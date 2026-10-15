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
  ShoppingBag
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
        className={`w-80 max-w-[85vw] h-full bg-white flex flex-col shadow-soft-xl transform transition-transform duration-300 ease-in-out ${
          isMobileNavOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drawer header with branding and close action */}
        <div className="flex items-center justify-between p-4 border-b border-rawaa-border bg-rawaa-soft">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-rawaa-primary-light border border-rawaa-primary/30 flex items-center justify-center text-rawaa-primary font-black">
              ر
            </span>
            <div className="flex flex-col leading-tight">
              <strong className="font-heading text-sm text-rawaa-dark">رَواء الصغير</strong>
              <small className="text-[10px] text-rawaa-muted">قائمة التصفح الشاملة</small>
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full text-rawaa-muted hover:text-rawaa-primary flex items-center justify-center"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>

        {/* User shortcut buttons for account wishlist and cart */}
        <div className="grid grid-cols-3 gap-1.5 p-2.5 border-b border-rawaa-border bg-white text-xs">
          <button
            type="button"
            className="flex flex-col items-center gap-1 p-2 bg-rawaa-soft hover:bg-rawaa-primary-light rounded-lg text-rawaa-dark transition-colors"
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsAuthOpen(true);
            }}
          >
            <User size={16} className="text-rawaa-primary" />
            <span className="text-[11px] font-medium truncate w-full text-center">
              {user ? user.name : 'حسابي'}
            </span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-1 p-2 bg-rawaa-soft hover:bg-rawaa-primary-light rounded-lg text-rawaa-dark transition-colors"
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsWishlistOpen(true);
            }}
          >
            <Heart size={16} className="text-rawaa-sage" />
            <span className="text-[11px] font-medium">المفضلة ({wishlist.length})</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-1 p-2 bg-rawaa-soft hover:bg-rawaa-primary-light rounded-lg text-rawaa-dark transition-colors"
            onClick={() => {
              setIsMobileNavOpen(false);
              setIsCartOpen(true);
            }}
          >
            <ShoppingBag size={16} className="text-rawaa-amber" />
            <span className="text-[11px] font-medium">السلة ({cartCount})</span>
          </button>
        </div>

        {/* Quick direct links to hospital bag and order tracking */}
        <div className="p-2.5 border-b border-rawaa-border grid grid-cols-2 gap-2 bg-[#FAF7F2]">
          <Link
            to="/hospital-bag"
            onClick={() => setIsMobileNavOpen(false)}
            className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-rawaa-border hover:border-rawaa-primary text-xs font-bold text-rawaa-dark shadow-soft-xs"
          >
            <span className="text-sm">🛍️</span>
            <span>حقيبة الولادة</span>
          </Link>
          <Link
            to="/track-order"
            onClick={() => setIsMobileNavOpen(false)}
            className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-rawaa-border hover:border-rawaa-primary text-xs font-bold text-rawaa-dark shadow-soft-xs"
          >
            <span className="text-sm">🚚</span>
            <span>تتبع طلبيتك</span>
          </Link>
        </div>

        {/* Category accordion menu */}
        <div className="flex-1 overflow-y-auto p-4">
          <span className="text-[11px] font-bold text-rawaa-subtle uppercase tracking-wider block mb-3">
            أقسام المتجر الـ 17
          </span>

          <ul className="flex flex-col gap-1.5">
            {categories.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || Grid;
              const isExpanded = expandedCat === cat.id;

              return (
                <li key={cat.id} className="border border-rawaa-border/60 rounded-xl overflow-hidden">
                  <div className="flex items-center bg-white hover:bg-rawaa-soft transition-colors">
                    <button
                      type="button"
                      className="flex-1 flex items-center gap-2.5 p-3 text-right text-xs font-semibold text-rawaa-dark"
                      onClick={() => handleSelectCategory(cat.id)}
                    >
                      <IconComp size={16} className="text-rawaa-primary shrink-0" />
                      <span className="truncate">{cat.name}</span>
                      {cat.badge && (
                        <span className="text-[10px] font-bold text-rawaa-sage bg-rawaa-sage-light px-1.5 py-0.5 rounded-full mr-auto">
                          {cat.badge}
                        </span>
                      )}
                    </button>

                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <button
                        type="button"
                        className="p-3 text-rawaa-muted hover:text-rawaa-dark"
                        onClick={(e) => toggleCategoryExpand(cat.id, e)}
                        aria-label="عرض الفئات الفرعية"
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-rawaa-primary' : ''}`}
                        />
                      </button>
                    )}
                  </div>

                  {isExpanded && cat.subcategories && (
                    <ul className="bg-rawaa-bg/80 border-t border-rawaa-border/50 py-2 px-6 flex flex-col gap-2 animate-in fade-in duration-150">
                      {cat.subcategories.map((sub, sIdx) => (
                        <li key={sIdx}>
                          <button
                            type="button"
                            className="flex items-center gap-2 text-xs text-rawaa-muted hover:text-rawaa-primary w-full text-right"
                            onClick={() => handleSelectCategory(cat.id, sub)}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rawaa-primary shrink-0" />
                            <span>{sub}</span>
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
            <div className="flex items-center justify-between text-xs py-1">
              <span className="flex items-center gap-1.5 text-rawaa-muted">
                <Globe size={14} />
                <span>العملة المعتمدة:</span>
              </span>
              <span className="font-bold text-rawaa-primary bg-rawaa-primary-light px-2.5 py-0.5 rounded-full text-xs">
                الجنيه المصري (ج.م) 🇪🇬
              </span>
            </div>

            <div className="flex items-center gap-2.5 bg-rawaa-sage-light p-3 rounded-xl text-xs text-rawaa-sage">
              <PhoneCall size={16} className="shrink-0" />
              <div>
                <strong className="block font-bold">خدمة العملاء والطلب عبر واتساب</strong>
                <a href="tel:01211735629" className="underline mt-0.5 block font-bold">
                  012-1173-5629 (مصر)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
