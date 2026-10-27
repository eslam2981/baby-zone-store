// Product management administration interface with table filtering sorting and modal forms
import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Minus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  ArrowUpDown,
  Sparkles,
  UploadCloud,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAdmin } from '../../context/AdminContext';
import { storageApi } from '../../services/api';
import ConfirmModal from '../../components/common/ConfirmModal';
import { TableRowSkeleton } from '../../components/common/Skeletons';

export default function AdminProductsPage() {
  const {
    allProducts,
    isLoadingProducts,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock
  } = useShop();

  const { addActivity } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  // Search, filter, and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Form input state
  const [formData, setFormData] = useState({
    name: '',
    brand: 'بيبي زون',
    category: 'bedding',
    subcategory: '',
    price: '',
    originalPrice: '',
    stockCount: 15,
    ageGroup: '0-3 سنوات',
    mainImage: '',
    gallery: [],
    shortDesc: '',
    badge: 'جديد',
    isBestSeller: false,
    isOrganic: false,
    isNew: true
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = Array.isArray(allProducts) ? [...allProducts] : [];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          (p?.name || '').toLowerCase().includes(q) ||
          (p?.brand || '').toLowerCase().includes(q) ||
          (p?.subcategory && p.subcategory.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p?.category === selectedCategory);
    }

    if (stockFilter === 'in-stock') {
      result = result.filter((p) => (p?.stockCount ?? 0) > 5);
    } else if (stockFilter === 'low-stock') {
      result = result.filter((p) => (p?.stockCount ?? 0) > 0 && (p?.stockCount ?? 0) <= 5);
    } else if (stockFilter === 'out-of-stock') {
      result = result.filter((p) => (p?.stockCount ?? 0) === 0);
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a?.price ?? 0) - (b?.price ?? 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b?.price ?? 0) - (a?.price ?? 0));
        break;
      case 'stock-high':
        result.sort((a, b) => (b?.stockCount ?? 0) - (a?.stockCount ?? 0));
        break;
      case 'stock-low':
        result.sort((a, b) => (a?.stockCount ?? 0) - (b?.stockCount ?? 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => (b?.isNew ? 1 : 0) - (a?.isNew ? 1 : 0));
        break;
    }

    return result;
  }, [allProducts, searchQuery, selectedCategory, stockFilter, sortBy]);

  const getCategoryName = (categoryId) => {
    return (categories || []).find((c) => c.id === categoryId)?.name || categoryId;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setUploadError('');

      const { publicUrl } = await storageApi.uploadImage(file, 'products');

      setFormData((prev) => ({
        ...prev,
        mainImage: publicUrl,
        gallery: prev.gallery && prev.gallery.length > 0 ? [...prev.gallery, publicUrl] : [publicUrl]
      }));
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('فشل رفع الصورة: ' + (err.message || 'يرجى التأكد من الاتصال'));
    } finally {
      setIsUploadingImage(false);
    }
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setUploadError('');
    if (searchParams.get('action')) {
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setUploadError('');
    setFormData({
      name: '',
      brand: 'بيبي زون',
      category: categories?.[0]?.id || 'bedding',
      subcategory: categories?.[0]?.subcategories?.[0] || 'مستلزمات مواليد',
      price: '',
      originalPrice: '',
      stockCount: 15,
      ageGroup: '0-3 سنوات',
      mainImage: '',
      gallery: [],
      shortDesc: '',
      badge: 'جديد',
      isBestSeller: false,
      isOrganic: false,
      isNew: true
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
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setUploadError('');
    setFormData({
      name: product.name,
      brand: product.brand || 'بيبي زون',
      category: product.category || categories?.[0]?.id || 'bedding',
      subcategory: product.subcategory || '',
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      stockCount: product.stockCount,
      ageGroup: product.ageGroup || '0-3 سنوات',
      mainImage: product.mainImage || '',
      gallery: Array.isArray(product.gallery) ? product.gallery : (product.mainImage ? [product.mainImage] : []),
      shortDesc: product.shortDesc || '',
      badge: product.badge || '',
      isBestSeller: Boolean(product.isBestSeller),
      isOrganic: Boolean(product.isOrganic),
      isNew: Boolean(product.isNew)
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mainImage) {
      setUploadError('يرجى رفع صورة للمنتج من الجهاز أو لصق رابط الصورة');
      return;
    }

    const priceNum = parseFloat(formData.price) || 0;
    const origPriceNum = parseFloat(formData.originalPrice) || priceNum;
    const discount = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0;

    const payload = {
      ...formData,
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercent: discount,
      stockCount: parseInt(formData.stockCount, 10) || 0,
      inStock: parseInt(formData.stockCount, 10) > 0,
      gallery: formData.gallery && formData.gallery.length > 0 ? formData.gallery : [formData.mainImage]
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
      addActivity('تعديل منتج', `المنتج: ${payload.name}`, 'product');
    } else {
      await addProduct(payload);
      addActivity('إضافة منتج جديد', `المنتج: ${payload.name}`, 'product');
    }

    handleCloseModal();
  };

  const handleDelete = (id, name) => {
    deleteProduct(id);
    addActivity('حذف منتج', `تم حذف المنتج ${name}`, 'product');
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-black text-rawaa-dark">إدارة كتالوج المنتجات</h2>
          <p className="text-xs text-rawaa-muted">
            إجمالي {(allProducts || []).length} منتج مسجل بالكتالوج عبر {(categories || []).length} أقسام
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-soft-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Filter and search bar controls */}
      <div className="bg-white rounded-2xl p-4 border border-rawaa-border shadow-soft-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search size={16} className="text-rawaa-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث بالاسم، الماركة، أو القسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl pr-10 pl-4 py-2 text-xs text-rawaa-dark placeholder-rawaa-subtle focus:bg-white focus:border-rawaa-primary outline-none transition-all"
          />
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:flex items-center gap-2 w-full md:w-auto">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs font-medium text-rawaa-dark outline-none cursor-pointer"
          >
            <option value="all">جميع الأقسام</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stock filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full sm:w-auto bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs font-medium text-rawaa-dark outline-none cursor-pointer"
          >
            <option value="all">جميع حالات المخزون</option>
            <option value="in-stock">متوفر (&gt; 5 قطع)</option>
            <option value="low-stock">مخزون منخفض (1-5)</option>
            <option value="out-of-stock">نفد من المخزون</option>
          </select>

          {/* Sort order */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 text-xs font-medium text-rawaa-dark outline-none cursor-pointer"
          >
            <option value="newest">الأحدث إضافة</option>
            <option value="price-low">السعر: من الأقل للأعلى</option>
            <option value="price-high">السعر: من الأعلى للأقل</option>
            <option value="stock-high">الكمية: الأكثر توفراً</option>
            <option value="stock-low">الكمية: الأقل توفراً</option>
          </select>
        </div>
      </div>

      {/* Products table & mobile card view */}
      <div className="bg-white rounded-2xl border border-rawaa-border shadow-soft-xs overflow-hidden">
        {/* Desktop / Tablet table view */}
        <div className="hidden md:block overflow-x-auto custom-modal-scroll">
          <table className="w-full text-right text-xs min-w-[820px] border-collapse">
            <thead className="bg-[#FAF7F2] border-b border-rawaa-border text-rawaa-subtle font-bold">
              <tr className="whitespace-nowrap">
                <th className="py-3.5 pr-4 pl-2 min-w-[260px]">المنتج والماركة</th>
                <th className="py-3.5 px-3">القسم</th>
                <th className="py-3.5 px-3">السعر</th>
                <th className="py-3.5 px-3">المخزون الحالي</th>
                <th className="py-3.5 px-3">الشارات</th>
                <th className="py-3.5 pl-4 pr-2 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rawaa-border/50">
              {isLoadingProducts ? (
                <>
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                </>
              ) : (filteredProducts || []).map((p) => (
                <tr key={p.id} className="hover:bg-rawaa-soft/50 transition-colors">
                  <td className="py-3 pr-4 pl-2 min-w-[260px]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl border border-rawaa-border shrink-0 bg-rawaa-soft overflow-hidden">
                        <img
                          src={p.mainImage || '/logo.png'}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/logo.png';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="block font-bold text-rawaa-dark truncate max-w-xs sm:max-w-md">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                          <span className="text-[10px] text-rawaa-muted font-bold">{p.brand}</span>
                          <span className="text-[10px] text-rawaa-subtle">•</span>
                          <span className="text-[10px] text-rawaa-subtle">{p.ageGroup}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-block bg-rawaa-soft px-2.5 py-1 rounded-lg text-[11px] font-bold text-rawaa-dark">
                      {(categories || []).find((c) => c.id === p.category)?.name || p.category}
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-baseline gap-1 font-bold">
                      <span className="text-rawaa-dark font-cairo text-sm">{p.price}</span>
                      <span className="text-[10px] text-rawaa-primary font-bold">ج.م</span>
                    </div>
                    {p.originalPrice > p.price && (
                      <span className="block text-[10px] text-rawaa-subtle line-through">
                        {p.originalPrice} ج.م
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          p.stockCount <= 0
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : p.stockCount <= 5
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {p.stockCount <= 0 ? 'نفد' : p.stockCount <= 5 ? `حرج (${p.stockCount})` : `${p.stockCount} قطعة`}
                      </span>
                      {/* Inline quick adjust buttons */}
                      <button
                        type="button"
                        onClick={() => updateProductStock(p.id, p.stockCount + 1)}
                        className="w-5 h-5 rounded bg-rawaa-soft hover:bg-rawaa-primary hover:text-white flex items-center justify-center font-bold text-[10px] transition-colors cursor-pointer shrink-0"
                        title="إضافة 1 للمخزون"
                      >
                        <Plus size={11} strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateProductStock(p.id, p.stockCount - 1)}
                        disabled={p.stockCount <= 0}
                        className="w-5 h-5 rounded bg-rawaa-soft hover:bg-red-500 hover:text-white flex items-center justify-center font-bold text-[10px] transition-colors cursor-pointer disabled:opacity-30 shrink-0"
                        title="خصم 1 من المخزون"
                      >
                        <Minus size={11} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {p.badge && (
                        <span className="bg-rawaa-primary-light text-rawaa-primary text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {p.badge}
                        </span>
                      )}
                      {p.discountPercent > 0 && (
                        <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          -{p.discountPercent}%
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 pl-4 pr-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-rawaa-muted hover:text-rawaa-primary hover:bg-rawaa-soft transition-colors cursor-pointer"
                        title="تعديل المنتج"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="p-1.5 rounded-lg text-rawaa-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="حذف المنتج"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoadingProducts && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-rawaa-muted">
                    <Package size={32} className="mx-auto text-rawaa-subtle mb-2 opacity-50" />
                    <p className="text-xs font-bold">لا توجد منتجات مطابقة لخيارات البحث أو الفلاتر</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card view (Visible on < md screens) */}
        <div className="md:hidden divide-y divide-rawaa-border/60">
          {isLoadingProducts ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-rawaa-soft/60 rounded-xl p-3 h-24" />
              ))}
            </div>
          ) : (!filteredProducts || filteredProducts.length === 0) ? (
            <div className="text-center py-10 px-4 text-rawaa-muted">
              <Package size={32} className="mx-auto text-rawaa-subtle mb-2 opacity-50" />
              <p className="text-xs font-bold">لا توجد منتجات مطابقة لخيارات البحث أو الفلاتر</p>
            </div>
          ) : (
            (filteredProducts || []).map((p) => (
              <div key={p.id} className="p-3.5 hover:bg-rawaa-soft/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl border border-rawaa-border shrink-0 bg-rawaa-soft overflow-hidden">
                    <img
                      src={p.mainImage || '/logo.png'}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/logo.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-rawaa-dark line-clamp-1 leading-snug">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="w-8 h-8 rounded-lg text-rawaa-muted hover:text-rawaa-primary hover:bg-rawaa-soft flex items-center justify-center transition-colors cursor-pointer"
                          title="تعديل المنتج"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="w-8 h-8 rounded-lg text-rawaa-muted hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="حذف المنتج"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-rawaa-muted">
                      <span>{getCategoryName(p.category)}</span>
                      {p.brand && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-rawaa-dark">{p.brand}</span>
                        </>
                      )}
                    </div>

                    {/* Price and Stock row */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-dashed border-rawaa-border/60">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-rawaa-dark">{p.price} ج.م</span>
                        {p.originalPrice > p.price && (
                          <span className="text-[10px] text-rawaa-subtle line-through">
                            {p.originalPrice} ج.م
                          </span>
                        )}
                        {p.discountPercent > 0 && (
                          <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                            -{p.discountPercent}%
                          </span>
                        )}
                      </div>

                      {/* Stock controls */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.stockCount <= 0
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : p.stockCount <= 5
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {p.stockCount <= 0 ? 'نفد' : `${p.stockCount} ق`}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateProductStock(p.id, p.stockCount + 1)}
                            className="w-6 h-6 rounded bg-rawaa-soft hover:bg-rawaa-primary hover:text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                            title="إضافة 1 للمخزون"
                          >
                            <Plus size={11} strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateProductStock(p.id, p.stockCount - 1)}
                            disabled={p.stockCount <= 0}
                            className="w-6 h-6 rounded bg-rawaa-soft hover:bg-red-500 hover:text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer disabled:opacity-30"
                            title="خصم 1 من المخزون"
                          >
                            <Minus size={11} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="تأكيد حذف المنتج؟"
        message={`هل أنت متأكد من رغبتك في حذف هذا المنتج${
          deleteConfirmId ? ` «${allProducts.find((p) => p.id === deleteConfirmId)?.name || ''}»` : ''
        } من كتالوج المتجر نهائياً؟`}
        confirmText="نعم، حذف المنتج"
        cancelText="تراجع"
        isDestructive={true}
        onConfirm={() => {
          const target = allProducts.find((p) => p.id === deleteConfirmId);
          handleDelete(deleteConfirmId, target?.name || '');
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Add / Edit product modal rendered in Portal at document.body level */}
      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full text-right shadow-2xl border border-rawaa-border animate-fadeIn max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-6 pb-3 border-b border-rawaa-border shrink-0 bg-white">
              <h3 className="font-heading text-base sm:text-lg font-bold text-rawaa-dark">
                {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد للكتالوج'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-full text-rawaa-muted hover:text-rawaa-dark hover:bg-rawaa-soft cursor-pointer transition-colors"
                aria-label="إغلاق النافذة"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto custom-modal-scroll p-4 sm:p-6 py-4 space-y-4">
              {/* Product name */}
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1">اسم المنتج بالكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="مثال: Stokke أو Cybex أو بيبي زون"
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">القسم الرئيسي *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary cursor-pointer"
                  >
                    {(categories || []).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
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
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
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
                  onChange={handleFileUpload}
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
                          onClick={() => setFormData((prev) => ({ ...prev, mainImage: '' }))}
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
                    onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                    placeholder="مثال: حديث ولادة (0-3 سنوات)"
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-rawaa-dark mb-1">شارة تسويقية مميزة (Badge)</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  placeholder="وصف مختصر لمميزات المنتج ومواصفاته للأمهات..."
                  className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl p-3 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
                />
              </div>

              {/* Feature checkboxes */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-rawaa-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="accent-rawaa-primary rounded"
                  />
                  <span>تمييز كأكثر مبيعاً</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-rawaa-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="accent-rawaa-primary rounded"
                  />
                  <span>منتج جديد</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-rawaa-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOrganic}
                    onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                    className="accent-rawaa-primary rounded"
                  />
                  <span>خامات عضوية 100%</span>
                </label>
              </div>

              </div>

              {/* Form buttons: Fixed at bottom */}
              <div className="shrink-0 p-4 sm:px-6 py-3 border-t border-rawaa-border bg-white flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 text-xs font-bold text-rawaa-dark bg-rawaa-soft hover:bg-rawaa-border rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-[0.99] rounded-xl shadow-soft-xs transition-all cursor-pointer"
                >
                  {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج للكتالوج'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
