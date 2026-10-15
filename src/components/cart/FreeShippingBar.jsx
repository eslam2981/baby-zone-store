// Progress bar showing remaining amount for free shipping eligibility
import { useShop } from '../../context/ShopContext';
import { Truck, CheckCircle2, Gift } from 'lucide-react';

export default function FreeShippingBar() {
  const {
    freeShippingRemainingSAR,
    freeShippingProgress,
    FREE_SHIPPING_LIMIT_SAR,
    formatPrice
  } = useShop();

  const isUnlocked = freeShippingRemainingSAR === 0;

  return (
    <div className={`p-4 border-b transition-colors ${isUnlocked ? 'bg-rawaa-sage-light border-rawaa-sage/20' : 'bg-rawaa-primary-light border-rawaa-primary/15'}`}>
      <div className="flex items-center gap-2 mb-2">
        {isUnlocked ? (
          <CheckCircle2 size={17} className="text-rawaa-sage shrink-0" />
        ) : (
          <Truck size={17} className="text-rawaa-primary shrink-0" />
        )}
        <p className="text-xs text-rawaa-dark leading-snug">
          {isUnlocked ? (
            <span className="inline-flex items-center gap-1 text-rawaa-sage font-bold">
              <span>تهانينا! لقد حصلتِ على شحن مجاني سريع لطلبكِ</span>
              <Gift size={15} className="text-rawaa-sage shrink-0" />
            </span>
          ) : (
            <>
              أضيفي بـ <strong className="text-rawaa-primary font-bold">{formatPrice(freeShippingRemainingSAR)}</strong> إضافية للحصول على <strong className="text-rawaa-primary">شحن مجاني</strong> (الحد الأدنى {formatPrice(FREE_SHIPPING_LIMIT_SAR)})
            </>
          )}
        </p>
      </div>

      <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${isUnlocked ? 'bg-rawaa-sage' : 'bg-rawaa-primary'}`}
          style={{ width: `${freeShippingProgress}%` }}
        />
      </div>
    </div>
  );
}
