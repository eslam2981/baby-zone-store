import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  X,
  Star,
  Heart,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  ArrowLeft
} from 'lucide-react';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80";

export default function QuickViewModal() {
  const {
    quickViewProduct,
    setQuickViewProduct,
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useShop();

  const [activeProduct, setActiveProduct] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (quickViewProduct) {
      setActiveProduct(quickViewProduct);
      setActiveImageIndex(0);
      setQuantity(1);
      setSelectedColor(
        quickViewProduct.colors && quickViewProduct.colors.length > 0
          ? quickViewProduct.colors[0]
          : null
      );
      // Trigger smooth entry transition
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setActiveProduct(null), 300);
      return () => clearTimeout(timer);
    }
  }, [quickViewProduct]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setQuickViewProduct(null);
      setActiveProduct(null);
    }, 300);
  };

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!activeProduct) return null;

  const product = activeProduct;
  const isLiked = isInWishlist(product.id);
  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.mainImage];

  const handleAddToCart = () => {
    setIsAdded(true);
    addToCart(product, quantity, selectedColor);
    setTimeout(() => {
      setIsAdded(false);
      handleClose();
    }, 700);
  };

  const handleGoToProductPage = () => {
    handleClose();
    navigate(`/product/${product.id}`);
  };

  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  return (
    <div
      className={`fixed inset-0 bg-rawaa-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`تفاصيل منتج ${product.name}`}
    >
      {/* Modal dialog container with rounded corners */}
      <div
        className={`bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-rawaa-border/80 relative transition-all duration-300 ease-out transform flex flex-col md:flex-row ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating close modal button */}
        <button
          type="button"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 hover:bg-rawaa-primary-light text-rawaa-muted hover:text-rawaa-primary shadow-soft-sm border border-rawaa-border/60 backdrop-blur-sm flex items-center justify-center transition-all z-20 cursor-pointer"
          onClick={handleClose}
          aria-label="إغلاق المعاينة"
        >
          <X size={18} />
        </button>

        {/* Product image and gallery column */}
        <div className="w-full md:w-1/2 p-5 sm:p-7 bg-[#FAF7F2]/50 flex flex-col justify-between border-b md:border-b-0 md:border-l border-rawaa-border/60 shrink-0">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-rawaa-border/70 shadow-soft-xs flex items-center justify-center">
            <img
              src={gallery[activeImageIndex] || product.mainImage || FALLBACK_IMAGE}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_IMAGE;
              }}
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-3 right-3 bg-rawaa-primary text-white text-xs font-black px-2.5 py-1 rounded-full shadow-soft-xs">
                خصم {product.discountPercent}%
              </span>
            )}
          </div>

          {/* Interactive thumbnail gallery images */}
          {gallery.length > 1 && (
            <div className="flex gap-2.5 mt-3 justify-center sm:justify-start">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-rawaa-primary shadow-soft-xs scale-105'
                      : 'border-rawaa-border/80 opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img
                    src={img || FALLBACK_IMAGE}
                    alt={`صورة فرعية ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product details and purchase options column */}
        <div className="w-full md:w-1/2 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto custom-modal-scroll max-h-[85vh]">
          <div>
            {/* Brand age group and stock badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold text-rawaa-primary bg-rawaa-primary-light px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="text-[11px] font-semibold text-rawaa-muted bg-rawaa-soft px-2.5 py-0.5 rounded-full">
                {product.ageGroup}
              </span>
              <span className="mr-auto inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                <Check size={12} />
                <span>متوفر ({product.stockCount} قطع)</span>
              </span>
            </div>

            {/* Product heading title */}
            <h2 className="font-heading text-lg sm:text-xl font-bold text-rawaa-dark leading-snug mb-2">
              {product.name}
            </h2>

            {/* Customer rating score and review count */}
            <div className="flex items-center gap-2 text-xs mb-3">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star size={14} fill="#EAB308" color="#EAB308" />
                <span>{product.rating}</span>
              </div>
              <span className="text-rawaa-subtle">({product.reviewCount} تقييم موثق)</span>
            </div>

            {/* Price display and savings badge */}
            <div className="flex items-baseline gap-3 bg-rawaa-soft/70 border border-rawaa-border/60 p-3 rounded-xl mb-3">
              <span className="font-heading text-xl sm:text-2xl font-black text-rawaa-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-rawaa-subtle line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {savings > 0 && (
                <span className="text-[11px] font-bold text-rawaa-sage bg-rawaa-sage-light px-2 py-0.5 rounded-md mr-auto">
                  توفير {formatPrice(savings)}
                </span>
              )}
            </div>

            {/* Short product summary text */}
            <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed mb-3">
              {product.shortDesc}
            </p>

            {/* Selectable color swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-3.5">
                <span className="text-xs text-rawaa-muted block mb-1.5">
                  اللون المختار: <strong className="text-rawaa-dark">{selectedColor?.name}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        selectedColor?.name === c.name
                          ? 'border-rawaa-primary bg-rawaa-primary-light font-bold text-rawaa-primary shadow-soft-xs'
                          : 'border-rawaa-border bg-white text-rawaa-dark hover:border-rawaa-primary/40'
                      }`}
                      onClick={() => setSelectedColor(c)}
                    >
                      <span className="w-3 h-3 rounded-full border border-black/15 shrink-0" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compact grid of key specifications */}
            {product.features && (
              <div className="bg-[#FAF7F2]/70 border border-rawaa-border/60 rounded-xl p-3 mb-4">
                <h4 className="text-xs font-bold text-rawaa-dark mb-1.5">المواصفات الأساسية:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-rawaa-muted">
                  {product.features.slice(0, 4).map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-1.5">
                      <Check size={12} className="text-rawaa-primary shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quantity controls and primary add to cart button */}
          <div className="pt-2 border-t border-rawaa-border/60">
            {/* Quantity and Actions */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center bg-rawaa-soft border border-rawaa-border rounded-xl p-0.5">
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center text-rawaa-dark hover:bg-white rounded-lg transition-colors cursor-pointer"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="إنقاص الكمية"
                >
                  <Minus size={13} />
                </button>
                <span className="w-7 text-center text-xs font-bold">{quantity}</span>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center text-rawaa-dark hover:bg-white rounded-lg transition-colors cursor-pointer"
                  onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                  aria-label="زيادة الكمية"
                >
                  <Plus size={13} />
                </button>
              </div>

              <button
                type="button"
                className={`flex-1 text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-soft-sm transition-all hover:-translate-y-0.5 cursor-pointer ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rawaa-primary hover:bg-rawaa-primary-hover text-white'
                }`}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {isAdded ? (
                  <>
                    <Check size={15} />
                    <span>تمت الإضافة للسلة!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} />
                    <span>إضافة إلى السلة ({formatPrice(product.price * quantity)})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className={`w-10 h-10 rounded-xl border border-rawaa-border bg-rawaa-soft flex items-center justify-center transition-colors hover:bg-rawaa-primary-light hover:text-rawaa-primary cursor-pointer shrink-0 ${
                  isLiked ? 'text-rawaa-primary bg-rawaa-primary-light border-rawaa-primary' : 'text-rawaa-dark'
                }`}
                onClick={() => toggleWishlist(product)}
                aria-label="إضافة للمفضلة"
              >
                <Heart size={16} fill={isLiked ? '#C25E3E' : 'none'} color={isLiked ? '#C25E3E' : 'currentColor'} />
              </button>
            </div>

            {/* Direct link to dedicated product page */}
            <button
              type="button"
              className="text-xs font-bold text-rawaa-primary hover:underline flex items-center gap-1 mb-2.5 cursor-pointer"
              onClick={handleGoToProductPage}
            >
              <span>فتح صفحة تفاصيل المنتج الكاملة</span>
              <ArrowLeft size={13} />
            </button>

            {/* Trust and shipping guarantees */}
            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-rawaa-border/50 text-[10.5px] text-rawaa-subtle">
              <div className="flex items-center gap-1 truncate">
                <Truck size={12} className="text-rawaa-primary shrink-0" />
                <span className="truncate">شحن سريع وامن</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <RotateCcw size={12} className="text-rawaa-sage shrink-0" />
                <span className="truncate">استبدال 14 يوماً</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <ShieldCheck size={12} className="text-amber-600 shrink-0" />
                <span className="truncate">ضمان الوكيل 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
