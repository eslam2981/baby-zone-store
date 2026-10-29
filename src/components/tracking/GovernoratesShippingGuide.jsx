import { ShieldCheck, Clock, Truck } from 'lucide-react';
import { GOVERNORATES } from '../../data/shippingData';

export function GovernoratesShippingGuide() {
  return (
    <div className="bg-white rounded-2xl shadow-soft-md border border-rawaa-border p-6 sm:p-8 mb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-rawaa-border">
        <div>
          <span className="text-xs text-rawaa-primary font-bold">دليل الشحن السريع في مصر</span>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-rawaa-dark mt-1">
            مواعيد وتكلفة التوصيل لجميع المحافظات
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck size={16} />
          <span>شحن مبرد ومعقم للمنتجات الحساسة</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GOVERNORATES.map((gov, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-rawaa-border bg-[#FAF7F2] hover:border-rawaa-primary hover:bg-white transition-all cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading text-sm font-bold text-rawaa-dark">{gov.name}</h3>
              <span className="text-[10px] font-bold bg-rawaa-primary-light text-rawaa-primary px-2 py-0.5 rounded-full">
                {gov.speed}
              </span>
            </div>
            <div className="text-xs text-rawaa-muted space-y-1.5 mt-2">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-rawaa-subtle shrink-0" />
                <span>{gov.eta}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck size={13} className="text-rawaa-subtle shrink-0" />
                <span className="text-rawaa-dark font-medium">{gov.fee}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

