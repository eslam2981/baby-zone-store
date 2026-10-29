import { Link } from 'react-router-dom';
import { Flame, BadgePercent, ArrowRight, Check } from 'lucide-react';

export function ProductBundleCrossSell({
  isBundleConstituent,
  bundleProduct,
  isBundlePage
}) {
  if (isBundleConstituent && bundleProduct) {
    return (
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-50/90 via-[#FCF8F5] to-amber-50/50 border-2 border-rose-300/80 shadow-soft-xs text-right">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-rose-600 text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-soft-xs">
            <Flame size={12} className="animate-pulse" />
            <span>عرض التوفير الذكي للأمهات</span>
          </span>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300/70">
            وفّري 1,170 ج.م فوراً
          </span>
        </div>

        <h3 className="font-heading text-sm sm:text-base font-extrabold text-rawaa-dark mb-1">
          هذا المنتج مشمول ضمن «بكج الأم والطفل المتكامل 4 في 1»
        </h3>
        <p className="text-xs text-rawaa-muted leading-relaxed mb-3">
          بدلاً من شراء القطع بشكل منفرد بإجمالي 4,670 ج.م، احصلي على البكج الطبي الفاخر كاملاً بسعر <strong className="text-rose-600 font-extrabold">3,500 ج.م</strong> فقط مع شحن مجاني وضمان استبدال.
        </p>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-rose-200/60 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-lg font-black text-rose-600">3,500 ج.م</span>
            <span className="text-xs text-rawaa-subtle line-through">4,670 ج.م</span>
          </div>
          <Link
            to="/product/prod-bundle-package-05"
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-soft-xs"
          >
            <span>عرض تفاصيل البكج بالكامل</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    );
  }

  if (isBundlePage) {
    return (
      <div className="mb-8 p-5 rounded-2xl bg-[#FAF8F5] border-2 border-amber-300/80 shadow-soft-xs text-right">
        <div className="flex items-center gap-2 mb-3">
          <BadgePercent size={20} className="text-amber-600" />
          <h3 className="font-heading text-sm sm:text-base font-extrabold text-rawaa-dark">
            محتويات العرض الشامل (4 منتجات طبية أساسية)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-rawaa-dark">
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-rawaa-border">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>سرير ومحبس المواليد المحمول (Baby Nest)</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-rawaa-border">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>وسادة الرضاعة الطبيعية المريحة للأم</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-rawaa-border">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>غطاء وساتر الرضاعة القطني المعقم</span>
          </div>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-rawaa-border">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>مفرش غيار الحفاضات المقاوم للماء والتسريب</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
