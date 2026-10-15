
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Gift, Sparkles, Feather, HeartHandshake, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function GiftConcierge() {
  const { setSelectedCategory } = useShop();
  const navigate = useNavigate();

  const handleGoToGifts = () => {
    setSelectedCategory('gifts');
    navigate('/category/gifts');
  };

  return (
    <section className="py-10 sm:py-16 bg-white border-b border-rawaa-border overflow-hidden" aria-label="خدمة باقات وهدايا المواليد الفاخرة">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12">
        <div className="bg-gradient-to-br from-[#FBF8F5] via-[#F6EFEB] to-[#F1E8E2] border border-rawaa-border rounded-panel p-5 sm:p-10 lg:p-12 shadow-soft-sm">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-rawaa-primary/20 text-rawaa-primary text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full mb-3 shadow-soft-xs">
              <Gift size={14} />
              <span>خدمة بيبي زون الخاصة للتهنئة وتجهيز المواليد</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-rawaa-dark leading-tight mb-3">
              لأن الهدايا ذكريات تدوم... <br className="hidden xs:inline" />
              نصنع لكِ باقة استقبال تليق بمقام أحبابك
            </h2>
            <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed">
              سواء كنتِ أمّاً تستعد ليوم الولادة الميمون، أو تبحثين عن أجمل هدية تليق بأختك أو صديقتك،
              فريقنا يتولى التنسيق والتغليف والتوصيل الفاخر.
            </p>
          </div>

          {/* Concierge feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {/* Custom embroidery card */}
            <div className="bg-white rounded-card p-5 sm:p-6 border border-rawaa-border shadow-soft-xs hover:shadow-soft-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-right">
              <div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mb-4">
                  <Feather size={22} className="sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-rawaa-dark mb-2">
                  تطريز وحفر الاسم المخصص
                </h3>
                <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed mb-4">
                  إمكانية تطريز اسم الرضيع على البطانيات والأفرولات، وحفر الخشب التذكاري لتوثيق تاريخ وساعة الميلاد.
                </p>
              </div>
              <ul className="space-y-2 border-t border-rawaa-border/60 pt-4 text-xs text-rawaa-dark">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-rawaa-sage shrink-0" />
                  <span>خيوط حريرية طبيعية 100%</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-rawaa-sage shrink-0" />
                  <span>خطوط عربية كلاسيكية متقنة</span>
                </li>
              </ul>
            </div>

            {/* Royal gift packaging card */}
            <div className="bg-white rounded-card p-5 sm:p-6 border-2 border-rawaa-primary/50 shadow-soft-md hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between text-right">
              <div className="absolute -top-3 right-5 sm:right-6 bg-rawaa-primary text-white text-[10px] sm:text-[11px] font-bold px-3 py-0.5 rounded-full shadow-soft-xs">
                الأكثر طلباً للتهنئة
              </div>
              <div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                  <Sparkles size={22} className="sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-rawaa-dark mb-2">
                  تغليف الهدايا الملكي
                </h3>
                <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed mb-4">
                  صناديق صلبة مذهبة مع أشرطة مخملية، وبطاقة إهداء مخصصة يُكتب فيها نص تهنئتك الخاصة بأرقى حبر.
                </p>
              </div>
              <ul className="space-y-2 border-t border-rawaa-border/60 pt-4 text-xs text-rawaa-dark">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-rawaa-sage shrink-0" />
                  <span>خامات تغليف صديقة للبيئة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-rawaa-sage shrink-0" />
                  <span>إمكانية إضافة عطر الرضع الطبيعي</span>
                </li>
              </ul>
            </div>

            {/* Hospital direct delivery card */}
            <div className="bg-white rounded-card p-5 sm:p-6 border border-rawaa-border shadow-soft-xs hover:shadow-soft-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-right">
              <div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rawaa-sage-light text-rawaa-sage flex items-center justify-center mb-4">
                  <HeartHandshake size={22} className="sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-rawaa-dark mb-2">
                  التسليم المباشر للمستشفى
                </h3>
                <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed mb-4">
                  نوصل الهدية مباشرة إلى غرفة الأم في مستشفى الولادة مع التنسيق المسبق، لتكوني أول من يبارك بأجمل صورة.
                </p>
              </div>
              <ul className="space-y-2 border-t border-rawaa-border/60 pt-4 text-xs text-rawaa-dark">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-rawaa-sage shrink-0" />
                  <span>تغليف واقٍ مقاوم للتعقيم</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-rawaa-sage shrink-0" />
                  <span>رسائل إشعار فورية عند التسليم</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action button to gifts category */}
          <div className="text-center">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs sm:text-sm font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              onClick={handleGoToGifts}
            >
              <span>استكشفي باقات وصناديق الهدايا الفاخرة</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
