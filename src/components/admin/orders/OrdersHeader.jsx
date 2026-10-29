import { RefreshCw, Plus } from 'lucide-react';

export default function OrdersHeader({
  isRealtimeConnected,
  isLoadingOrders,
  isSyncing,
  onRefresh,
  onOpenManualOrder
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-heading text-xl font-black text-rawaa-dark">الطلبات والمبيعات المباشرة</h2>
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
            <span>{isRealtimeConnected ? 'مباشر (0ms)' : 'جاري الاتصال...'}</span>
          </span>
        </div>
        <p className="text-xs text-rawaa-muted">
          إدارة ومتابعة شحنات عملاء بيبي زون في كافة محافظات مصر — تظهر الطلبات الجديدة لحظة إتمامها بدون ريفرش
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoadingOrders || isSyncing}
          className="flex items-center gap-1.5 bg-white hover:bg-rawaa-soft border border-rawaa-border text-rawaa-dark text-xs font-bold px-3.5 py-2 rounded-full transition-all cursor-pointer shadow-soft-xs disabled:opacity-50"
          title="مزامنة فورية الآن"
        >
          <RefreshCw size={14} className={isLoadingOrders || isSyncing ? 'animate-spin text-rawaa-primary' : ''} />
          <span>مزامنة فورية</span>
        </button>

        <button
          type="button"
          onClick={onOpenManualOrder}
          className="flex items-center gap-1.5 bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-soft-xs transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>تسجيل طلب هاتف / واتساب</span>
        </button>
      </div>
    </div>
  );
}

