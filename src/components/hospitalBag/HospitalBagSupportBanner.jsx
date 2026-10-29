import { ChevronLeft } from 'lucide-react';

export default function HospitalBagSupportBanner() {
  return (
    <div className="bg-gradient-to-r from-[#222C27] to-rawaa-dark text-white rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden">
      <div className="max-w-2xl mx-auto space-y-3 relative z-10">
        <span className="inline-block bg-white/10 text-amber-200 text-xs font-bold px-3.5 py-1 rounded-full">
          فريق بيبي زون الطبي معكِ خطوة بخطوة
        </span>
        <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-white">
          هل أنتِ محتارة في اختيار المقاسات أو نوع المستلزمات؟
        </h2>
        <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
          استشاريونا جاهزون لمساعدتكِ في مراجعة قائمتك عبر الواتساب وتجهيز بكج مخصص يناسب موعد ولادتكِ وفصول السنة.
        </p>
        <div className="pt-2">
          <a
            href="https://wa.me/201035401549?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A8%D9%8A%D8%A8%D9%8A%20%D8%B2%D9%88%D9%86%D8%8C%20%D8%A3%D8%AD%D8%AA%D8%A7%D8%AC%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9%20%D9%81%D9%8A%20%D8%AA%D8%AC%D9%87%D9%8A%D8%B2%20%D9%82%D8%A7%D8%A6%D9%85%D8%A9%20%D8%AD%D9%82%D9%8A%D8%A8%D8%A9%20%D8%A7%D9%84%D9%88%D9%84%D8%A7%D8%AF%D8%A9"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-soft-md transition-all cursor-pointer"
          >
            <span>تحدثي مع أخصائية رعاية الأمهات عبر واتساب</span>
            <ChevronLeft size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

