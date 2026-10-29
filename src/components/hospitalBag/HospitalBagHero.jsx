import { Link } from 'react-router-dom';
import { ChevronLeft, Sparkles, Stethoscope, Lock } from 'lucide-react';

export default function HospitalBagHero() {
  return (
    <>
      {/* Breadcrumb links */}
      <div className="flex items-center gap-2 text-xs text-rawaa-muted mb-6">
        <Link to="/" className="hover:text-rawaa-primary transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft size={14} />
        <span className="text-rawaa-dark font-medium">دليل وحاسبة حقيبة الولادة الذكية</span>
      </div>

      {/* Hero title banner */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-4 py-1.5 rounded-full shadow-soft-xs">
            <Sparkles size={14} className="text-amber-600 animate-pulse" />
            <span>قريباً في بيبي زون (Coming Soon)</span>
          </span>
          <div className="inline-flex items-center gap-1.5 bg-rawaa-primary-light text-rawaa-primary text-xs font-bold px-4 py-1.5 rounded-full shadow-soft-xs">
            <Stethoscope size={14} />
            <span>معتمد ومراجع من أطباء واستشاريي طب الأطفال</span>
          </div>
        </div>
        <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-rawaa-dark mb-3 tracking-tight">
          دليل وقائمة تجهيز حقيبة المستشفى والمولود
        </h1>
        <p className="text-sm sm:text-base text-rawaa-muted leading-relaxed">
          نعمل حالياً على تجهيز باقات حقيبة الولادة المتكاملة وتوفير كافة المستلزمات الطبية المعتمدة قريباً. استكشفي القائمة النموذجية الآن أو اطلبي تجهيزاً خاصاً عبر الواتساب.
        </p>
      </div>

      {/* Disabled / Coming Soon Section Alert Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-7 mb-8 flex flex-col md:flex-row items-center justify-between gap-5 shadow-soft-sm text-center md:text-right">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-200 text-amber-950 border border-amber-300 flex items-center justify-center shrink-0 shadow-soft-xs">
            <Lock size={26} className="text-amber-900" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <span className="font-heading font-black text-base sm:text-lg text-amber-950">
                قسم حقيبة الولادة معطّل ومغلق حالياً (قيد التجهيز والتطوير)
              </span>
              <span className="bg-amber-300 text-amber-950 text-xs font-black px-3 py-0.5 rounded-full border border-amber-400">
                Coming Soon · قريباً
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900/80 mt-1 max-w-2xl leading-relaxed">
              نعمل حالياً على تجهيز باقات الولادة الطبية المتكاملة مع مستلزمات المستشفى وتحديث كافة الأسعار والخيارات. كافة أدوات التفاعل والإضافة للسلة معطلة مؤقتاً لحين التدشين الرسمي.
            </p>
          </div>
        </div>

        <a
          href={`https://wa.me/201035401549?text=${encodeURIComponent('مرحباً بيبي زون، أود الاستفسار عن موعد توفر حقيبة الولادة وطلب تجهيز مخصص')}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-soft-sm transition-all shrink-0 cursor-pointer"
        >
          <span>طلب تجهيز عبر الواتساب</span>
          <ChevronLeft size={16} />
        </a>
      </div>
    </>
  );
}

