-- ============================================================================
--  EL-ROI Services — 0008_create_booking_price_match
--  Make the server-side price lookup in create_booking() more forgiving:
--  prefer an exact (package, option) price, then fall back to option-only,
--  then the service base price. Still authoritative — the browser amount is
--  never used.
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
  v_opt     text := nullif(p_pricing_option, '');
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

  if v_service.pricing_type <> 'quote' and not v_service.requires_quote then
    -- 1. exact package + option
    select id, amount into v_price_id, v_amount
    from public.service_prices
    where service_id = p_service_id
      and active and not requires_quote and amount is not null
      and package_id is not distinct from p_package_id
      and pricing_option is not distinct from v_opt
    order by valid_from desc nulls last, created_at desc
    limit 1;

    -- 2. option only (ignore package)
    if v_price_id is null then
      select id, amount into v_price_id, v_amount
      from public.service_prices
      where service_id = p_service_id
        and active and not requires_quote and amount is not null
        and pricing_option is not distinct from v_opt
      order by valid_from desc nulls last, created_at desc
      limit 1;
    end if;

    -- 3. any active price for the service
    if v_price_id is null then
      select id, amount into v_price_id, v_amount
      from public.service_prices
      where service_id = p_service_id
        and active and not requires_quote and amount is not null
      order by valid_from desc nulls last, created_at desc
      limit 1;
    end if;

    -- 4. service base price
    if v_price_id is null and v_service.base_price is not null then
      v_amount := v_service.base_price;
    end if;
  end if;

  insert into public.bookings (
    client_id, service_id, package_id, price_id, pricing_option,
    service_date, service_time, service_location, client_phone, instructions,
    subtotal, total_amount, status
  ) values (
    v_uid, p_service_id, p_package_id, v_price_id, v_opt,
    p_service_date, p_service_time, p_service_location, p_client_phone,
    nullif(p_instructions, ''),
    v_amount, v_amount, 'pending'
  ) returning * into v_booking;

  return v_booking;
end;
$$;
