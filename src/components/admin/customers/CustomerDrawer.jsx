import { createPortal } from 'react-dom';
import {
  X,
  Cloud,
  ShieldCheck,
  Crown,
  Key,
  Trash2,
  Save,
  Loader2
} from 'lucide-react';
import { AVAILABLE_PERMISSIONS } from './customerPermissions';
import ModernSelect from '../../common/ModernSelect';
import ModernCheckbox from '../../common/ModernCheckbox';

export default function CustomerDrawer({
  customer,
  customerOrders = [],
  isSaving,
  onClose,
  onChangeField,
  onTogglePermission,
  onSave,
  onDelete
}) {
  if (!customer) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn overscroll-contain"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-r border-rawaa-border animate-slideLeft overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 bg-gradient-to-l from-rawaa-soft to-white border-b border-rawaa-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 min-w-[56px] min-h-[56px] rounded-2xl font-black text-2xl flex items-center justify-center shrink-0 shadow-soft-sm ${
                customer.isVip
                  ? 'bg-amber-100 text-amber-700 border border-amber-300'
                  : 'bg-rawaa-primary text-white shadow-rawaa-primary/25'
              }`}
            >
              {customer.name?.charAt(0) || 'ع'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black font-heading text-rawaa-dark">
                  {customer.name}
                </h2>
                {customer.isVip && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-xs text-rawaa-muted mt-0.5 flex items-center gap-2">
                <span>{customer.email || 'بدون بريد إلكتروني'}</span>
                <span>·</span>
                <span className="font-mono" dir="ltr">{customer.phone}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-rawaa-soft hover:bg-rawaa-border text-rawaa-muted hover:text-rawaa-dark flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-6 space-y-6 flex-1 min-h-0 overflow-y-auto custom-modal-scroll">
          {/* Cloud Database Sync Banner */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-900">سجل عميل موثق بقاعدة البيانات</div>
                <div className="text-[11px] text-emerald-700">أي تعديل تحفظه يتم تطبيقه فوراً وبشكل دائم</div>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-800 font-bold">
              {customer.id}
            </span>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-rawaa-soft/70 p-3.5 rounded-2xl text-center border border-rawaa-border/60">
              <div className="text-[11px] text-rawaa-muted font-bold">عدد الطلبات الحقيقية</div>
              <div className="text-lg font-black font-heading text-rawaa-dark mt-1">
                {customerOrders.length > 0 ? customerOrders.length : (customer.ordersCount || 0)}
              </div>
            </div>
            <div className="bg-rawaa-soft/70 p-3.5 rounded-2xl text-center border border-rawaa-border/60">
              <div className="text-[11px] text-rawaa-muted font-bold">إجمالي المشتريات</div>
              <div className="text-lg font-black font-heading text-rawaa-primary mt-1">
                {(customerOrders.length > 0
                  ? customerOrders.reduce((sum, ord) => sum + (ord.deliveryStatus !== 'ملغي' && ord.status !== 'ملغي' ? (Number(ord.total) || 0) : 0), 0)
                  : (customer.totalSpent || 0)
                ).toLocaleString()}
                <span className="text-[10px] font-normal mr-0.5">ج.م</span>
              </div>
            </div>
            <div className="bg-rawaa-soft/70 p-3.5 rounded-2xl text-center border border-rawaa-border/60">
              <div className="text-[11px] text-rawaa-muted font-bold">حالة الحساب</div>
              <div className={`text-xs font-bold mt-2 ${
                customer.status === 'نشط'
                  ? 'text-emerald-700'
                  : customer.status === 'محظور'
                  ? 'text-rose-700'
                  : 'text-gray-600'
              }`}>
                {customer.status || 'نشط'}
              </div>
            </div>
          </div>

          {/* Role and Account Status Section */}
          <div className="bg-white border border-rawaa-border rounded-2xl p-5 space-y-4 shadow-soft-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-rawaa-border">
              <ShieldCheck className="w-4 h-4 text-rawaa-primary" />
              <h3 className="font-heading text-xs font-black text-rawaa-dark uppercase">
                الرتبة وحالة الحساب
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1.5">رتبة ونوع الحساب</label>
                <ModernSelect
                  value={customer.role || 'customer'}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    onChangeField('role', newRole);
                    onChangeField('isVip', newRole === 'vip_customer');
                  }}
                  options={[
                    { value: 'customer', label: 'عميلة مسجلة عادية (Customer)', badge: 'عادي', badgeColor: 'bg-gray-100 text-gray-700' },
                    { value: 'vip_customer', label: 'عميلة VIP ذهبية (VIP Client)', badge: 'VIP 👑', badgeColor: 'bg-amber-100 text-amber-800' },
                    { value: 'wholesaler', label: 'تاجر / توريد جملة (Wholesaler)', badge: 'جملة 🏷️', badgeColor: 'bg-blue-100 text-blue-800' },
                    { value: 'supervisor', label: 'مشرفة دعم ومتابعة (Supervisor)', badge: 'إشراف 🛡️', badgeColor: 'bg-purple-100 text-purple-800' },
                    { value: 'admin', label: 'مدير إداري للنظام (Admin)', badge: 'إدارة ⚡', badgeColor: 'bg-emerald-100 text-emerald-800' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1.5">حالة التفعيل</label>
                <ModernSelect
                  value={customer.status || 'نشط'}
                  onChange={(e) => onChangeField('status', e.target.value)}
                  options={[
                    { value: 'نشط', label: 'نشط — مسموح بكامل الصلاحيات', badge: 'نشط', badgeColor: 'bg-emerald-100 text-emerald-800' },
                    { value: 'غير نشط', label: 'غير نشط — قيد المراجعة', badge: 'قيد المراجعة', badgeColor: 'bg-amber-100 text-amber-800' },
                    { value: 'محظور', label: 'محظور — ممنوع من الشراء والطلب', badge: 'محظور', badgeColor: 'bg-rose-100 text-rose-800' }
                  ]}
                />
              </div>
            </div>

            {/* VIP Fast Toggle */}
            <div
              onClick={() => {
                const nextVal = !(customer.isVip || customer.role === 'vip_customer');
                onChangeField('isVip', nextVal);
                onChangeField('role', nextVal ? 'vip_customer' : 'customer');
              }}
              className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">عضوية VIP الخاصة</span>
                  <span className="text-[11px] text-amber-700">تمنح العميل خصم تلقائي وأولوية شحن</span>
                </div>
              </div>
              <ModernCheckbox
                checked={Boolean(customer.isVip || customer.role === 'vip_customer')}
                onChange={(checked) => {
                  onChangeField('isVip', checked);
                  onChangeField('role', checked ? 'vip_customer' : 'customer');
                }}
                color="amber"
                size="md"
              />
            </div>
          </div>

          {/* Granular Permissions Matrix */}
          <div className="bg-white border border-rawaa-border rounded-2xl p-5 space-y-4 shadow-soft-xs">
            <div className="flex items-center justify-between pb-2 border-b border-rawaa-border">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-rawaa-primary" />
                <h3 className="font-heading text-xs font-black text-rawaa-dark uppercase">
                  مصفوفة الصلاحيات الممنوحة للعميل
                </h3>
              </div>
              <span className="text-[11px] text-rawaa-muted font-bold">
                {(customer.permissions || []).length} من أصل {AVAILABLE_PERMISSIONS.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {AVAILABLE_PERMISSIONS.map((perm) => {
                const isGranted = Array.isArray(customer.permissions) && customer.permissions.includes(perm.id);

                return (
                  <div
                    key={perm.id}
                    onClick={() => onTogglePermission(perm.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isGranted
                        ? 'bg-rawaa-primary/5 border-rawaa-primary/25 shadow-soft-xs'
                        : 'bg-rawaa-soft/40 border-rawaa-border/60 hover:border-rawaa-border'
                    }`}
                  >
                    <div className="pt-0.5">
                      <ModernCheckbox
                        checked={isGranted}
                        onChange={() => onTogglePermission(perm.id)}
                        color="primary"
                        size="md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`block text-xs font-bold ${isGranted ? 'text-rawaa-primary' : 'text-rawaa-dark'}`}>
                        {perm.name}
                      </span>
                      <span className="block text-[11px] text-rawaa-muted mt-0.5 leading-relaxed">
                        {perm.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Information Editable */}
          <div className="bg-white border border-rawaa-border rounded-2xl p-5 space-y-3 shadow-soft-xs">
            <h3 className="font-heading text-xs font-black text-rawaa-dark uppercase pb-2 border-b border-rawaa-border">
              بيانات التواصل والعنوان
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-rawaa-dark mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={customer.name || ''}
                  onChange={(e) => onChangeField('name', e.target.value)}
                  className="w-full px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-rawaa-dark mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={customer.phone || ''}
                    onChange={(e) => onChangeField('phone', e.target.value)}
                    className="w-full px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-mono font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-rawaa-dark mb-1">المحافظة</label>
                  <input
                    type="text"
                    value={customer.city || ''}
                    onChange={(e) => onChangeField('city', e.target.value)}
                    className="w-full px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-rawaa-dark mb-1">العنوان التفصيلي</label>
                <input
                  type="text"
                  value={customer.address || ''}
                  onChange={(e) => onChangeField('address', e.target.value)}
                  className="w-full px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-medium text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-rawaa-dark mb-1">ملاحظات الإدارة الداخلية</label>
                <textarea
                  rows={2}
                  value={customer.notes || ''}
                  onChange={(e) => onChangeField('notes', e.target.value)}
                  placeholder="أضف أي ملاحظات خاصة بالعميل..."
                  className="w-full px-3 py-2 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs font-medium text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Order history */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-black text-rawaa-dark uppercase flex items-center justify-between">
              <span>سجل طلبات ومشتريات العميل</span>
              <span className="text-rawaa-primary font-bold text-[11px]">
                {customerOrders.length} طلب
              </span>
            </h3>

            {customerOrders.length === 0 ? (
              <div className="p-5 text-center bg-rawaa-soft/40 rounded-2xl border border-dashed border-rawaa-border text-rawaa-muted text-xs">
                لم يقم العميل بأي طلبات بعد
              </div>
            ) : (
              <div className="space-y-2">
                {customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 bg-rawaa-soft/40 border border-rawaa-border rounded-2xl text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="font-mono text-rawaa-dark">#{ord.id}</span>
                      <span className="text-rawaa-primary font-heading">
                        {(ord.total || ord.totalAmount || 0).toLocaleString()} ج.م
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-rawaa-muted text-[11px]">
                      <span>{ord.date ? ord.date.split('T')[0] : '2026-10-26'}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-white border border-rawaa-border font-medium text-rawaa-dark">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div className="p-5 bg-gradient-to-r from-rawaa-soft to-white border-t border-rawaa-border flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onDelete}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 size={15} />
            <span>حذف العميل</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-rawaa-soft hover:bg-rawaa-border text-rawaa-dark rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-soft-xs cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>جارٍ حفظ التعديلات...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>حفظ بيانات وتعديلات العميل</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

