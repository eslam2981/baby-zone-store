
import { Truck, RotateCcw, ShieldCheck, HeartHandshake } from 'lucide-react';

const PILLARS = [
  {
    icon: Truck,
    title: "شحن سريع وامن",
    desc: "توصيل خلال 24-48 ساعة بسيارات مجهزة ومكيفة للحفاظ على سلامة مستحضرات الرضيع ونظافتها.",
    bg: "bg-rawaa-primary-light text-rawaa-primary"
  },
  {
    icon: RotateCcw,
    title: "استبدال واسترجاع مرن",
    desc: "سياسة استرجاع مريحة خلال 14 يوماً من الاستلام مع استلام الشحنة مباشرة من باب منزلك مجاناً.",
    bg: "bg-rawaa-sage-light text-rawaa-sage"
  },
  {
    icon: ShieldCheck,
    title: "أصالة وضمان الوكيل",
    desc: "جميع المعروضات مستوردة مباشرة من المصانع الرسمية العالمية وحاصلة على تراخيص الجودة والسلامة.",
    bg: "bg-amber-50 text-amber-600"
  },
  {
    icon: HeartHandshake,
    title: "دعم مباشر وخدمة عملاء",
    desc: "فريق متكامل لمساعدتك على مدار الساعة في اختيار المقاسات ومتابعة شحنتك خطوة بخطوة حتى باب بيتك.",
    bg: "bg-emerald-50 text-emerald-700"
  }
];

export default function TrustPillars() {
  return (
    <section className="bg-white border-b border-rawaa-border py-8 px-4 sm:px-6 lg:px-8" aria-label="ضمانات الجودة">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-rawaa-soft transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${p.bg}`}>
                  <Icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-sm font-bold text-rawaa-dark mb-1">{p.title}</h3>
                  <p className="text-xs text-rawaa-muted leading-relaxed">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
