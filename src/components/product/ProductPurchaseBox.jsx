import { Link } from 'react-router-dom';
import { Share2, Star, Check, Minus, Plus, ShoppingBag, Sparkles, Lock } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export function ProductPurchaseBox({
  product,
  selectedColor,
  setSelectedColor,
  quantity,
  setQuantity,
  isAdding,
  onAddToCart,
  onShare,
  formatPrice
}) {
  const { user } = useShop();

  const isWholesaler = user?.role === 'wholesaler' || user?.permissions?.includes('bulk_purchasing');
  const isVip = Boolean(user?.isVip || user?.role === 'vip_customer' || user?.permissions?.includes('vip_discounts'));
  const isBlocked = user?.status === 'محظور';
  const isInactive = user?.status === 'غير نشط';
  const canPlaceOrders = !user || (
    !isBlocked &&
    (user.isAdmin || !user.permissions || user.permissions.includes('place_orders') || user.permissions.includes('*'))
  );

  const savingsAmount = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : 0;

  return (
    <div className="flex flex-col text-right">
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
          onClick={onShare}
          className="flex items-center gap-1.5 text-xs text-rawaa-muted hover:text-rawaa-primary transition-colors cursor-pointer"
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

      {/* Role-based Wholesale and VIP discounts callout */}
      {isWholesaler ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl p-2.5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-blue-600 shrink-0" />
            <div>
              <span className="font-bold block">سعر توريد الجملة للتاجر (خصم 15%):</span>
              <span className="text-[11px] text-blue-700">يطبق تلقائياً عند الدفع في السلة</span>
            </div>
          </div>
          <span className="text-xs font-black text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
            {formatPrice(Math.round(product.price * 0.85))} للقطعة
          </span>
        </div>
      ) : isVip ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl p-2.5 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">سعر عميلات VIP الذهبيات (خصم 5% + شحن مجاني):</span>
              <span className="text-[11px] text-amber-700">ميزة حصرية وخاصة بعضويتك</span>
            </div>
          </div>
          <span className="text-xs font-black text-amber-700 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
            {formatPrice(Math.round(product.price * 0.95))}
          </span>
        </div>
      ) : null}

      {/* Account Status Warnings */}
      {isBlocked ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-2.5 mb-5 flex items-center gap-2">
          <Lock size={15} className="text-rose-600 shrink-0" />
          <span className="font-bold">حسابك محظور من الشراء والتنفيذ بأمر إدارة المتجر</span>
        </div>
      ) : isInactive ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-2.5 mb-5 flex items-center gap-2">
          <Lock size={15} className="text-amber-600 shrink-0" />
          <span className="font-bold">حسابك قيد المراجعة والاعتماد — يمكنك تجهيز السلة لحين التفعيل</span>
        </div>
      ) : null}

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
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
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
        <div className="inline-flex items-center justify-between bg-rawaa-soft border border-rawaa-border rounded-full p-1 w-full sm:w-36 shrink-0">
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-white hover:bg-rawaa-primary-light text-rawaa-dark hover:text-rawaa-primary flex items-center justify-center transition-colors shadow-soft-xs disabled:opacity-50 cursor-pointer"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="إنقاص الكمية"
          >
            <Minus size={15} />
          </button>
          <span className="font-bold text-sm text-rawaa-dark px-2">{quantity}</span>
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-white hover:bg-rawaa-primary-light text-rawaa-dark hover:text-rawaa-primary flex items-center justify-center transition-colors shadow-soft-xs cursor-pointer"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="زيادة الكمية"
          >
            <Plus size={15} />
          </button>
        </div>

        {product.inStock ? (
          <button
            type="button"
            disabled={!canPlaceOrders}
            className={`flex-1 inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full font-bold text-sm shadow-soft-md transition-all duration-200 ${
              !canPlaceOrders
                ? 'bg-gray-400 text-white cursor-not-allowed opacity-75'
                : isAdding
                ? 'bg-emerald-600 text-white scale-[0.98] cursor-pointer'
                : 'bg-rawaa-primary hover:bg-rawaa-primary-hover text-white hover:-translate-y-0.5 cursor-pointer'
            }`}
            onClick={canPlaceOrders ? onAddToCart : undefined}
          >
            {!canPlaceOrders ? (
              <>
                <Lock size={16} />
                <span>
                  {isBlocked
                    ? 'الحساب محظور من الشراء'
                    : 'صلاحية إتمام الطلبات معطلة لحسابك'}
                </span>
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                <span>{isAdding ? 'تمت الإضافة بنجاح' : `أضف إلى السلة (${formatPrice(product.price * quantity)})`}</span>
              </>
            )}
          </button>
        ) : (
          <a
            href={`https://wa.me/201035401549?text=${encodeURIComponent(
              `مرحباً بيبي زون، أود الاستفسار عن موعد توفر منتج «${product.name}» (كود #${product.id})`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-soft-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <Sparkles size={18} />
            <span>قريباً في بيبي زون · اطلب توفيره عبر واتساب</span>
          </a>
        )}
      </div>
    </div>
  );
}

