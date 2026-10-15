// Slide drawer displaying saved wishlist products with quick add to cart actions

import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { X, Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';

export default function WishlistDrawer() {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    toggleWishlist,
    addToCart,
    formatPrice
  } = useShop();

  const navigate = useNavigate();

  return (
    <div
      className={`fixed inset-0 bg-rawaa-dark/60 backdrop-blur-sm z-50 flex justify-start transition-opacity duration-300 ease-in-out ${
        isWishlistOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setIsWishlistOpen(false)}
      aria-hidden={!isWishlistOpen}
    >
      <aside
        className={`w-full max-w-md h-full bg-white flex flex-col shadow-soft-xl transform transition-transform duration-300 ease-in-out ${
          isWishlistOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
        aria-label="قائمة المفضلة"
      >
        <div className="flex items-center justify-between p-5 border-b border-rawaa-border bg-rawaa-soft">
          <div className="flex items-center gap-3">
            <Heart size={21} className="text-rawaa-sage fill-rawaa-sage" />
            <div>
              <h3 className="font-heading text-lg font-bold text-rawaa-dark">قائمة المفضلة</h3>
              <span className="text-xs text-rawaa-muted">({wishlist.length} منتجات محفوظة)</span>
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white border border-rawaa-border text-rawaa-muted hover:text-rawaa-primary flex items-center justify-center transition-colors"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="إغلاق قائمة المفضلة"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {wishlist.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-4">
                <Heart size={30} />
              </div>
              <h4 className="font-heading text-lg font-bold text-rawaa-dark mb-1.5">
                قائمة المفضلة فارغة
              </h4>
              <p className="text-xs text-rawaa-muted leading-relaxed max-w-xs mx-auto mb-6">
                انقري على أيقونة القلب على أي منتج لحفظه والرجوع إليه لاحقاً ومتابعة تخفيضات الأسعار.
              </p>
              <button
                type="button"
                className="bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-soft-sm transition-all hover:-translate-y-0.5"
                onClick={() => {
                  setIsWishlistOpen(false);
                  navigate('/category/all');
                }}
              >
                <span>استكشفي المنتجات الآن</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-rawaa-border">
              {wishlist.map((product) => (
                <li key={product.id} className="py-4 flex gap-3">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-20 h-20 rounded-card object-cover shrink-0 border border-rawaa-border cursor-pointer hover:opacity-90"
                    onClick={() => {
                      setIsWishlistOpen(false);
                      navigate(`/product/${product.id}`);
                    }}
                  />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="font-bold text-[11px] text-rawaa-sage uppercase">{product.brand}</span>
                    <h4
                      className="text-xs font-bold text-rawaa-dark line-clamp-2 leading-snug mb-1 cursor-pointer hover:text-rawaa-primary"
                      onClick={() => {
                        setIsWishlistOpen(false);
                        navigate(`/product/${product.id}`);
                      }}
                    >
                      {product.name}
                    </h4>
                    <span className="font-black text-rawaa-primary text-sm mb-3">{formatPrice(product.price)}</span>

                    <div className="flex items-center gap-2 mt-auto">
                      <button
                        type="button"
                        className="bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-soft-xs transition-colors"
                        onClick={() => addToCart(product, 1)}
                      >
                        <ShoppingBag size={14} />
                        <span>نقل إلى السلة</span>
                      </button>

                      <button
                        type="button"
                        className="p-1.5 text-rawaa-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        onClick={() => toggleWishlist(product)}
                        title="إزالة من المفضلة"
                        aria-label={`إزالة ${product.name} من المفضلة`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
