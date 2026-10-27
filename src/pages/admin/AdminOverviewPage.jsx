// Dashboard overview page displaying business KPIs revenue trends and recent orders
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ChevronLeft,
  Truck,
  CheckCircle2,
  Activity,
  Plus,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { RevenueTrendChart, CategoryDistributionChart } from '../../components/admin/AdminCharts';
import { TableRowSkeleton } from '../../components/common/Skeletons';

export default function AdminOverviewPage() {
  const { currentAdmin, orders, isLoadingOrders, customers, activityLog, updateOrderStatus } = useAdmin();
  const { allProducts, categories } = useShop();

  // Dynamic calculation of core KPIs from actual orders state
  const totalRevenue = useMemo(() => {
    return (orders || []).reduce(
      (sum, ord) => sum + (ord.deliveryStatus !== 'ملغي' ? (Number(ord.total) || 0) : 0),
      0
    );
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return (orders || []).filter(
      (o) => o.deliveryStatus === 'تم التسليم' || o.status === 'تم التسليم'
    );
  }, [orders]);

  const deliverySuccessRate = useMemo(() => {
    if (!orders || orders.length === 0) return 0;
    return Math.round((deliveredOrders.length / orders.length) * 100);
  }, [orders, deliveredOrders]);

  const pendingOrders = useMemo(() => {
    return (orders || []).filter(
      (o) => o.deliveryStatus === 'بانتظار التأكيد' || o.deliveryStatus === 'قيد التجهيز الطبي'
    );
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return (allProducts || []).filter((p) => Number(p.stockCount) <= 5);
  }, [allProducts]);

  // Dynamic product sales calculation from actual orders items
  const productSalesMap = useMemo(() => {
    const map = {};
    (orders || []).forEach((ord) => {
      if (ord.deliveryStatus === 'ملغي') return;
      if (Array.isArray(ord.items)) {
        ord.items.forEach((item) => {
          const id = item.id || item.productId;
          if (id) {
            map[id] = (map[id] || 0) + (Number(item.quantity) || 1);
          }
        });
      }
    });
    return map;
  }, [orders]);

  const sortedProductsBySales = useMemo(() => {
    return [...(allProducts || [])]
      .map((p) => ({
        ...p,
        salesCount: productSalesMap[p.id] || 0
      }))
      .sort((a, b) => b.salesCount - a.salesCount);
  }, [allProducts, productSalesMap]);

  const hasAnyProductSales = Object.values(productSalesMap).some((qty) => qty > 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'تم التسليم':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'مع المندوب':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'قيد التجهيز الطبي':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'تم تأكيد الطلب':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'بانتظار التأكيد':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ملغي':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome greeting banner */}
      <div className="bg-gradient-to-l from-[#FDF4F0] via-white to-rawaa-soft border border-rawaa-border text-rawaa-dark rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-soft-xs relative overflow-hidden">
        {/* Soft decorative background glow */}
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-rawaa-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-rawaa-sage/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-white border border-rawaa-border text-rawaa-sage text-xs font-bold px-3 py-1 rounded-full mb-1 shadow-soft-xs">
            <Activity size={14} className="text-rawaa-primary" />
            <span>لوحة المتابعة الحية لمتجر بيبي زون</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black text-rawaa-dark flex items-center gap-2">
            <span>مرحباً بك يا {currentAdmin?.name || 'إسلام جميل'}</span>
            <Sparkles size={22} className="text-rawaa-primary animate-pulse shrink-0" />
          </h2>
          <p className="text-xs text-rawaa-muted max-w-xl">
            إليك التقرير الإجمالي للمبيعات وشحنات اليوم عبر كافة محافظات جمهورية مصر العربية
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Link
            to="/admin/products?action=add"
            className="flex items-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-soft-sm hover:shadow-soft-md cursor-pointer"
          >
            <Plus size={16} />
            <span>إضافة منتج جديد</span>
          </Link>
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 bg-white hover:bg-rawaa-primary-light border border-rawaa-border hover:border-rawaa-primary text-rawaa-dark hover:text-rawaa-primary text-xs font-bold px-4 py-2.5 rounded-full shadow-soft-xs transition-all cursor-pointer"
          >
            <span>زيارة المتجر</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* 4 Core KPI metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-rawaa-border shadow-soft-xs hover:shadow-soft-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rawaa-subtle">إجمالي الإيرادات المؤكدة</span>
            <div className="w-9 h-9 rounded-xl bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-heading text-2xl font-black text-rawaa-dark">
              {totalRevenue.toLocaleString('ar-EG')}
            </h3>
            <span className="text-xs font-bold text-rawaa-primary">ج.م</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-bold text-rawaa-muted">
            {totalRevenue > 0 ? (
              <>
                <ArrowUpRight size={14} className="text-emerald-600" />
                <span className="text-emerald-600">من {orders.length} طلب بيع مسجل</span>
              </>
            ) : (
              <span>بانتظار تسجيل أول عملية بيع</span>
            )}
          </div>
        </div>

        {/* Card 2 Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-rawaa-border shadow-soft-xs hover:shadow-soft-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rawaa-subtle">عدد الطلبات المسجلة</span>
            <div className="w-9 h-9 rounded-xl bg-rawaa-sage-light text-rawaa-sage flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-heading text-2xl font-black text-rawaa-dark">
              {orders.length}
            </h3>
            <span className="text-xs font-medium text-rawaa-muted">طلب</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-bold text-rawaa-muted">
            {orders.length > 0 ? (
              <>
                <ArrowUpRight size={14} className="text-emerald-600" />
                <span className="text-emerald-600">{deliveredOrders.length} طلب تم تسليمه</span>
              </>
            ) : (
              <span>لا توجد طلبات جديدة حالياً</span>
            )}
          </div>
        </div>

        {/* Card 3 Active Products */}
        <div className="bg-white rounded-2xl p-5 border border-rawaa-border shadow-soft-xs hover:shadow-soft-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rawaa-subtle">المنتجات بالكتالوج</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-heading text-2xl font-black text-rawaa-dark">
              {allProducts.length}
            </h3>
            <span className="text-xs font-medium text-rawaa-muted">منتج معتمد</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-rawaa-muted font-medium">
            <span>موزعة على {categories.length} أقسام معتمدة</span>
          </div>
        </div>

        {/* Card 4 Customers */}
        <div className="bg-white rounded-2xl p-5 border border-rawaa-border shadow-soft-xs hover:shadow-soft-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rawaa-subtle">قاعدة العملاء والأمهات</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-heading text-2xl font-black text-rawaa-dark">
              {customers.length}
            </h3>
            <span className="text-xs font-medium text-rawaa-muted">عميلة مسجلة</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-bold">
            {customers.length > 0 ? (
              <span className="text-purple-600">
                {customers.filter((c) => c.isVip).length} عميلة مميزة VIP
              </span>
            ) : (
              <span className="text-rawaa-muted font-normal">بانتظار تسجيل أول عميلة</span>
            )}
          </div>
        </div>
      </div>

      {/* Secondary quick alert strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/orders"
          className="flex items-center justify-between p-3.5 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/70 rounded-2xl transition-all"
        >
          <div className="flex items-center gap-2.5">
            <Clock size={18} className="text-amber-600" />
            <div>
              <strong className="block text-xs font-bold text-amber-900">طلبات بانتظار الشحن والتأكيد</strong>
              <span className="text-[11px] text-amber-700">
                {pendingOrders.length > 0 ? `${pendingOrders.length} طلب بحاجة لمتابعة فريق العمل` : 'لا توجد طلبات معلقة حالياً'}
              </span>
            </div>
          </div>
          <ChevronLeft size={16} className="text-amber-700" />
        </Link>

        <Link
          to="/admin/inventory"
          className="flex items-center justify-between p-3.5 bg-red-50/70 hover:bg-red-100/70 border border-red-200/70 rounded-2xl transition-all"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-red-600" />
            <div>
              <strong className="block text-xs font-bold text-red-900">تنبيهات المخزون الحرج</strong>
              <span className="text-[11px] text-red-700">
                {lowStockProducts.length > 0 ? `${lowStockProducts.length} منتجات أوشكت على النفاد` : 'المخزون بوضع آمن ومستقر'}
              </span>
            </div>
          </div>
          <ChevronLeft size={16} className="text-red-700" />
        </Link>

        <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <Truck size={18} className="text-emerald-600" />
            <div>
              <strong className="block text-xs font-bold text-emerald-900">نسبة نجاح التوصيل في مصر</strong>
              <span className="text-[11px] text-emerald-700">
                {orders.length > 0
                  ? `%${deliverySuccessRate} مع مندوبي الشحن السريع`
                  : 'بانتظار انطلاق أول شحنة للمندوبين'}
              </span>
            </div>
          </div>
          <CheckCircle2 size={16} className="text-emerald-700" />
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart />
        </div>
        <div>
          <CategoryDistributionChart />
        </div>
      </div>

      {/* Bottom two column layout for Recent Orders and Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-rawaa-border shadow-soft-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-rawaa-subtle uppercase">العمليات المباشرة</span>
              <h3 className="font-heading text-base sm:text-lg font-bold text-rawaa-dark">أحدث طلبات الشراء</h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-rawaa-primary hover:underline flex items-center gap-1"
            >
              <span>عرض كافة الطلبات</span>
              <ChevronLeft size={14} />
            </Link>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto custom-modal-scroll">
            <table className="w-full text-right text-xs min-w-[680px] border-collapse">
              <thead>
                <tr className="border-b border-rawaa-border/60 text-rawaa-subtle font-bold whitespace-nowrap">
                  <th className="pb-3 pr-2 min-w-[100px]">رقم الطلب</th>
                  <th className="pb-3 min-w-[140px]">العميل والمحافظة</th>
                  <th className="pb-3 whitespace-nowrap">الإجمالي</th>
                  <th className="pb-3 whitespace-nowrap">طريقة الدفع</th>
                  <th className="pb-3 whitespace-nowrap">حالة الشحنة</th>
                  <th className="pb-3 pl-2 text-center whitespace-nowrap">إجراء سريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rawaa-border/40">
                {isLoadingOrders ? (
                  <>
                    <TableRowSkeleton cols={6} />
                    <TableRowSkeleton cols={6} />
                    <TableRowSkeleton cols={6} />
                    <TableRowSkeleton cols={6} />
                    <TableRowSkeleton cols={6} />
                  </>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-rawaa-muted">
                      <div className="w-12 h-12 rounded-2xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center mx-auto mb-2 shadow-soft-xs">
                        <ShoppingBag size={22} />
                      </div>
                      <p className="text-xs font-bold text-rawaa-dark">لا توجد طلبات مسجلة حالياً</p>
                      <p className="text-[11px] text-rawaa-muted mt-0.5">ستظهر أحدث طلبات الشراء الواردة هنا تلقائياً</p>
                    </td>
                  </tr>
                ) : (
                  (orders || []).slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-rawaa-soft/60 transition-colors">
                      <td className="py-3 pr-2 font-mono font-bold text-rawaa-dark whitespace-nowrap">
                        <Link to="/admin/orders" className="hover:text-rawaa-primary hover:underline">
                          #{ord.id}
                        </Link>
                      </td>
                      <td className="py-3 min-w-[140px]">
                        <span className="block font-bold text-rawaa-dark line-clamp-1">{ord.customerName}</span>
                        <span className="block text-[10px] text-rawaa-muted whitespace-nowrap">{ord.city}</span>
                      </td>
                      <td className="py-3 font-bold text-rawaa-dark whitespace-nowrap">
                        {ord.total} ج.م
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className="text-[11px] text-rawaa-muted">{ord.paymentMethod}</span>
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${getStatusBadge(ord.deliveryStatus)}`}>
                          {ord.deliveryStatus}
                        </span>
                      </td>
                      <td className="py-3 pl-2 text-center whitespace-nowrap">
                        {ord.deliveryStatus === 'بانتظار التأكيد' ? (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'تم تأكيد الطلب')}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            تأكيد الطلب
                          </button>
                        ) : ord.deliveryStatus === 'تم تأكيد الطلب' ? (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'قيد التجهيز الطبي')}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            بدء التجهيز
                          </button>
                        ) : ord.deliveryStatus === 'قيد التجهيز الطبي' ? (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'مع المندوب')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            تسليم للمندوب
                          </button>
                        ) : ord.deliveryStatus === 'مع المندوب' ? (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(ord.id, 'تم التسليم')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            تأكيد الاستلام
                          </button>
                        ) : ord.deliveryStatus === 'ملغي' ? (
                          <span className="text-red-600 font-bold text-[10px] bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            ملغي
                          </span>
                        ) : (
                          <Link
                            to="/admin/orders"
                            className="text-rawaa-subtle hover:text-rawaa-primary font-bold text-[11px]"
                          >
                            تفاصيل
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="sm:hidden space-y-3">
            {isLoadingOrders ? (
              <div className="space-y-2">
                <div className="h-20 bg-rawaa-soft/60 rounded-2xl animate-pulse" />
                <div className="h-20 bg-rawaa-soft/60 rounded-2xl animate-pulse" />
              </div>
            ) : (!orders || orders.length === 0) ? (
              <p className="text-xs text-rawaa-muted text-center py-6">لا توجد طلبات مسجلة حالياً</p>
            ) : (
              (orders || []).slice(0, 5).map((ord) => (
                <div key={ord.id} className="p-3.5 bg-rawaa-soft/40 border border-rawaa-border/70 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Link to="/admin/orders" className="font-mono font-bold text-xs text-rawaa-primary hover:underline">
                      #{ord.id}
                    </Link>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(ord.deliveryStatus)}`}>
                      {ord.deliveryStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="block font-bold text-rawaa-dark">{ord.customerName}</span>
                      <span className="block text-[10px] text-rawaa-muted">{ord.city} • {ord.paymentMethod}</span>
                    </div>
                    <span className="font-heading font-black text-rawaa-dark text-sm">{ord.total} ج.م</span>
                  </div>
                  {ord.deliveryStatus === 'بانتظار التأكيد' && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(ord.id, 'تم تأكيد الطلب')}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      تأكيد الطلب الآن
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Best selling products */}
        <div className="bg-white rounded-2xl p-5 border border-rawaa-border shadow-soft-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-rawaa-subtle uppercase">الأكثر طلباً</span>
                <h3 className="font-heading text-base sm:text-lg font-bold text-rawaa-dark">أعلى المنتجات مبيعاً</h3>
              </div>
              <Link
                to="/admin/products"
                className="text-xs font-bold text-rawaa-primary hover:underline flex items-center gap-1"
              >
                <span>الكتالوج</span>
                <ChevronLeft size={14} />
              </Link>
            </div>

            {hasAnyProductSales ? (
              <div className="space-y-3">
                {sortedProductsBySales
                  .filter((p) => p.salesCount > 0)
                  .slice(0, 5)
                  .map((prod) => (
                    <div key={prod.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-rawaa-soft transition-colors">
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover border border-rawaa-border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-rawaa-dark truncate">{prod.name}</span>
                        <span className="block text-[11px] text-rawaa-primary font-bold">{prod.price} ج.م</span>
                      </div>
                      <div className="text-left shrink-0">
                        <span className="block text-xs font-bold text-rawaa-dark font-mono">{prod.salesCount} مبيعة</span>
                        <span className={`block text-[10px] font-bold ${Number(prod.stockCount) <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                          متبقي {prod.stockCount}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-8 px-4 text-center border border-dashed border-rawaa-border/80 rounded-2xl bg-rawaa-soft/30 my-auto">
                <div className="w-10 h-10 rounded-full bg-rawaa-soft text-rawaa-muted flex items-center justify-center mx-auto mb-2">
                  <Package size={20} />
                </div>
                <p className="text-xs font-bold text-rawaa-dark">لا توجد مبيعات مسجلة بعد</p>
                <p className="text-[11px] text-rawaa-muted mt-0.5">
                  سيتم ترتيب المنتجات الأكثر مبيعاً تلقائياً فور تسجيل أول عملية شراء
                </p>
              </div>
            )}
          </div>

          {/* Quick activity log preview */}
          <div className="mt-5 pt-4 border-t border-rawaa-border/60">
            <span className="text-[11px] font-bold text-rawaa-subtle block mb-2">سجل النشاط الإداري الأخير:</span>
            <div className="space-y-1.5">
              {activityLog && activityLog.length > 0 ? (
                activityLog.slice(0, 2).map((act) => (
                  <div key={act.id} className="flex items-center justify-between text-[11px] text-rawaa-muted">
                    <span className="truncate max-w-[200px]">{act.action} — {act.target}</span>
                    <span className="text-[10px] text-rawaa-subtle shrink-0">{act.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-rawaa-muted">لا توجد حركات إدارية مسجلة حديثاً</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

