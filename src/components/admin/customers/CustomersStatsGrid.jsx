import { Users, UserCheck, Crown, ShoppingBag } from 'lucide-react';

export default function CustomersStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      <div className="bg-white p-5 rounded-3xl border border-rawaa-border shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-rawaa-muted">إجمالي العملاء المسجلين</span>
          <span className="w-8 h-8 rounded-xl bg-rawaa-soft text-rawaa-dark flex items-center justify-center">
            <Users className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-black font-heading text-rawaa-dark">
          {stats.total}
        </div>
        <div className="text-[11px] text-rawaa-muted mt-1">حسابات موثقة ومسجلة في المتجر</div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-rawaa-border shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-rawaa-muted">العملاء النشطون</span>
          <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-black font-heading text-emerald-600">
          {stats.activeCount}
        </div>
        <div className="text-[11px] text-rawaa-muted mt-1">مفعلون بكامل الصلاحيات</div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-rawaa-border shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-rawaa-muted">أعضاء فئة VIP</span>
          <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Crown className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-black font-heading text-amber-600">
          {stats.vipCount}
        </div>
        <div className="text-[11px] text-rawaa-muted mt-1">يتمتعون بالخصومات والأولوية</div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-rawaa-border shadow-soft">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-rawaa-muted">إجمالي مشتريات العملاء</span>
          <span className="w-8 h-8 rounded-xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl font-black font-heading text-rawaa-primary">
          {stats.totalSpent.toLocaleString()} <span className="text-xs font-normal">ج.م</span>
        </div>
        <div className="text-[11px] text-rawaa-muted mt-1">القيمة الإجمالية للمشتريات</div>
      </div>
    </div>
  );
}

