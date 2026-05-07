-- Aggregator seed data (demo cafe + sample orders)
-- Run AFTER supabase/schema.sql

-- Demo cafe (fixed UUID so it can be referenced from web env)
insert into public.cafes (id, name, slug, is_active, accepting_orders)
values (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Кафе Demo',
  'demo',
  true,
  true
)
on conflict (slug) do update
set
  name = excluded.name,
  is_active = excluded.is_active,
  accepting_orders = excluded.accepting_orders;

-- A couple of demo orders
insert into public.orders (
  id,
  cafe_id,
  order_number,
  type,
  table_label,
  comment,
  status,
  total_rub
)
values
(
  '22222222-2222-2222-2222-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  '1042',
  'dine_in',
  'Стол 7',
  'без лука',
  'new',
  910
),
(
  '33333333-3333-3333-3333-333333333333'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  '1180',
  'dine_in',
  'Стол 2',
  null,
  'in_progress',
  520
)
on conflict do nothing;

insert into public.order_items (
  order_id,
  cafe_id,
  menu_item_id,
  name_snapshot,
  price_snapshot_rub,
  qty
)
values
  ('22222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, null, 'Классический бургер', 390, 1),
  ('22222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, null, 'Картофель фри', 160, 1),
  ('22222222-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, null, 'Лимонад', 180, 2),
  ('33333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, null, 'Чикен бургер', 360, 1),
  ('33333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, null, 'Кола', 170, 1)
on conflict do nothing;
