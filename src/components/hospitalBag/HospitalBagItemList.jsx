import { Link } from 'react-router-dom';
import { CheckSquare, Square, CheckCircle2, Info, Lock } from 'lucide-react';

export default function HospitalBagItemList({
  filteredItems = [],
  checkedItems = [],
  onToggleItem
}) {
  if (filteredItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-rawaa-border p-10 text-center mb-12">
        <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
        <h3 className="font-heading text-sm font-bold text-rawaa-dark">لا توجد عناصر متبقية في هذا القسم!</h3>
        <p className="text-xs text-rawaa-muted mt-1">لقد قمتِ بإتمام جميع الأغراض المطلوبة هنا بنجاح.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 mb-12">
      {filteredItems.map((item) => {
        const isChecked = checkedItems.includes(item.id);

        return (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isChecked
                ? 'border-emerald-300 bg-emerald-50/20'
                : 'border-rawaa-border hover:border-rawaa-primary/50 shadow-soft-xs'
            }`}
          >
            {/* Item checkbox and title */}
            <div className="flex items-start gap-3.5 flex-1">
              <button
                type="button"
                onClick={() => onToggleItem(item.id)}
                className="mt-0.5 text-rawaa-primary hover:scale-110 transition-transform cursor-pointer shrink-0"
                aria-label="تحديد هذا الغرض"
              >
                {isChecked ? (
                  <CheckSquare size={22} className="text-emerald-600 fill-emerald-100" />
                ) : (
                  <Square size={22} className="text-rawaa-subtle" />
                )}
              </button>

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-heading text-sm sm:text-base font-bold transition-all ${
                      isChecked ? 'line-through text-rawaa-muted opacity-70' : 'text-rawaa-dark'
                    }`}
                  >
                    {item.title}
                  </span>

                  {/* Importance badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.importance === 'essential'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.importance === 'recommended'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rawaa-soft text-rawaa-muted border border-rawaa-border'
                    }`}
                  >
                    {item.importanceLabel}
                  </span>
                </div>

                {/* Pediatrician tip */}
                <div className="flex items-start gap-1.5 text-xs text-rawaa-muted leading-relaxed">
                  <Info size={14} className="text-rawaa-primary shrink-0 mt-0.5" />
                  <span>{item.tip}</span>
                </div>
              </div>
            </div>

            {/* Store product match and purchase action */}
            {item.productId ? (
              <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-rawaa-border/60 shrink-0">
                <Link
                  to={`/product/${item.productId}`}
                  className="text-xs text-rawaa-primary hover:underline font-semibold"
                >
                  معاينة الموديل
                </Link>
                <button
                  type="button"
                  disabled
                  className="bg-rawaa-soft text-rawaa-muted border border-rawaa-border text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-not-allowed opacity-75"
                >
                  <Lock size={13} />
                  <span>معطّل (قريباً)</span>
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-rawaa-subtle pt-2 md:pt-0 border-t md:border-t-0 border-rawaa-border/60">
                مستلزم شخصي أو طبي
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

