-- ============================================================================
--  EL-ROI Services — 0005_bookings_and_payments
--  bookings (+ ELR-###### numbers), booking_history (auto audit trail),
--  payments, and a SECURITY DEFINER create_booking() RPC that is the
--  authoritative pricing path (never trusts a browser-supplied amount).
-- ============================================================================

-- ------------------------------------------------------------- bookings
create sequence if not exists public.booking_number_seq start 1;

create table if not exists public.bookings (
  id                uuid primary key default gen_random_uuid(),
  booking_number    text unique not null,
  client_id         uuid not null references public.profiles (id),
  service_id        uuid not null references public.services (id),
  package_id        uuid references public.service_packages (id),
  price_id          uuid references public.service_prices (id),
  pricing_option    text,
  service_date      date not null,
  service_time      time not null,
  service_location  text not null,
  client_phone      text not null,
  instructions      text,
  status            text not null default 'pending'
    check (status in ('pending', 'confirmed', 'assigned', 'on_the_way',
      'in_progress', 'awaiting_payment', 'completed', 'cancelled', 'rejected')),
  assigned_staff_id uuid references public.profiles (id),
  assigned_by       uuid references public.profiles (id),
  assigned_at       timestamptz,
  quoted_amount     numeric(12, 2),
  subtotal          numeric(12, 2),
  total_amount      numeric(12, 2),
  completion_notes  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  completed_at      timestamptz,
  cancelled_at      timestamptz
);

create index if not exists bookings_client_id_idx        on public.bookings (client_id);
create index if not exists bookings_assigned_staff_id_idx on public.bookings (assigned_staff_id);
create index if not exists bookings_status_idx           on public.bookings (status);
create index if not exists bookings_service_date_idx     on public.bookings (service_date);
create index if not exists bookings_created_at_idx       on public.bookings (created_at desc);
create index if not exists bookings_booking_number_idx   on public.bookings (booking_number);

-- ELR-000001, ELR-000002, … — sequence backed, concurrency safe.
create or replace function public.set_booking_number()
returns trigger language plpgsql as $$
begin
  if new.booking_number is null or new.booking_number = '' then
    new.booking_number :=
      'ELR-' || lpad(nextval('public.booking_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bookings_number on public.bookings;
create trigger trg_bookings_number before insert on public.bookings
  for each row execute function public.set_booking_number();

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

-- Lifecycle timestamps (assigned_at / completed_at / cancelled_at).
create or replace function public.maintain_booking_timestamps()
returns trigger language plpgsql as $$
begin
  if new.assigned_staff_id is distinct from old.assigned_staff_id
     and new.assigned_staff_id is not null then
    new.assigned_at := now();
  end if;
  if new.status is distinct from old.status then
    if new.status = 'completed' then new.completed_at := now();
    elsif new.status in ('cancelled', 'rejected') then new.cancelled_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bookings_timestamps on public.bookings;
create trigger trg_bookings_timestamps before update on public.bookings
  for each row execute function public.maintain_booking_timestamps();

-- ------------------------------------------------------ booking_history
create table if not exists public.booking_history (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  action     text not null,
  old_value  text,
  new_value  text,
  changed_by uuid references public.profiles (id),
  metadata   jsonb,
  created_at timestamptz not null default now()
);
create index if not exists booking_history_booking_id_idx
  on public.booking_history (booking_id, created_at);

create or replace function public.record_booking_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if tg_op = 'INSERT' then
    insert into public.booking_history (booking_id, action, new_value, changed_by)
    values (new.id, 'booking_created', new.booking_number,
            coalesce(actor, new.client_id));
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.booking_history
      (booking_id, action, old_value, new_value, changed_by)
    values (new.id, 'status_changed', old.status, new.status, actor);

    if new.status = 'confirmed' then
      insert into public.booking_history (booking_id, action, changed_by)
      values (new.id, 'booking_confirmed', actor);
    elsif new.status = 'rejected' then
      insert into public.booking_history (booking_id, action, changed_by)
      values (new.id, 'booking_rejected', actor);
    elsif new.status = 'in_progress' then
      insert into public.booking_history (booking_id, action, changed_by)
      values (new.id, 'service_started', actor);
    elsif new.status = 'completed' then
      insert into public.booking_history (booking_id, action, changed_by)
      values (new.id, 'service_completed', actor);
    elsif new.status = 'cancelled' then
      insert into public.booking_history (booking_id, action, changed_by)
      values (new.id, 'booking_cancelled', actor);
    end if;
  end if;

  if new.assigned_staff_id is distinct from old.assigned_staff_id then
    insert into public.booking_history
      (booking_id, action, old_value, new_value, changed_by)
    values (
      new.id,
      case when old.assigned_staff_id is null
           then 'booking_assigned' else 'booking_reassigned' end,
      coalesce((select full_name from public.profiles where id = old.assigned_staff_id),
               'Unassigned'),
      coalesce((select full_name from public.profiles where id = new.assigned_staff_id),
               'Unassigned'),
      actor
    );
  end if;

  if new.total_amount is distinct from old.total_amount then
    insert into public.booking_history
      (booking_id, action, old_value, new_value, changed_by)
    values (new.id, 'price_changed',
            coalesce(old.total_amount::text, 'Quote'),
            coalesce(new.total_amount::text, 'Quote'), actor);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_bookings_history_ins on public.bookings;
create trigger trg_bookings_history_ins after insert on public.bookings
  for each row execute function public.record_booking_history();

drop trigger if exists trg_bookings_history_upd on public.bookings;
create trigger trg_bookings_history_upd after update on public.bookings
  for each row execute function public.record_booking_history();

-- ------------------------------------------------------------- payments
create table if not exists public.payments (
  id                    uuid primary key default gen_random_uuid(),
  booking_id            uuid not null references public.bookings (id) on delete cascade,
  amount                numeric(12, 2) not null,
  payment_method        text not null
    check (payment_method in ('cash', 'mobile_money', 'bank_transfer', 'other')),
  payment_status        text not null default 'paid'
    check (payment_status in ('unpaid', 'partially_paid', 'paid', 'refunded')),
  transaction_reference text,
  notes                 text,
  recorded_by           uuid references public.profiles (id),
  payment_date          timestamptz not null default now(),
  created_at            timestamptz not null default now()
);
create index if not exists payments_booking_id_idx on public.payments (booking_id);

create or replace function public.on_payment_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings set updated_at = now() where id = new.booking_id;
  insert into public.booking_history (booking_id, action, new_value, changed_by)
  values (new.booking_id, 'payment_recorded', new.amount::text, new.recorded_by);
  return new;
end;
$$;

drop trigger if exists trg_payments_after_insert on public.payments;
create trigger trg_payments_after_insert after insert on public.payments
  for each row execute function public.on_payment_insert();

-- ============================================================================
--  Guard: constrain what non-staff may change on a booking.
-- ============================================================================
create or replace function public.guard_booking_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;                       -- service role / seed / RPC context
  end if;
  if public.is_staff() then
    return new;                        -- managers / admins: full control
  end if;

  -- assigned worker: status + completion notes only
  if old.assigned_staff_id is not null and old.assigned_staff_id = auth.uid() then
    if new.assigned_staff_id is distinct from old.assigned_staff_id
       or new.client_id      is distinct from old.client_id
       or new.service_id     is distinct from old.service_id
       or new.total_amount   is distinct from old.total_amount
       or new.service_date   is distinct from old.service_date
       or new.service_time   is distinct from old.service_time then
      raise exception 'Workers may only update job status and notes';
    end if;
    if new.status is distinct from old.status
       and new.status not in ('assigned', 'on_the_way', 'in_progress', 'completed') then
      raise exception 'Invalid job status transition';
    end if;
    return new;
  end if;

  -- client (owner): may only cancel a pending or confirmed booking
  if old.client_id = auth.uid() then
    if new.assigned_staff_id is distinct from old.assigned_staff_id
       or new.total_amount   is distinct from old.total_amount
       or new.service_id     is distinct from old.service_id
       or new.service_date   is distinct from old.service_date then
      raise exception 'You cannot modify this booking';
    end if;
    if new.status is distinct from old.status then
      if new.status <> 'cancelled' then
        raise exception 'You can only cancel this booking';
      end if;
      if old.status not in ('pending', 'confirmed') then
        raise exception 'Only pending or confirmed bookings can be cancelled';
      end if;
    end if;
    return new;
  end if;

  raise exception 'Not authorized to modify this booking';
end;
$$;

drop trigger if exists trg_bookings_guard on public.bookings;
create trigger trg_bookings_guard before update on public.bookings
  for each row execute function public.guard_booking_update();

-- ============================================================================
--  create_booking() — the ONLY sanctioned way for a client to book.
--  Looks up the current active price server-side and snapshots it onto the
--  booking. A browser-supplied amount is never used.
-- ============================================================================
create or replace function public.create_booking(
  p_service_id      uuid,
  p_package_id      uuid,
  p_pricing_option  text,
  p_service_date    date,
  p_service_time    time,
  p_service_location text,
  p_client_phone    text,
  p_instructions    text
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_service public.services%rowtype;
  v_price   public.service_prices%rowtype;
  v_amount  numeric(12, 2);
  v_price_id uuid;
  v_booking public.bookings%rowtype;
begin
  if v_uid is null then
    raise exception 'You must be signed in to book a service';
  end if;

  select * into v_service from public.services
  where id = p_service_id and active;
  if not found then
    raise exception 'That service is not currently available';
  end if;

  if p_service_date < current_date then
    raise exception 'Please choose a future date';
  end if;

  -- Match the most recent active price for this service / package / option.
  select * into v_price from public.service_prices
  where service_id = p_service_id
    and (package_id is not distinct from p_package_id)
    and (pricing_option is not distinct from nullif(p_pricing_option, ''))
    and active
  order by valid_from desc nulls last, created_at desc
  limit 1;

  if found and not v_price.requires_quote and v_price.amount is not null then
    v_amount   := v_price.amount;
    v_price_id := v_price.id;
  else
    v_amount   := null;               -- quote request
    v_price_id := null;
  end if;

  insert into public.bookings (
    client_id, service_id, package_id, price_id, pricing_option,
    service_date, service_time, service_location, client_phone, instructions,
    subtotal, total_amount, status
  ) values (
    v_uid, p_service_id, p_package_id, v_price_id, nullif(p_pricing_option, ''),
    p_service_date, p_service_time, p_service_location, p_client_phone,
    nullif(p_instructions, ''),
    v_amount, v_amount, 'pending'
  ) returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.create_booking(
  uuid, uuid, text, date, time, text, text, text
) to authenticated;
