import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import FreeShippingBar from './FreeShippingBar';
import {
  X,
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Lock
} from 'lucide-react';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotalSAR,
    cartSavingsSAR,
    cartCount,
    freeShippingRemainingSAR,
    formatPrice,
    addToast
  } = useShop();

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const navigate = useNavigate();

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (clean === 'BABY10' || clean === 'RAWAA10') {
      setAppliedPromo({ code: clean, percent: 10 });
      addToast(`تم تطبيق كود الخصم ${clean} بنجاح! تم خصم 10% إضافية 🎉`, 'success');
    } else {
      addToast('كود الخصم المدخل غير صالح أو منتهي الصلاحية', 'warning');
    }
  };

  const promoDiscountSAR = appliedPromo
    ? Math.round((cartTotalSAR * appliedPromo.percent) / 100)
    : 0;

  const shippingCostSAR = cartTotalSAR === 0 ? 0 : freeShippingRemainingSAR === 0 ? 0 : 25;
  const finalTotalSAR = Math.max(0, cartTotalSAR - promoDiscountSAR + shippingCostSAR);

  const handleCheckout = () => {
    addToast('جاري تحويلك إلى بوابة الدفع الآمنة المشفرة...', 'info');
  };

  return (
    <div
      className={`fixed inset-0 bg-rawaa-dark/60 backdrop-blur-sm z-50 flex justify-start transition-opacity duration-300 ease-in-out ${
        isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setIsCartOpen(false)}
      aria-hidden={!isCartOpen}
    >
      <aside
        className={`w-full max-w-md h-full bg-white flex flex-col shadow-soft-xl transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
        aria-label="سلة التسوق"
      >
        {/* Drawer header with item count and close button */}
        <div className="flex items-center justify-between p-5 border-b border-rawaa-border bg-rawaa-soft">
          <div className="flex items-center gap-3">
            <ShoppingBag size={21} className="text-rawaa-primary" />
            <div>
              <h3 className="font-heading text-lg font-bold text-rawaa-dark">سلة التسوق</h3>
              <span className="text-xs text-rawaa-muted">({cartCount} منتجات مختارة)</span>
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-white border border-rawaa-border text-rawaa-muted hover:text-rawaa-primary flex items-center justify-center transition-colors"
            onClick={() => setIsCartOpen(false)}
            aria-label="إغلاق سلة التسوق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free shipping threshold progress bar */}
        <FreeShippingBar />

        {/* Cart product items list or empty state */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={32} />
              </div>
              <h4 className="font-heading text-lg font-bold text-rawaa-dark mb-1.5">
                سلة التسوق فارغة حالياً
              </h4>
              <p className="text-xs text-rawaa-muted leading-relaxed max-w-xs mx-auto mb-6">
                استكشفي تشكيلتنا الفاخرة وأضيفي ما يحتاجه طفلك من أفضل الماركات العالمية المعتمدة.
              </p>
              <button
                type="button"
                className="bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold px-6 py-3 rounded-full inline-flex items-center gap-2 shadow-soft-sm transition-all hover:-translate-y-0.5"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/category/all');
                }}
              >
                <span>ابدئي التسوق الآن</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-rawaa-border">
              {cart.map((item) => {
                const { product, quantity, selectedColor, colorKey } = item;
                const itemTotalSAR = product.price * quantity;

                return (
                  <li key={`${product.id}-${colorKey}`} className="py-4 flex gap-3">
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-20 h-20 rounded-card object-cover shrink-0 border border-rawaa-border"
                    />

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[11px] text-rawaa-sage uppercase">{product.brand}</span>
                        {selectedColor && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rawaa-muted">
                            <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: selectedColor.hex }} />
                            <span>{selectedColor.name}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-rawaa-dark line-clamp-2 leading-snug mb-1.5">
                        {product.name}
                      </h4>

                      <div className="flex items-center gap-2 text-xs mb-2">
                        <span className="font-black text-rawaa-primary text-sm">{formatPrice(product.price)}</span>
                        {quantity > 1 && (
                          <span className="text-[11px] text-rawaa-muted">({formatPrice(itemTotalSAR)})</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        {/* Item quantity stepper controls */}
                        <div className="flex items-center bg-rawaa-soft border border-rawaa-border rounded-full">
                          <button
                            type="button"
                            className="w-7 h-7 flex items-center justify-center text-rawaa-dark hover:bg-white rounded-full transition-colors"
                            onClick={() => updateQuantity(product.id, colorKey, -1)}
                            aria-label="إنقاص الكمية"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{quantity}</span>
                          <button
                            type="button"
                            className="w-7 h-7 flex items-center justify-center text-rawaa-dark hover:bg-white rounded-full transition-colors"
                            onClick={() => updateQuantity(product.id, colorKey, 1)}
                            disabled={quantity >= product.stockCount}
                            aria-label="زيادة الكمية"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Item removal trigger */}
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[11px] text-rawaa-muted hover:text-red-600 transition-colors"
                          onClick={() => removeFromCart(product.id, colorKey)}
                          aria-label={`حذف ${product.name} من السلة`}
                        >
                          <Trash2 size={14} />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Cart summary and checkout breakdown */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-rawaa-border bg-white shadow-soft-md">
            {/* Promotional coupon input form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2 mb-4">
              <div className="flex-1 flex items-center bg-rawaa-soft border border-rawaa-border rounded-full px-3 py-1.5 focus-within:border-rawaa-primary">
                <Tag size={15} className="text-rawaa-muted ml-2" />
                <input
                  type="text"
                  placeholder="كود الخصم (جرّبي BABY10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full bg-transparent text-xs text-rawaa-dark outline-none placeholder-rawaa-subtle"
                />
              </div>
              <button
                type="submit"
                className="bg-rawaa-sage hover:bg-rawaa-sage-hover text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors shrink-0"
              >
                تطبيق
              </button>
            </form>

            {/* Itemized price breakdown calculations */}
            <div className="flex flex-col gap-1.5 text-xs text-rawaa-muted mb-4">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold text-rawaa-dark">{formatPrice(cartTotalSAR)}</span>
              </div>

              {cartSavingsSAR > 0 && (
                <div className="flex justify-between text-rawaa-primary font-medium">
                  <span>وفّرتِ من العروض:</span>
                  <span>- {formatPrice(cartSavingsSAR)}</span>
                </div>
              )}

              {appliedPromo && (
                <div className="flex justify-between text-rawaa-sage font-medium">
                  <span>كود الخصم ({appliedPromo.code} - 10%):</span>
                  <span>- {formatPrice(promoDiscountSAR)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>رسوم التوصيل:</span>
                <span className="font-semibold text-rawaa-dark">
                  {shippingCostSAR === 0 ? (
                    <strong className="text-emerald-600 font-bold">مجاناً بالكامل</strong>
                  ) : (
                    formatPrice(shippingCostSAR)
                  )}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-dashed border-rawaa-border text-sm">
                <span className="font-bold text-rawaa-dark">المجموع الإجمالي:</span>
                <span className="font-heading text-xl font-black text-rawaa-primary">{formatPrice(finalTotalSAR)}</span>
              </div>
            </div>

            {/* Primary checkout action button */}
            <button
              type="button"
              className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-sm font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 shadow-soft-sm hover:shadow-soft-md transition-all hover:-translate-y-0.5"
              onClick={handleCheckout}
            >
              <Lock size={16} />
              <span>متابعة إتمام الطلب الآمن ({formatPrice(finalTotalSAR)})</span>
            </button>

            <button
              type="button"
              className="w-full text-center text-xs text-rawaa-muted hover:text-red-600 mt-2 hover:underline"
              onClick={clearCart}
            >
              إفراغ سلة التسوق
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-rawaa-subtle mt-3">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>دفع مشفر 256-bit بمعايير أمان PCI-DSS المعتمدة</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
