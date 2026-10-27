-- ==============================================================================
-- بيبي زون | BABY ZONE — سكريبت الحماية والأمان الصارم لقواعد البيانات (Supabase RLS)
-- قم بنسخ هذا الكود بالكامل وتشغيله داخل Supabase SQL Editor (>_ New Query)
-- كود آمن 100% وقابل لإعادة التشغيل عدة مرات دون أي أخطاء (Idempotent)
-- ==============================================================================

-- 1. تفعيل نظام حماية الصفوف (Row Level Security - RLS) على كافة الجداول
ALTER TABLE IF EXISTS admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_log ENABLE ROW LEVEL SECURITY;

-- 2. إزالة كافة السياسات القديمة والمفتوحة تلقائياً مهما كان اسمها (Clean up all legacy policies)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('admins', 'customers', 'orders', 'coupons', 'reviews', 'store_settings', 'activity_log')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- ==============================================================================
-- 3. سياسات جدول المشرفين ومديري النظام (Admins Protection)
-- ==============================================================================
DROP POLICY IF EXISTS "Admins read authenticated only" ON admins;
CREATE POLICY "Admins read authenticated only" ON admins
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins modify authenticated only" ON admins;
CREATE POLICY "Admins modify authenticated only" ON admins
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 4. سياسات جدول العملاء وبيانات الخصوصية (Customers PII Protection)
-- ==============================================================================
DROP POLICY IF EXISTS "Customers read own profile or admin" ON customers;
CREATE POLICY "Customers read own profile or admin" ON customers
  FOR SELECT
  TO authenticated
  USING (
    email = auth.jwt() ->> 'email' 
    OR id = auth.uid()::text 
    OR (auth.jwt() ->> 'role') = 'service_role'
  );

DROP POLICY IF EXISTS "Customers self-registration" ON customers;
CREATE POLICY "Customers self-registration" ON customers
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Customers update own profile or admin" ON customers;
CREATE POLICY "Customers update own profile or admin" ON customers
  FOR UPDATE
  TO authenticated
  USING (
    email = auth.jwt() ->> 'email' 
    OR id = auth.uid()::text
  );

-- ==============================================================================
-- 5. سياسات جدول الطلبات (Orders Protection)
-- ==============================================================================
DROP POLICY IF EXISTS "Orders public creation" ON orders;
CREATE POLICY "Orders public creation" ON orders
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Orders read own or admin" ON orders;
CREATE POLICY "Orders read own or admin" ON orders
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    OR customer_email = auth.jwt() ->> 'email'
  );

DROP POLICY IF EXISTS "Orders modify authenticated only" ON orders;
CREATE POLICY "Orders modify authenticated only" ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Orders delete authenticated only" ON orders;
CREATE POLICY "Orders delete authenticated only" ON orders
  FOR DELETE
  TO authenticated
  USING (true);

-- ==============================================================================
-- 6. سياسات جدول إعدادات المتجر (Store Settings)
-- ==============================================================================
DROP POLICY IF EXISTS "Store settings public read" ON store_settings;
CREATE POLICY "Store settings public read" ON store_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Store settings modify authenticated only" ON store_settings;
CREATE POLICY "Store settings modify authenticated only" ON store_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 7. سياسات جدول الكوبونات (Coupons Protection)
-- ==============================================================================
DROP POLICY IF EXISTS "Coupons read active only" ON coupons;
CREATE POLICY "Coupons read active only" ON coupons
  FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Coupons modify authenticated only" ON coupons;
CREATE POLICY "Coupons modify authenticated only" ON coupons
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 8. سياسات جدول التقييمات (Reviews Protection)
-- ==============================================================================
DROP POLICY IF EXISTS "Reviews read approved only" ON reviews;
CREATE POLICY "Reviews read approved only" ON reviews
  FOR SELECT
  USING (is_approved = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Reviews submit public" ON reviews;
CREATE POLICY "Reviews submit public" ON reviews
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Reviews manage authenticated only" ON reviews;
CREATE POLICY "Reviews manage authenticated only" ON reviews
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 9. سياسات جدول سجل النشاطات الإدارية (Activity Log Protection)
-- ==============================================================================
DROP POLICY IF EXISTS "Activity log authenticated only" ON activity_log;
CREATE POLICY "Activity log authenticated only" ON activity_log
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
