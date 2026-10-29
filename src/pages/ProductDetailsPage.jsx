import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { reviewsApi } from '../services/api';
import { syncBus } from '../utils/syncBus';
import { ProductDetailSkeleton } from '../components/common/Skeletons';
import { validatePersonName, validateEmail, sanitizeText } from '../utils/validators';
import { ChevronLeft } from 'lucide-react';

import { ProductMediaGallery } from '../components/product/ProductMediaGallery';
import { ProductPurchaseBox } from '../components/product/ProductPurchaseBox';
import { ProductBundleCrossSell } from '../components/product/ProductBundleCrossSell';
import { ProductDetailsTabs } from '../components/product/ProductDetailsTabs';
import { RelatedProductsSection } from '../components/product/RelatedProductsSection';

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const {
    allProducts,
    isLoadingProducts,
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    categories,
    addToast,
    user
  } = useShop();

  const product = allProducts.find((p) => p.id === productId);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('features');
  const [isAdding, setIsAdding] = useState(false);

  // Live reviews state from Supabase Cloud
  const [productReviews, setProductReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [newReview, setNewReview] = useState({
    name: user?.name || '',
    email: user?.email || '',
    rating: 5,
    comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadProductReviews() {
      if (!productId) return;
      try {
        setIsLoadingReviews(true);
        const data = await reviewsApi.getByProductId(productId);
        if (isMounted && Array.isArray(data)) {
          setProductReviews(data);
        }
      } catch (e) {
        console.warn('Reviews load notice:', e.message);
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    }
    loadProductReviews();
    return () => { isMounted = false; };
  }, [productId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const cleanName = sanitizeText(newReview.name);
    const nameErr = validatePersonName(cleanName, true, 2, 60);
    if (nameErr) {
      if (addToast) addToast(nameErr, 'warning');
      return;
    }

    const cleanComment = sanitizeText(newReview.comment);
    if (!cleanComment || cleanComment.length < 3) {
      if (addToast) addToast('يرجى كتابة تعليق لا يقل عن 3 أحرف لإفادة الأمهات', 'warning');
      return;
    }
    if (cleanComment.length > 500) {
      if (addToast) addToast('التعليق طويل جداً (الحد الأقصى 500 حرف)', 'warning');
      return;
    }

    let cleanEmail = sanitizeText(newReview.email || user?.email || '');
    if (cleanEmail) {
      const emailErr = validateEmail(cleanEmail, false);
      if (emailErr) {
        if (addToast) addToast(emailErr, 'warning');
        return;
      }
    }

    const rating = Math.min(5, Math.max(1, Number(newReview.rating) || 5));

    try {
      setIsSubmittingReview(true);
      const reviewPayload = {
        id: `rev-${Date.now()}`,
        productId,
        productName: product?.name || '',
        customerName: cleanName,
        customerEmail: cleanEmail,
        rating,
        comment: cleanComment,
        isApproved: true
      };

      await reviewsApi.create(reviewPayload);
      syncBus.emit('REVIEW_ADDED', { review: reviewPayload, timestamp: Date.now() });
      setProductReviews((prev) => [reviewPayload, ...prev]);
      setNewReview({
        name: user?.name || '',
        email: user?.email || '',
        rating: 5,
        comment: ''
      });
      if (addToast) addToast('شكراً لمشاركتك! تم تسجيل ونشر تقييمك بنجاح', 'success');
    } catch (err) {
      console.error('Review submit error:', err);
      if (addToast) addToast('حدث خطأ أثناء حفظ التقييم', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImage(0);
    setQuantity(1);
    if (product && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    } else {
      setSelectedColor(null);
    }
  }, [productId, product]);

  if (isLoadingProducts) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="bg-rawaa-bg min-h-screen py-16 text-center">
        <div className="max-w-md mx-auto px-4">
          <h2 className="font-heading text-2xl font-bold text-rawaa-dark mb-4">
            عذراً، المنتج غير متوفر أو تم حذفه
          </h2>
          <p className="text-rawaa-muted mb-6 text-sm">
            ربما تم نقل المنتج أو انتهت كميته من المتجر حالياً.
          </p>
          <Link
            to="/category/all"
            className="inline-flex items-center gap-2 bg-rawaa-primary text-white px-6 py-3 rounded-full font-bold text-sm shadow-soft-sm hover:bg-rawaa-primary-hover transition-colors"
          >
            <span>تصفح جميع المنتجات</span>
            <ChevronLeft size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const categoryName =
    categories.find((c) => c.slug === product.category || c.id === product.category)?.name ||
    product.category;

  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.mainImage];

  const isLiked = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDesc,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      if (addToast) addToast('تم نسخ رابط المنتج إلى الحافظة بنجاح', 'success');
    }
  };

  // 1. Products in same category (excluding current product and bundle)
  const sameCategoryProducts = (allProducts || []).filter(
    (p) => p.category === product.category && p.id !== product.id && p.id !== 'prod-bundle-package-05'
  );

  let relatedProducts = [...sameCategoryProducts];

  // 2. If fewer than 4 products in same category, supplement with complementary / best-selling items
  if (relatedProducts.length < 4) {
    const otherProducts = (allProducts || []).filter(
      (p) =>
        p.id !== product.id &&
        p.id !== 'prod-bundle-package-05' &&
        !relatedProducts.some((r) => r.id === p.id)
    );

    const sortedOthers = [...otherProducts].sort((a, b) => {
      if (b.isBestSeller && !a.isBestSeller) return 1;
      if (!b.isBestSeller && a.isBestSeller) return -1;
      return (Number(b.rating) || 0) - (Number(a.rating) || 0);
    });

    relatedProducts = [...relatedProducts, ...sortedOthers].slice(0, 4);
  }

  const BUNDLE_CONSTITUENT_IDS = [
    'prod-baby-nest-01',
    'prod-nursing-pillow-02',
    'prod-nursing-cover-03',
    'prod-changing-mat-04'
  ];
  const isBundleConstituent = BUNDLE_CONSTITUENT_IDS.includes(product.id);
  const bundleProduct = allProducts.find((p) => p.id === 'prod-bundle-package-05');
  const isBundlePage = product.id === 'prod-bundle-package-05';

  return (
    <div className="bg-rawaa-bg min-h-screen py-6 sm:py-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12">
        {/* Breadcrumb navigation trail */}
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-rawaa-muted mb-8 flex-wrap">
          <Link to="/" className="hover:text-rawaa-primary transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft size={14} className="text-rawaa-subtle shrink-0" />
          <Link to="/category/all" className="hover:text-rawaa-primary transition-colors">
            الأقسام
          </Link>
          <ChevronLeft size={14} className="text-rawaa-subtle shrink-0" />
          <Link to={`/category/${product.category}`} className="hover:text-rawaa-primary transition-colors">
            {categoryName}
          </Link>
          <ChevronLeft size={14} className="text-rawaa-subtle shrink-0" />
          <span className="font-bold text-rawaa-dark truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product showcase grid with gallery and details */}
        <div className="bg-white border border-rawaa-border rounded-panel p-6 sm:p-8 lg:p-12 shadow-soft-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Gallery */}
          <ProductMediaGallery
            product={product}
            gallery={gallery}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
            isLiked={isLiked}
            onToggleWishlist={() => toggleWishlist(product)}
          />

          {/* Details & actions */}
          <div className="lg:col-span-6 flex flex-col text-right">
            <ProductPurchaseBox
              product={product}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              quantity={quantity}
              setQuantity={setQuantity}
              isAdding={isAdding}
              onAddToCart={handleAddToCart}
              onShare={handleShare}
              formatPrice={formatPrice}
            />

            {/* Bundle special offers */}
            <ProductBundleCrossSell
              isBundleConstituent={isBundleConstituent}
              bundleProduct={bundleProduct}
              isBundlePage={isBundlePage}
              formatPrice={formatPrice}
            />

            {/* Tabs */}
            <ProductDetailsTabs
              product={product}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              productReviews={productReviews}
              isLoadingReviews={isLoadingReviews}
              newReview={newReview}
              setNewReview={setNewReview}
              handleReviewSubmit={handleReviewSubmit}
              isSubmittingReview={isSubmittingReview}
            />
          </div>
        </div>

        {/* Related products recommendation grid */}
        <RelatedProductsSection
          relatedProducts={relatedProducts}
          categoryName={categoryName}
          categorySlug={product.category}
        />
      </div>
    </div>
  );
}
