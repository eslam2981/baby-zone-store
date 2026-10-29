import { Boxes, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';

export default function InventoryMetricsGrid({ metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rawaa-border shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-rawaa-dark/60">إجمالي الوحدات</span>
          <span className="w-8 h-8 rounded-lg bg-rawaa-soft text-rawaa-dark flex items-center justify-center shrink-0">
            <Boxes className="w-4 h-4" />
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black font-cairo text-rawaa-dark">
          {metrics.totalUnits.toLocaleString()}
        </div>
        <div className="text-[11px] text-rawaa-dark/50 mt-1 whitespace-nowrap">
          موزعة على {metrics.totalItems} صنفاً
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rawaa-border shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-rawaa-dark/60">القيمة التقديرية</span>
          <span className="w-8 h-8 rounded-lg bg-rawaa-sage/10 text-rawaa-sage flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black font-cairo text-rawaa-sage whitespace-nowrap">
          {metrics.totalValuation.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
        </div>
        <div className="text-[11px] text-rawaa-dark/50 mt-1 whitespace-nowrap">بسعر البيع الحالي</div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rawaa-border shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-rawaa-dark/60">مخزون منخفض (5 فأقل)</span>
          <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black font-cairo text-amber-600">
          {metrics.lowStockCount}
        </div>
        <div className="text-[11px] text-rawaa-dark/50 mt-1 whitespace-nowrap">تحتاج طلب توريد عاجل</div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rawaa-border shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-rawaa-dark/60">نفد من المخزون</span>
          <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black font-cairo text-rose-600">
          {metrics.outOfStockCount}
        </div>
        <div className="text-[11px] text-rawaa-dark/50 mt-1 whitespace-nowrap">منتجات غير متوفرة للشراء</div>
      </div>
    </div>
  );
}

