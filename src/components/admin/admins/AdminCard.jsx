import { Mail, Phone, Key, Zap, Trash2 } from 'lucide-react';

export default function AdminCard({
  admin,
  isCurrentUser,
  onEditPassword,
  onToggleStatus,
  onDelete
}) {
  return (
    <div className="bg-white rounded-2xl border border-rawaa-border shadow-soft p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-rawaa-primary/40 transition-all">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-rawaa-primary/10 text-rawaa-primary font-black text-sm flex items-center justify-center flex-shrink-0">
              {admin.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-sm text-rawaa-dark flex items-center gap-1.5">
                <span>{admin.name}</span>
                {isCurrentUser && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rawaa-sage text-white font-normal">
                    أنت
                  </span>
                )}
              </h3>
              <div className="text-[11px] text-rawaa-primary font-bold mt-0.5">
                {admin.role}
              </div>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              admin.status === 'نشط'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            {admin.status}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-rawaa-dark/70 pt-2 border-t border-rawaa-border/50">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-rawaa-dark/40" />
            <span className="font-mono">{admin.email}</span>
          </div>
          {admin.phone && (
            <div className="flex items-center gap-2" dir="ltr">
              <Phone className="w-3.5 h-3.5 text-rawaa-dark/40" />
              <span className="font-mono">{admin.phone}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <div className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-rawaa-dark/40 shrink-0" />
              <span className="text-[11px] text-rawaa-dark/70">
                كلمة المرور: <span className="font-mono text-rawaa-muted">••••••••</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditPassword(admin)}
              className="text-[10px] text-rawaa-primary hover:underline font-bold px-1.5 py-0.5 rounded hover:bg-rawaa-primary/10 transition-colors"
            >
              تغيير
            </button>
          </div>
        </div>

        {/* Permissions Badges */}
        <div className="mt-3 pt-3 border-t border-rawaa-border/50">
          <div className="text-[11px] font-bold text-rawaa-dark/60 mb-2">الصلاحيات:</div>
          <div className="flex flex-wrap gap-1.5">
            {admin.permissions?.map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 rounded-md bg-rawaa-soft text-[10px] font-bold text-rawaa-dark border border-rawaa-border"
              >
                {p === 'all' ? (
                  <span className="flex items-center gap-1 text-rawaa-primary">
                    <Zap className="w-3 h-3 fill-rawaa-primary" />
                    <span>كامل الصلاحيات</span>
                  </span>
                ) : p === 'orders' ? (
                  'إدارة الطلبات'
                ) : p === 'products' ? (
                  'المنتجات والمخزون'
                ) : p === 'customers' ? (
                  'قاعدة العملاء'
                ) : p === 'coupons' ? (
                  'الكوبونات'
                ) : (
                  p
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {!isCurrentUser && (
        <div className="pt-3 border-t border-rawaa-border flex items-center justify-between">
          <button
            type="button"
            onClick={() => onToggleStatus(admin)}
            className="text-xs font-bold text-rawaa-dark/70 hover:text-rawaa-dark cursor-pointer"
          >
            {admin.status === 'نشط' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
          </button>

          <button
            type="button"
            onClick={() => onDelete(admin)}
            className="p-1.5 rounded-lg text-rawaa-dark/40 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="حذف المشرف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

