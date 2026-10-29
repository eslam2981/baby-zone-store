import { Link } from 'react-router-dom';
import { User, Package, Calendar, Truck, ShoppingBag, ArrowRight } from 'lucide-react';
import { OrderCardSkeleton } from '../common/Skeletons';

export function CustomerHubHeader({
  user,
  customerOrders,
  isLoadingOrders,
  activeOrder,
  onSelectOrder,
  formatPrice
}) {
  const activeInFlightCount = customerOrders.filter((o) => o.status !== 'تم التسليم' && o.status !== 'ملغي').length;
  const completedOrdersCount = customerOrders.filter((o) => o.status === 'تم التسليم').length;
  const cancelledOrdersCount = customerOrders.filter((o) => o.status === 'ملغي').length;
  const totalCustomerSpent = customerOrders.reduce(
    (sum, ord) => sum + (ord.status !== 'ملغي' ? (Number(ord.total) || 0) : 0),
    0
  );

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-rawaa-border mb-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-rawaa-border/60">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center font-heading font-black text-2xl shadow-soft-xs border border-rawaa-primary/20 shrink-0">
            {user.name ? user.name.charAt(0) : <User size={28} />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-heading text-xl sm:text-2xl font-black text-rawaa-dark">
                أهلاً بكِ في صفحتكِ الخاصة، {user.name}
              </h1>
              <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-0.5 rounded-full">
                عضوية عائلة بيبي زون المفعلة
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-rawaa-muted">
              <span>📧 {user.email}</span>
              {user.phone ? <span dir="ltr">📱 {user.phone}</span> : <span className="text-rawaa-subtle">📱 لم يُسجل هاتف بعد</span>}
              {user.city ? <span>📍 {user.city}</span> : <span className="text-rawaa-subtle">📍 لم تُحدد المحافظة</span>}
            </div>
          </div>
        </div>

        {/* Quick stats pills */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
          <div className="bg-[#FAF7F2] border border-rawaa-border rounded-2xl px-3.5 py-2 text-center min-w-[80px]">
            <div className="text-[11px] text-rawaa-muted">إجمالي الطلبات</div>
            <div className="font-heading text-base sm:text-lg font-black text-rawaa-dark">{customerOrders.length}</div>
          </div>
          <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl px-3.5 py-2 text-center min-w-[90px]">
            <div className="text-[11px] text-purple-800 font-medium">إجمالي المشتريات</div>
            <div className="font-heading text-base sm:text-lg font-black text-purple-950">{formatPrice(totalCustomerSpent)}</div>
          </div>
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl px-3.5 py-2 text-center min-w-[80px]">
            <div className="text-[11px] text-amber-800 font-medium">قيد الشحن</div>
            <div className="font-heading text-base sm:text-lg font-black text-amber-900">{activeInFlightCount}</div>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl px-3.5 py-2 text-center min-w-[80px]">
            <div className="text-[11px] text-emerald-800 font-medium">تم استلامها</div>
            <div className="font-heading text-base sm:text-lg font-black text-emerald-900">{completedOrdersCount}</div>
          </div>
          {cancelledOrdersCount > 0 && (
            <div className="bg-red-50/70 border border-red-200/80 rounded-2xl px-3.5 py-2 text-center min-w-[70px]">
              <div className="text-[11px] text-red-800 font-medium">ملغية</div>
              <div className="font-heading text-base sm:text-lg font-black text-red-900">{cancelledOrdersCount}</div>
            </div>
          )}
        </div>
      </div>

      {/* Customer's personal orders list */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-rawaa-primary" />
            <h2 className="font-heading text-base font-bold text-rawaa-dark">
              سجل طلباتك الخاصة ({customerOrders.length})
            </h2>
          </div>
          <span className="text-xs text-rawaa-muted">
            يتم تحديث حالات الشحن تلقائياً وبشكل فوري
          </span>
        </div>

        {isLoadingOrders ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        ) : customerOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customerOrders.map((ord) => {
              const isSelected = activeOrder?.id === ord.id;
              const statusColor =
                ord.status === 'تم التسليم'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : ord.status === 'مع المندوب'
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : ord.status === 'قيد التجهيز الطبي'
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : ord.status === 'تم تأكيد الطلب'
                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                  : ord.status === 'ملغي'
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200';

              return (
                <div
                  key={ord.id}
                  className={`rounded-2xl p-4 transition-all border text-right cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-rawaa-primary ring-2 ring-rawaa-primary/20 shadow-soft-md'
                      : 'bg-[#FAF7F2] hover:bg-white border-rawaa-border hover:border-rawaa-primary/40 shadow-soft-2xs'
                  }`}
                  onClick={() => onSelectOrder(ord)}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="font-mono text-xs font-black text-rawaa-dark bg-white border border-rawaa-border px-2.5 py-1 rounded-lg">
                        #{ord.id}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                        {ord.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-rawaa-muted mb-3 flex items-center gap-1.5">
                      <Calendar size={13} className="text-rawaa-subtle shrink-0" />
                      <span>{ord.date}</span>
                    </div>

                    {ord.items && ord.items.length > 0 && (
                      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                        {ord.items.slice(0, 3).map((it, iIdx) => (
                          <img
                            key={iIdx}
                            src={it.image}
                            alt={it.name}
                            className="w-10 h-10 rounded-lg object-cover border border-rawaa-border bg-white shrink-0"
                            title={`${it.name} (${it.quantity || it.qty || 1} قطعة)`}
                          />
                        ))}
                        {ord.items.length > 3 && (
                          <span className="w-10 h-10 rounded-lg bg-rawaa-soft border border-rawaa-border flex items-center justify-center text-[10px] font-bold text-rawaa-muted shrink-0">
                            +{ord.items.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-rawaa-border/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-rawaa-muted block">الإجمالي:</span>
                      <span className="font-heading text-sm font-black text-rawaa-primary">
                        {formatPrice(ord.total)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(ord);
                      }}
                      className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-rawaa-primary text-white shadow-soft-xs'
                          : 'bg-white hover:bg-rawaa-primary hover:text-white text-rawaa-dark border border-rawaa-border'
                      }`}
                    >
                      <span>تتبع المسار</span>
                      <Truck size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#FAF7F2] rounded-2xl p-8 border border-dashed border-rawaa-border text-center">
            <div className="w-14 h-14 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={24} />
            </div>
            <h3 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
              لم تقومي بتسجيل أي طلبات بعد بحسابك
            </h3>
            <p className="text-xs text-rawaa-muted max-w-md mx-auto mb-4 leading-relaxed">
              تصفحي منتجات بيبي زون وأضيفي مستلزمات طفلك للسلة، وستظهر جميع طلباتك هنا تلقائياً لتمكينك من تتبع مسار الشحنة خطوة بخطوة.
            </p>
            <Link
              to="/category/all"
              className="inline-flex items-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all shadow-soft-xs"
            >
              <span>تصفح المنتجات وبدء التسوق</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

