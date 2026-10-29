import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import ModernSelect from '../../common/ModernSelect';

export default function ManualOrderModal({
  isOpen,
  onClose,
  allProducts = [],
  manualOrder,
  onChangeManualOrder,
  onSubmit
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full text-right shadow-soft-xl border border-rawaa-border animate-scaleUp max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rawaa-border shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center">
              <Plus size={18} />
            </div>
            <h3 className="font-heading text-base sm:text-lg font-bold text-rawaa-dark">
              تسجيل طلب بيع يدوي (هاتف / واتساب)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-rawaa-soft rounded-full text-rawaa-muted cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="space-y-4 flex-1 min-h-0 overflow-y-auto custom-modal-scroll p-4 sm:p-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">اسم العميل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سارة محمود"
                  value={manualOrder.customerName}
                  onChange={(e) => onChangeManualOrder({ customerName: e.target.value })}
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  placeholder="مثال: 01012345678"
                  value={manualOrder.customerPhone}
                  onChange={(e) => onChangeManualOrder({ customerPhone: e.target.value })}
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">المحافظة *</label>
                <ModernSelect
                  value={manualOrder.city}
                  onChange={(e) => onChangeManualOrder({ city: e.target.value })}
                  options={[
                    { value: 'القاهرة', label: 'القاهرة' },
                    { value: 'الجيزة', label: 'الجيزة' },
                    { value: 'الإسكندرية', label: 'الإسكندرية' },
                    { value: 'الدقهلية', label: 'الدقهلية (المنصورة)' },
                    { value: 'الغربية', label: 'الغربية (طنطا)' },
                    { value: 'الشرقية', label: 'الشرقية (الزقازيق)' },
                    { value: 'القليوبية', label: 'القليوبية' },
                    { value: 'البحيرة', label: 'البحيرة' },
                    { value: 'المنوفية', label: 'المنوفية' },
                    { value: 'دمياط', label: 'دمياط' },
                    { value: 'بورسعيد', label: 'بورسعيد' },
                    { value: 'السويس', label: 'السويس' },
                    { value: 'الإسماعيلية', label: 'الإسماعيلية' },
                    { value: 'بني سويف', label: 'بني سويف' },
                    { value: 'الفيوم', label: 'الفيوم' },
                    { value: 'المنيا', label: 'المنيا' },
                    { value: 'أسيوط', label: 'أسيوط' },
                    { value: 'سوهاج', label: 'سوهاج' },
                    { value: 'قنا', label: 'قنا' },
                    { value: 'الأقصر', label: 'الأقصر' },
                    { value: 'أسوان', label: 'أسوان' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">العنوان التفصيلي *</label>
                <input
                  type="text"
                  required
                  placeholder="الشارع، رقم العمارة، الشقة"
                  value={manualOrder.address}
                  onChange={(e) => onChangeManualOrder({ address: e.target.value })}
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-rawaa-dark mb-1">المنتج المطلوب *</label>
                <ModernSelect
                  value={manualOrder.productId}
                  onChange={(e) => onChangeManualOrder({ productId: e.target.value })}
                  options={allProducts.map((p) => ({
                    value: p.id,
                    label: `${p.name.substring(0, 45)}... (${p.price} ج.م)`
                  }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">الكمية *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={manualOrder.quantity}
                  onChange={(e) => onChangeManualOrder({ quantity: e.target.value })}
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">طريقة الدفع</label>
              <ModernSelect
                value={manualOrder.paymentMethod}
                onChange={(e) => onChangeManualOrder({ paymentMethod: e.target.value })}
                options={[
                  { value: 'الدفع عند الاستلام (COD)', label: 'الدفع عند الاستلام (COD)' },
                  { value: 'فودافون كاش / إنستاباي', label: 'فودافون كاش / إنستاباي' },
                  { value: 'فيزا / ماستركارد', label: 'فيزا / ماستركارد' }
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">ملاحظات التوصيل (اختياري)</label>
              <input
                type="text"
                placeholder="مثال: يرجى الاتصال قبل الوصول"
                value={manualOrder.notes}
                onChange={(e) => onChangeManualOrder({ notes: e.target.value })}
                className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
              />
            </div>
          </div>

          <div className="p-4 sm:px-6 py-3 border-t border-rawaa-border bg-white flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-rawaa-dark hover:bg-rawaa-soft rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-[0.99] rounded-xl shadow-soft-xs transition-all cursor-pointer"
            >
              حفظ وتأكيد الطلب
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

