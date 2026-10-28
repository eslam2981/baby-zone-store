import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Gift, Copy, Check, Sparkles, ArrowLeft } from 'lucide-react';

export default function PromotionalBanner() {
  const { setSelectedCategory, addToast } = useShop();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const promoCode = 'BABY10';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    addToast('تم نسخ كود الخصم (BABY10) بنجاح! استخدميه عند إتمام الطلب', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShopOffers = () => {
    setSelectedCategory('offers');
    navigate('/category/offers');
  };

  return (
    <section className="py-8 sm:py-12 bg-rawaa-bg overflow-hidden" aria-label="عرض حصري للمواليد">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12">
        <div className="bg-gradient-to-r from-rawaa-primary/10 via-rawaa-primary-light/50 to-rawaa-soft border border-rawaa-primary/20 rounded-panel overflow-hidden shadow-soft-md grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Promotion text and voucher box */}
          <div className="lg:col-span-7 p-5 sm:p-8 lg:p-12 text-right">
            <div className="inline-flex items-center gap-1.5 bg-rawaa-primary text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full mb-3 sm:mb-4 shadow-soft-xs">
              <Sparkles size={13} />
              <span>مهرجان استقبال المواليد الجديد</span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-rawaa-dark leading-snug sm:leading-[1.35] mb-3 sm:mb-4">
              <span className="block mb-2 sm:mb-2.5">جهّزي كل مستلزمات طفلك الأولى</span>
              <span className="inline-flex items-center flex-wrap gap-2 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                <span>مع خصم إضافي</span>
                <span className="inline-flex items-center justify-center text-rawaa-primary bg-white px-2.5 py-0.5 rounded-lg border border-rawaa-primary/30 shadow-soft-xs font-black">
                  10%
                </span>
                <span>على كافة التشكيلة</span>
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-rawaa-muted leading-relaxed mb-6 max-w-xl">
              احصلي على كود الخصم الحصري بالإضافة إلى شحن مجاني وتغليف فاخر عند شرائك لعربات
              الأطفال، غرف النوم، أو باقات الهدايا الملكية.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Copy coupon box */}
              <div
                onClick={handleCopyCode}
                title="انقري لنسخ الكود"
                className="inline-flex items-center justify-between sm:justify-start gap-3 bg-white border-2 border-dashed border-rawaa-primary/40 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-card cursor-pointer hover:border-rawaa-primary transition-all duration-200 group shadow-soft-xs"
              >
                <span className="text-[11px] sm:text-xs text-rawaa-muted">كود الخصم</span>
                <span className="font-mono text-sm sm:text-base font-bold text-rawaa-primary tracking-wider">
                  {promoCode}
                </span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center transition-colors group-hover:bg-rawaa-primary group-hover:text-white shrink-0"
                  aria-label="نسخ كود الخصم"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Offers action button */}
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs sm:text-sm font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-soft-sm hover:-translate-y-0.5 transition-all duration-200 text-center"
                onClick={handleShopOffers}
              >
                <span>تسوقي العروض المميزة</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>

          {/* Banner image column */}
          <div className="lg:col-span-5 h-56 sm:h-72 lg:h-full min-h-[260px] lg:min-h-[340px] relative overflow-hidden group">
            <img
              src="/images/motherhood/promo-mother-baby.jpg"
              alt="أم تداعب مولودها بحب وفرح على بساط دافئ في بيبي زون"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rawaa-dark/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-rawaa-soft/20 pointer-events-none" />
            <div className="absolute bottom-3 right-3 left-3 sm:left-auto bg-white/95 backdrop-blur-sm border border-rawaa-border px-3 py-1.5 sm:py-2 rounded-full inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold text-rawaa-dark shadow-soft-sm">
              <Gift size={15} className="text-rawaa-primary shrink-0" />
              <span className="truncate">تغليف إهداء مجاني لكافة باقات المواليد</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
