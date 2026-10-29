import { RefreshCw, Plus } from 'lucide-react';

export default function ProductsHeader({
  totalProducts = 0,
  totalCategories = 0,
  isRealtimeConnected,
  isSyncing,
  onRefresh,
  onOpenAdd
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-heading text-xl font-black text-rawaa-dark">إدارة كتالوج المنتجات</h2>
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
            <span>{isRealtimeConnected ? 'كتالوج لحظي (0ms)' : 'جاري الاتصال...'}</span>
          </span>
        </div>
        <p className="text-xs text-rawaa-muted">
          إجمالي {totalProducts} منتج مسجل بالكتالوج عبر {totalCategories} أقسام — تحديث فوري وتلقائي
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isSyncing}
          className="flex items-center gap-1.5 bg-white hover:bg-rawaa-soft border border-rawaa-border text-rawaa-dark text-xs font-bold px-3 py-2.5 rounded-full shadow-soft-xs transition-all cursor-pointer disabled:opacity-50"
          title="مزامنة فورية للكتالوج"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin text-rawaa-primary' : ''} />
          <span className="hidden sm:inline">مزامنة</span>
        </button>
        <button
          type="button"
          onClick={onOpenAdd}
          className="flex items-center justify-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-soft-xs transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>إضافة منتج جديد</span>
        </button>
      </div>
    </div>
  );
}

