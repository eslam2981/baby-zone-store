import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  X,
  ChevronDown,
  PhoneCall,
  Globe,
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
  User,
  Heart,
  ShoppingBag,
  Baby,
  Truck
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

export default function MobileNav() {
  const {
    isMobileNavOpen,
    setIsMobileNavOpen,
    categories,
    setSelectedSubcategory,
    setIsAuthOpen,
    user,
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen
  } = useShop();

  const [expandedCat, setExpandedCat] = useState(null);
  const navigate = useNavigate();

  const handleSelectCategory = (catId, sub = null) => {
    setSelectedSubcategory(sub);
    setIsMobileNavOpen(false);
    if (sub) {
      navigate(`/category/${catId}?sub=${encodeURIComponent(sub)}`);
    } else {
      navigate(`/category/${catId}`);
    }
  };

  const toggleCategoryExpand = (catId, e) => {
    e.stopPropagation();
    setExpandedCat(expandedCat === catId ? null : catId);
  };

  return (
    <div
      className={`fixed inset-0 bg-rawaa-dark/60 backdrop-blur-sm z-50 flex justify-start transition-opacity duration-300 ease-in-out ${
        isMobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setIsMobileNavOpen(false)}
      aria-hidden={!isMobileNavOpen}
    >
      <div
        className={`w-[88vw] max-w-sm sm:w-96 h-full bg-white flex flex-col shadow-soft-xl transform transition-transform duration-300 ease-in-out ${
          isMobileNavOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drawer header with branding and close action */}
        <div className="flex items-center justify-between p-4 border-b border-rawaa-border bg-rawaa-soft shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-rawaa-primary-light border border-rawaa-primary/30 flex items-center justify-center text-rawaa-primary font-black shadow-soft-xs">
              ر
            </span>
            <div className="flex flex-col leading-tight">
              <strong className="font-heading text-sm font-bold text-rawaa-dark">رَواء الصغير</strong>
              <small className="text-[11px] text-rawaa-muted">قائمة التصفح الشاملة</small>
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full text-rawaa-muted hover:text-rawaa-primary hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>

        {/* User shortcut buttons for account wishlist and cart */}
        <div className="grid grid-cols-3 gap-2 p-3 border-b border-rawaa-border bg-white text-xs shrink-0">
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-rawaa-soft hover:bg-rawaa-primary-light rounded-xl text-rawaa-dark transition-colors cursor-pointer"
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsAuthOpen(true);
            }}
          >
            <User size={18} className="text-rawaa-primary" />
            <span className="text-[11px] font-bold truncate max-w-full">
              {user ? user.name : 'حسابي'}
            </span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-rawaa-soft hover:bg-rawaa-primary-light rounded-xl text-rawaa-dark transition-colors cursor-pointer relative"
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsWishlistOpen(true);
            }}
          >
            <div className="relative">
              <Heart size={18} className="text-rawaa-sage" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-rawaa-sage text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold">المفضلة</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-rawaa-soft hover:bg-rawaa-primary-light rounded-xl text-rawaa-dark transition-colors cursor-pointer relative"
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsCartOpen(true);
            }}
          >
            <div className="relative">
              <ShoppingBag size={18} className="text-rawaa-amber" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-rawaa-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold">السلة</span>
          </button>
        </div>

        {/* Quick direct links to hospital bag and order tracking */}
        <div className="p-3 border-b border-rawaa-border grid grid-cols-2 gap-2 bg-[#FAF7F2] shrink-0">
          <Link
            to="/hospital-bag"
            onClick={() => setIsMobileNavOpen(false)}
            className="flex items-center justify-center gap-2 p-2.5 bg-white rounded-xl border border-rawaa-border hover:border-rawaa-primary text-xs font-bold text-rawaa-dark shadow-soft-xs active:scale-95 transition-all text-center group"
          >
            <span className="w-6 h-6 rounded-lg bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center shrink-0 group-hover:bg-rawaa-primary group-hover:text-white transition-colors">
              <Baby size={14} />
            </span>
            <span className="whitespace-nowrap">حقيبة الولادة</span>
          </Link>
          <Link
            to="/track-order"
            onClick={() => setIsMobileNavOpen(false)}
            className="flex items-center justify-center gap-2 p-2.5 bg-white rounded-xl border border-rawaa-border hover:border-emerald-600 text-xs font-bold text-rawaa-dark shadow-soft-xs active:scale-95 transition-all text-center group"
          >
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Truck size={14} />
            </span>
            <span className="whitespace-nowrap">تتبع طلبيتك</span>
          </Link>
        </div>

        {/* Category accordion menu */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-bold text-rawaa-subtle uppercase tracking-wider">
              أقسام المتجر الـ 17
            </span>
            <span className="text-[10px] text-rawaa-muted font-medium">
              شامل لجميع المستلزمات
            </span>
          </div>

          <ul className="flex flex-col gap-2">
            {categories.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || Grid;
              const isExpanded = expandedCat === cat.id;

              return (
                <li key={cat.id} className="border border-rawaa-border/70 rounded-xl overflow-hidden bg-white shadow-soft-xs">
                  <div className="flex items-stretch hover:bg-rawaa-soft transition-colors">
                    <button
                      type="button"
                      className="flex-1 flex items-center gap-2.5 p-3 text-right text-xs font-semibold text-rawaa-dark min-w-0 cursor-pointer"
                      onClick={() => handleSelectCategory(cat.id)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-rawaa-soft flex items-center justify-center shrink-0 text-rawaa-primary">
                        <IconComp size={16} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col text-right">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-rawaa-dark leading-snug break-words">
                            {cat.name}
                          </span>
                          {cat.badge && (
                            <span className="text-[10px] font-bold text-rawaa-sage bg-rawaa-sage-light px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                              {cat.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <button
                        type="button"
                        className="px-3 flex items-center justify-center text-rawaa-muted hover:text-rawaa-primary hover:bg-rawaa-soft transition-colors shrink-0 cursor-pointer"
                        onClick={(e) => toggleCategoryExpand(cat.id, e)}
                        aria-label="عرض الفئات الفرعية"
                      >
                        <ChevronDown
                          size={17}
                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-rawaa-primary' : ''}`}
                        />
                      </button>
                    )}
                  </div>

                  {isExpanded && cat.subcategories && (
                    <ul className="bg-[#FAF7F2] border-t border-rawaa-border/50 py-2 px-3 flex flex-col gap-1">
                      {cat.subcategories.map((sub, sIdx) => (
                        <li key={sIdx}>
                          <button
                            type="button"
                            className="flex items-center justify-between gap-2 text-xs text-rawaa-muted hover:text-rawaa-primary hover:bg-white p-2 rounded-lg w-full text-right transition-colors cursor-pointer"
                            onClick={() => handleSelectCategory(cat.id, sub)}
                          >
                            <span className="font-medium text-xs break-words">{sub}</span>
                            <ChevronLeft size={13} className="text-rawaa-subtle shrink-0" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Quick settings and customer support details */}
          <div className="mt-6 pt-4 border-t border-rawaa-border flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs py-1 px-1">
              <span className="flex items-center gap-1.5 text-rawaa-muted font-medium">
                <Globe size={15} />
                <span>العملة المعتمدة:</span>
              </span>
              <span className="font-bold text-rawaa-primary bg-rawaa-primary-light px-2.5 py-1 rounded-full text-xs">
                الجنيه المصري (ج.م) 🇪🇬
              </span>
            </div>

            <div className="flex items-center gap-3 bg-rawaa-sage-light p-3.5 rounded-2xl text-xs text-rawaa-sage border border-rawaa-sage/20">
              <PhoneCall size={18} className="shrink-0 text-rawaa-sage" />
              <div className="flex-1">
                <span className="block font-bold text-rawaa-sage">خدمة العملاء والطلب عبر واتساب</span>
                <a href="tel:01211735629" className="font-bold text-sm text-rawaa-sage hover:underline block mt-0.5" dir="ltr">
                  012-1173-5629
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
