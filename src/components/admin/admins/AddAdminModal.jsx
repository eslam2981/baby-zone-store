import { createPortal } from 'react-dom';
import { Shield, X, Zap } from 'lucide-react';
import ModernSelect from '../../common/ModernSelect';
import ModernCheckbox from '../../common/ModernCheckbox';

export default function AddAdminModal({
  isOpen,
  onClose,
  formData,
  onChangeForm,
  onTogglePermission,
  onToggleAllPermissions,
  onSubmit
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-rawaa-border max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 bg-rawaa-soft/60 border-b border-rawaa-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-rawaa-primary" />
            <h3 className="font-bold font-cairo text-rawaa-dark">إضافة مشرف جديد للمنصة</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white text-rawaa-dark/60 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto custom-modal-scroll">
            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">الاسم الكامل</label>
              <input
                type="text"
                placeholder="مثال: ياسمين أحمد"
                value={formData.name}
                onChange={(e) => onChangeForm({ name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">البريد الإلكتروني *</label>
              <input
                type="email"
                dir="ltr"
                placeholder="admin@domain.com"
                value={formData.email}
                onChange={(e) => onChangeForm({ email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">كلمة المرور الخاصة بالمشرف *</label>
              <input
                type="password"
                dir="ltr"
                placeholder="كلمة مرور الحساب الإداري (6 أحرف على الأقل)"
                value={formData.password}
                onChange={(e) => onChangeForm({ password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                required
              />
              <span className="text-[10px] text-rawaa-muted mt-1 block">
                كلمة المرور التي سيستخدمها المشرف لتسجيل الدخول للوحة التحكم
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">الدور الوظيفي</label>
                <ModernSelect
                  value={formData.role}
                  onChange={(e) => onChangeForm({ role: e.target.value })}
                  options={[
                    { value: 'مدير عام', label: 'مدير عام' },
                    { value: 'مشرف طلبات', label: 'مشرف طلبات' },
                    { value: 'مسؤول مخزون', label: 'مسؤول مخزون' },
                    { value: 'خدمة عملاء', label: 'خدمة عملاء' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="01012345678"
                  value={formData.phone}
                  onChange={(e) => onChangeForm({ phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-mono text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-rawaa-dark">تحديد الصلاحيات الممنوحة</label>
                <button
                  type="button"
                  onClick={onToggleAllPermissions}
                  className="text-[11px] font-bold text-rawaa-primary hover:underline cursor-pointer"
                >
                  {formData.permissions.includes('all') ? 'إلغاء كامل الصلاحيات' : '⚡ منح كامل الصلاحيات (Super Admin)'}
                </button>
              </div>

              {formData.permissions.includes('all') ? (
                <div className="p-3 bg-rawaa-primary/10 border border-rawaa-primary/30 rounded-xl text-xs font-bold text-rawaa-primary flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-rawaa-primary" />
                  <span>تم منح هذا الحساب صلاحية كاملة (Super Admin) للوصول لكافة أقسام وإعدادات لوحة التحكم.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'orders', label: 'إدارة الطلبات والشحنات والفواتير' },
                    { id: 'products', label: 'إدارة المنتجات والأقسام' },
                    { id: 'inventory', label: 'مراقبة المخزون وتنبيهات النواقص' },
                    { id: 'customers', label: 'استعراض وتعديل بيانات العملاء' },
                    { id: 'coupons', label: 'إصدار وتفعيل كوبونات الخصم' },
                    { id: 'reviews', label: 'مراجعة واعتماد تقييمات العملاء' },
                    { id: 'analytics', label: 'التقارير والإحصائيات والأرباح' },
                    { id: 'settings', label: 'إعدادات المتجر وبيانات الاتصال' },
                    { id: 'admins', label: 'إدارة فريق العمل والصلاحيات' }
                  ].map((perm) => {
                    const isChecked = formData.permissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => onTogglePermission(perm.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors select-none ${
                          isChecked
                            ? 'bg-rawaa-primary/5 border-rawaa-primary/30 text-rawaa-primary font-bold'
                            : 'hover:bg-rawaa-soft border-rawaa-border/50 text-rawaa-dark'
                        }`}
                      >
                        <ModernCheckbox
                          checked={isChecked}
                          onChange={() => onTogglePermission(perm.id)}
                          color="primary"
                          size="sm"
                        />
                        <span>{perm.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 p-4 sm:px-6 py-3 border-t border-rawaa-border shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-rawaa-border text-rawaa-dark text-xs font-bold rounded-xl hover:bg-rawaa-soft transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rawaa-primary text-white text-xs font-bold rounded-xl hover:bg-rawaa-primary/90 active:scale-[0.99] transition-all shadow-xs cursor-pointer"
            >
              حفظ المشرف
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

