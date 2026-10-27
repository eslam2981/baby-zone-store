-- ==============================================================================
-- بيبي زون | BABY ZONE — المخطط السحابي الشامل (Supabase Master Schema)
-- قم بنسخ هذا الكود وتشغيله داخل Supabase SQL Editor (>_ New Query)
-- لإنشاء كافة الجداول وتفعيل الـ APIs والأمان والـ Realtime لجميع عناصر المتجر
-- ==============================================================================

-- 1. جدول الكوبونات وقسائم الخصم (Coupons)
create table if not exists coupons (
  id text primary key,
  code text unique not null,
  discount_percent numeric default 0,
  discount_amount numeric default 0,
  type text default 'percentage',
  min_spend numeric default 0,
  max_discount numeric default 0,
  usage_count integer default 0,
  max_usage integer default 100,
  start_date date default current_date,
  end_date date,
  is_active boolean default true,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. جدول المراجعات والتقييمات (Reviews)
create table if not exists reviews (
  id text primary key,
  product_id text not null,
  product_name text,
  customer_name text not null,
  customer_email text,
  rating numeric default 5,
  comment text not null,
  is_approved boolean default true,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. جدول إعدادات المتجر (Store Settings)
create table if not exists store_settings (
  id text primary key default 'primary_store_settings',
  store_name text default 'بيبي زون | BABY ZONE',
  tagline text default 'عالم متكامل لأجود مستلزمات الأم والطفل في مصر',
  description text default 'المتجر الاستثنائي المعتمد لمستلزمات الأم والطفل في مصر',
  support_phone text default '+20 103 540 1549',
  support_email text default 'care@babyzone-egypt.com',
  address text default 'القاهرة، مصر',
  currency text default 'ج.م',
  currency_code text default 'EGP',
  free_shipping_limit numeric default 1375,
  cairo_shipping_fee numeric default 50,
  provinces_shipping_fee numeric default 75,
  tax_rate numeric default 14,
  auto_confirm_orders boolean default false,
  enable_cod boolean default true,
  enable_instapay boolean default true,
  enable_vodafone_cash boolean default true,
  enable_credit_card boolean default true,
  maintenance_mode boolean default false,
  business_hours text default 'يومياً من 9:00 ص حتى 11:00 م',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- إدراج الإعدادات الافتراضية إذا لم تكن موجودة
insert into store_settings (id, store_name, tagline, free_shipping_limit, cairo_shipping_fee, provinces_shipping_fee)
values ('primary_store_settings', 'بيبي زون | BABY ZONE', 'عالم متكامل لأجود مستلزمات الأم والطفل في مصر', 1375, 50, 75)
on conflict (id) do nothing;

-- 4. جدول مديري ومشرفي النظام (Admins Team)
create table if not exists admins (
  id text primary key,
  name text not null,
  email text unique not null,
  phone text,
  role text default 'مدير النظام (Super Admin)',
  avatar text default '/logo.png',
  status text default 'نشط',
  permissions text[] default '{"all"}'::text[],
  last_login timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- إدراج حساب مدير النظام الرئيسي إذا لم يكن موجوداً
insert into admins (id, name, email, phone, role, status, permissions)
values ('adm-1', 'إسلام جميل', 'admin@babyzone-egypt.com', '01035401549', 'مدير النظام (Super Admin)', 'نشط', '{"all"}')
on conflict (email) do nothing;

-- 5. جدول سجل النشاطات الإدارية (Activity Log)
create table if not exists activity_log (
  id text primary key,
  admin_name text not null,
  action text not null,
  target text,
  type text default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. تفعيل سياسات الأمان والحماية (Row Level Security - RLS)
alter table coupons enable row level security;
alter table reviews enable row level security;
alter table store_settings enable row level security;
alter table admins enable row level security;
alter table activity_log enable row level security;

-- سياسات الوصول (إعادة إنشائها بأمان دون تكرار أو أخطاء)
drop policy if exists "Allow all read coupons" on coupons;
create policy "Allow all read coupons" on coupons for select using (true);
drop policy if exists "Allow all write coupons" on coupons;
create policy "Allow all write coupons" on coupons for all using (true);

drop policy if exists "Allow all read reviews" on reviews;
create policy "Allow all read reviews" on reviews for select using (true);
drop policy if exists "Allow all write reviews" on reviews;
create policy "Allow all write reviews" on reviews for all using (true);

drop policy if exists "Allow all read store_settings" on store_settings;
create policy "Allow all read store_settings" on store_settings for select using (true);
drop policy if exists "Allow all write store_settings" on store_settings;
create policy "Allow all write store_settings" on store_settings for all using (true);

drop policy if exists "Allow all read admins" on admins;
create policy "Allow all read admins" on admins for select using (true);
drop policy if exists "Allow all write admins" on admins;
create policy "Allow all write admins" on admins for all using (true);

drop policy if exists "Allow all read activity_log" on activity_log;
create policy "Allow all read activity_log" on activity_log for select using (true);
drop policy if exists "Allow all write activity_log" on activity_log;
create policy "Allow all write activity_log" on activity_log for all using (true);

-- 7. تفعيل التحديث اللحظي عبر Realtime لكافة الجداول بأمان
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'orders') then
    alter publication supabase_realtime add table orders;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'customers') then
    alter publication supabase_realtime add table customers;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'coupons') then
    alter publication supabase_realtime add table coupons;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'reviews') then
    alter publication supabase_realtime add table reviews;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'store_settings') then
    alter publication supabase_realtime add table store_settings;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'admins') then
    alter publication supabase_realtime add table admins;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'activity_log') then
    alter publication supabase_realtime add table activity_log;
  end if;
end $$;
