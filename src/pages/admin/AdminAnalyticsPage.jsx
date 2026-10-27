import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { RevenueTrendChart, CategoryDistributionChart } from '../../components/admin/AdminCharts';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  MapPin,
  Calendar,
  ShoppingBag,
  Users,
  Percent,
  ArrowUpRight,
  Sparkles,
  Wallet,
  Smartphone
} from 'lucide-react';

/* Analytics and financial reports page with regional performance and revenue trends */
export default function AdminAnalyticsPage() {
  const { orders, customers } = useAdmin();
  const { allProducts } = useShop();
  const [timeRange, setTimeRange] = useState('month');

  /* Calculate core financial and operational analytics */
  const metrics = useMemo(() => {
    const totalRev = (orders || []).reduce(
      (sum, o) => sum + (o.deliveryStatus !== 'ملغي' ? (Number(o.total || o.totalAmount) || 0) : 0),
      0
    );
    const deliveredOrders = (orders || []).filter(
      (o) => o.status === 'تم التسليم' || o.deliveryStatus === 'تم التسليم'
    );
    const validOrders = (orders || []).filter((o) => o.deliveryStatus !== 'ملغي');
    const avgOrderValue = validOrders.length > 0 ? Math.round(totalRev / validOrders.length) : 0;
    const repeatCustomers = (customers || []).filter((c) => (Number(c.ordersCount) || 0) > 1).length;
    const repeatRate =
      customers.length > 0 ? Math.round((repeatCustomers / customers.length) * 100) : 0;
    const deliveryRate = orders.length > 0 ? Math.round((deliveredOrders.length / orders.length) * 100) : 0;
    const digitalOrders = (orders || []).filter((o) => {
      const pm = o.paymentMethod || '';
      return pm.includes('إنستاباي') || pm.includes('محفظة') || pm.includes('فيزا') || pm.includes('بطاق');
    });
    const digitalRate = orders.length > 0 ? Math.round((digitalOrders.length / orders.length) * 100) : 0;

    return { totalRev, avgOrderValue, repeatRate, ordersCount: orders.length, deliveryRate, digitalRate };
  }, [orders, customers]);

  /* Egyptian regional demand distribution from real orders */
  const regions = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [
        { name: 'القاهرة الكبرى', share: 0, amount: '0 ج.م', orders: 0 },
        { name: 'الجيزة و 6 أكتوبر', share: 0, amount: '0 ج.م', orders: 0 },
        { name: 'الإسكندرية والساحل', share: 0, amount: '0 ج.م', orders: 0 },
        { name: 'محافظات الدلتا', share: 0, amount: '0 ج.م', orders: 0 },
        { name: 'مدن القناة والصعيد', share: 0, amount: '0 ج.م', orders: 0 }
      ];
    }
    const totalRev = orders.reduce((sum, o) => sum + (Number(o.total || o.totalAmount) || 0), 0) || 1;
    const cityGroups = {
      'القاهرة الكبرى': { orders: 0, amount: 0 },
      'الجيزة و 6 أكتوبر': { orders: 0, amount: 0 },
      'الإسكندرية والساحل': { orders: 0, amount: 0 },
      'محافظات الدلتا': { orders: 0, amount: 0 },
      'مدن القناة والصعيد': { orders: 0, amount: 0 }
    };
    orders.forEach((o) => {
      if (o.deliveryStatus === 'ملغي') return;
      const city = o.city || '';
      const amount = Number(o.total || o.totalAmount) || 0;
      if (city.includes('جيزة') || city.includes('أكتوبر') || city.includes('زايد')) {
        cityGroups['الجيزة و 6 أكتوبر'].orders += 1;
        cityGroups['الجيزة و 6 أكتوبر'].amount += amount;
      } else if (city.includes('إسكندرية') || city.includes('مطروح') || city.includes('ساحل')) {
        cityGroups['الإسكندرية والساحل'].orders += 1;
        cityGroups['الإسكندرية والساحل'].amount += amount;
      } else if (
        city.includes('دقهلية') ||
        city.includes('منصورة') ||
        city.includes('شرقية') ||
        city.includes('طنطا') ||
        city.includes('بحيرة') ||
        city.includes('منوفية')
      ) {
        cityGroups['محافظات الدلتا'].orders += 1;
        cityGroups['محافظات الدلتا'].amount += amount;
      } else if (
        city.includes('صعيد') ||
        city.includes('أسيوط') ||
        city.includes('سوهاج') ||
        city.includes('قنا') ||
        city.includes('إسماعيلية') ||
        city.includes('سويس') ||
        city.includes('بورسعيد')
      ) {
        cityGroups['مدن القناة والصعيد'].orders += 1;
        cityGroups['مدن القناة والصعيد'].amount += amount;
      } else {
        cityGroups['القاهرة الكبرى'].orders += 1;
        cityGroups['القاهرة الكبرى'].amount += amount;
      }
    });

    return Object.entries(cityGroups).map(([name, data]) => ({
      name,
      orders: data.orders,
      amount: `${data.amount.toLocaleString('ar-EG')} ج.م`,
      share: Math.round((data.amount / totalRev) * 100)
    }));
  }, [orders]);

  /* Payment method breakdown from real orders */
  const paymentMethods = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [
        { name: 'إنستاباي / محافظ إلكترونية', count: 0, share: 0, icon: Smartphone, color: 'bg-emerald-500' },
        { name: 'الدفع نقداً عند الاستلام COD', count: 0, share: 0, icon: Wallet, color: 'bg-amber-500' },
        { name: 'البطاقات الائتمانية فيزا / ماستر', count: 0, share: 0, icon: CreditCard, color: 'bg-rawaa-primary' }
      ];
    }
    const total = orders.length;
    const instapayCount = orders.filter(
      (o) => (o.paymentMethod || '').includes('إنستاباي') || (o.paymentMethod || '').includes('محفظة')
    ).length;
    const codCount = orders.filter(
      (o) => (o.paymentMethod || '').includes('نقداً') || (o.paymentMethod || '').includes('COD') || (o.paymentMethod || '').includes('الاستلام')
    ).length;
    const cardCount = total - instapayCount - codCount;

    return [
      { name: 'إنستاباي / محافظ إلكترونية', count: instapayCount, share: Math.round((instapayCount / total) * 100), icon: Smartphone, color: 'bg-emerald-500' },
      { name: 'الدفع نقداً عند الاستلام COD', count: codCount, share: Math.round((codCount / total) * 100), icon: Wallet, color: 'bg-amber-500' },
      { name: 'البطاقات الائتمانية فيزا / ماستر', count: Math.max(0, cardCount), share: Math.round((Math.max(0, cardCount) / total) * 100), icon: CreditCard, color: 'bg-rawaa-primary' }
    ];
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-rawaa-sage/10 text-rawaa-sage flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold font-cairo text-rawaa-dark">التقارير والتحليلات البيعية</h1>
              <p className="text-xs text-rawaa-dark/60 mt-0.5">
                مؤشرات الأداء المالي، التوزيع الجغرافي للمبيعات، ومتوسط سلة المشتريات
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1 bg-rawaa-soft p-1 rounded-xl border border-rawaa-border text-xs font-bold">
          <button
            type="button"
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === 'week' ? 'bg-white text-rawaa-primary shadow-xs' : 'text-rawaa-dark/60'
            }`}
          >
            آخر 7 أيام
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === 'month' ? 'bg-white text-rawaa-primary shadow-xs' : 'text-rawaa-dark/60'
            }`}
          >
            هذا الشهر
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              timeRange === 'year' ? 'bg-white text-rawaa-primary shadow-xs' : 'text-rawaa-dark/60'
            }`}
          >
            هذا العام
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rawaa-dark/60">متوسط قيمة السلة (AOV)</span>
            <span className="w-8 h-8 rounded-lg bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-cairo text-rawaa-dark">
            {metrics.avgOrderValue.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
          </div>
          <div className="text-[11px] text-rawaa-muted font-bold mt-1 flex items-center gap-1">
            {orders.length > 0 ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">محسوب من {orders.length} طلب</span>
              </>
            ) : (
              <span>بانتظار تسجيل أول طلب</span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rawaa-dark/60">معدل ولاء العملاء</span>
            <span className="w-8 h-8 rounded-lg bg-rawaa-sage/10 text-rawaa-sage flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-cairo text-rawaa-sage">%{metrics.repeatRate}</div>
          <div className="text-[11px] text-rawaa-dark/50 mt-1">
            {customers.length > 0 ? 'نسبة العملاء الذين كرروا الشراء' : 'بانتظار تسجيل العملاء'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rawaa-dark/60">نسبة نجاح التوصيل</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-cairo text-emerald-600">%{metrics.deliveryRate}</div>
          <div className="text-[11px] text-rawaa-dark/50 mt-1">
            {orders.length > 0 ? 'معدل تسليم الشحنات الناجحة' : 'لا توجد شحنات بعد'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rawaa-dark/60">الدفع الرقمي المسبق</span>
            <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-cairo text-amber-700">%{metrics.digitalRate}</div>
          <div className="text-[11px] text-rawaa-dark/50 mt-1">
            {orders.length > 0 ? 'إنستاباي وبطاقات دفع' : 'بانتظار أول معاملة'}
          </div>
        </div>
      </div>


      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart />
        </div>
        <div>
          <CategoryDistributionChart />
        </div>
      </div>

      {/* Egypt Regions Breakdown and Payment Shares */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regions */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rawaa-primary" />
              <h2 className="font-bold font-cairo text-base text-rawaa-dark">
                التوزيع الجغرافي للمبيعات في مصر
              </h2>
            </div>
            <span className="text-xs text-rawaa-dark/50">أعلى المحافظات طلباً</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {regions.map((reg) => (
              <div key={reg.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-rawaa-dark">{reg.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-rawaa-dark/60 font-mono text-[11px]">{reg.orders} طلب</span>
                    <span className="text-rawaa-primary font-cairo">{reg.amount}</span>
                  </div>
                </div>
                <div className="w-full bg-rawaa-soft h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rawaa-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${reg.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rawaa-sage" />
              <h2 className="font-bold font-cairo text-base text-rawaa-dark">
                طرق الدفع المفضلة لدى العملاء
              </h2>
            </div>
            <span className="text-xs text-rawaa-dark/50">نسب العمليات</span>
          </div>

          <div className="space-y-4 pt-2">
            {paymentMethods.map((pm) => {
              const Icon = pm.icon;
              return (
                <div
                  key={pm.name}
                  className="p-4 rounded-xl bg-rawaa-soft/40 border border-rawaa-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-white border border-rawaa-border text-rawaa-dark flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5 text-rawaa-primary" />
                    </span>
                    <div>
                      <div className="font-bold text-xs text-rawaa-dark">{pm.name}</div>
                      <div className="text-[11px] text-rawaa-dark/50 mt-0.5">
                        معاملات مؤكدة وفورية
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black font-cairo text-rawaa-dark">%{pm.share}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
