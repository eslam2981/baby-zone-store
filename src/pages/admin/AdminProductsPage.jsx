import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { useAdmin } from '../../context/AdminContext';
import { storageApi } from '../../services/api';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  validateProductName,
  validatePrice,
  validateStock,
  sanitizeText
} from '../../utils/validators';
import ProductsHeader from '../../components/admin/products/ProductsHeader';
import ProductsFilterBar from '../../components/admin/products/ProductsFilterBar';
import ProductsTable from '../../components/admin/products/ProductsTable';
import ProductFormModal from '../../components/admin/products/ProductFormModal';

const INITIAL_FORM_DATA = {
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
};

export default function AdminProductsPage() {
  const {
    allProducts,
    isLoadingProducts,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    addToast
  } = useShop();

  const { addActivity, isRealtimeConnected, isSyncing, refreshAllRealtimeData } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

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
    setFormData({
      ...INITIAL_FORM_DATA,
      category: categories?.[0]?.id || 'bedding',
      subcategory: categories?.[0]?.subcategories?.[0] || 'مستلزمات مواليد'
    });
    if (searchParams.get('action')) {
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  };

  const handleOpenAdd = useCallback(() => {
    setEditingProduct(null);
    setUploadError('');
    setFormData({
      ...INITIAL_FORM_DATA,
      category: categories?.[0]?.id || 'bedding',
      subcategory: categories?.[0]?.subcategories?.[0] || 'مستلزمات مواليد'
    });
    setIsModalOpen(true);
  }, [categories]);

  // Synchronize modal state with URL searchParams
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenAdd();
    }
  }, [searchParams, handleOpenAdd]);

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
    setUploadError('');

    const cleanName = sanitizeText(formData.name);
    const nameErr = validateProductName(cleanName, 3, 150);
    if (nameErr) {
      setUploadError(nameErr);
      if (addToast) addToast(nameErr, 'warning');
      return;
    }

    const priceErr = validatePrice(formData.price, 'سعر البيع', 0.5, 500000);
    if (priceErr) {
      setUploadError(priceErr);
      if (addToast) addToast(priceErr, 'warning');
      return;
    }

    let origPriceNum = parseFloat(formData.originalPrice);
    if (formData.originalPrice !== '' && formData.originalPrice !== null && formData.originalPrice !== undefined) {
      const origErr = validatePrice(formData.originalPrice, 'السعر الأصلي', 0.5, 500000);
      if (origErr) {
        setUploadError(origErr);
        if (addToast) addToast(origErr, 'warning');
        return;
      }
    } else {
      origPriceNum = parseFloat(formData.price);
    }

    const stockErr = validateStock(formData.stockCount, 0, 99999);
    if (stockErr) {
      setUploadError(stockErr);
      if (addToast) addToast(stockErr, 'warning');
      return;
    }

    if (!formData.mainImage || !formData.mainImage.trim()) {
      setUploadError('يرجى رفع صورة للمنتج من الجهاز أو لصق رابط الصورة');
      if (addToast) addToast('يرجى إضافة صورة للمنتج', 'warning');
      return;
    }

    const priceNum = parseFloat(formData.price);
    const finalOrigPrice = !isNaN(origPriceNum) && origPriceNum > 0 ? origPriceNum : priceNum;
    const discount = finalOrigPrice > priceNum ? Math.round(((finalOrigPrice - priceNum) / finalOrigPrice) * 100) : 0;

    const payload = {
      ...formData,
      name: cleanName,
      brand: sanitizeText(formData.brand) || 'بيبي زون',
      shortDesc: sanitizeText(formData.shortDesc),
      badge: sanitizeText(formData.badge),
      price: priceNum,
      originalPrice: finalOrigPrice,
      discountPercent: discount,
      stockCount: parseInt(formData.stockCount, 10) || 0,
      inStock: parseInt(formData.stockCount, 10) > 0,
      gallery: formData.gallery && formData.gallery.length > 0 ? formData.gallery : [formData.mainImage]
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
      addActivity('تعديل منتج', `المنتج: ${payload.name}`, 'product');
      if (addToast) addToast('تم تعديل المنتج بنجاح', 'success');
    } else {
      await addProduct(payload);
      addActivity('إضافة منتج جديد', `المنتج: ${payload.name}`, 'product');
      if (addToast) addToast('تم إضافة المنتج بنجاح', 'success');
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
      <ProductsHeader
        totalProducts={allProducts?.length || 0}
        totalCategories={categories?.length || 0}
        isRealtimeConnected={isRealtimeConnected}
        isSyncing={isSyncing}
        onRefresh={() => refreshAllRealtimeData()}
        onOpenAdd={handleOpenAdd}
      />

      {/* Filter and search bar controls */}
      <ProductsFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories || []}
      />

      {/* Products table & mobile card view */}
      <ProductsTable
        isLoadingProducts={isLoadingProducts}
        filteredProducts={filteredProducts}
        categories={categories || []}
        onUpdateStock={updateProductStock}
        onEditProduct={handleOpenEdit}
        onDeleteProduct={setDeleteConfirmId}
      />

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

      {/* Add / Edit product modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isEditing={Boolean(editingProduct)}
        formData={formData}
        onChangeForm={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
        categories={categories || []}
        uploadError={uploadError}
        setUploadError={setUploadError}
        isUploadingImage={isUploadingImage}
        onFileUpload={handleFileUpload}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
