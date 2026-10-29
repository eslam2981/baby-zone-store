import { ShieldCheck, UserPlus, RefreshCw } from 'lucide-react';

export default function AdminsHeader({
  isSyncing,
  onRefresh,
  onOpenAdd
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft">
      <div>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold font-cairo text-rawaa-dark">إدارة فريق العمل والصلاحيات</h1>
            <p className="text-xs text-rawaa-dark/60 mt-0.5">
              تعيين مدراء النظام والمشرفين وتحديد الصلاحيات الممنوحة لكل مسؤول
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>مشرفين لحظي (0ms)</span>
        </span>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isSyncing}
          title="مزامنة المشرفين والصلاحيات لحظياً الآن"
          className="p-2 rounded-xl border border-rawaa-border hover:bg-rawaa-soft text-rawaa-dark/70 hover:text-rawaa-dark transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-rawaa-peach' : ''}`} />
        </button>

        <button
          type="button"
          onClick={onOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rawaa-primary text-white rounded-xl text-xs font-bold hover:bg-rawaa-primary/90 transition-all shadow-md shadow-rawaa-primary/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مشرف جديد</span>
        </button>
      </div>
    </div>
  );
}

