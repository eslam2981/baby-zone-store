import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import ModernSelect from '../../common/ModernSelect';
import ModernCheckbox from '../../common/ModernCheckbox';

export default function ProductFormModal({
  isOpen,
  onClose,
  isEditing,
  formData,
  onChangeForm,
  categories = [],
  uploadError,
  setUploadError,
  isUploadingImage,
  onFileUpload,
  onSubmit
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full text-right shadow-2xl border border-rawaa-border animate-scaleUp max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 pb-3 border-b border-rawaa-border shrink-0 bg-white">
          <h3 className="font-heading text-base sm:text-lg font-bold text-rawaa-dark">
            {isEditing ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للكتالوج'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-rawaa-muted hover:text-rawaa-dark hover:bg-rawaa-soft cursor-pointer transition-colors"
            aria-label="إغلاق النافذة"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto custom-modal-scroll p-4 sm:p-6 py-4 space-y-4">
            {/* Product name */}
            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">اسم المنتج بالكامل *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => onChangeForm({ name: e.target.value })}
                placeholder="مثال: عربة أطفال ستوك يويو³ خفيفة الوزن..."
                className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
              />
            </div>

            {/* Brand and category grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">العلامة التجارية (الماركة) *</label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => onChangeForm({ brand: e.target.value })}
                  placeholder="مثال: Stokke أو Cybex أو بيبي زون"
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">القسم الرئيسي *</label>
                <ModernSelect
                  value={formData.category}
                  onChange={(e) => onChangeForm({ category: e?.target?.value !== undefined ? e.target.value : e })}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="اختر القسم..."
                />
              </div>
            </div>

            {/* Prices and stock count */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">سعر البيع (ج.م) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.price}
                  onChange={(e) => onChangeForm({ price: e.target.value })}
                  placeholder="مثال: 1890"
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">السعر الأصلي قبل الخصم (ج.م)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.originalPrice}
                  onChange={(e) => onChangeForm({ originalPrice: e.target.value })}
                  placeholder="مثال: 2250"
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">كمية المخزون المتاحة *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stockCount}
                  onChange={(e) => onChangeForm({ stockCount: e.target.value })}
                  placeholder="مثال: 12"
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>
            </div>

            {/* Direct image upload to Supabase Storage & URL input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-rawaa-dark">
                صورة المنتج الرئيسية *
              </label>

              {uploadError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
                  <span>{uploadError}</span>
                  <button type="button" onClick={() => setUploadError('')} className="p-1 hover:bg-red-100 rounded">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* File upload drag/click card */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={onFileUpload}
                className="hidden"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isUploadingImage
                      ? 'border-rawaa-primary bg-rawaa-primary/5 cursor-wait'
                      : 'border-rawaa-border hover:border-rawaa-primary hover:bg-rawaa-soft/60'
                  }`}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Loader2 size={24} className="text-rawaa-primary animate-spin" />
                      <span className="text-xs font-bold text-rawaa-dark">جاري رفع الصورة إلى التخزين السحابي...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <div className="w-10 h-10 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center">
                        <UploadCloud size={20} />
                      </div>
                      <span className="text-xs font-bold text-rawaa-dark">رفع صورة من جهازك مباشرة</span>
                      <span className="text-[10px] text-rawaa-muted">JPG, PNG, WebP (تخزين دائم على السحابة)</span>
                    </div>
                  )}
                </div>

                {/* Image Preview if available */}
                <div className="border border-rawaa-border rounded-2xl p-2.5 bg-rawaa-soft/40 flex items-center justify-center relative min-h-[90px]">
                  {formData.mainImage ? (
                    <div className="relative group w-full h-24 flex items-center justify-center">
                      <img
                        src={formData.mainImage}
                        alt="معاينة المنتج"
                        className="max-h-full max-w-full rounded-xl object-contain border border-rawaa-border bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => onChangeForm({ mainImage: '' })}
                        className="absolute top-1 left-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity"
                        title="إزالة الصورة"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-rawaa-subtle py-2">
                      <ImageIcon size={22} className="mx-auto mb-1 opacity-40" />
                      <span className="text-[11px]">لا توجد صورة محددة بعد</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional manual URL entry */}
              <div>
                <span className="text-[10px] font-medium text-rawaa-muted mb-1 block">
                  أو يمكنك إدخال رابط صورة خارجي مباشرة:
                </span>
                <input
                  type="url"
                  value={formData.mainImage}
                  onChange={(e) => onChangeForm({ mainImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-1.5 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>
            </div>

            {/* Age group and badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">الفئة العمرية المناسبة</label>
                <input
                  type="text"
                  value={formData.ageGroup}
                  onChange={(e) => onChangeForm({ ageGroup: e.target.value })}
                  placeholder="مثال: حديث ولادة (0-3 سنوات)"
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">شارة تسويقية مميزة (Badge)</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => onChangeForm({ badge: e.target.value })}
                  placeholder="مثال: الأكثر مبيعاً أو معتمد طبياً"
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>
            </div>

            {/* Short description */}
            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">وصف المنتج ومميزاته المختصرة</label>
              <textarea
                rows="3"
                value={formData.shortDesc}
                onChange={(e) => onChangeForm({ shortDesc: e.target.value })}
                placeholder="وصف مختصر لمميزات المنتج ومواصفاته للأمهات..."
                className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl p-3 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
              />
            </div>

            {/* Feature checkboxes */}
            <div className="flex flex-wrap gap-4 pt-1">
              <ModernCheckbox
                checked={Boolean(formData.isBestSeller)}
                onChange={(checked) => onChangeForm({ isBestSeller: checked })}
                label="تمييز كأكثر مبيعاً"
                color="primary"
                size="sm"
              />
              <ModernCheckbox
                checked={Boolean(formData.isNew)}
                onChange={(checked) => onChangeForm({ isNew: checked })}
                label="منتج جديد"
                color="primary"
                size="sm"
              />
              <ModernCheckbox
                checked={Boolean(formData.isOrganic)}
                onChange={(checked) => onChangeForm({ isOrganic: checked })}
                label="خامات عضوية 100%"
                color="primary"
                size="sm"
              />
            </div>
          </div>

          {/* Form buttons: Fixed at bottom */}
          <div className="shrink-0 p-4 sm:px-6 py-3 border-t border-rawaa-border bg-white flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-rawaa-dark bg-rawaa-soft hover:bg-rawaa-border rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-xs font-bold text-white bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-[0.99] rounded-xl shadow-soft-xs transition-all cursor-pointer"
            >
              {isEditing ? 'حفظ التعديلات' : 'إضافة المنتج للكتالوج'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

