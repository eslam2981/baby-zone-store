import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  Heart,
  Send,
  PhoneCall,
  Mail,
  MapPin,
  Lock,
  ShieldCheck
} from 'lucide-react';

export default function Footer() {
  const { addToast } = useShop();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      addToast('شكراً لانضمامكِ لمجتمع بيبي زون! تم إرسال دليل تجهيز حقيبة الولادة المجاني لبريدك الإلكتروني', 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-rawaa-dark text-white border-t border-white/10 mt-auto">
      {/* Newsletter subscription strip */}
      <div className="bg-[#222C27] border-b border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center lg:text-right">
            <span className="inline-block bg-rawaa-primary/20 text-amber-200 text-xs font-bold px-3 py-0.5 rounded-full mb-2">
              نادي بيبي زون للأمهات الجدد
            </span>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white mb-1">
              انضمي لأكثر من 50,000 أم واستلمي دليل رعاية المواليد مجاناً
            </h3>
            <p className="text-xs text-white/70">
              نصائح طبية أسبوعية من استشاريي طب الأطفال، عروض حصرية، وأولويات حجز المنتجات النادرة.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 w-full lg:max-w-md">
            <div className="flex-1 flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-2 sm:py-1.5 focus-within:border-rawaa-primary">
              <Mail size={16} className="text-white/50 ml-2 shrink-0" />
              <input
                type="email"
                placeholder="أدخلي بريدك الإلكتروني..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="w-full bg-transparent text-white text-xs outline-none placeholder-white/40"
                aria-label="البريد الإلكتروني للاشتراك بالنشرة البريدية"
              />
            </div>
            <button
              type="submit"
              className="bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <span>{subscribed ? 'تم الاشتراك!' : 'اشتركي مجاناً'}</span>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Main navigation links grid */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand information and contacts */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <img
                src="/logo.png"
                alt="شعار بيبي زون - Baby Zone"
                className="w-10 h-10 object-contain rounded-full bg-white p-1 shadow-soft-xs border border-white/20"
              />
              <span className="font-heading text-xl font-black text-white">بيبي <span className="text-rawaa-primary">زون</span> | BABY ZONE</span>
            </Link>

            <p className="text-xs text-white/65 leading-relaxed mb-4">
              المتجر المتخصص الأرقى في مصر والشرق الأوسط لمستلزمات الطفولة الآمنة وعناية الأم والطفل.
              نجمع بين الدفء الأسري وأعلى درجات الأمان الطبي والاعتمادات العالمية الموثوقة.
            </p>

            <div className="flex flex-col gap-2 text-xs text-white/75">
              <div className="flex items-center gap-2">
                <PhoneCall size={14} className="text-amber-300" />
                <span>خدمة العملاء والواتساب 012-1173-5629</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-emerald-300" />
                <span>care@babyzone-egypt.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-rose-300" />
                <span>القاهرة التجمع الخامس | الإسكندرية سموحة</span>
              </div>
            </div>
          </div>

          {/* Category navigation links */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-6 after:h-0.5 after:bg-rawaa-primary">
              أقسام التسوق
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-white/70">
              <li>
                <Link to="/category/strollers" className="hover:text-white hover:-translate-x-1 inline-block transition-transform">
                  عربات الأطفال وأنظمة السفر
                </Link>
              </li>
              <li>
                <Link to="/category/car-seats" className="hover:text-white hover:-translate-x-1 inline-block transition-transform">
                  مقاعد السيارات الآمنة i-Size
                </Link>
              </li>
              <li>
                <Link to="/category/clothing" className="hover:text-white hover:-translate-x-1 inline-block transition-transform">
                  أزياء قطنية عضوية للمواليد
                </Link>
              </li>
              <li>
                <Link to="/category/bedding" className="hover:text-white hover:-translate-x-1 inline-block transition-transform">
                  أسرّة ومستلزمات النوم الهانئ
                </Link>
              </li>
              <li>
                <Link to="/category/bottles" className="hover:text-white hover:-translate-x-1 inline-block transition-transform">
                  الرضّاعات الزجاجية والمعقمات
                </Link>
              </li>
              <li>
                <Link to="/category/gifts" className="hover:text-white hover:-translate-x-1 inline-block transition-transform">
                  صناديق وباقات هدايا المواليد
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer service links */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-6 after:h-0.5 after:bg-rawaa-primary">
              خدمة العملاء والضمان
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-white/70">
              <li><Link to="/#faq" className="hover:text-white transition-colors">الأسئلة الشائعة لمعلومات التسوق</Link></li>
              <li><Link to="/track-order" className="hover:text-white transition-colors">تتبع طلبيتك مباشرة وسرعة الشحن</Link></li>
              <li><Link to="/hospital-bag" className="hover:text-white transition-colors">دليل وقائمة تجهيز حقيبة الولادة الذكية</Link></li>
              <li><Link to="/category/all" className="hover:text-white transition-colors">شروط الاستبدال والاسترجاع المجاني</Link></li>
              <li><Link to="/category/all" className="hover:text-white transition-colors">ضمان الأصالة وتراخيص الغذاء والدواء</Link></li>
            </ul>
          </div>

          {/* Security badges and payment methods */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-6 after:h-0.5 after:bg-rawaa-primary">
              معايير الأمان والدفع
            </h4>
            <p className="text-xs text-white/65 leading-relaxed mb-4">
              جميع المنتجات مطابقة للمواصفات والمقاييس المصرية والعالمية ومصرح بها صحياً لسلامة وصحة طفلك.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="bg-white/10 border border-white/15 text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded">فودافون كاش</span>
              <span className="bg-white/10 border border-white/15 text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded">InstaPay إنستاباي</span>
              <span className="bg-white/10 border border-white/15 text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded">Visa</span>
              <span className="bg-white/10 border border-white/15 text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded">Mastercard</span>
              <span className="bg-white/10 border border-white/15 text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded">فوري Fawry</span>
              <span className="bg-white/10 border border-white/15 text-white/90 text-[11px] font-semibold px-2.5 py-1 rounded">الدفع عند الاستلام</span>
            </div>

            <div className="flex items-center gap-2 bg-rawaa-sage/30 border border-rawaa-sage/50 p-2.5 rounded-lg text-[11px] text-emerald-200">
              <Lock size={14} className="shrink-0" />
              <span>تسوق آمن ومشفر 100% بنظام SSL العالمي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright and bottom disclaimer bar */}
      <div className="border-t border-white/10 py-4 px-4 sm:px-6 lg:px-8 text-[11px] text-white/50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
          <p>
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} لمتجر <strong>بيبي زون (Baby Zone)</strong> 
          </p>
          <div className="flex items-center gap-1.5 justify-center">
            <span>صُنِع بكل الحب لراحة أمهات وأطفال الوطن العربي</span>
            <Heart size={13} className="text-rawaa-primary fill-rawaa-primary" />
          </div>
        </div>
      </div>
    </footer>
  );
}
