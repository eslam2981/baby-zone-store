 import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: "كيف أتأكد أن أقمشة الملابس والأغطية آمنة بنسبة 100% لبشرة حديثي الولادة؟",
    a: "جميع منسوجاتنا وملابس المواليد حاصلة على شهادة GOTS العالمية للقطن العضوي النقي، وخالية تماماً من أصباغ الآزو، ومبيدات الحشرات، والفورمالدهيد. كما نعتمد درزات خياطة مسطحة تمنع أي احتكاك مع جلد الرضيع الحساس."
  },
  {
    q: "هل عربات السفر ومقاعد السيارات مصرح بدخولها لكابينة الطائرات ومعتمدة أمنياً؟",
    a: "نعم، كافة عربات السفر في قسمنا (مثل Stokke Yoyo³) مطابقة لمقاييس الاتحاد الدولي للنقل الجوي (IATA) كأمتعة كابينة يد. أما مقاعد السيارات فتخضع لمعيار الأمان الأوروبي الصارم ECE R129 (i-Size) ومزودة بأنظمة تثبيت آيزوفيكس وقضبان امتصاص صدمات متطورة."
  },
  {
    q: "ما هي مدة التوصيل، وكيف يتم ضمان سلامة مستحضرات العناية والمغذيات في الصيف؟",
    a: "يتم التوصيل داخل القاهرة الكبرى، الجيزة، والإسكندرية خلال 24 إلى 48 ساعة، ولباقي محافظات مصر خلال 2 إلى 3 أيام عمل. يتم شحن كافة مستحضرات العناية والمغذيات بسيارات مجهزة لحمايتها من درجات الحرارة المرتفعة مع تغليف حراري محكم."
  },
  {
    q: "ما هي شروط الاستبدال والاسترجاع في حال لم يناسبني المقاس أو لون المنتج؟",
    a: "نوفر سياسة استبدال واسترجاع مريحة لمدة 14 يوماً من تاريخ الاستلام للمنتجات غير المستخدمة في تغليفها الأصلي. نقوم بإرسال مندوب الشحن لاستلام الشحنة من باب منزلك مجاناً ويتم إرجاع المبلغ كاملاً لحسابك فور المعاينة."
  },
  {
    q: "ما هي خيارات الدفع المتاحة، وهل يتوفر الدفع عند الاستلام؟",
    a: "نعم، الدفع الأساسي والمعتمد لدينا هو الدفع عند الاستلام (Cash on Delivery) بعد استلام الطلب ومعاينته عند باب منزلك للتأكد من رضاكِ التام وجودة المنتجات، كما ندعم الدفع الفوري عبر إنستاباي (InstaPay)، المحافظ الإلكترونية (فودافون كاش، أورنج كاش، اتصالات كاش)، والبطاقات البنكية."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-14 sm:py-20 bg-rawaa-bg border-b border-rawaa-border" aria-label="الأسئلة الشائعة لمعلومات التسوق">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-rawaa-border text-rawaa-sage text-xs font-bold px-3.5 py-1.5 rounded-full mb-3 shadow-soft-xs">
            <HelpCircle size={15} />
            <span>إجابات واضحة وشفافة</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-rawaa-dark mb-2">
            الأسئلة الشائعة التي تهم كل أم وأب
          </h2>
          <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed max-w-xl mx-auto">
            جمعنا لكِ أهم الاستفسارات حول سلامة المنتجات، معايير الجودة الطبية، وخدمات التوصيل والدفع عند الاستلام
          </p>
        </div>

        <div className="space-y-3 sm:space-y-3.5">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-rawaa-primary/40 shadow-soft-md ring-1 ring-rawaa-primary/15'
                    : 'border-rawaa-border hover:border-rawaa-border-strong shadow-soft-xs'
                }`}
              >
                {/* Accordion toggle button */}
                <button
                  type="button"
                  className="w-full text-right p-4 sm:p-5 flex items-center justify-between gap-4 font-heading font-bold text-xs sm:text-sm md:text-base text-rawaa-dark hover:text-rawaa-primary transition-colors cursor-pointer select-none"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="leading-snug">{item.q}</span>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? 'rotate-180 bg-rawaa-primary text-white shadow-soft-xs'
                        : 'bg-rawaa-soft text-rawaa-muted hover:bg-rawaa-primary-light hover:text-rawaa-primary'
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {/* Smooth height accordion container */}
                <div
                  id={`faq-answer-${index}`}
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-rawaa-muted leading-relaxed border-t border-rawaa-border/50 bg-[#FAF8F5]/60">
                      <p className="pt-2">{item.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
