import { Link } from 'react-router-dom';
import { User, Package, ArrowLeft, LogOut, Crown, Briefcase, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

const PERMISSION_LABELS = {
  view_catalog: 'تصفح الكتالوج والأسعار',
  place_orders: 'إتمام الطلبات وتأكيد الشراء',
  view_own_orders: 'تتبع الشحنات وسجل الطلبات',
  rate_products: 'كتابة تقييمات ومراجعات',
  hospital_bag: 'حاسبة شنطة الولادة',
  vip_discounts: 'خصومات VIP التلقائية',
  cod_payment: 'الدفع عند الاستلام (COD)',
  instapay_payment: 'الدفع عبر إنستاباي والمحافظ',
  online_payment: 'الدفع الإلكتروني (فيزا / ماستركارد)',
  bulk_purchasing: 'أسعار وكميات الجملة (15%)'
};

export default function AuthCustomerProfileView({
  user,
  userOrders = [],
  isLoadingUserOrders,
  onLogout,
  onClose
}) {
  const totalSpent = userOrders.reduce(
    (sum, ord) =>
      sum +
      (ord.status !== 'ملغي' && ord.deliveryStatus !== 'ملغي'
        ? Number(ord.total_amount) || Number(ord.total) || 0
        : 0),
    0
  );

  const isWholesaler = user.role === 'wholesaler';
  const isSupervisor = user.role === 'supervisor';
  const isVip = !isWholesaler && !isSupervisor && (user.role === 'vip_customer' || Boolean(user.isVip));
  const isInactive = user.status === 'غير نشط';
  const isBlocked = user.status === 'محظور';

  const pendingOrdersCount = userOrders.filter(
    (o) => o.status !== 'تم التسليم' && o.status !== 'ملغي'
  ).length;

  const permissions = Array.isArray(user.permissions) ? user.permissions : [];

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden text-right">
      {/* Top Profile Summary Header - Sticky at top */}
      <div className="text-center pt-6 pb-3 px-6 shrink-0 border-b border-rawaa-border/60 bg-white">
        <div className="w-14 h-14 rounded-2xl bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-2 font-heading font-black text-2xl shadow-soft-xs border border-rawaa-primary/20">
          {user.name ? user.name.charAt(0) : <User size={26} />}
        </div>

        {/* Name and Role Badge */}
        <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
          <h3 className="font-heading text-lg font-black text-rawaa-dark">أهلاً بكِ، {user.name}!</h3>
          {isWholesaler ? (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-900 border-indigo-200 flex items-center gap-1 shadow-2xs">
              <Briefcase size={12} className="text-indigo-600" />
              تاجر / توريد جملة (خصم 15%)
            </span>
          ) : isSupervisor ? (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-purple-50 text-purple-900 border-purple-200 flex items-center gap-1 shadow-2xs">
              <ShieldCheck size={12} className="text-purple-600" />
              مشرفة دعم ومتابعة
            </span>
          ) : isVip ? (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-900 border-amber-300 flex items-center gap-1 shadow-2xs">
              <Crown size={12} className="text-amber-500 fill-amber-500" />
              عضوية VIP الذهبية
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs">
              عضوية مسجلة
            </span>
          )}
        </div>

        <p className="text-xs text-rawaa-muted font-mono" dir="ltr">{user.email}</p>
      </div>

      {/* Scrollable Middle Body - ONLY this part scrolls, cleanly inside */}
      <div className="flex-1 overflow-y-auto custom-modal-scroll px-5 sm:px-6 py-4 space-y-3">
        {/* Account Status Alert if not active */}
        {isInactive && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-right text-xs text-amber-900 flex items-start gap-2 shadow-2xs">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">حسابك قيد المراجعة والاعتماد</span>
              <span className="text-[11px] text-amber-700">يجري مراجعة ملفك التجاري من الإدارة، لا يمكن إتمام الطلبات لحين التفعيل.</span>
            </div>
          </div>
        )}

        {isBlocked && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-right text-xs text-rose-900 flex items-start gap-2 shadow-2xs">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">تم تجميد وحظر هذا الحساب</span>
              <span className="text-[11px] text-rose-700">يرجى التواصل مع خدمة العملاء للاستفسار عن سبب الحظر.</span>
            </div>
          </div>
        )}

        {/* Real User Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-rawaa-soft/80 border border-rawaa-border/70 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-rawaa-muted font-bold block mb-1">الطلبات المسجلة</span>
            <strong className="font-heading text-base sm:text-lg font-black text-rawaa-dark block">
              {isLoadingUserOrders && userOrders.length === 0 ? '...' : userOrders.length}
            </strong>
          </div>
          <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-purple-800 font-medium block mb-1">إجمالي المشتريات</span>
            <strong className="font-heading text-xs sm:text-sm font-black text-purple-950 block truncate">
              {isLoadingUserOrders && userOrders.length === 0 ? '...' : `${totalSpent.toLocaleString()} ج.م`}
            </strong>
          </div>
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-amber-800 font-medium block mb-1">قيد التوصيل</span>
            <strong className="font-heading text-base sm:text-lg font-black text-amber-900 block">
              {isLoadingUserOrders && userOrders.length === 0 ? '...' : pendingOrdersCount}
            </strong>
          </div>
        </div>

        {/* Permissions Matrix Pills */}
        {permissions.length > 0 && (
          <div className="bg-white border border-rawaa-border/80 rounded-2xl p-3 text-right shadow-2xs">
            <span className="text-[11px] font-bold text-rawaa-dark block mb-2">
              الصلاحيات والميزات المفعلة لك ({permissions.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {permissions.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-rawaa-soft text-rawaa-dark border border-rawaa-border/60"
                >
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  <span>{PERMISSION_LABELS[p] || p}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Real Customer Contact Card */}
        <div className="bg-rawaa-soft rounded-2xl p-3.5 text-right flex flex-col gap-2 text-xs text-rawaa-dark border border-rawaa-border/60">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-rawaa-muted">رقم الهاتف المعتمد:</span>
            <strong className="text-rawaa-dark font-mono font-bold" dir="ltr">
              {user.phone || 'لم يُسجل هاتف بعد'}
            </strong>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-rawaa-border/60">
            <span className="text-rawaa-muted">المحافظة والعنوان:</span>
            <strong className="text-rawaa-dark font-bold">
              {user.city ? `${user.city}${user.address ? ` - ${user.address}` : ''}` : 'لم تُحدد المحافظة'}
            </strong>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-rawaa-border/60">
            <span className="text-rawaa-muted">حالة الحساب:</span>
            {isBlocked ? (
              <span className="text-rose-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                محظور ومقيد
              </span>
            ) : isInactive ? (
              <span className="text-amber-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                غير نشط — قيد المراجعة
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                نشط وموثق
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Sticky Action Buttons Footer - ALWAYS VISIBLE */}
      <div className="p-4 sm:p-5 bg-white border-t border-rawaa-border shrink-0 flex flex-col gap-2">
        <Link
          to="/track-order"
          onClick={onClose}
          className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 cursor-pointer"
        >
          <Package size={16} />
          <span>صفحتي الخاصة وسجل طلباتي ({userOrders.length})</span>
          <ArrowLeft size={14} />
        </Link>

        <button
          type="button"
          className="w-full border border-rawaa-border hover:border-red-300 hover:bg-red-50 text-red-600 text-xs font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
          onClick={onLogout}
        >
          <LogOut size={16} />
          <span>تسجيل الخروج من الحساب</span>
        </button>
      </div>
    </div>
  );
}

