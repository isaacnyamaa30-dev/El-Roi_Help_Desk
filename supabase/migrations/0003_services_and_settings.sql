-- ============================================================================
--  EL-ROI Services — 0003_services_and_settings
--  Service catalogue (categories, services, packages, prices) + business
--  settings, working days and blackout dates. Additive: does not touch the
--  legacy help-desk tables.
--  Reuses public.set_updated_at() from 0001.
-- ============================================================================

-- ------------------------------------------------------------ categories
create table if not exists public.service_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text,
  icon        text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -------------------------------------------------------------- services
create table if not exists public.services (
  id                          uuid primary key default gen_random_uuid(),
  category_id                 uuid not null references public.service_categories (id),
  name                        text not null,
  slug                        text unique,
  description                 text,
  pricing_type                text not null default 'quote'
    check (pricing_type in ('fixed', 'hourly', 'daily', 'package', 'quote')),
  base_price                  numeric(12, 2),
  requires_quote              boolean not null default false,
  estimated_duration_minutes  integer,
  active                      boolean not null default true,
  display_order               integer not null default 0,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index if not exists services_category_id_idx on public.services (category_id);
create index if not exists services_active_idx on public.services (active);

-- ------------------------------------------------------------- packages
create table if not exists public.service_packages (
  id            uuid primary key default gen_random_uuid(),
  service_id    uuid not null references public.services (id) on delete cascade,
  name          text not null,
  description   text,
  active        boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists service_packages_service_id_idx
  on public.service_packages (service_id);

-- --------------------------------------------------------------- prices
create table if not exists public.service_prices (
  id             uuid primary key default gen_random_uuid(),
  service_id     uuid not null references public.services (id) on delete cascade,
  package_id     uuid references public.service_packages (id) on delete cascade,
  pricing_option text,               -- 'elroi_materials' | 'client_materials' | 'standard' | null
  amount         numeric(12, 2),
  unit           text,               -- 'per hour' | 'per day' | null
  requires_quote boolean not null default false,
  active         boolean not null default true,
  valid_from     timestamptz,
  valid_to       timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists service_prices_service_id_idx
  on public.service_prices (service_id);
create index if not exists service_prices_package_id_idx
  on public.service_prices (package_id);

-- ------------------------------------------------------ business settings
create table if not exists public.business_settings (
  id                   uuid primary key default gen_random_uuid(),
  business_name        text not null
    default 'EL-ROI Weekend Cleaning And Driving Services',
  short_name           text not null default 'EL-ROI Services',
  phone                text,
  email                text,
  currency             text not null default 'GHS',
  timezone             text not null default 'Africa/Accra',
  opening_time         time not null default '09:00',
  closing_time         time not null default '20:00',
  booking_slot_minutes integer not null default 60,
  booking_enabled      boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- -------------------------------------------------------- working days
create table if not exists public.working_days (
  id           uuid primary key default gen_random_uuid(),
  day_of_week  integer not null unique check (day_of_week between 0 and 6), -- 0 = Sunday
  enabled      boolean not null default false,
  opening_time time not null default '09:00',
  closing_time time not null default '20:00'
);

-- ------------------------------------------------------- blackout dates
create table if not exists public.blackout_dates (
  id         uuid primary key default gen_random_uuid(),
  date       date unique not null,
  reason     text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------- updated_at triggers
drop trigger if exists trg_service_categories_updated_at on public.service_categories;
create trigger trg_service_categories_updated_at before update on public.service_categories
  for each row execute function public.set_updated_at();

drop trigger if exists trg_services_updated_at on public.services;
create trigger trg_services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

drop trigger if exists trg_service_packages_updated_at on public.service_packages;
create trigger trg_service_packages_updated_at before update on public.service_packages
  for each row execute function public.set_updated_at();

drop trigger if exists trg_service_prices_updated_at on public.service_prices;
create trigger trg_service_prices_updated_at before update on public.service_prices
  for each row execute function public.set_updated_at();

drop trigger if exists trg_business_settings_updated_at on public.business_settings;
create trigger trg_business_settings_updated_at before update on public.business_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------- seed defaults
insert into public.business_settings (phone, email)
select '+233 24 374 4689', 'isaacnyamaa30@gmail.com'
where not exists (select 1 from public.business_settings);

insert into public.working_days (day_of_week, enabled)
values (0, true), (1, false), (2, false), (3, false), (4, false), (5, false), (6, true)
on conflict (day_of_week) do nothing;

insert into public.service_categories (name, slug, description, icon)
values
  ('Cleaning', 'cleaning',
   'Professional weekend home, office and shop cleaning.', 'sparkles'),
  ('Driving', 'driving',
   'Reliable weekend personal, event and airport driving.', 'car')
on conflict (slug) do nothing;
