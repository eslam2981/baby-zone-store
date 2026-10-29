import { Boxes, Package, RefreshCw } from 'lucide-react';

export default function InventoryHeader({
  totalUnits = 0,
  isRealtimeConnected,
  isSyncing,
  onRefresh
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft">
      <div>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-rawaa-sage/10 text-rawaa-sage flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-cairo text-rawaa-dark">إدارة المخزون والمستودع</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isRealtimeConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {isRealtimeConnected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isRealtimeConnected ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </span>
                <span>{isRealtimeConnected ? 'مخزون لحظي (0ms)' : 'جاري الاتصال...'}</span>
              </span>
            </div>
            <p className="text-xs text-rawaa-dark/60 mt-0.5">
              تتبع كميات المنتجات ومستويات التوريد والتنبيه عند نفاد المخزون — يتناقص المخزون فورياً عند كل طلب
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isSyncing}
          className="flex items-center gap-1.5 bg-white hover:bg-rawaa-soft border border-rawaa-border text-rawaa-dark text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-soft-xs disabled:opacity-50"
          title="مزامنة فورية للمخزون والمنتجات"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin text-rawaa-primary' : ''} />
          <span className="hidden sm:inline">مزامنة فورية</span>
        </button>
        <div className="px-3.5 py-2 bg-rawaa-soft rounded-xl text-xs font-bold text-rawaa-dark flex items-center gap-2 whitespace-nowrap">
          <Package className="w-4 h-4 text-rawaa-primary shrink-0" />
          <span>{totalUnits.toLocaleString()} قطعة بالمستودع</span>
        </div>
      </div>
    </div>
  );
}

