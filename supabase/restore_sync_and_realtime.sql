-- ==============================================================================
-- بيبي زون | BABY ZONE — سكريبت استعادة المزامنة اللحظية والربط الكامل (Real-Time Sync)
-- قم بتشغيل هذا الكود في Supabase SQL Editor لربط الداش بورد وصفحة الطلبات والعميل فورا
-- ==============================================================================

-- 1. إزالة أي سياسات سابقة كانت تحجب البيانات عن العميل أو الداش بورد
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

-- 2. تفعيل السياسات التفاعلية المفتوحة للمزامنة الحية (Live Interactive Sync Policies)
-- جدول الطلبات (Orders): يسمح بالإضافة والقراءة والتحديث لحظياً بين العميل والداش بورد
CREATE POLICY "Orders full sync policy" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- جدول العملاء (Customers): يسمح بمزامنة ملفات العملاء وتحديث طلباتهم تلقائياً
CREATE POLICY "Customers full sync policy" ON customers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- جدول مديري النظام (Admins): يسمح للداش بورد بقراءة المشرفين والصلاحيات
CREATE POLICY "Admins full sync policy" ON admins
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- جدول إعدادات المتجر (Store Settings)
CREATE POLICY "Store Settings full sync policy" ON store_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- جدول الكوبونات (Coupons)
CREATE POLICY "Coupons full sync policy" ON coupons
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- جدول التقييمات (Reviews)
CREATE POLICY "Reviews full sync policy" ON reviews
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- جدول سجل النشاطات (Activity Log)
CREATE POLICY "Activity Log full sync policy" ON activity_log
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. تفعيل وإضافة كافة الجداول في قناة Supabase Realtime لإرسال التحديثات اللحظية لجميع المتصفحات
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE customers;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE coupons;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE store_settings;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;
