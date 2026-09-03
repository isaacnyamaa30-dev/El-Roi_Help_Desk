-- ============================================================================
--  EL-ROI Services — 0004_profiles_and_roles
--  Extend profiles for the service business: add phone, switch the role set
--  from help-desk roles to service roles, and update the signup trigger.
--  Reuses public.current_user_role() / is_staff() / is_admin() from 0001.
-- ============================================================================

alter table public.profiles add column if not exists phone text;

-- New role set: client / cleaner / driver / manager / admin
alter table public.profiles alter column role set default 'client';
alter table public.profiles drop constraint if exists profiles_role_check;

-- Map any legacy help-desk roles before applying the new constraint.
update public.profiles set role = 'client'  where role = 'user';
update public.profiles set role = 'cleaner' where role = 'agent';

alter table public.profiles add constraint profiles_role_check
  check (role in ('client', 'cleaner', 'driver', 'manager', 'admin'));

-- Public signups are always clients; phone comes from signup metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''),
             split_part(new.email, '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Helper: is the current user a field worker (cleaner or driver)?
create or replace function public.is_worker()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('cleaner', 'driver'), false);
$$;
