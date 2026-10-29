import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import ModernSelect from '../../common/ModernSelect';

export default function AddCustomerModal({
  isOpen,
  onClose,
  form,
  onChangeForm,
  onSubmit
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full text-right shadow-2xl border border-rawaa-border animate-scaleUp relative max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rawaa-border shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center">
              <Plus size={18} />
            </div>
            <div>
              <h3 className="font-heading text-base font-black text-rawaa-dark">تسجيل وإضافة عميل جديد</h3>
              <p className="text-[11px] text-rawaa-muted">سيتم إنشاء وتوثيق حساب العميل مباشرة في قاعدة البيانات</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-rawaa-muted hover:text-rawaa-dark hover:bg-rawaa-soft transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="space-y-3.5 flex-1 min-h-0 overflow-y-auto custom-modal-scroll p-4 sm:p-6 py-4">
            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">اسم العميل بالكامل *</label>
              <input
                type="text"
                required
                placeholder="مثال: ياسمين عبد العزيز"
                value={form.name}
                onChange={(e) => onChangeForm({ name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => onChangeForm({ email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-medium text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  placeholder="010XXXXXXXX"
                  value={form.phone}
                  onChange={(e) => onChangeForm({ phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-mono font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">المحافظة</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => onChangeForm({ city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">الرتبة</label>
                <ModernSelect
                  value={form.role}
                  onChange={(e) => {
                    const r = e.target.value;
                    onChangeForm({
                      role: r,
                      isVip: r === 'vip_customer'
                    });
                  }}
                  options={[
                    { value: 'customer', label: 'عميلة مسجلة (Customer)', badge: 'عادي' },
                    { value: 'vip_customer', label: 'عميلة VIP مميزة', badge: 'VIP 👑', badgeColor: 'bg-amber-100 text-amber-800' },
                    { value: 'wholesaler', label: 'تاجر / توريد جملة', badge: 'جملة 🏷️', badgeColor: 'bg-blue-100 text-blue-800' }
                  ]}
                  buttonClassName="py-2.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">العنوان</label>
              <input
                type="text"
                placeholder="الشارع، رقم العمارة، الحي..."
                value={form.address}
                onChange={(e) => onChangeForm({ address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-medium text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-4 sm:px-6 py-3 border-t border-rawaa-border shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-rawaa-dark bg-rawaa-soft hover:bg-rawaa-border rounded-xl transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-xs font-bold text-white bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-[0.99] rounded-xl transition-all shadow-soft-xs cursor-pointer"
            >
              تأكيد وحفظ العميل
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

