import { CheckCircle2, Printer, Share2, RotateCcw } from 'lucide-react';

export default function HospitalBagProgress({
  completionPercentage,
  completedCount,
  totalCount,
  onReset
}) {
  return (
    <div className="bg-white rounded-2xl shadow-soft-md border border-rawaa-border p-5 sm:p-7">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Progress calculation */}
        <div className="w-full md:max-w-md">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-rawaa-dark flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>نسبة جاهزية حقيبتكِ:</span>
            </span>
            <span className="text-rawaa-primary font-mono text-sm">{completionPercentage}% مكتمل</span>
          </div>

          {/* Progress bar line */}
          <div className="w-full h-3 bg-rawaa-soft rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-l from-emerald-500 to-rawaa-primary rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-rawaa-muted mt-2">
            <span>تم إنجاز {completedCount} من أصل {totalCount} غرض</span>
            <span>
              {completionPercentage === 100
                ? 'حقيبتك مكتملة 100%، مستعدة تماماً ليومك الكبير!'
                : completionPercentage > 50
                ? 'أحسنتِ! أنجزتِ أكثر من نصف القائمة'
                : 'ابدئي بتجهيز الأغراض الأساسية أولاً'}
            </span>
          </div>
        </div>

        {/* Quick action tools */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled
            className="bg-[#FAF7F2] border border-rawaa-border text-rawaa-muted text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 cursor-not-allowed shadow-soft-xs"
          >
            <Printer size={15} />
            <span>طباعة القائمة</span>
          </button>

          <button
            type="button"
            disabled
            className="bg-emerald-50 border border-emerald-200 text-emerald-800/70 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 cursor-not-allowed"
          >
            <Share2 size={15} />
            <span>مشاركة على الواتساب</span>
          </button>

          <button
            type="button"
            disabled
            onClick={onReset}
            className="bg-rawaa-soft text-rawaa-muted text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 cursor-not-allowed"
            title="معطل"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

