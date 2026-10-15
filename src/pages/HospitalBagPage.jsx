// Hospital bag and newborn preparation checklist page with interactive progress tracking
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  CheckSquare,
  Square,
  Sparkles,
  ShoppingBag,
  Printer,
  Share2,
  RotateCcw,
  Heart,
  Baby,
  Bed,
  Car,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Info
} from 'lucide-react';

// Checklist data categorized with medical tips and linked store products
const CHECKLIST_CATEGORIES = [
  {
    id: 'baby_first',
    name: 'حقيبة المولود الأولى (أول 48 ساعة)',
    icon: Baby,
    description: 'المستلزمات الحيوية للطفل فور الولادة وأثناء التواجد في المستشفى',
    items: [
      {
        id: 'b1',
        title: 'طقمين سالوبيت داخلي قطن عضوي 100% طبيعي',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'احرصي على خامات قطنية معتمدة من Oeko-Tex لعدم تهيج بشرة حديثي الولادة الحساسة',
        productId: 'p3',
        productName: 'طقم سالوبيت مواليد قطن عضوي 100% طبيعي'
      },
      {
        id: 'b2',
        title: 'ببرونة زجاجية طبية مع حلمة تحاكي الرضاعة الطبيعية',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'ضرورية للرضعات الأولى في حال تأخر تدفق حليب الأم بعد الولادة القيصرية',
        productId: 'p5',
        productName: 'مجموعة رضّاعات زجاجية طبية كوموتومو'
      },
      {
        id: 'b3',
        title: 'بطانية استقبال ناعمة ومسامية للتقميط الهادئ',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'التقميط يحاكي بيئة رحم الأم ويمنع فزع المولود أثناء النوم في الساعات الأولى',
        productId: null
      },
      {
        id: 'b4',
        title: 'حفاضات مقاس حديثي الولادة (Newborn) بفتحة الحبل السري',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'اختاري حفاضات تحتوي على انحناء خاص لحماية منطقة السرة من الاحتكاك',
        productId: null
      },
      {
        id: 'b5',
        title: 'قفازات قطنية ناعمة وجوارب دافئة وقبعة قطن',
        importance: 'recommended',
        importanceLabel: 'موصى به طبياً',
        tip: 'تنظيم حرارة الرضيع يبدأ من تدفئة الرأس والأطراف لحمايته من تيارات التكييف',
        productId: null
      },
      {
        id: 'b6',
        title: 'مناديل مبللة بالماء النقي 99.9% بدون كحول أو عطور',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'تجنبي أي مناديل معطرة لحماية طبقة الجلد الأولى الرقيقة من التحسس',
        productId: null
      }
    ]
  },
  {
    id: 'mom_hospital',
    name: 'حقيبة الأم للولادة والإقامة بالمستشفى',
    icon: Heart,
    description: 'كل ما تحتاجه الأم للشعور بالراحة والرعاية بعد رحلة الولادة المباركة',
    items: [
      {
        id: 'm1',
        title: 'مضخة ثدي كهربائية طبية ذكية وهادئة',
        importance: 'recommended',
        importanceLabel: 'موصى به طبياً',
        tip: 'تحفيز إدرار الحليب مبكراً يقي الأم من تحجر الثدي ويشجع الرضاعة الطبيعية',
        productId: 'p7',
        productName: 'مضخة ثدي كهربائية مزدوجة ذكية ميديلا'
      },
      {
        id: 'm2',
        title: 'ثوبين نوم فضفاضين بفتحة أمامية مريحة للرضاعة',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'اختاري قماش قطني ناعم لتسهيل التلامس الجسدي المباشر مع طفلك بعد الولادة',
        productId: null
      },
      {
        id: 'm3',
        title: 'حمالات صدر قطنية مخصصة للرضاعة الطبيعية مع وسادات',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'الوسادات القطنية تمتص أي تسرب مبكر للحليب وتحافظ على نظافة وجفاف الثدي',
        productId: null
      },
      {
        id: 'm4',
        title: 'فوط صحية عالية الامتصاص مخصصة لفترة النفاس',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'تكون أكبر حجماً وأكثر نعومة لحماية منطقة الجرح أثناء المشي والحركة',
        productId: null
      },
      {
        id: 'm5',
        title: 'ملف الأوراق الرسمية وتقارير متابعة الحمل وتحاليل المستشفى',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'احتفظي ببطاقة الهوية والتحاليل في جيب منفصل وسهل الوصول لمرافقي الولادة',
        productId: null
      },
      {
        id: 'm6',
        title: 'حقيبة العناية الشخصية ومرطب شفاه وزيت التدليك الطبيعي',
        importance: 'optional',
        importanceLabel: 'راحة إضافية',
        tip: 'جفاف الشفاه شائع جداً بسبب التنفس العميق أثناء المخاض وتكييف غرف العمليات',
        productId: null
      }
    ]
  },
  {
    id: 'travel_safety',
    name: 'الخروج الآمن والتنقل بالسيارة',
    icon: Car,
    description: 'تجهيزات الخروج من المستشفى والانتقال الآمن إلى المنزل',
    items: [
      {
        id: 't1',
        title: 'مقعد سيارة مخصص لحديثي الولادة بمعيار الأمان الأوروبي i-Size',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي قانونياً',
        tip: 'لا يُسمح طبياً بنقل المولود بالسيارة في حضن الأم لخطورة الصدمات الفجائية',
        productId: 'p2',
        productName: 'مقعد سيارة سايبكس سيلونا دوار 360 درجة'
      },
      {
        id: 't2',
        title: 'عربة أطفال خفيفة الوزن سهلة الطي بيد واحدة مع مهد مسطح',
        importance: 'recommended',
        importanceLabel: 'موصى به طبياً',
        tip: 'المهد المسطح بزاوية 180 درجة ضروري لفتح مجرى تنفس الرضيع وتطوير العمود الفقري',
        productId: 'p1',
        productName: 'عربة أطفال ستوك يويو³ خفيفة الوزن'
      },
      {
        id: 't3',
        title: 'حقيبة تنظيم حفاضات وتنقل واسعة وعازلة للحرارة',
        importance: 'recommended',
        importanceLabel: 'موصى به طبياً',
        tip: 'تحتوي على جيوب معزولة تحفظ درجة حرارة رضعات الحليب وبساط غيار معقم',
        productId: 'p10',
        productName: 'حقيبة حفاضات وتنقل للأمهات مقاومة للماء'
      }
    ]
  },
  {
    id: 'nursery_home',
    name: 'استقبال المولود في المنزل وغرفة النوم',
    icon: Bed,
    description: 'تجهيزات النوم الهادئ والرعاية الصحية في الأسابيع الأولى',
    items: [
      {
        id: 'n1',
        title: 'سرير مواليد جانبي ملحق لسرير الأم متعدد الارتفاعات',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'يوفر نوماً آمناً للمولود بمفرده مع سهولة إرضاعه ليلاً دون مغادرة سريرك',
        productId: 'p4',
        productName: 'سرير مواليد جانبي ملحق لسرير الأم'
      },
      {
        id: 'n2',
        title: 'جهاز مراقبة الأطفال الذكي بالفيديو وكاميرا الرؤية الليلية',
        importance: 'recommended',
        importanceLabel: 'موصى به طبياً',
        tip: 'حساسات الحرارة والصوت تمنحكِ راحة البال ومتابعة تنفس الطفل أثناء النوم',
        productId: 'p9',
        productName: 'جهاز مراقبة الأطفال بالفيديو مع كاميرا ليلية'
      },
      {
        id: 'n3',
        title: 'مقياس حرارة رقمي سريع ودقيق بالأشعة تحت الحمراء',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'قياس الحرارة الدقيق بدون إيقاظ الرضيع من أهم أدوات الإسعافات المنزلية',
        productId: null
      },
      {
        id: 'n4',
        title: 'كرسي تغذية مريح للأطفال للمراحل اللاحقة',
        importance: 'optional',
        importanceLabel: 'تجهيز مستقبلي',
        tip: 'يدعم الجلوس المستقيم وتناول الأطعمة الأولى بأمان عند بلوغ 4 إلى 6 أشهر',
        productId: 'p8',
        productName: 'كرسي إطعام للأطفال ستوك تريب تراب'
      }
    ]
  }
];

