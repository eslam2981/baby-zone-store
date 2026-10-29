import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  Bed,
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
  ArrowLeft,
  X,
  Baby,
  Truck,
  Zap
} from 'lucide-react';

const ICON_MAP = {
  Bed,
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

export default function MegaMenu({ isOpen, onClose }) {
  const { categories, setSelectedSubcategory } = useShop();
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSmoothClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isVisible) {
        handleSmoothClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleSmoothClose]);

  if (!isRendered) return null;

  const handleCategoryClick = (categoryId, subcategoryName = null) => {
    setSelectedSubcategory(subcategoryName);
    handleSmoothClose();
    if (subcategoryName) {
      navigate(`/category/${categoryId}?sub=${encodeURIComponent(subcategoryName)}`);
    } else {
      navigate(`/category/${categoryId}`);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-rawaa-dark/55 backdrop-blur-sm z-50 flex justify-center p-3 sm:p-6 overflow-y-auto transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleSmoothClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-panel max-w-screen-2xl w-full my-auto shadow-soft-xl border border-rawaa-border overflow-hidden transition-all duration-300 ease-out transform ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mega menu header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-rawaa-border bg-rawaa-soft">
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-rawaa-dark">
              جميع أقسام ومستلزمات متجر بيبي زون
            </h3>
            <p className="text-xs text-rawaa-muted mt-0.5">
              {categories.length === 1
                ? 'قسم رئيسي مدروس بعناية لمرافقة كل خطوة في رحلة نمو طفلك'
                : categories.length === 2
                ? 'قسمان رئيسيان مدروسان بعناية لمرافقة كل خطوة في رحلة نمو طفلك'
                : categories.length >= 3 && categories.length <= 10
                ? `${categories.length} أقسام رئيسية مدروسة بعناية لمرافقة كل خطوة في رحلة نمو طفلك`
                : `${categories.length} قسماً رئيسياً مدروساً بعناية لمرافقة كل خطوة في رحلة نمو طفلك`}
            </p>
          </div>
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-white border border-rawaa-border text-rawaa-muted hover:text-rawaa-primary hover:bg-rawaa-primary-light flex items-center justify-center transition-colors cursor-pointer"
            onClick={handleSmoothClose}
            aria-label="إغلاق قائمة الأقسام"
          >
            <X size={20} />
          </button>
        </div>

        {/* Featured smart tools banner in mega menu */}
        <div className="bg-[#FAF7F2] border-b border-rawaa-border px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-rawaa-dark">أدوات ذكية للأم والمولود:</span>
            <button
              type="button"
              onClick={() => {
                handleSmoothClose();
                navigate('/hospital-bag');
              }}
              className="bg-white hover:bg-rawaa-primary hover:text-white border border-rawaa-border px-3 py-1 rounded-full font-bold text-rawaa-primary transition-colors cursor-pointer flex items-center gap-1.5 shadow-soft-xs"
            >
              <Baby size={14} className="shrink-0" />
              <span>دليل تجهيز حقيبة الولادة</span>
              <span className="bg-amber-200 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-bold">قريباً</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleSmoothClose();
                navigate('/track-order');
              }}
              className="bg-white hover:bg-emerald-600 hover:text-white border border-rawaa-border px-3 py-1 rounded-full font-bold text-emerald-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-soft-xs"
            >
              <Truck size={14} className="shrink-0" />
              <span>تتبع شحنتك المباشر</span>
            </button>
          </div>
          <span className="text-rawaa-muted hidden md:inline">خدمة التوصيل السريع لجميع محافظات مصر</span>
        </div>

        {/* Categories grid container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 max-h-[62vh] overflow-y-auto">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Grid;

            return (
              <div
                key={cat.id}
                className="bg-rawaa-bg hover:bg-rawaa-primary-light/50 border border-rawaa-border hover:border-rawaa-primary/50 rounded-card p-4 flex flex-col transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-soft-sm"
              >
                {/* Category title and icon button */}
                <button
                  type="button"
                  className="w-full flex items-center gap-3 text-right cursor-pointer"
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  <span className="w-9 h-9 rounded-lg bg-white group-hover:bg-rawaa-primary group-hover:text-white text-rawaa-primary flex items-center justify-center shrink-0 border border-rawaa-border transition-colors">
                    <IconComponent size={19} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="font-heading text-sm font-bold text-rawaa-dark group-hover:text-rawaa-primary transition-colors block truncate">
                      {cat.name}
                    </span>
                    {cat.badge && (
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                          cat.isComingSoon
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {cat.badge}
                      </span>
                    )}
                  </div>
                </button>

                <p className="text-[11.5px] text-rawaa-muted my-2.5 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                {/* Subcategories list */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <ul className="flex flex-col gap-1.5 mt-auto pt-2.5 border-t border-dashed border-rawaa-border">
                    {cat.subcategories.slice(0, 3).map((sub, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-[11.5px] text-rawaa-muted hover:text-rawaa-primary text-right w-full transition-colors cursor-pointer"
                          onClick={() => handleCategoryClick(cat.id, sub)}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rawaa-primary shrink-0" />
                          <span className="truncate">{sub}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* View full category button */}
                <button
                  type="button"
                  className="flex items-center justify-between mt-3 pt-2 text-xs font-bold text-rawaa-primary group-hover:underline cursor-pointer"
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  <span>عرض القسم بالكامل</span>
                  <ArrowLeft size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {/* WhatsApp ordering banner strip */}
        <div className="bg-gradient-to-r from-rawaa-sage to-emerald-900 text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-amber-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              <Zap size={13} className="text-amber-300" />
              <span>خدمة عملاء وطلب سريع</span>
            </span>
            <h4 className="font-heading text-base font-bold text-white mt-1">
              محتاجة مساعدة في اختيار المنتج أو حابة تطلبي عبر واتساب مباشرة؟
            </h4>
            <p className="text-xs text-white/85">
              فريق خدمة العملاء متاح للرد على كافة استفساراتك وتأكيد طلبك وتوصيله لباب منزلك
            </p>
          </div>
          <button
            type="button"
            className="bg-white hover:bg-amber-100 text-rawaa-sage font-bold text-xs px-5 py-2.5 rounded-full shrink-0 shadow-soft-sm transition-transform hover:-translate-y-0.5 cursor-pointer"
            onClick={() => {
              handleSmoothClose();
              window.open(
                `https://wa.me/201035401549?text=${encodeURIComponent('السلام عليكم، محتاجة مساعدة بخصوص منتجات متجر بيبي زون (Baby Zone)')}`,
                '_blank'
              );
            }}
          >
            تحدثي مع خدمة العملاء عبر واتساب
          </button>
        </div>
      </div>
    </div>
  );
}
