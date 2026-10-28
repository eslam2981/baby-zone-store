
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Star,
  ArrowLeft,
  Heart,
  Truck,
  Award
} from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="bg-gradient-to-b from-[#FDF4F0] via-rawaa-bg to-rawaa-bg border-b border-rawaa-border overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Editorial column */}
          <div className="lg:col-span-7 flex flex-col items-start text-right">
            {/* Editorial badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white border border-rawaa-border text-rawaa-sage text-[11px] sm:text-xs font-bold px-3 py-1 sm:py-1.5 rounded-full shadow-soft-xs mb-3 sm:mb-4">
              <Sparkles size={13} className="text-rawaa-amber shrink-0" />
              <span>المتجر الحصري المعتمد لمستلزمات الطفولة الفاخرة</span>
            </div>

            {/* Main heading */}
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-rawaa-dark leading-[1.25] tracking-tight mb-3 sm:mb-4">
              لأن بداية حياة طفلك <br className="hidden xs:inline" />
              تستحق <span className="text-rawaa-primary relative inline-block">
                أعلى معايير الأمان
                <span className="absolute bottom-1 right-0 left-0 h-2 bg-rawaa-primary/15 rounded -z-10" />
              </span> والأناقة.
            </h1>

            {/* Subtitle description */}
            <p className="text-xs sm:text-sm md:text-base text-rawaa-muted leading-relaxed max-w-xl mb-6">
              ننتقي لكِ أفضل ما صُنِع عالمياً لمرحلة الحمل وحتى الطفولة المبكرة؛ من الأقطان العضوية
              المنسوجة بمقاييس طبية، إلى عربات السفر الذكية ومقاعد الأمان المعتمدة أوروبياً.
            </p>

            {/* Call to action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 mb-6 sm:mb-8 w-full sm:w-auto">
              <Link
                to="/category/all"
                className="bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs sm:text-sm font-bold px-6 sm:px-7 py-3 rounded-full flex items-center justify-center gap-2 shadow-soft-sm hover:shadow-soft-md transition-all hover:-translate-y-0.5 text-center"
              >
                <span>تسوقي التشكيلة الكاملة</span>
                <ArrowLeft size={16} />
              </Link>

              <Link
                to="/category/gifts"
                className="bg-white hover:bg-rawaa-primary-light border-1.5 border-rawaa-border hover:border-rawaa-primary text-rawaa-dark hover:text-rawaa-primary text-xs sm:text-sm font-bold px-5 sm:px-6 py-3 rounded-full flex items-center justify-center gap-2 shadow-soft-xs transition-all hover:-translate-y-0.5 text-center"
              >
                <Heart size={16} className="text-rawaa-primary" />
                <span>باقات هدايا المواليد</span>
              </Link>
            </div>

            {/* Trust metrics bar */}
            <div className="w-full sm:w-auto grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-card sm:rounded-panel border border-rawaa-border shadow-soft-xs text-xs">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} fill="#EAB308" color="#EAB308" />
                  ))}
                </div>
                <span className="text-[11px] sm:text-xs text-rawaa-muted">
                  <strong className="text-rawaa-dark font-bold">4.9 / 5</strong> تقييم
                </span>
              </div>

              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-r border-rawaa-border/60 pt-2 sm:pt-0 sm:pr-3">
                <Award size={15} className="text-rawaa-sage shrink-0" />
                <span className="text-[11px] sm:text-xs text-rawaa-muted">
                  <strong className="text-rawaa-dark font-bold">+45,000</strong> طلبية
                </span>
              </div>

              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-r border-rawaa-border/60 pt-2 sm:pt-0 sm:pr-3">
                <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                <span className="text-[11px] sm:text-xs text-rawaa-muted">
                  <strong className="text-rawaa-dark font-bold">100% أصلي</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Visual arch composition column */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-[300px] sm:max-w-sm lg:max-w-md mx-auto">
              {/* Arch shaped photo container */}
              <div className="rounded-[100px_100px_20px_20px] sm:rounded-[160px_160px_28px_28px] overflow-hidden shadow-soft-lg sm:shadow-soft-xl border-4 sm:border-8 border-white aspect-[4/4.5] sm:aspect-[4/5] relative bg-rawaa-soft">
                <img
                  src="/images/motherhood/hero-mother-baby.jpg"
                  alt="أم تحتضن مولودها بحنان وأمان وسط أجواء دافئة في بيبي زون"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              {/* Pediatrician recommendation badge */}
              <div className="absolute top-4 sm:top-8 right-2 sm:-right-4 bg-white/95 backdrop-blur-sm p-2 sm:p-2.5 rounded-card shadow-soft-md border border-rawaa-border flex items-center gap-2 z-20">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rawaa-sage-light text-rawaa-sage flex items-center justify-center shrink-0">
                  <ShieldCheck size={15} />
                </div>
                <div className="flex flex-col text-right">
                  <strong className="text-[10px] sm:text-xs text-rawaa-dark font-bold leading-tight">توصية أطباء الأطفال</strong>
                  <small className="text-[9px] sm:text-[10px] text-rawaa-muted">خامات عضوية معتمدة</small>
                </div>
              </div>

              {/* Fast delivery badge */}
              <div className="absolute bottom-4 sm:bottom-6 left-2 sm:-left-4 bg-white/95 backdrop-blur-sm p-2 sm:p-2.5 rounded-card shadow-soft-md border border-rawaa-border flex items-center gap-2 z-20">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center shrink-0">
                  <Truck size={15} />
                </div>
                <div className="flex flex-col text-right">
                  <strong className="text-[10px] sm:text-xs text-rawaa-dark font-bold leading-tight">توصيل سريع وامن</strong>
                  <small className="text-[9px] sm:text-[10px] text-rawaa-muted">خلال 24-48 ساعة</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
