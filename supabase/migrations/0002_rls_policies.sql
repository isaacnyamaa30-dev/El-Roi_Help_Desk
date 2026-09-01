-- ============================================================================
--  EL-ROI Help Desk Tracker — 0002_rls_policies
--
--  Row Level Security is MANDATORY. Frontend route guards are UX only —
--  these policies are the real authorization boundary.
-- ============================================================================

alter table public.profiles       enable row level security;
alter table public.tickets        enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.ticket_history enable row level security;

-- ----------------------------------------------------------------- profiles
--
-- Any authenticated user may READ profiles. This is deliberate for the
-- classroom MVP: ticket lists/detail views join to creator and assignee
-- names, and the assignment dropdown needs the list of agents. The app
-- only ever surfaces name + role. Tighten this later if needed.

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (true);

-- A user may create only their own profile row (the signup trigger also
-- does this with elevated rights; this covers manual/app inserts).
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

-- A user may update their own profile; admins may update anyone.
-- guard_profile_update() still blocks role changes by non-admins.
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ------------------------------------------------------------------ tickets

-- Read: own tickets, tickets assigned to me, or everything for staff.
drop policy if exists tickets_select on public.tickets;
create policy tickets_select on public.tickets
  for select to authenticated
  using (
    created_by = auth.uid()
    or assigned_to = auth.uid()
    or public.is_staff()
  );

-- Create: only as yourself.
drop policy if exists tickets_insert on public.tickets;
create policy tickets_insert on public.tickets
  for insert to authenticated
  with check (created_by = auth.uid());

-- Update: creator, assigned agent, or staff. guard_ticket_update() then
-- constrains exactly which columns each non-staff role may touch.
drop policy if exists tickets_update on public.tickets;
create policy tickets_update on public.tickets
  for update to authenticated
  using (
    created_by = auth.uid()
    or assigned_to = auth.uid()
    or public.is_staff()
  )
  with check (
    created_by = auth.uid()
    or assigned_to = auth.uid()
    or public.is_staff()
  );

-- No delete policy: tickets are never deleted from the app.

-- ---------------------------------------------------------- ticket_messages

-- Read: messages on a ticket you can see. Internal notes are staff/agent only.
drop policy if exists ticket_messages_select on public.ticket_messages;
create policy ticket_messages_select on public.ticket_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and (t.created_by = auth.uid()
             or t.assigned_to = auth.uid()
             or public.is_staff())
    )
    and (
      message_type = 'public'
      or public.current_user_role() in ('agent', 'manager', 'admin')
    )
  );

-- Write: as yourself, on a ticket you participate in / manage. Regular
-- users can only post public messages.
drop policy if exists ticket_messages_insert on public.ticket_messages;
create policy ticket_messages_insert on public.ticket_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and (t.created_by = auth.uid()
             or t.assigned_to = auth.uid()
             or public.is_staff())
    )
    and (
      message_type = 'public'
      or public.current_user_role() in ('agent', 'manager', 'admin')
    )
  );

-- ----------------------------------------------------------- ticket_history

-- Read: history for any ticket you can see (creator, assignee or staff).
drop policy if exists ticket_history_select on public.ticket_history;
create policy ticket_history_select on public.ticket_history
  for select to authenticated
  using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and (t.created_by = auth.uid()
             or t.assigned_to = auth.uid()
             or public.is_staff())
    )
  );

-- Write: rows are normally written by SECURITY DEFINER triggers. Allow
-- authenticated inserts too, but only attributed to yourself.
drop policy if exists ticket_history_insert on public.ticket_history;
create policy ticket_history_insert on public.ticket_history
  for insert to authenticated
  with check (changed_by = auth.uid() or changed_by is null);
