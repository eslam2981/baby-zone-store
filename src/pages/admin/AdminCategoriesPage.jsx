import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  X,
  Tag
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAdmin } from '../../context/AdminContext';
import ConfirmModal from '../../components/common/ConfirmModal';

export default function AdminCategoriesPage() {
  const { categories, allProducts, addCategory, updateCategory, deleteCategory, addToast } = useShop();
  const { addActivity } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    badge: 'شامل',
    description: '',
    subcategoriesStr: ''
  });

  // Filter categories
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    if (searchParams.get('action')) {
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      badge: 'جديد',
      description: '',
      subcategoriesStr: 'وصل حديثاً, الأكثر طلباً'
    });
    setIsModalOpen(true);
  };

  // Synchronize modal state with URL searchParams dynamically without needing any page refresh
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenAdd();
    }
  }, [searchParams]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug || cat.id,
      badge: cat.badge || '',
      description: cat.description || '',
      subcategoriesStr: (cat.subcategories || []).join(', ')
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const subs = formData.subcategoriesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const slug = formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-');

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: formData.name,
        slug,
        badge: formData.badge,
        description: formData.description,
        subcategories: subs
      });
      addActivity('تعديل قسم', `قسم: ${formData.name}`, 'category');
    } else {
      addCategory({
        id: slug,
        name: formData.name,
        slug,
        icon: 'Grid',
        badge: formData.badge,
        description: formData.description,
        subcategories: subs
      });
      addActivity('إضافة قسم جديد', `قسم: ${formData.name}`, 'category');
    }

    setIsModalOpen(false);
  };

  const handleRequestDelete = (cat) => {
    const productsInCat = allProducts.filter((p) => p.category === cat.id);
    if (productsInCat.length > 0) {
      if (addToast) {
        addToast(`لا يمكن حذف قسم «${cat.name}» لوجود ${productsInCat.length} منتجات مرتبطة به حالياً`, 'warning');
      }
      return;
    }
    setCategoryToDelete(cat);
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    deleteCategory(categoryToDelete.id);
    addActivity('حذف قسم', `تم حذف قسم: ${categoryToDelete.name}`, 'category');
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-black text-rawaa-dark">أقسام وتصنيفات المتجر</h2>
          <p className="text-xs text-rawaa-muted">
            إدارة {categories.length} قسماً رئيسياً وفئاتها الفرعية في بيبي زون
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-soft-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* Search filter */}
      <div className="bg-white rounded-2xl p-4 border border-rawaa-border shadow-soft-xs flex items-center">
        <div className="relative w-full max-w-md">
          <Search size={16} className="text-rawaa-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث في أسماء الأقسام ووصفها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl pr-10 pl-4 py-2 text-xs text-rawaa-dark placeholder-rawaa-subtle focus:bg-white focus:border-rawaa-primary outline-none transition-all"
          />
        </div>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredCategories.map((cat) => {
          const catProducts = allProducts.filter((p) => p.category === cat.id);
          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl p-5 border border-rawaa-border shadow-soft-xs hover:shadow-soft-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center shrink-0 shadow-soft-xs font-bold text-sm">
                      <Layers size={20} />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-rawaa-dark">
                        {cat.name}
                      </h3>
                      <span className="text-[10px] text-rawaa-subtle font-mono">#{cat.slug || cat.id}</span>
                    </div>
                  </div>

                  {cat.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        cat.isComingSoon
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-rawaa-muted leading-relaxed line-clamp-2 mb-3">
                  {cat.description}
                </p>

                {/* Subcategories tag chips */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-rawaa-subtle block mb-1.5">الفئات الفرعية</span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto custom-modal-scroll">
                      {cat.subcategories.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="bg-rawaa-soft text-rawaa-dark text-[10px] font-medium px-2 py-0.5 rounded-md"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom stats and action buttons */}
              <div className="pt-3 border-t border-rawaa-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-rawaa-muted font-bold">
                  <Package size={15} className="text-rawaa-primary" />
                  <span>{catProducts.length} منتج بالقسم</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg text-rawaa-muted hover:text-rawaa-primary hover:bg-rawaa-soft transition-colors cursor-pointer"
                    title="تعديل القسم"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestDelete(cat)}
                    className="p-1.5 rounded-lg text-rawaa-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="حذف القسم"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-lg w-full text-right shadow-2xl border border-rawaa-border animate-fadeIn space-y-4 my-auto sm:my-8 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-rawaa-border shrink-0">
              <h3 className="font-heading text-lg font-bold text-rawaa-dark">
                {editingCategory ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-full text-rawaa-muted hover:bg-rawaa-soft cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 flex-1 overflow-y-auto custom-modal-scroll">
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">اسم القسم بالكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: مقاعد السيارات الآمنة للأطفال"
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">المعرف البرمجي (Slug)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="مثال: car-seats"
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">شارة القسم (Badge)</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="مثال: طبي، أمان، يومي"
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">الوصف العام للقسم</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف مختصر لمحتويات القسم وما يقدمه للأم والطفل..."
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl p-3 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">الفئات الفرعية (مفصولة بفاصلة ,)</label>
                <input
                  type="text"
                  value={formData.subcategoriesStr}
                  onChange={(e) => setFormData({ ...formData, subcategoriesStr: e.target.value })}
                  placeholder="مثال: مقاعد دوارة 360, كراسي تثبيت أيزوفيكس, مهادات سفر"
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-rawaa-border shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2 text-xs font-bold text-rawaa-dark bg-rawaa-soft hover:bg-rawaa-border rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-rawaa-primary hover:bg-rawaa-primary-hover rounded-xl shadow-soft-xs transition-colors cursor-pointer"
                >
                  {editingCategory ? 'حفظ التعديلات' : 'إضافة القسم'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation modal for category deletion */}
      <ConfirmModal
        isOpen={Boolean(categoryToDelete)}
        title="تأكيد حذف القسم"
        message={`هل أنت متأكد من رغبتك في حذف قسم «${categoryToDelete?.name || ''}» نهائياً من المتجر؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="تأكيد الحذف"
        cancelText="إلغاء"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
