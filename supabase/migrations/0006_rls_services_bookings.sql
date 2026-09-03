-- ============================================================================
--  EL-ROI Services — 0006_rls_services_bookings
--  Row Level Security for the service catalogue, bookings, history, payments
--  and business settings. RLS is the real authorization boundary; the
--  frontend route guards are UX only.
-- ============================================================================

alter table public.service_categories enable row level security;
alter table public.services           enable row level security;
alter table public.service_packages   enable row level security;
alter table public.service_prices     enable row level security;
alter table public.business_settings  enable row level security;
alter table public.working_days       enable row level security;
alter table public.blackout_dates     enable row level security;
alter table public.bookings           enable row level security;
alter table public.booking_history    enable row level security;
alter table public.payments           enable row level security;

-- ------------------------------------------------ catalogue (public read)
-- Anyone (even signed-out visitors) can browse the active catalogue.
-- Managers / admins see everything and are the only ones who can edit it.

drop policy if exists categories_select on public.service_categories;
create policy categories_select on public.service_categories
  for select to anon, authenticated
  using (active or public.is_staff());

drop policy if exists categories_write on public.service_categories;
create policy categories_write on public.service_categories
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists services_select on public.services;
create policy services_select on public.services
  for select to anon, authenticated
  using (active or public.is_staff());

drop policy if exists services_write on public.services;
create policy services_write on public.services
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists packages_select on public.service_packages;
create policy packages_select on public.service_packages
  for select to anon, authenticated
  using (active or public.is_staff());

drop policy if exists packages_write on public.service_packages;
create policy packages_write on public.service_packages
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists prices_select on public.service_prices;
create policy prices_select on public.service_prices
  for select to anon, authenticated
  using (active or public.is_staff());

drop policy if exists prices_write on public.service_prices;
create policy prices_write on public.service_prices
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------- settings (public read)
drop policy if exists settings_select on public.business_settings;
create policy settings_select on public.business_settings
  for select to anon, authenticated using (true);

drop policy if exists settings_write on public.business_settings;
create policy settings_write on public.business_settings
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists working_days_select on public.working_days;
create policy working_days_select on public.working_days
  for select to anon, authenticated using (true);

drop policy if exists working_days_write on public.working_days;
create policy working_days_write on public.working_days
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists blackout_select on public.blackout_dates;
create policy blackout_select on public.blackout_dates
  for select to anon, authenticated using (true);

drop policy if exists blackout_write on public.blackout_dates;
create policy blackout_write on public.blackout_dates
  for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ------------------------------------------------------------- bookings
-- Read: own bookings, jobs assigned to me, or everything for staff.
drop policy if exists bookings_select on public.bookings;
create policy bookings_select on public.bookings
  for select to authenticated
  using (
    client_id = auth.uid()
    or assigned_staff_id = auth.uid()
    or public.is_staff()
  );

-- Create: normally via create_booking() (SECURITY DEFINER). A direct insert
-- is still allowed but only for yourself.
drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings
  for insert to authenticated
  with check (client_id = auth.uid());

-- Update: creator, assigned worker or staff — guard_booking_update() then
-- constrains exactly which columns each non-staff role may touch.
drop policy if exists bookings_update on public.bookings;
create policy bookings_update on public.bookings
  for update to authenticated
  using (
    client_id = auth.uid()
    or assigned_staff_id = auth.uid()
    or public.is_staff()
  )
  with check (
    client_id = auth.uid()
    or assigned_staff_id = auth.uid()
    or public.is_staff()
  );

-- ----------------------------------------------------- booking_history
drop policy if exists booking_history_select on public.booking_history;
create policy booking_history_select on public.booking_history
  for select to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and (b.client_id = auth.uid()
             or b.assigned_staff_id = auth.uid()
             or public.is_staff())
    )
  );

drop policy if exists booking_history_insert on public.booking_history;
create policy booking_history_insert on public.booking_history
  for insert to authenticated
  with check (changed_by = auth.uid() or changed_by is null);

-- ------------------------------------------------------------- payments
-- Read: staff, or the client who owns the booking.
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments
  for select to authenticated
  using (
    public.is_staff()
    or exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
  );

-- Only staff record payments, attributed to themselves.
drop policy if exists payments_write on public.payments;
create policy payments_write on public.payments
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff() and (recorded_by = auth.uid() or recorded_by is null));
