-- ==============================================================================
-- بيبي زون | BABY ZONE — جدول العملاء والصلاحيات السحابي (Supabase Cloud Database)
-- قم بنسخ هذا الكود وتشغيله داخل Supabase SQL Editor (>_ New Query)
-- ==============================================================================

-- 1. إنشاء جدول العملاء والصلاحيات (Customers Table)
create table if not exists customers (
  id text primary key,
  name text not null,
  email text unique not null,
  phone text,
  city text default 'القاهرة',
  address text,
  role text default 'customer', -- 'customer', 'vip_customer', 'wholesaler', 'supervisor', 'admin'
  permissions text[] default '{"view_catalog", "place_orders", "view_own_orders", "rate_products", "hospital_bag"}'::text[],
  is_vip boolean default false,
  status text default 'نشط', -- 'نشط', 'غير نشط', 'محظور'
  orders_count integer default 0,
  total_spent numeric default 0,
  notes text,
  joined_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. تفعيل نظام حماية البيانات (Row Level Security - RLS)
alter table customers enable row level security;

-- 3. سياسات الوصول (RLS Policies)
create policy "Allow all read customers" on customers
  for select using (true);

create policy "Allow all insert customers" on customers
  for insert with check (true);

create policy "Allow all update customers" on customers
  for update using (true);

create policy "Allow all delete customers" on customers
  for delete using (true);

-- 4. تفعيل التحديث اللحظي عبر Realtime
alter publication supabase_realtime add table customers;
