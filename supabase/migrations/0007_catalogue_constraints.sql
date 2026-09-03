-- ============================================================================
--  EL-ROI Services — 0007_catalogue_constraints
--  Natural-key uniqueness so upserts (seed + admin) are idempotent.
-- ============================================================================

alter table public.service_packages
  drop constraint if exists service_packages_service_name_key;
alter table public.service_packages
  add constraint service_packages_service_name_key unique (service_id, name);

-- One active price per (service, package, option). Historical rows are kept
-- by setting active = false / valid_to rather than deleting.
create unique index if not exists service_prices_active_key
  on public.service_prices (
    service_id,
    coalesce(package_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(pricing_option, '')
  )
  where active;
