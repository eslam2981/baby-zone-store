import { ShieldCheck, Truck, Phone } from 'lucide-react';

export function DeliveryGuarantees() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft-xs text-center">
        <div className="w-12 h-12 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-3">
          <ShieldCheck size={24} />
        </div>
        <h3 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
          حق المعاينة قبل الدفع
        </h3>
        <p className="text-xs text-rawaa-muted leading-relaxed">
          يحق لكِ فحص المنتج والتأكد من سلامته التامة ومطابقته للطلب بحضور المندوب قبل دفع أي مليم.
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft-xs text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
          <Truck size={24} />
        </div>
        <h3 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
          سيارات نقل مكيفة
        </h3>
        <p className="text-xs text-rawaa-muted leading-relaxed">
          شحن مخصص يضمن عدم تأثر الخامات العضوية أو السيليكون الطبي أو عبوات الرضاعة بدرجات الحرارة.
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft-xs text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
          <Phone size={24} />
        </div>
        <h3 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
          دعم فوري على الواتساب
        </h3>
        <p className="text-xs text-rawaa-muted leading-relaxed">
          فريق خدمة عملاء متواجد على مدار اليوم لتغيير موعد التسليم أو تعديل العنوان فور رغبتك.
        </p>
      </div>
    </div>
  );
}

