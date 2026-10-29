import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { couponsApi } from '../../services/api';
import { validateCouponCode, normalizeCouponCode } from '../../utils/validators';
import FreeShippingBar from './FreeShippingBar';
import CheckoutModal from './CheckoutModal';
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
    addToast,
    user,
    setIsAuthOpen
  } = useShop();

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const navigate = useNavigate();

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    const clean = normalizeCouponCode(promoInput);
    if (!clean) return;

    const codeErr = validateCouponCode(clean);
    if (codeErr) {
      addToast(codeErr, 'warning');
      return;
    }

    if (clean === 'BABY10' || clean === 'ZONE10' || clean === 'BABYZONE10' || clean === 'RAWAA10') {
      setAppliedPromo({ code: clean, type: 'percentage', percent: 10, amount: 0 });
      setPromoInput('');
      addToast(`تم تطبيق كود الخصم ${clean} بنجاح! تم خصم 10% إضافية`, 'success');
      return;
    }

    try {
      setIsApplyingPromo(true);
      const cp = await couponsApi.getByCode(clean);
      if (cp && cp.is_active) {
        const isPercent = cp.type === 'percentage';
        const percentVal = isPercent ? (Number(cp.discount_percent) || 10) : 0;
        const amountVal = !isPercent ? (Number(cp.discount_amount) || 0) : 0;
        const minSpend = Number(cp.min_spend) || 0;

        if (minSpend > 0 && cartTotalSAR < minSpend) {
          addToast(`هذا الكوبون يتطلب مشتريات بقيمة ${minSpend} ج.م على الأقل`, 'warning');
          return;
        }

        setAppliedPromo({
          code: clean,
          type: cp.type || 'percentage',
          percent: percentVal,
          amount: amountVal
        });

        setPromoInput('');
        const discountDesc = isPercent ? `${percentVal}%` : `${amountVal} ج.م`;
        addToast(`تم تطبيق كود الخصم ${clean} بنجاح! (${discountDesc})`, 'success');
      } else {
        addToast('كود الخصم المدخل غير صالح أو منتهي الصلاحية', 'warning');
      }
    } catch {
      addToast('كود الخصم المدخل غير صالح أو منتهي الصلاحية', 'warning');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const promoDiscountSAR = appliedPromo
    ? appliedPromo.type === 'fixed'
      ? Math.min(cartTotalSAR, appliedPromo.amount || 0)
      : Math.round((cartTotalSAR * (appliedPromo.percent || 0)) / 100)
    : 0;

  const isWholesaler = user?.role === 'wholesaler' || user?.permissions?.includes('bulk_purchasing');
  const isVipUser = Boolean(user?.isVip || user?.role === 'vip_customer' || user?.permissions?.includes('vip_discounts'));
  const canPlaceOrders = !user || (
    user.status !== 'محظور' &&
    user.status !== 'غير نشط' &&
    (user.isAdmin || !user.permissions || user.permissions.includes('place_orders') || user.permissions.includes('*'))
  );

  // Wholesale: 15% discount; VIP: 5% loyalty discount
  const wholesaleDiscountSAR = isWholesaler ? Math.round(cartTotalSAR * 0.15) : 0;
  const vipDiscountSAR = (!isWholesaler && isVipUser) ? Math.round(cartTotalSAR * 0.05) : 0;
  const roleDiscountSAR = wholesaleDiscountSAR + vipDiscountSAR;

  const shippingCostSAR = cartTotalSAR === 0
    ? 0
    : (isVipUser || isWholesaler || freeShippingRemainingSAR === 0)
    ? 0
    : 70;

  const totalDiscountSAR = promoDiscountSAR + roleDiscountSAR;
  const finalTotalSAR = Math.max(0, cartTotalSAR - totalDiscountSAR + shippingCostSAR);

  const handleCheckout = () => {
    if (!user) {
      addToast('يرجى تسجيل الدخول أو إنشاء حسابك أولاً لإتمام طلبك ومتابعة شحنتك في صفحتك الخاصة', 'warning');
      setIsCartOpen(false);
      setIsAuthOpen(true);
      return;
    }
    if (user.status === 'محظور') {
      addToast('عذراً، هذا الحساب محظور حالياً من قبل الإدارة', 'error');
      return;
    }
    if (user.status === 'غير نشط') {
      addToast('حسابك غير نشط وقيد المراجعة من الإدارة. إتمام الطلبات معلق حتى اعتماد الحساب.', 'warning');
      return;
    }
    if (user.permissions && !user.permissions.includes('place_orders') && !user.permissions.includes('*')) {
      addToast('صلاحية إتمام الطلبات معطلة لحسابك من قِبل الإدارة.', 'warning');
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <>
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
        <div className="flex-1 overflow-y-auto custom-modal-scroll p-5">
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
                disabled={isApplyingPromo}
                className="bg-rawaa-sage hover:bg-rawaa-sage-hover disabled:opacity-50 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors shrink-0"
              >
                {isApplyingPromo ? 'جارٍ التحقق...' : 'تطبيق'}
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
                  <span>
                    كود الخصم ({appliedPromo.code} - {appliedPromo.type === 'fixed' ? formatPrice(appliedPromo.amount || 0) : `${appliedPromo.percent}%`}):
                  </span>
                  <span>- {formatPrice(promoDiscountSAR)}</span>
                </div>
              )}

              {isWholesaler && wholesaleDiscountSAR > 0 && (
                <div className="flex justify-between text-blue-700 font-bold">
                  <span>خصم تاجر الجملة والتوريد (15%):</span>
                  <span>- {formatPrice(wholesaleDiscountSAR)}</span>
                </div>
              )}

              {isVipUser && !isWholesaler && vipDiscountSAR > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>خصم عضوية VIP الذهبية (5%):</span>
                  <span>- {formatPrice(vipDiscountSAR)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>رسوم التوصيل:</span>
                <span className="font-semibold text-rawaa-dark">
                  {shippingCostSAR === 0 ? (
                    <strong className="text-emerald-600 font-bold">
                      {isVipUser ? 'مجاناً (ميزة VIP)' : isWholesaler ? 'مجاناً (ميزة تاجر)' : 'مجاناً بالكامل'}
                    </strong>
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

            {/* Login and Account Status Block */}
            {!user ? (
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2.5 mb-2.5 shadow-2xs">
                <Lock size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block font-bold mb-0.5 text-amber-950">تسجيل الدخول مطلوب لإتمام الشراء:</strong>
                  <span className="text-[11px] text-amber-800">
                    يلزم تسجيل الدخول أو إنشاء حسابك لضمان حفظ بياناتك ومتابعة شحنتك لحظة بلحظة في صفحتك الخاصة.
                  </span>
                </div>
              </div>
            ) : user.status === 'محظور' ? (
              <div className="bg-rose-50 border border-rose-300 rounded-2xl p-2.5 text-xs text-rose-900 flex items-center justify-between gap-2 mb-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                  <span className="font-bold">حسابك محظور من الشراء والتنفيذ بأمر الإدارة</span>
                </div>
                <span className="text-[10px] bg-rose-200 text-rose-900 font-black px-2 py-0.5 rounded-full">محظور</span>
              </div>
            ) : user.status === 'غير نشط' ? (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-2.5 text-xs text-amber-900 flex items-center justify-between gap-2 mb-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span className="font-bold">حسابك قيد المراجعة — إتمام الطلبات معلق حتى الاعتماد</span>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2 py-0.5 rounded-full">قيد المراجعة</span>
              </div>
            ) : !canPlaceOrders ? (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-2.5 text-xs text-amber-900 flex items-center justify-between gap-2 mb-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-bold">صلاحية إتمام الطلبات معطلة لحسابك من قِبل الإدارة</span>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-black px-2 py-0.5 rounded-full">مقيد</span>
              </div>
            ) : (
              <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-2.5 text-xs text-emerald-900 flex items-center justify-between gap-2 mb-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-medium">الطلب مرتبط بحسابك: <strong className="font-bold text-emerald-800">{user.name}</strong></span>
                </div>
                {isWholesaler ? (
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">تاجر جملة</span>
                ) : isVipUser ? (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">VIP ذهبي 👑</span>
                ) : (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">حساب نشط</span>
                )}
              </div>
            )}

            {/* Primary checkout action button */}
            <button
              type="button"
              disabled={user && !canPlaceOrders}
              className={`w-full text-white text-sm font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                !user
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : !canPlaceOrders
                  ? 'bg-gray-400'
                  : 'bg-rawaa-primary hover:bg-rawaa-primary-hover hover:-translate-y-0.5'
              }`}
              onClick={handleCheckout}
            >
              <Lock size={16} />
              <span>
                {!user
                  ? `تسجيل الدخول ومتابعة إتمام الطلب (${formatPrice(finalTotalSAR)})`
                  : user.status === 'محظور'
                  ? 'الحساب محظور من الشراء'
                  : user.status === 'غير نشط'
                  ? 'الحساب قيد المراجعة والاعتماد'
                  : !canPlaceOrders
                  ? 'صلاحية إتمام الطلبات معطلة لحسابك'
                  : `متابعة إتمام الطلب الآمن (${formatPrice(finalTotalSAR)})`}
              </span>
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

      {/* Egyptian Checkout Modal rendered as a separate layer */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        totalAmount={finalTotalSAR}
        subtotal={cartTotalSAR}
        shippingFee={shippingCostSAR}
        discountAmount={promoDiscountSAR}
        onOrderSuccess={() => {
          setIsCartOpen(false);
        }}
      />
    </>
  );
}

