import { Users, RefreshCw, Plus } from 'lucide-react';

export default function CustomersHeader({
  isRealtimeConnected,
  isSyncing,
  onRefresh,
  onOpenAddModal
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-rawaa-border shadow-soft">
      <div>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center shrink-0 shadow-soft-xs">
            <Users className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black font-heading text-rawaa-dark">
                إدارة العملاء والصلاحيات
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
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
                <span>{isRealtimeConnected ? 'مزامنة لحظية (Live 0ms)' : 'جاري الاتصال...'}</span>
              </span>
            </div>
            <p className="text-xs text-rawaa-muted mt-1 leading-relaxed">
              إدارة ملفات العملاء، تحديد الصلاحيات والرتب التنفيذية — تتحدث بيانات العملاء تلقائياً لحظة تسجيلهم أو إتمامهم للطلبات
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isSyncing}
          className="flex items-center gap-1.5 bg-white hover:bg-rawaa-soft border border-rawaa-border text-rawaa-dark text-xs font-bold px-3.5 py-2.5 rounded-2xl shadow-soft-xs transition-all cursor-pointer disabled:opacity-50"
          title="مزامنة فورية للعملاء والطلبات"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin text-rawaa-primary' : ''} />
          <span className="hidden sm:inline">مزامنة فورية</span>
        </button>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-soft-xs transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>تسجيل عميل جديد</span>
        </button>
      </div>
    </div>
  );
}