export default function HospitalBagPage() {
  const { allProducts, addToCart, addToast } = useShop();

  // Active category selection tab
  const [activeTab, setActiveTab] = useState('baby_first');

  // Filter option between all essential and remaining
  const [filterMode, setFilterMode] = useState('all');

  // Local storage persisted set of checked item IDs
  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      const saved = localStorage.getItem('rawaa_hospital_bag_checks');
      return saved ? JSON.parse(saved) : ['b1', 'b2', 'm1'];
    } catch {
      return ['b1', 'b2', 'm1'];
    }
  });

  // Save checklist selections on change
  useEffect(() => {
    try {
      localStorage.setItem('rawaa_hospital_bag_checks', JSON.stringify(checkedItems));
    } catch (e) {
      console.error(e);
    }
  }, [checkedItems]);

  // Calculate totals and checklist completion metrics
  const allItems = CHECKLIST_CATEGORIES.flatMap((c) => c.items);
  const totalCount = allItems.length;
  const completedCount = allItems.filter((i) => checkedItems.includes(i.id)).length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  // Toggle individual item checkbox
  const handleToggleItem = (itemId) => {
    if (checkedItems.includes(itemId)) {
      setCheckedItems((prev) => prev.filter((id) => id !== itemId));
    } else {
      setCheckedItems((prev) => [...prev, itemId]);
      addToast('أحسنتِ! تم تحديد الغرض كجاهز في حقيبتك 💖', 'success');
    }
  };

  // Reset all checked items
  const handleResetChecklist = () => {
    if (window.confirm('هل تودين حقاً إعادة تعيين القائمة والبدء من جديد؟')) {
      setCheckedItems([]);
      addToast('تمت إعادة تعيين القائمة بنجاح', 'info');
    }
  };

  // Trigger browser print window for printable checklist
  const handlePrint = () => {
    window.print();
  };

  // Add matching store product to cart directly
  const handleAddToCart = (productId) => {
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : null;
      addToCart(product, 1, defaultColor);
      addToast(`تمت إضافة "${product.name}" إلى حقيبة التسوق بنجاح 🛍️`, 'success');
    }
  };

  const currentCategory = CHECKLIST_CATEGORIES.find((c) => c.id === activeTab) || CHECKLIST_CATEGORIES[0];

  // Filter items in active category by user mode
  const filteredItems = currentCategory.items.filter((item) => {
    const isChecked = checkedItems.includes(item.id);
    if (filterMode === 'essential') return item.importance === 'essential';
    if (filterMode === 'completed') return isChecked;
    if (filterMode === 'remaining') return !isChecked;
    return true;
  });

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 sm:py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb links */}
        <div className="flex items-center gap-2 text-xs text-rawaa-muted mb-6">
          <Link to="/" className="hover:text-rawaa-primary transition-colors">الرئيسية</Link>
          <ChevronLeft size={14} />
          <span className="text-rawaa-dark font-medium">دليل وحاسبة حقيبة الولادة الذكية</span>
        </div>

        {/* Hero title banner */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-rawaa-primary-light text-rawaa-primary text-xs font-bold px-4 py-1.5 rounded-full mb-3 shadow-soft-xs">
            <Stethoscope size={14} />
            <span>معتمد ومراجع من أطباء واستشاريي طب الأطفال وحديثي الولادة</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-rawaa-dark mb-3 tracking-tight">
            دليل وقائمة تجهيز حقيبة المستشفى والمولود
          </h1>
          <p className="text-sm sm:text-base text-rawaa-muted leading-relaxed">
            خططي ليوم ولادتكِ باطمئنان وسعادة تامة، دون قلق من نسيان أي غرض أساسي لطفلكِ ولكِ مع إمكانية إضافة النواقص لسلتك بلمسة واحدة.
          </p>
        </div>

        {/* Progress meter and action buttons card */}
        <div className="bg-white rounded-2xl shadow-soft-md border border-rawaa-border p-5 sm:p-7 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Progress calculation */}
            <div className="w-full md:max-w-md">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-rawaa-dark flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>نسبة جاهزية حقيبتكِ:</span>
                </span>
                <span className="text-rawaa-primary font-mono text-sm">{completionPercentage}% مكتمل</span>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-3 bg-rawaa-soft rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-l from-emerald-500 to-rawaa-primary rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-rawaa-muted mt-2">
                <span>تم إنجاز {completedCount} من أصل {totalCount} غرض</span>
                <span>
                  {completionPercentage === 100
                    ? '🎉 حقيبتك مكتملة 100%، مستعدة تماماً ليومك الكبير!'
                    : completionPercentage > 50
                    ? '👏 أحسنتِ! أنجزتِ أكثر من نصف القائمة'
                    : '🌸 ابدئي بتجهيز الأغراض الأساسية أولاً'}
                </span>
              </div>
            </div>

            {/* Quick action tools */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-[#FAF7F2] hover:bg-white border border-rawaa-border hover:border-rawaa-primary text-rawaa-dark text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-soft-xs"
              >
                <Printer size={15} />
                <span>طباعة القائمة</span>
              </button>

              <a
                href={`https://wa.me/201211735629?text=${encodeURIComponent(`مرحباً بيبي زون، لقد جهزت ${completionPercentage}% من حقيبة الولادة وأود الاستفسار عن توفير باقي المنتجات`)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <Share2 size={15} />
                <span>مشاركة على الواتساب</span>
              </a>

              <button
                type="button"
                onClick={handleResetChecklist}
                className="bg-rawaa-soft hover:bg-rose-50 text-rawaa-muted hover:text-rose-600 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                title="إعادة تعيين القائمة"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Category tabs navigation */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2">
          {CHECKLIST_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const catItemCount = cat.items.length;
            const catDoneCount = cat.items.filter((i) => checkedItems.includes(i.id)).length;
            const isActive = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-rawaa-primary text-white border-rawaa-primary shadow-soft-md scale-[1.02]'
                    : 'bg-white text-rawaa-dark hover:bg-rawaa-soft border-rawaa-border'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-rawaa-primary'} />
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-rawaa-soft text-rawaa-muted'
                  }`}
                >
                  {catDoneCount}/{catItemCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter modes bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-3.5 rounded-xl border border-rawaa-border">
          <div className="flex items-center gap-1.5 text-xs text-rawaa-muted font-medium">
            <span>تصفية العناصر:</span>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterMode === 'all' ? 'bg-rawaa-dark text-white' : 'hover:bg-rawaa-soft text-rawaa-muted'
              }`}
            >
              الكل ({currentCategory.items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('essential')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterMode === 'essential' ? 'bg-rose-600 text-white' : 'hover:bg-rawaa-soft text-rawaa-muted'
              }`}
            >
              الأساسي فقط
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('remaining')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterMode === 'remaining' ? 'bg-amber-600 text-white' : 'hover:bg-rawaa-soft text-rawaa-muted'
              }`}
            >
              المتبقي للتحضير
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('completed')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterMode === 'completed' ? 'bg-emerald-600 text-white' : 'hover:bg-rawaa-soft text-rawaa-muted'
              }`}
            >
              المكتمل
            </button>
          </div>

          <p className="text-xs text-rawaa-muted hidden sm:block">
            {currentCategory.description}
          </p>
        </div>

        {/* Checklist items interactive list */}
        <div className="space-y-3.5 mb-12">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-rawaa-border p-10 text-center">
              <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-2" />
              <h3 className="font-heading text-sm font-bold text-rawaa-dark">لا توجد عناصر متبقية في هذا القسم!</h3>
              <p className="text-xs text-rawaa-muted mt-1">لقد قمتِ بإتمام جميع الأغراض المطلوبة هنا بنجاح.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isChecked = checkedItems.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isChecked
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-rawaa-border hover:border-rawaa-primary/50 shadow-soft-xs'
                  }`}
                >
                  {/* Item checkbox and title */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.id)}
                      className="mt-0.5 text-rawaa-primary hover:scale-110 transition-transform cursor-pointer shrink-0"
                      aria-label="تحديد هذا الغرض"
                    >
                      {isChecked ? (
                        <CheckSquare size={22} className="text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Square size={22} className="text-rawaa-subtle" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-heading text-sm sm:text-base font-bold transition-all ${
                            isChecked ? 'line-through text-rawaa-muted opacity-70' : 'text-rawaa-dark'
                          }`}
                        >
                          {item.title}
                        </span>

                        {/* Importance badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.importance === 'essential'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : item.importance === 'recommended'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rawaa-soft text-rawaa-muted border border-rawaa-border'
                          }`}
                        >
                          {item.importanceLabel}
                        </span>
                      </div>

                      {/* Pediatrician tip */}
                      <div className="flex items-start gap-1.5 text-xs text-rawaa-muted leading-relaxed">
                        <Info size={14} className="text-rawaa-primary shrink-0 mt-0.5" />
                        <span>{item.tip}</span>
                      </div>
                    </div>
                  </div>

                  {/* Store product match and purchase action */}
                  {item.productId ? (
                    <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-rawaa-border/60 shrink-0">
                      <Link
                        to={`/product/${item.productId}`}
                        className="text-xs text-rawaa-primary hover:underline font-semibold"
                      >
                        معاينة الموديل
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item.productId)}
                        className="bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-soft-xs cursor-pointer"
                      >
                        <ShoppingBag size={14} />
                        <span>أضيفي للسلة</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-rawaa-subtle pt-2 md:pt-0 border-t md:border-t-0 border-rawaa-border/60">
                      مستلزم شخصي أو طبي
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quality and care banner bottom */}
        <div className="bg-gradient-to-r from-[#222C27] to-rawaa-dark text-white rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="inline-block bg-white/10 text-amber-200 text-xs font-bold px-3.5 py-1 rounded-full">
              فريق بيبي زون الطبي معكِ خطوة بخطوة
            </span>
            <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-white">
              هل أنتِ محتارة في اختيار المقاسات أو نوع المستلزمات؟
            </h2>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              استشاريونا جاهزون لمساعدتكِ في مراجعة قائمتك عبر الواتساب وتجهيز بكج مخصص يناسب موعد ولادتكِ وفصول السنة.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/201211735629?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%B1%D9%8E%D9%88%D8%A7%D8%A1%D8%8C%20%D8%A3%D8%AD%D8%AA%D8%A7%D8%AC%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9%20%D9%81%D9%8A%20%D8%AA%D8%AC%D9%87%D9%8A%D8%B2%20%D9%82%D8%A7%D8%A6%D9%85%D8%A9%20%D8%AD%D9%82%D9%8A%D8%A8%D8%A9%20%D8%A7%D9%84%D9%88%D9%84%D8%A7%D8%AF%D8%A9"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-soft-md transition-all cursor-pointer"
              >
                <span>تحدثي مع أخصائية رعاية الأمهات عبر واتساب</span>
                <ChevronLeft size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
