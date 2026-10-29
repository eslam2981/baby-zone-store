import { CheckCircle2, Truck, ArrowLeft } from 'lucide-react';

export default function CheckoutSuccessView({
  order,
  formatPrice,
  onNavigateToTracking,
  onClose
}) {
  return (
    <div className="text-center py-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
        <CheckCircle2 size={36} />
      </div>
      <div>
        <h3 className="font-heading text-xl font-black text-rawaa-dark mb-1">
          تهانينا! تم استلام طلبك بنجاح
        </h3>
        <p className="text-xs text-rawaa-muted max-w-sm mx-auto">
          شكراً لثقتك في بيبي زون. رقم طلبك المعتمد هو:
        </p>
        <div className="inline-block bg-rawaa-soft border border-rawaa-border text-rawaa-primary font-mono text-lg font-black px-4 py-2 rounded-2xl mt-2">
          #{order.id}
        </div>
      </div>

      <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-rawaa-border/60 text-xs text-right space-y-1.5 max-w-sm mx-auto">
        <div className="flex justify-between font-bold text-rawaa-dark">
          <span>الاسم:</span>
          <span>{order.name}</span>
        </div>
        <div className="flex justify-between text-rawaa-muted">
          <span>المحافظة:</span>
          <span>{order.city}</span>
        </div>
        <div className="flex justify-between text-rawaa-muted">
          <span>طريقة الدفع:</span>
          <span>{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between font-bold text-rawaa-primary pt-2 border-t border-rawaa-border">
          <span>المبلغ المطلوب:</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <p className="text-[11px] text-rawaa-muted">
        سيتواصل معك فريق خدمة العملاء على رقم <strong>{order.phone}</strong> لتأكيد ميعاد التوصيل مع مندوب الشحن.
      </p>

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={onNavigateToTracking}
          className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3.5 px-6 rounded-full transition-all shadow-soft-sm hover:shadow-soft-md cursor-pointer flex items-center justify-center gap-2"
        >
          <Truck size={16} />
          <span>الانتقال إلى صفحة طلباتي ومتابعة الشحنة</span>
          <ArrowLeft size={14} />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full border border-rawaa-border hover:bg-rawaa-soft text-rawaa-muted hover:text-rawaa-dark text-xs font-semibold py-2.5 px-4 rounded-full transition-colors cursor-pointer"
        >
          متابعة تصفح المتجر
        </button>
      </div>
    </div>
  );
}

