import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  Heart,
  Eye,
  ShoppingBag,
  Star,
  Check,
  Sparkles
} from 'lucide-react';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const {
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct
  } = useShop();

  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : null
  );
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  const isLiked = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, 1, selectedColor);
    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const savingsAmount = product.originalPrice
    ? product.originalPrice - product.price
    : 0;

  return (
    <article
      className={`bg-white border border-rawaa-border rounded-panel overflow-hidden shadow-soft-xs hover:shadow-soft-lg hover:border-rawaa-primary/40 hover:-translate-y-1 transition-all duration-300 flex cursor-pointer group ${
        viewMode === 'list' ? 'flex-col sm:flex-row' : 'flex-col'
      }`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`${product.name} - ${formatPrice(product.price)}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleCardClick();
      }}
    >
      {/* Product image container with responsive aspect ratio */}
      <div
        className={`relative bg-gradient-to-b from-[#FAF7F2] to-[#F2EDE4] overflow-hidden shrink-0 ${
          viewMode === 'list' ? 'w-full sm:w-60 aspect-square' : 'w-full aspect-[16/10] sm:aspect-[16/10.5]'
        }`}
      >
        <img
          src={product.mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Product discount and organic certification badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-start gap-1 z-10 pointer-events-none">
          {product.discountPercent > 0 && (
            <span className="bg-rawaa-primary text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-soft-xs">
              -{product.discountPercent}%
            </span>
          )}
          {product.badge && (
            <span className="bg-white/95 backdrop-blur-sm text-rawaa-sage text-[11px] font-bold px-2 py-0.5 rounded-full border border-rawaa-border flex items-center gap-1 shadow-soft-xs">
              {product.isOrganic && <Sparkles size={11} className="text-rawaa-amber" />}
              <span>{product.badge}</span>
            </span>
          )}
        </div>

        {/* Floating wishlist and quick view action buttons */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            className={`w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm border border-rawaa-border text-rawaa-dark shadow-soft-sm flex items-center justify-center transition-all hover:scale-110 hover:bg-rawaa-primary-light hover:text-rawaa-primary ${
              isLiked ? 'text-rawaa-primary bg-rawaa-primary-light' : ''
            }`}
            onClick={handleWishlistToggle}
            aria-label={isLiked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            title="المفضلة"
          >
            <Heart size={16} fill={isLiked ? '#C25E3E' : 'none'} color={isLiked ? '#C25E3E' : 'currentColor'} />
          </button>

          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm border border-rawaa-border text-rawaa-dark shadow-soft-sm flex items-center justify-center transition-all hover:scale-110 hover:bg-rawaa-primary-light hover:text-rawaa-primary"
            onClick={handleQuickView}
            aria-label="معاينة سريعة للمنتج"
            title="معاينة سريعة"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Product textual details and specifications */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        {/* Brand name and target age group tag */}
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-rawaa-sage uppercase tracking-wider text-[11px]">{product.brand}</span>
          <span className="text-[10.5px] text-rawaa-muted bg-rawaa-soft px-2 py-0.5 rounded-full font-medium">
            {product.ageGroup}
          </span>
        </div>

        {/* Product title with hover color transition */}
        <h3 className="font-body text-xs sm:text-sm font-bold text-rawaa-dark line-clamp-2 leading-snug mb-1.5 group-hover:text-rawaa-primary transition-colors min-h-[2.5em]">
          {product.name}
        </h3>

        {/* Rating score and live stock availability */}
        <div className="flex items-center gap-2 text-xs mb-2">
          <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
            <Star size={13} fill="#EAB308" color="#EAB308" />
            <span>{product.rating}</span>
          </div>
          <span className="text-rawaa-subtle text-[11px]">({product.reviewCount} تقييم)</span>
          {product.inStock ? (
            <span className="mr-auto text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              متوفر
            </span>
          ) : (
            <span className="mr-auto text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              نفد
            </span>
          )}
        </div>

        {/* Selectable product color swatches */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs text-rawaa-muted">الألوان:</span>
            <div className="flex items-center gap-1.5">
              {product.colors.map((c, cIdx) => (
                <button
                  key={cIdx}
                  type="button"
                  className={`w-4 h-4 rounded-full border border-black/20 transition-transform ${
                    selectedColor?.name === c.name ? 'scale-125 ring-2 ring-rawaa-primary ring-offset-1' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  onClick={() => setSelectedColor(c)}
                  aria-label={`اختر لون: ${c.name}`}
                />
              ))}
            </div>
            {selectedColor && (
              <span className="text-[11px] text-rawaa-subtle mr-1">({selectedColor.name})</span>
            )}
          </div>
        )}

        {/* Price and savings display container */}
        <div className="mt-auto pt-3 border-t border-rawaa-border/60">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Formatted product price display */}
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="font-heading text-lg sm:text-xl font-black text-rawaa-primary whitespace-nowrap">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs sm:text-sm text-rawaa-subtle line-through whitespace-nowrap">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Calculated savings amount pill */}
            {savingsAmount > 0 && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                وفّرتِ {formatPrice(savingsAmount)}
              </span>
            )}
          </div>
        </div>

        {/* Add to cart interactive trigger */}
        <div className="mt-3">
          <button
            type="button"
            className={`w-full text-xs sm:text-sm font-bold py-2 sm:py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all duration-200 border cursor-pointer ${
              isAdding
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-rawaa-soft border-rawaa-border text-rawaa-dark hover:bg-rawaa-primary hover:border-rawaa-primary hover:text-white shadow-soft-xs hover:shadow-soft-sm'
            }`}
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            {isAdding ? (
              <>
                <Check size={16} />
                <span>تمت الإضافة بنجاح ✨</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>أضيفي للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
