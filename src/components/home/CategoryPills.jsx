import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  Grid,
  HeartPulse,
  Package,
  Soup,
  Milk,
  Shirt,
  Moon,
  Compass,
  ShieldCheck,
  Footprints,
  Sparkles,
  Droplets,
  Home,
  Camera,
  Flower2,
  Gift,
  Flame,
  Infinity as InfinityIcon
} from 'lucide-react';

const ICON_MAP = {
  Grid,
  HeartPulse,
  Package,
  Soup,
  Milk,
  Shirt,
  Moon,
  Compass,
  ShieldCheck,
  Footprints,
  Sparkles,
  Droplets,
  Home,
  Camera,
  Flower2,
  Gift,
  Flame
};

export default function CategoryPills() {
  const { categories, selectedCategory, setSelectedCategory, setSelectedSubcategory } = useShop();
  const [isPressed, setIsPressed] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(null);
    navigate(`/category/${catId}`);
  };

  const renderCategoryPill = (cat, keySuffix = '') => {
    const Icon = ICON_MAP[cat.icon] || Grid;
    const isActive = selectedCategory === cat.id;

    return (
      <button
        key={`${cat.id}-${keySuffix}`}
        type="button"
        className={`group/pill inline-flex items-center gap-2.5 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-xl border transition-all duration-200 cursor-pointer shrink-0 select-none ${
          isActive
            ? 'bg-rawaa-primary text-white border-rawaa-primary shadow-soft-sm scale-[1.02]'
            : 'bg-white hover:bg-[#FAF7F2] text-rawaa-dark border-rawaa-border hover:border-rawaa-primary/50 shadow-soft-xs hover:shadow-soft-sm hover:-translate-y-0.5'
        }`}
        onClick={() => handleSelect(cat.id)}
        dir="rtl"
        aria-label={`تصفح قسم ${cat.name}`}
      >
        {/* Category icon container */}
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
            isActive
              ? 'bg-white/20 text-white'
              : 'bg-rawaa-soft text-rawaa-primary group-hover/pill:bg-rawaa-primary group-hover/pill:text-white'
          }`}
        >
          <Icon size={16} />
        </div>

        {/* Category name */}
        <span
          className={`font-heading font-bold text-xs sm:text-sm whitespace-nowrap transition-colors ${
            isActive ? 'text-white' : 'text-rawaa-dark group-hover/pill:text-rawaa-primary'
          }`}
        >
          {cat.name}
        </span>

        {/* Optional category badge */}
        {cat.badge && (
          <span
            className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md shrink-0 border whitespace-nowrap ${
              isActive
                ? 'bg-white/20 text-white border-white/30'
                : 'bg-rawaa-primary-light text-rawaa-primary border-rawaa-primary/20'
            }`}
          >
            {cat.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <section className="bg-white py-6 sm:py-10 border-b border-rawaa-border overflow-hidden relative" aria-label="أقسام المتجر الشاملة">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12">
        {/* Section header with title and badges */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex flex-col text-right">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rawaa-primary tracking-wider mb-1">
              <Sparkles size={14} className="text-rawaa-amber" />
              <span>تصفحي حسب الاحتياج</span>
            </div>
            <h2 className="font-heading text-lg sm:text-2xl md:text-3xl font-extrabold text-rawaa-dark">
              أقسام المتجر الشاملة
            </h2>
            <p className="text-xs sm:text-sm text-rawaa-muted mt-0.5">
              17 قسماً متخصصاً تلبي كافة متطلبات رحلة الأمومة ونمو طفلك بأعلى المعايير
            </p>
          </div>

          {/* Category count and motion badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-rawaa-soft text-rawaa-dark border border-rawaa-border shadow-soft-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>17 قسماً معتمداً</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-rawaa-primary-light text-rawaa-primary border border-rawaa-primary/20 shadow-soft-xs">
              <InfinityIcon size={14} className="animate-pulse" />
              <span>حركة إنفينتي</span>
            </span>
          </div>
        </div>

        {/* Infinite marquee carousel container */}
        <div className="relative w-full rounded-2xl bg-[#FAF7F2]/70 border border-rawaa-border/70 p-2 sm:p-2.5 overflow-hidden">
          {/* Right fade gradient mask */}
          <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-10 sm:w-16 md:w-20 bg-gradient-to-l from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent z-10 pointer-events-none rounded-r-2xl" />

          {/* Left fade gradient mask */}
          <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-10 sm:w-16 md:w-20 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent z-10 pointer-events-none rounded-l-2xl" />

          {/* Continuous marquee track with pause on interaction and mobile scrollbar */}
          <div
            className={`marquee-group mobile-category-scroll flex relative w-full select-none py-1 ${
              isPressed ? 'marquee-paused' : ''
            }`}
            dir="ltr"
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            onTouchCancel={() => setIsPressed(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
          >
            {/* Primary category track */}
            <div className="flex shrink-0 items-center gap-3 pr-3 animate-marquee-seamless">
              {categories.map((cat) => renderCategoryPill(cat, 't1'))}
            </div>

            {/* Second cloned track */}
            <div className="flex shrink-0 items-center gap-3 pr-3 animate-marquee-seamless" aria-hidden="true">
              {categories.map((cat) => renderCategoryPill(cat, 't2'))}
            </div>

            {/* Third cloned track */}
            <div className="flex shrink-0 items-center gap-3 pr-3 animate-marquee-seamless" aria-hidden="true">
              {categories.map((cat) => renderCategoryPill(cat, 't3'))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
