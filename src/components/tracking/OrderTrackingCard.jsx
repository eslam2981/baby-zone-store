import { AlertCircle, Clock, Phone } from 'lucide-react';
import { OrderTrackingStepper } from './OrderTrackingStepper';
import { OrderDetailsGrid } from './OrderDetailsGrid';

export function OrderTrackingCard({ activeOrder, formatPrice }) {
  if (!activeOrder) return null;

  return (
    <div id="tracking-result-card" className="bg-white rounded-2xl shadow-soft-lg border border-rawaa-border overflow-hidden mb-12 scroll-mt-24 animate-fadeIn">
      {/* Header banner of order status */}
      <div className={`p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
        activeOrder.isCancelled
          ? 'bg-gradient-to-r from-[#2e0e0e] via-[#451414] to-[#2e0e0e] text-white border-b border-red-500/30'
          : 'bg-gradient-to-r from-rawaa-dark via-[#26352E] to-rawaa-dark text-white'
      }`}>
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="text-xs bg-white/15 px-3 py-0.5 rounded-full font-mono font-bold tracking-wider text-white">
              #{activeOrder.id}
            </span>
            <span className={`text-xs font-medium ${activeOrder.isCancelled ? 'text-red-300' : 'text-amber-300'}`}>
              {activeOrder.date}
            </span>
            {activeOrder.isCancelled ? (
              <span className="text-xs text-red-200 bg-red-600/40 border border-red-400/40 px-2.5 py-0.5 rounded-full font-bold">
                طلب ملغي
              </span>
            ) : activeOrder.customerName && (
              <span className="text-xs text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full">
                المستلم: {activeOrder.customerName}
              </span>
            )}
          </div>
          <h2 className="font-heading text-lg sm:text-2xl font-bold !text-white text-white">
            {activeOrder.statusLabel}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 mt-1 flex items-center gap-1.5">
            {activeOrder.isCancelled ? (
              <>
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <span>حالة الشحنة: <strong className="text-red-200 font-bold">{activeOrder.estimatedTime}</strong></span>
              </>
            ) : (
              <>
                <Clock size={15} className="text-amber-400 shrink-0" />
                <span>الموعد المتوقع: <strong className="text-white font-bold">{activeOrder.estimatedTime}</strong></span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {!activeOrder.isCancelled ? (
            activeOrder.deliveryPin ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2.5 text-right">
                <div className="text-[11px] text-white/70">كود التحقق الأمني للاستلام</div>
                <div className="font-mono text-lg font-extrabold text-amber-300 tracking-widest">{activeOrder.deliveryPin}</div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2.5 text-right">
                <div className="text-[11px] text-white/70">رقم الشحنة المرجعي</div>
                <div className="font-mono text-base font-extrabold text-amber-300 tracking-wider">#{activeOrder.id}</div>
              </div>
            )
          ) : (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl px-4 py-2.5 text-right">
              <div className="text-[11px] text-red-200">حالة المسار</div>
              <div className="font-bold text-sm text-red-100">تم إلغاء الشحنة</div>
            </div>
          )}
          <a
            href={`https://wa.me/201035401549?text=${encodeURIComponent(
              activeOrder.isCancelled
                ? `مرحباً بيبي زون، بخصوص طلبي الملغي رقم #${activeOrder.id}، أود الاستفسار عن إمكانية إعادة تفعيله.`
                : `مرحباً بيبي زون، أود الاستفسار عن طلبي رقم ${activeOrder.id}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className={`${
              activeOrder.isCancelled
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            } text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 transition-colors shrink-0 shadow-sm`}
          >
            <Phone size={15} />
            <span>{activeOrder.isCancelled ? 'تواصل لإعادة تفعيل الطلب' : 'تواصل بخصوص هذا الطلب'}</span>
          </a>
        </div>
      </div>

      <OrderTrackingStepper activeOrder={activeOrder} />
      <OrderDetailsGrid activeOrder={activeOrder} formatPrice={formatPrice} />
    </div>
  );
}

