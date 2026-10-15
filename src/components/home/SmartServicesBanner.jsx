// Interactive banner showcasing hospital bag planner and live Egyptian delivery tracking
import { Link } from 'react-router-dom';
import { Sparkles, Truck, CheckCircle2, ChevronLeft, ArrowLeft, Stethoscope, Clock, Baby } from 'lucide-react';

export default function SmartServicesBanner() {
  return (
    <section className="py-12 sm:py-16 bg-[#F4EFEB] border-y border-rawaa-border">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12">
        {/* Section title and subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-rawaa-primary/10 text-rawaa-primary text-xs font-bold px-3 py-1 rounded-full mb-2.5">
            <Sparkles size={14} />
            <span>خدمات وأدوات رَواء الحصرية</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-rawaa-dark">
            أدوات ذكية ترافقك في كل خطوة
          </h2>
          <p className="text-xs sm:text-sm text-rawaa-muted mt-1.5">
            صممنا لكِ خدمات تفاعلية استثنائية لضمان راحة بالك واطمئنانك الكامل
          </p>
        </div>

        {/* Two featured service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1 Hospital Bag Planner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rawaa-border shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-rose-50 rounded-full blur-2xl -translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="w-12 h-12 rounded-2xl bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center shadow-soft-xs">
                  <Baby size={24} />
                </span>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <Stethoscope size={13} />
                  <span>معتمد طبياً</span>
                </span>
              </div>

              <h3 className="font-heading text-lg sm:text-xl font-bold text-rawaa-dark mb-2">
                دليل وحاسبة تجهيز حقيبة الولادة الذكية
              </h3>
              <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed mb-6">
                قائمة تفاعلية مراجعة من استشاريي الأطفال، تتيح لكِ متابعة نسبة جاهزية حقيبة المستشفى والمولود وإضافة المستلزمات الناقصة لسلتكِ بلمسة واحدة.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-rawaa-muted mb-6">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>تتبع نسبة الجاهزية</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>إمكانية الطباعة والحفظ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>نصائح طبية لكل منتج</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>إضافة فورية للسلة</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-rawaa-border/60">
              <Link
                to="/hospital-bag"
                className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs sm:text-sm font-bold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-soft-xs hover:shadow-soft-sm transition-all"
              >
                <span>ابدئي تجهيز حقيبتكِ الآن</span>
                <ChevronLeft size={16} />
              </Link>
            </div>
          </div>

          {/* Card 2 Live Order Tracking */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rawaa-border shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-soft-xs">
                  <Truck size={24} />
                </span>
                <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock size={13} />
                  <span>تحديثات فورية</span>
                </span>
              </div>

              <h3 className="font-heading text-lg sm:text-xl font-bold text-rawaa-dark mb-2">
                نظام تتبع الشحنات المباشر في محافظات مصر
              </h3>
              <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed mb-6">
                تابعي موقع شحنتكِ المعقمة لحظة بلحظة، وتعرفي على اسم مندوب التوصيل وموعد الوصول المحدد مع إمكانية السداد نقداً أو عبر InstaPay عند الاستلام.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-rawaa-muted mb-6">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>تتبع مسار المندوب</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>حق الفحص قبل الدفع</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>سيارات نقل مبردة</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>تغطية لكافة المحافظات</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-rawaa-border/60">
              <Link
                to="/track-order"
                className="w-full bg-rawaa-dark hover:bg-black text-white text-xs sm:text-sm font-bold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-soft-xs hover:shadow-soft-sm transition-all"
              >
                <span>تتبعي مسار طلبيتكِ</span>
                <ChevronLeft size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
