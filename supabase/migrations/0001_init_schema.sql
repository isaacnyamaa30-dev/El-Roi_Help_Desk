-- ============================================================================
--  EL-ROI Help Desk Tracker — 0001_init_schema
--  Tables, sequences, functions and triggers.
--  RLS policies live in 0002_rls_policies.sql.
-- ============================================================================

-- ------------------------------------------------------------------ profiles
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null,
  email       text,
  role        text not null default 'user'
                check (role in ('user', 'agent', 'manager', 'admin')),
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Application profile + role for each Supabase Auth user.';

-- ------------------------------------------------------------------- tickets
create sequence if not exists public.ticket_number_seq start 1;

create table if not exists public.tickets (
  id            uuid primary key default gen_random_uuid(),
  ticket_number text unique not null,
  title         text not null,
  description   text not null,
  category      text not null,
  priority      text not null default 'medium'
                  check (priority in ('low', 'medium', 'high', 'urgent')),
  status        text not null default 'open'
                  check (status in ('open', 'assigned', 'in_progress',
                    'waiting_for_user', 'resolved', 'closed', 'reopened')),
  created_by    uuid not null references public.profiles (id),
  assigned_to   uuid references public.profiles (id),
  assigned_by   uuid references public.profiles (id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  assigned_at   timestamptz,
  resolved_at   timestamptz,
  closed_at     timestamptz
);

create index if not exists tickets_created_by_idx   on public.tickets (created_by);
create index if not exists tickets_assigned_to_idx  on public.tickets (assigned_to);
create index if not exists tickets_status_idx       on public.tickets (status);
create index if not exists tickets_priority_idx     on public.tickets (priority);
create index if not exists tickets_created_at_idx   on public.tickets (created_at desc);
create index if not exists tickets_ticket_number_idx on public.tickets (ticket_number);

-- ----------------------------------------------------------- ticket_messages
create table if not exists public.ticket_messages (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references public.tickets (id) on delete cascade,
  sender_id    uuid not null references public.profiles (id),
  message      text not null,
  message_type text not null default 'public'
                 check (message_type in ('public', 'internal')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists ticket_messages_ticket_id_idx
  on public.ticket_messages (ticket_id, created_at);

-- ----------------------------------------------------------- ticket_history
create table if not exists public.ticket_history (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid not null references public.tickets (id) on delete cascade,
  action     text not null,
  old_value  text,
  new_value  text,
  changed_by uuid references public.profiles (id),
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ticket_history_ticket_id_idx
  on public.ticket_history (ticket_id, created_at);

-- ============================================================================
--  Helper functions (SECURITY DEFINER: run as owner, bypass RLS, no recursion)
-- ============================================================================

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('manager', 'admin'), false);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

-- ============================================================================
--  updated_at maintenance
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tickets_updated_at on public.tickets;
create trigger trg_tickets_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

drop trigger if exists trg_ticket_messages_updated_at on public.ticket_messages;
create trigger trg_ticket_messages_updated_at
  before update on public.ticket_messages
  for each row execute function public.set_updated_at();

-- ============================================================================
--  Profile auto-creation on signup
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''),
             split_part(new.email, '@', 1)),
    new.email,
    'user'                       -- public signups are ALWAYS 'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
--  Guard: only admins may change a profile role; nobody may change id
-- ============================================================================

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Trusted server context (service role / seed script): no JWT, allow.
  if auth.uid() is null then
    return new;
  end if;
  if new.id is distinct from old.id then
    raise exception 'Cannot change profile id';
  end if;
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Not authorized to change role';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_guard on public.profiles;
create trigger trg_profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ============================================================================
--  Ticket number generation (ERH-000001) — sequence backed, concurrency safe
-- ============================================================================

create or replace function public.set_ticket_number()
returns trigger
language plpgsql
as $$
begin
  if new.ticket_number is null or new.ticket_number = '' then
    new.ticket_number :=
      'ERH-' || lpad(nextval('public.ticket_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_tickets_number on public.tickets;
create trigger trg_tickets_number
  before insert on public.tickets
  for each row execute function public.set_ticket_number();

-- ============================================================================
--  Ticket lifecycle timestamps (assigned_at / resolved_at / closed_at)
-- ============================================================================

create or replace function public.maintain_ticket_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.assigned_to is distinct from old.assigned_to
     and new.assigned_to is not null then
    new.assigned_at := now();
  end if;

  if new.status is distinct from old.status then
    if new.status = 'resolved' then
      new.resolved_at := now();
    elsif new.status = 'closed' then
      new.closed_at := now();
    elsif new.status = 'reopened' then
      new.resolved_at := null;
      new.closed_at := null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_tickets_timestamps on public.tickets;
create trigger trg_tickets_timestamps
  before update on public.tickets
  for each row execute function public.maintain_ticket_timestamps();

-- ============================================================================
--  Automatic ticket history recording
-- ============================================================================

create or replace function public.record_ticket_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if tg_op = 'INSERT' then
    insert into public.ticket_history (ticket_id, action, new_value, changed_by)
    values (new.id, 'ticket_created', new.ticket_number, coalesce(actor, new.created_by));
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.ticket_history
      (ticket_id, action, old_value, new_value, changed_by)
    values (new.id, 'status_changed', old.status, new.status, actor);

    if new.status = 'resolved' then
      insert into public.ticket_history (ticket_id, action, changed_by)
      values (new.id, 'ticket_resolved', actor);
    elsif new.status = 'reopened' then
      insert into public.ticket_history (ticket_id, action, changed_by)
      values (new.id, 'ticket_reopened', actor);
    elsif new.status = 'closed' then
      insert into public.ticket_history (ticket_id, action, changed_by)
      values (new.id, 'ticket_closed', actor);
    end if;
  end if;

  if new.priority is distinct from old.priority then
    insert into public.ticket_history
      (ticket_id, action, old_value, new_value, changed_by)
    values (new.id, 'priority_changed', old.priority, new.priority, actor);
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    insert into public.ticket_history
      (ticket_id, action, old_value, new_value, changed_by)
    values (
      new.id,
      case when old.assigned_to is null
           then 'ticket_assigned' else 'ticket_reassigned' end,
      coalesce((select full_name from public.profiles where id = old.assigned_to),
               'Unassigned'),
      coalesce((select full_name from public.profiles where id = new.assigned_to),
               'Unassigned'),
      actor
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_tickets_history_ins on public.tickets;
create trigger trg_tickets_history_ins
  after insert on public.tickets
  for each row execute function public.record_ticket_history();

drop trigger if exists trg_tickets_history_upd on public.tickets;
create trigger trg_tickets_history_upd
  after update on public.tickets
  for each row execute function public.record_ticket_history();

-- ============================================================================
--  On new ticket message: bump ticket.updated_at + record history
-- ============================================================================

create or replace function public.on_ticket_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_role text;
begin
  select role into sender_role from public.profiles where id = new.sender_id;

  update public.tickets set updated_at = now() where id = new.ticket_id;

  insert into public.ticket_history (ticket_id, action, changed_by)
  values (
    new.ticket_id,
    case when sender_role in ('agent', 'manager', 'admin')
         then 'agent_response_added' else 'user_response_added' end,
    new.sender_id
  );

  return new;
end;
$$;

drop trigger if exists trg_ticket_messages_after_insert on public.ticket_messages;
create trigger trg_ticket_messages_after_insert
  after insert on public.ticket_messages
  for each row execute function public.on_ticket_message();

-- ============================================================================
--  Guard: constrain what non-staff may change on a ticket
-- ============================================================================

create or replace function public.guard_ticket_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Trusted server context (service role / seed script): no JWT, allow.
  if auth.uid() is null then
    return new;
  end if;

  if public.is_staff() then
    return new;                                   -- managers / admins: full
  end if;

  -- assigned agent: may change status only
  if old.assigned_to is not null and old.assigned_to = auth.uid() then
    if new.assigned_to  is distinct from old.assigned_to
       or new.priority  is distinct from old.priority
       or new.created_by is distinct from old.created_by
       or new.title     is distinct from old.title
       or new.description is distinct from old.description then
      raise exception 'Agents may only change ticket status';
    end if;
    return new;
  end if;

  -- ticket creator (regular user): may only reopen a resolved/closed ticket
  if old.created_by = auth.uid() then
    if new.title       is distinct from old.title
       or new.description is distinct from old.description
       or new.category  is distinct from old.category
       or new.priority  is distinct from old.priority
       or new.assigned_to is distinct from old.assigned_to then
      raise exception 'You cannot modify this ticket';
    end if;
    if new.status is distinct from old.status
       and not (old.status in ('resolved', 'closed')
                and new.status = 'reopened') then
      raise exception 'You can only reopen a resolved ticket';
    end if;
    return new;
  end if;

  raise exception 'Not authorized to modify this ticket';
end;
$$;

drop trigger if exists trg_tickets_guard on public.tickets;
create trigger trg_tickets_guard
  before update on public.tickets
  for each row execute function public.guard_ticket_update();
