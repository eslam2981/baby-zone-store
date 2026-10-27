import { useState, useEffect } from 'react';
import { useParams, Link} from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { reviewsApi } from '../services/api';
import ProductCard from '../components/catalog/ProductCard';
import { ReviewSkeleton, ProductDetailSkeleton } from '../components/common/Skeletons';
import { validatePersonName, validateEmail, sanitizeText, REGEX_PATTERNS } from '../utils/validators';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronLeft,
  Minus,
  Plus,
  Share2,
  Award,
  Info,
  MessageSquare,
  Send,
  User
} from 'lucide-react';

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
      addToast(nameErr, 'warning');
      return;
    }

    const cleanComment = sanitizeText(newReview.comment);
    if (!cleanComment || cleanComment.length < 3) {
      addToast('يرجى كتابة تعليق لا يقل عن 3 أحرف لإفادة الأمهات', 'warning');
      return;
    }
    if (cleanComment.length > 500) {
      addToast('التعليق طويل جداً (الحد الأقصى 500 حرف)', 'warning');
      return;
    }

    let cleanEmail = sanitizeText(newReview.email || user?.email || '');
    if (cleanEmail) {
      const emailErr = validateEmail(cleanEmail, false);
      if (emailErr) {
        addToast(emailErr, 'warning');
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
      setProductReviews((prev) => [reviewPayload, ...prev]);
      setNewReview({
        name: user?.name || '',
        email: user?.email || '',
        rating: 5,
        comment: ''
      });
      addToast('شكراً لمشاركتك! تم تسجيل تقييمك على السيرفر بنجاح', 'success');
    } catch (err) {
      console.error('Review submit error:', err);
      addToast('حدث خطأ أثناء حفظ التقييم', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product) {
      setActiveImage(0);
      setQuantity(1);
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : null);
    }
  }, [productId, product]);

  if (isLoadingProducts) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-rawaa-soft text-rawaa-subtle flex items-center justify-center mx-auto mb-6">
          <Info size={40} />
        </div>
        <h2 className="font-heading text-2xl font-bold text-rawaa-dark mb-3">
          المنتج غير موجود أو تم نقله
        </h2>
        <p className="text-sm text-rawaa-muted mb-8 leading-relaxed max-w-md mx-auto">
          عذراً، لم نتمكن من العثور على المنتج المطلوب. قد يكون قد نفد من المخزون أو تم تغيير الرابط.
        </p>
        <Link
          to="/category/all"
          className="inline-flex items-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-sm font-bold px-6 py-3 rounded-full shadow-soft-sm transition-all"
        >
          <span>تصفحي كل المنتجات</span>
          <ChevronLeft size={16} />
        </Link>
      </div>
    );
  }

  const categoryObj = categories.find((c) => c.id === product.category);
  const categoryName = categoryObj ? categoryObj.name : 'المنتجات';
  const isLiked = isInWishlist(product.id);
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.mainImage];

  const savingsAmount = product.originalPrice ? product.originalPrice - product.price : 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product, quantity, selectedColor);
    setTimeout(() => setIsAdding(false), 800);
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
      addToast('تم نسخ رابط المنتج إلى الحافظة بنجاح', 'success');
    }
  };

  // Related products from the same category
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

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
          {/* Product media gallery column */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Featured product image view */}
            <div className="relative aspect-square rounded-card overflow-hidden bg-rawaa-soft border border-rawaa-border group">
              <img
                src={gallery[activeImage] || product.mainImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Promotional badges and certifications */}
              <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                {product.badge && (
                  <span className="bg-rawaa-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-soft-xs">
                    {product.badge}
                  </span>
                )}
                {product.isOrganic && (
                  <span className="bg-rawaa-sage text-white text-xs font-bold px-3 py-1 rounded-full shadow-soft-xs">
                    عضوي 100% GOTS
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-soft-xs">
                    خصم {product.discountPercent}%
                  </span>
                )}
              </div>

              {/* Floating wishlist action button */}
              <button
                type="button"
                className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-soft-xs ${
                  isLiked
                    ? 'bg-rose-50 text-rose-500 border border-rose-200'
                    : 'bg-white/90 text-rawaa-muted hover:text-rawaa-primary hover:bg-white'
                }`}
                onClick={() => toggleWishlist(product)}
                aria-label={isLiked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              >
                <Heart size={20} className={isLiked ? 'fill-rose-500' : ''} />
              </button>
            </div>

            {/* Thumbnail image gallery strip */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === idx
                        ? 'border-rawaa-primary shadow-soft-xs scale-105'
                        : 'border-rawaa-border hover:border-rawaa-primary/40 opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img src={imgUrl} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Delivery and authenticity guarantee badges */}
            <div className="bg-rawaa-soft rounded-card p-4 border border-rawaa-border grid grid-cols-2 gap-3 text-xs text-rawaa-dark mt-2">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-rawaa-sage shrink-0" />
                <span>شحن وتوصيل مبرد خلال 24-48 ساعة</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-rawaa-sage shrink-0" />
                <span>ضمان الوكيل الأصلي سنتين</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={18} className="text-rawaa-sage shrink-0" />
                <span>استرجاع واستبدال مجاني 14 يوماً</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={18} className="text-rawaa-sage shrink-0" />
                <span>معتمد من هيئة الغذاء والدواء</span>
              </div>
            </div>
          </div>

          {/* Product details and purchase options column */}
          <div className="lg:col-span-6 flex flex-col text-right">
            {/* Brand name and share button */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <Link
                to={`/category/${product.category}`}
                className="text-xs font-bold text-rawaa-sage tracking-wider uppercase hover:underline"
              >
                {product.brand}
              </Link>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs text-rawaa-muted hover:text-rawaa-primary transition-colors"
                title="مشاركة المنتج"
              >
                <Share2 size={15} />
                <span>مشاركة</span>
              </button>
            </div>

            {/* Main product heading */}
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-rawaa-dark leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating score and verified reviews count */}
            <div className="flex items-center gap-3 mb-4 text-xs">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-bold">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
              </div>
              <span className="text-rawaa-muted font-medium">({product.reviewCount} تقييم موثق من أمهات)</span>
              <span className="text-rawaa-border">•</span>
              <span className="text-rawaa-sage font-bold bg-rawaa-sage-light px-2 py-0.5 rounded-md">
                الفئة: {product.ageGroup}
              </span>
            </div>

            {/* Price display and savings badge */}
            <div className="bg-[#FAF8F5] border border-rawaa-border rounded-card p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-heading text-3xl sm:text-4xl font-black text-rawaa-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm sm:text-base text-rawaa-subtle line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-rawaa-muted block mt-0.5">
                  السعر شامل ضريبة القيمة المضافة (15%)
                </span>
              </div>

              {savingsAmount > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">
                  وفّرتِ {formatPrice(savingsAmount)}
                </div>
              )}
            </div>

            {/* Short product summary description */}
            <p className="text-sm text-rawaa-muted leading-relaxed mb-6">
              {product.shortDesc}
            </p>

            {/* Color variant selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-rawaa-dark">
                    اللون المختار: <strong className="text-rawaa-primary">{selectedColor?.name || ''}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {product.colors.map((color, i) => {
                    const isSelected = selectedColor?.name === color.name;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'ring-2 ring-rawaa-primary ring-offset-2 scale-110 shadow-soft-xs'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        aria-label={`اختيار لون ${color.name}`}
                      >
                        {isSelected && (
                          <Check size={14} className={color.hex === '#FFFFFF' || color.hex === '#F8F5EE' ? 'text-gray-900' : 'text-white'} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock availability indicator */}
            <div className="flex items-center gap-2 text-xs mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-emerald-800">
                {product.stockCount ? `متوفر في المخزون (متبقي ${product.stockCount} قطع فقط)` : 'متوفر للشحن الفوري'}
              </span>
            </div>

            {/* Quantity stepper and add to cart action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
              {/* Quantity adjustment stepper */}
              <div className="inline-flex items-center justify-between bg-rawaa-soft border border-rawaa-border rounded-full p-1 w-full sm:w-36 shrink-0">
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-white hover:bg-rawaa-primary-light text-rawaa-dark hover:text-rawaa-primary flex items-center justify-center transition-colors shadow-soft-xs disabled:opacity-50"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="إنقاص الكمية"
                >
                  <Minus size={15} />
                </button>
                <span className="font-bold text-sm text-rawaa-dark px-2">{quantity}</span>
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-white hover:bg-rawaa-primary-light text-rawaa-dark hover:text-rawaa-primary flex items-center justify-center transition-colors shadow-soft-xs"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="زيادة الكمية"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Primary add to cart button or coming soon inquiry */}
              {product.inStock ? (
                <button
                  type="button"
                  className={`flex-1 inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full font-bold text-sm shadow-soft-md transition-all duration-200 cursor-pointer ${
                    isAdding
                      ? 'bg-emerald-600 text-white scale-[0.98]'
                      : 'bg-rawaa-primary hover:bg-rawaa-primary-hover text-white hover:-translate-y-0.5'
                  }`}
                  onClick={handleAddToCart}
                >
                  <ShoppingBag size={18} />
                  <span>{isAdding ? 'تمت الإضافة بنجاح' : `أضف إلى السلة (${formatPrice(product.price * quantity)})`}</span>
                </button>
              ) : (
                <a
                  href={`https://wa.me/201035401549?text=${encodeURIComponent(
                    `مرحباً بيبي زون، أود الاستفسار عن موعد توفر منتج «${product.name}» (كود #${product.id})`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-soft-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Sparkles size={18} />
                  <span>قريباً في بيبي زون · اطلب توفيره عبر واتساب</span>
                </a>
              )}
            </div>

            {/* Tabbed specifications and shipping information */}
            <div className="border-t border-rawaa-border pt-6 mt-auto">
              <div className="flex items-center gap-4 border-b border-rawaa-border/60 pb-2 mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('features')}
                  className={`pb-2 transition-colors relative ${
                    activeTab === 'features' ? 'text-rawaa-primary font-black' : 'text-rawaa-muted hover:text-rawaa-dark'
                  }`}
                >
                  المميزات والمواصفات
                  {activeTab === 'features' && (
                    <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-rawaa-primary rounded" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-2 transition-colors relative ${
                    activeTab === 'shipping' ? 'text-rawaa-primary font-black' : 'text-rawaa-muted hover:text-rawaa-dark'
                  }`}
                >
                  الشحن وسياسة الإرجاع
                  {activeTab === 'shipping' && (
                    <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-rawaa-primary rounded" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('safety')}
                  className={`pb-2 transition-colors relative ${
                    activeTab === 'safety' ? 'text-rawaa-primary font-black' : 'text-rawaa-muted hover:text-rawaa-dark'
                  }`}
                >
                  معايير الأمان والشهادات
                  {activeTab === 'safety' && (
                    <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-rawaa-primary rounded" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 transition-colors relative flex items-center gap-1 ${
                    activeTab === 'reviews' ? 'text-rawaa-primary font-black' : 'text-rawaa-muted hover:text-rawaa-dark'
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>التقييمات ({productReviews.length})</span>
                  {activeTab === 'reviews' && (
                    <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-rawaa-primary rounded" />
                  )}
                </button>
              </div>

              {activeTab === 'features' && (
                <ul className="space-y-2 text-xs text-rawaa-muted leading-relaxed">
                  {product.features?.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={15} className="text-rawaa-sage shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'shipping' && (
                <div className="text-xs text-rawaa-muted space-y-2 leading-relaxed">
                  <p>• التوصيل الفوري متاح لكافة المدن الكبرى خلال 24-48 ساعة عبر أسطول سيارات مجهز ومبرد.</p>
                  <p>• استرجاع واستبدال مجاني بدون أي رسوم خلال 14 يوماً من استلام الشحنة.</p>
                  <p>• التغليف الفاخر وبطاقة الإهداء متوفرة مجاناً لجميع منتجات المواليد.</p>
                </div>
              )}

              {activeTab === 'safety' && (
                <div className="text-xs text-rawaa-muted space-y-2 leading-relaxed">
                  <p>• حاصل على شهادة الفحص الطبي وخالٍ تماماً من مادة BPA والفثالات والسموم.</p>
                  <p>• مطابق للمعايير الأوروبية المعتمدة (EN 1888 للأمان وحماية الطفل).</p>
                  <p>• أقمشة قطنية نقية 100% حاصلة على ترخيص معيار المنسوجات العضوية GOTS.</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {/* Reviews list */}
                  {isLoadingReviews ? (
                    <div className="space-y-2.5">
                      <ReviewSkeleton />
                      <ReviewSkeleton />
                      <ReviewSkeleton />
                    </div>
                  ) : productReviews.length === 0 ? (
                    <div className="py-3 text-center text-xs text-rawaa-muted bg-[#FAF8F5] rounded-lg">
                      لا توجد تقييمات مسجلة بعد لهذا المنتج. كوني أول من يقيم!
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {productReviews.map((rev) => (
                        <div key={rev.id} className="bg-[#FAF8F5] p-3 rounded-lg border border-rawaa-border/60 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-rawaa-dark flex items-center gap-1.5">
                              <User size={12} className="text-rawaa-muted" />
                              {rev.customer_name || rev.customerName}
                            </span>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={11}
                                  className={i < (rev.rating || 5) ? 'fill-amber-400' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-rawaa-muted leading-relaxed">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add review form */}
                  <form onSubmit={handleReviewSubmit} className="pt-3 border-t border-rawaa-border/60 space-y-2.5">
                    <span className="text-xs font-bold text-rawaa-dark block">أضيفي تقييمك للمنتج:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="الاسم الكريم *"
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        className="text-xs p-2 rounded-lg border border-rawaa-border bg-white focus:outline-none focus:ring-1 focus:ring-rawaa-primary"
                        required
                      />
                      <select
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        className="text-xs p-2 rounded-lg border border-rawaa-border bg-white focus:outline-none focus:ring-1 focus:ring-rawaa-primary"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ ممتاز (5 نجوم)</option>
                        <option value={4}>⭐⭐⭐⭐ جيد جداً (4 نجوم)</option>
                        <option value={3}>⭐⭐⭐ متوسط (3 نجوم)</option>
                        <option value={2}>⭐⭐ مقبول (نجمتان)</option>
                        <option value={1}>⭐ سيء (نجمة واحدة)</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="اكتبي تجربتك مع المنتج لمساعدة الأمهات الأخريات... *"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      rows={2}
                      className="w-full text-xs p-2 rounded-lg border border-rawaa-border bg-white focus:outline-none focus:ring-1 focus:ring-rawaa-primary resize-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full py-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Send size={13} />
                      <span>{isSubmittingReview ? 'جارٍ الإرسال...' : 'إرسال التقييم للسيرفر'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products recommendation grid */}
        {relatedProducts.length > 0 && (
          <section className="mt-14" aria-label="منتجات ذات صلة">
            <div className="flex items-center justify-between mb-6">
              <div className="text-right">
                <span className="text-xs font-bold text-rawaa-primary tracking-wider mb-1 block">
                  مختارات تكمل طلبيتك
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-rawaa-dark">
                  منتجات ذات صلة مقترحة لكِ
                </h2>
              </div>
              <Link
                to={`/category/${product.category}`}
                className="text-xs font-bold text-rawaa-primary hover:underline flex items-center gap-1"
              >
                <span>مشاهدة الكل في {categoryName}</span>
                <ChevronLeft size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
