
// Top announcement bar displaying shipping thresholds currency and customer service
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Truck, PhoneCall, ShieldCheck, Baby } from 'lucide-react';

export default function TopAnnouncement() {
  const {
    freeShippingRemainingSAR,
    FREE_SHIPPING_LIMIT_SAR,
    formatPrice
  } = useShop();

  return (
    <aside
      aria-label="شريط الإعلانات الترويجي"
      className="bg-rawaa-sage text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 border-b border-white/10 relative z-40"
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12 flex items-center justify-between gap-2 sm:gap-4">
        {/* Live announcement for free shipping threshold */}
        <div className="flex items-center gap-1.5 sm:gap-2 font-medium min-w-0">
          <Truck size={14} className="shrink-0 text-amber-300" />
          <span className="truncate sm:overflow-visible">
            {freeShippingRemainingSAR === 0 ? (
              <strong className="text-amber-200 font-bold">
                تهانينا! مؤهل لشحن مجاني سريع لكافة محافظات مصر
              </strong>
            ) : (
              <>
                شحن مجاني فوق <strong className="text-amber-200">{formatPrice(FREE_SHIPPING_LIMIT_SAR)}</strong> — متبقي {formatPrice(freeShippingRemainingSAR)}
              </>
            )}
          </span>
        </div>

        {/* Secondary trust badges and contact details */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
          <Link
            to="/hospital-bag"
            className="hidden md:inline-flex items-center gap-1.5 text-white/90 hover:text-amber-200 transition-colors"
          >
            <Baby size={13} className="text-amber-300" />
            <span>حقيبة الولادة</span>
            <span className="bg-amber-300 text-amber-950 text-[9px] px-1.5 py-0.2 rounded-full font-black">قريباً</span>
          </Link>

          <Link
            to="/track-order"
            className="hidden sm:inline-flex items-center gap-1 text-white/90 hover:text-amber-200 transition-colors"
          >
            <Truck size={13} className="text-amber-300" />
            <span>تتبع شحنتك</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1.5 text-white/90">
            <ShieldCheck size={14} className="text-emerald-300" />
            <span>منتجات أصلية 100% معتمدة</span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5">
            <PhoneCall size={13} className="text-amber-300" />
            <a href="tel:01035401549" className="underline underline-offset-2 hover:text-amber-200 transition-colors">
              خدمة العملاء والطلب: 0103 540 1549
            </a>
          </div>

          {/* Egyptian currency and store badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-white shadow-soft-xs">
            <span className="text-xs">🇪🇬</span>
            <span>مصر (ج.م)</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
