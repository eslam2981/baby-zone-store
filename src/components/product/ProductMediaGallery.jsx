import { Heart, Truck, ShieldCheck, RotateCcw, Award } from 'lucide-react';

export function ProductMediaGallery({
  product,
  gallery,
  activeImage,
  setActiveImage,
  isLiked,
  onToggleWishlist
}) {
  return (
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
          className={`absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-soft-xs cursor-pointer ${
            isLiked
              ? 'bg-rose-50 text-rose-500 border border-rose-200'
              : 'bg-white/90 text-rawaa-muted hover:text-rawaa-primary hover:bg-white'
          }`}
          onClick={onToggleWishlist}
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
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
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
  );
}

