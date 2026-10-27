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
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Info,
  Lock
} from 'lucide-react';
import ConfirmModal from '../components/common/ConfirmModal';
import { CHECKLIST_CATEGORIES } from '../data/hospitalBagData';

export default function HospitalBagPage() {
  const { allProducts, addToCart, addToast } = useShop();

  // Active category selection tab
  const [activeTab, setActiveTab] = useState('baby_first');

  // Filter option between all essential and remaining
  const [filterMode, setFilterMode] = useState('all');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

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

  // Smooth scroll to top when switching checklist sections
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

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
      addToast('أحسنتِ! تم تحديد الغرض كجاهز في حقيبتك', 'success');
    }
  };

  // Reset all checked items
  const handleResetChecklist = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    setCheckedItems([]);
    setIsResetConfirmOpen(false);
    addToast('تمت إعادة تعيين القائمة بنجاح', 'info');
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
      addToast(`تمت إضافة "${product.name}" إلى حقيبة التسوق بنجاح`, 'success');
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
          <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-4 py-1.5 rounded-full shadow-soft-xs">
              <Sparkles size={14} className="text-amber-600 animate-pulse" />
              <span>قريباً في بيبي زون (Coming Soon)</span>
            </span>
            <div className="inline-flex items-center gap-1.5 bg-rawaa-primary-light text-rawaa-primary text-xs font-bold px-4 py-1.5 rounded-full shadow-soft-xs">
              <Stethoscope size={14} />
              <span>معتمد ومراجع من أطباء واستشاريي طب الأطفال</span>
            </div>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-rawaa-dark mb-3 tracking-tight">
            دليل وقائمة تجهيز حقيبة المستشفى والمولود
          </h1>
          <p className="text-sm sm:text-base text-rawaa-muted leading-relaxed">
            نعمل حالياً على تجهيز باقات حقيبة الولادة المتكاملة وتوفير كافة المستلزمات الطبية المعتمدة قريباً. استكشفي القائمة النموذجية الآن أو اطلبي تجهيزاً خاصاً عبر الواتساب.
          </p>
        </div>

        {/* Disabled / Coming Soon Section Alert Banner */}
        <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-7 mb-8 flex flex-col md:flex-row items-center justify-between gap-5 shadow-soft-sm text-center md:text-right">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-200 text-amber-950 border border-amber-300 flex items-center justify-center shrink-0 shadow-soft-xs">
              <Lock size={26} className="text-amber-900" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                <span className="font-heading font-black text-base sm:text-lg text-amber-950">
                  قسم حقيبة الولادة معطّل ومغلق حالياً (قيد التجهيز والتطوير)
                </span>
                <span className="bg-amber-300 text-amber-950 text-xs font-black px-3 py-0.5 rounded-full border border-amber-400">
                  Coming Soon · قريباً
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-900/80 mt-1 max-w-2xl leading-relaxed">
                نعمل حالياً على تجهيز باقات الولادة الطبية المتكاملة مع مستلزمات المستشفى وتحديث كافة الأسعار والخيارات. كافة أدوات التفاعل والإضافة للسلة معطلة مؤقتاً لحين التدشين الرسمي.
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/201035401549?text=${encodeURIComponent('مرحباً بيبي زون، أود الاستفسار عن موعد توفر حقيبة الولادة وطلب تجهيز مخصص')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-soft-sm transition-all shrink-0 cursor-pointer"
          >
            <span>طلب تجهيز عبر الواتساب</span>
            <ChevronLeft size={16} />
          </a>
        </div>

        {/* Disabled Checklist Section Container */}
        <div className="relative">
          {/* Top lock badge floating on disabled area */}
          <div className="mb-4 inline-flex items-center gap-2 bg-amber-100 text-amber-950 border border-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black">
            <Lock size={14} className="text-amber-800" />
            <span>عناصر هذا القسم للعرض الاسترشادي فقط · التفاعل معطّل حالياً</span>
          </div>

          <div className="opacity-60 pointer-events-none select-none filter grayscale-[15%] space-y-6">
            {/* Progress meter and action buttons card */}
            <div className="bg-white rounded-2xl shadow-soft-md border border-rawaa-border p-5 sm:p-7">
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
                        ? 'حقيبتك مكتملة 100%، مستعدة تماماً ليومك الكبير!'
                        : completionPercentage > 50
                        ? 'أحسنتِ! أنجزتِ أكثر من نصف القائمة'
                        : 'ابدئي بتجهيز الأغراض الأساسية أولاً'}
                    </span>
                  </div>
                </div>

                {/* Quick action tools */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    disabled
                    className="bg-[#FAF7F2] border border-rawaa-border text-rawaa-muted text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 cursor-not-allowed shadow-soft-xs"
                  >
                    <Printer size={15} />
                    <span>طباعة القائمة</span>
                  </button>

                  <button
                    type="button"
                    disabled
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800/70 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 cursor-not-allowed"
                  >
                    <Share2 size={15} />
                    <span>مشاركة على الواتساب</span>
                  </button>

                  <button
                    type="button"
                    disabled
                    className="bg-rawaa-soft text-rawaa-muted text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 cursor-not-allowed"
                    title="معطل"
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
                        disabled
                        className="bg-rawaa-soft text-rawaa-muted border border-rawaa-border text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-not-allowed opacity-75"
                      >
                        <Lock size={13} />
                        <span>معطّل (قريباً)</span>
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
          </div>
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
                href="https://wa.me/201035401549?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A8%D9%8A%D8%A8%D9%8A%20%D8%B2%D9%88%D9%86%D8%8C%20%D8%A3%D8%AD%D8%AA%D8%A7%D8%AC%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9%20%D9%81%D9%8A%20%D8%AA%D8%AC%D9%87%D9%8A%D8%B2%20%D9%82%D8%A7%D8%A6%D9%85%D8%A9%20%D8%AD%D9%82%D9%8A%D8%A8%D8%A9%20%D8%A7%D9%84%D9%88%D9%84%D8%A7%D8%AF%D8%A9"
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

      {/* Confirmation modal for checklist reset */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="إعادة تعيين القائمة"
        message="هل تودين حقاً إعادة تعيين قائمة حقيبة الولادة والبدء من جديد؟"
        confirmText="نعم، ابدأ من جديد"
        cancelText="إلغاء"
        isDestructive={false}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
