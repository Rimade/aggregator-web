-- Aggregator MVP schema (Supabase Postgres) + RLS tenant isolation
-- Run this in Supabase SQL Editor.

-- Extensions
create extension if not exists "pgcrypto";

-- Enum for roles
do $$ begin
  create type public.user_role as enum ('platform_admin', 'cafe_staff');
exception
  when duplicate_object then null;
end $$;

-- Cafes
create table if not exists public.cafes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  accepting_orders boolean not null default true,
  created_at timestamptz not null default now()
);

-- Profiles: link auth.users -> cafe + role
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'cafe_staff',
  cafe_id uuid references public.cafes (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Menu categories
create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Menu items
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes (id) on delete cascade,
  category_id uuid references public.menu_categories (id) on delete set null,
  name text not null,
  description text,
  price_rub int not null check (price_rub >= 0),
  is_available boolean not null default true,
  image_path text,
  created_at timestamptz not null default now()
);

-- Orders
do $$ begin
  create type public.order_type as enum ('dine_in', 'pickup');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum ('new', 'in_progress', 'ready', 'closed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafes (id) on delete cascade,
  order_number text not null,
  type public.order_type not null,
  table_label text,
  customer_name text,
  customer_phone text,
  comment text,
  status public.order_status not null default 'new',
  total_rub int not null check (total_rub >= 0),
  created_at timestamptz not null default now(),
  unique (cafe_id, order_number)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  cafe_id uuid not null references public.cafes (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  name_snapshot text not null,
  price_snapshot_rub int not null check (price_snapshot_rub >= 0),
  qty int not null check (qty > 0),
  created_at timestamptz not null default now()
);

-- Ensure order_items.cafe_id matches orders.cafe_id
create or replace function public.enforce_order_items_cafe_id()
returns trigger
language plpgsql
as $$
declare
  parent_cafe_id uuid;
begin
  select cafe_id into parent_cafe_id from public.orders where id = new.order_id;
  if parent_cafe_id is null then
    raise exception 'order not found';
  end if;
  if new.cafe_id <> parent_cafe_id then
    raise exception 'cafe_id mismatch';
  end if;
  return new;
end $$;

drop trigger if exists trg_order_items_cafe_id on public.order_items;
create trigger trg_order_items_cafe_id
before insert or update on public.order_items
for each row execute function public.enforce_order_items_cafe_id();

-- Helper: current user's role / cafe_id
create or replace function public.current_role()
returns public.user_role
language sql stable
as $$
  select role from public.profiles where user_id = auth.uid()
$$;

create or replace function public.current_cafe_id()
returns uuid
language sql stable
as $$
  select cafe_id from public.profiles where user_id = auth.uid()
$$;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.cafes enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies: platform admin full access
create policy "platform_admin_all_profiles"
on public.profiles
for all
using (public.current_role() = 'platform_admin')
with check (public.current_role() = 'platform_admin');

create policy "platform_admin_all_cafes"
on public.cafes
for all
using (public.current_role() = 'platform_admin')
with check (public.current_role() = 'platform_admin');

create policy "platform_admin_all_menu_categories"
on public.menu_categories
for all
using (public.current_role() = 'platform_admin')
with check (public.current_role() = 'platform_admin');

create policy "platform_admin_all_menu_items"
on public.menu_items
for all
using (public.current_role() = 'platform_admin')
with check (public.current_role() = 'platform_admin');

create policy "platform_admin_all_orders"
on public.orders
for all
using (public.current_role() = 'platform_admin')
with check (public.current_role() = 'platform_admin');

create policy "platform_admin_all_order_items"
on public.order_items
for all
using (public.current_role() = 'platform_admin')
with check (public.current_role() = 'platform_admin');

-- Policies: cafe staff tenant isolation
create policy "cafe_staff_self_profile"
on public.profiles
for select
using (auth.uid() = user_id);

create policy "cafe_staff_read_own_cafe"
on public.cafes
for select
using (id = public.current_cafe_id());

create policy "cafe_staff_crud_menu_categories"
on public.menu_categories
for all
using (cafe_id = public.current_cafe_id())
with check (cafe_id = public.current_cafe_id());

create policy "cafe_staff_crud_menu_items"
on public.menu_items
for all
using (cafe_id = public.current_cafe_id())
with check (cafe_id = public.current_cafe_id());

create policy "cafe_staff_read_orders"
on public.orders
for select
using (cafe_id = public.current_cafe_id());

create policy "cafe_staff_update_orders"
on public.orders
for update
using (cafe_id = public.current_cafe_id())
with check (cafe_id = public.current_cafe_id());

create policy "cafe_staff_read_order_items"
on public.order_items
for select
using (cafe_id = public.current_cafe_id());

create policy "cafe_staff_crud_order_items"
on public.order_items
for all
using (cafe_id = public.current_cafe_id())
with check (cafe_id = public.current_cafe_id());

-- Public (customer) access: read active cafes by slug + read menu if active and accepting orders
create policy "public_read_active_cafes"
on public.cafes
for select
to anon
using (is_active = true);

create policy "public_read_menu_categories_if_cafe_active"
on public.menu_categories
for select
to anon
using (
  exists (
    select 1
    from public.cafes c
    where c.id = cafe_id and c.is_active = true and c.accepting_orders = true
  )
);

create policy "public_read_menu_items_if_cafe_active"
on public.menu_items
for select
to anon
using (
  exists (
    select 1
    from public.cafes c
    where c.id = cafe_id and c.is_active = true and c.accepting_orders = true
  )
);

-- Public (customer) access: create orders only for active cafes accepting orders
create policy "public_insert_orders_if_cafe_active"
on public.orders
for insert
to anon
with check (
  exists (
    select 1
    from public.cafes c
    where c.id = cafe_id and c.is_active = true and c.accepting_orders = true
  )
);

create policy "public_insert_order_items_if_cafe_active"
on public.order_items
for insert
to anon
with check (
  exists (
    select 1
    from public.cafes c
    where c.id = cafe_id and c.is_active = true and c.accepting_orders = true
  )
);

-- Optional: prevent anon updates/deletes by default (RLS already blocks without explicit policies)

