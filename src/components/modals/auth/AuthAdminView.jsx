import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, LogOut } from 'lucide-react';

export default function AuthAdminView({
  currentAdmin,
  user,
  onLogout,
  onClose
}) {
  const permissions = currentAdmin?.permissions || ['all'];
  const isSuperAdmin = permissions.includes('all') || permissions.includes('*');

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden text-right">
      {/* Top Header Summary - Sticky at top */}
      <div className="text-center pt-6 pb-3 px-6 shrink-0 border-b border-rawaa-border/60 bg-white">
        <div className="w-14 h-14 rounded-2xl bg-rawaa-primary/10 border-2 border-rawaa-primary/30 text-rawaa-primary flex items-center justify-center mx-auto mb-2 shadow-soft-xs">
          <ShieldCheck size={28} />
        </div>
        <h3 className="font-heading text-lg font-bold text-rawaa-dark">
          أهلاً بك، {currentAdmin?.name || user?.name || 'مدير النظام'}!
        </h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-xs text-rawaa-muted font-mono" dir="ltr">{currentAdmin?.email || user?.email}</span>
          <span className="text-[10px] font-bold bg-rawaa-sage/15 text-rawaa-sage px-2.5 py-0.5 rounded-full border border-rawaa-sage/30">
            {currentAdmin?.role || 'مشرف إداري'}
          </span>
        </div>
      </div>

      {/* Middle Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-modal-scroll px-5 sm:px-6 py-4 space-y-3">
        <div className="bg-rawaa-soft border border-rawaa-border rounded-2xl p-3.5 text-right flex flex-col gap-2 text-xs text-rawaa-dark">
          <div className="flex items-center justify-between pb-1.5 border-b border-rawaa-border">
            <span className="font-bold text-[11px]">حالة الحساب الإداري:</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              صلاحيات مفعلة
            </span>
          </div>
          <div className="pt-1">
            <span className="font-semibold text-rawaa-dark text-[11px] block mb-1.5">الصلاحيات المتاحة لك:</span>
            <div className="flex flex-wrap gap-1">
              {isSuperAdmin ? (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                  ⚡ كامل صلاحيات لوحة التحكم (Super Admin)
                </span>
              ) : (
                permissions.map((perm) => (
                  <span key={perm} className="bg-white border border-rawaa-border text-rawaa-dark text-[10px] px-2 py-0.5 rounded font-medium shadow-2xs">
                    {perm === 'orders' ? 'الطلبات والمبيعات' :
                     perm === 'products' ? 'إدارة المنتجات' :
                     perm === 'inventory' ? 'المخزون' :
                     perm === 'customers' ? 'العملاء' :
                     perm === 'coupons' ? 'كوبونات الخصم' :
                     perm === 'reviews' ? 'التقييمات' :
                     perm === 'analytics' ? 'التقارير والإحصائيات' :
                     perm === 'settings' ? 'إعدادات المتجر' :
                     perm === 'admins' ? 'فريق الإدارة' : perm}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Sticky Action Buttons Footer - ALWAYS VISIBLE */}
      <div className="p-4 sm:p-5 bg-white border-t border-rawaa-border shrink-0 flex flex-col gap-2">
        <Link
          to="/admin"
          onClick={onClose}
          className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 cursor-pointer"
        >
          <ShieldCheck size={16} />
          <span>الانتقال إلى لوحة الإدارة والتحكم</span>
          <ArrowLeft size={14} />
        </Link>

        <button
          type="button"
          className="w-full border border-rawaa-border hover:border-red-300 hover:bg-red-50 text-red-600 text-xs font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
          onClick={onLogout}
        >
          <LogOut size={16} />
          <span>تسجيل الخروج من الحساب</span>
        </button>
      </div>
    </div>
  );
}

