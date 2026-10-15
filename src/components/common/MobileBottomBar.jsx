
import { Link, useLocation } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Home, Layers, Search, Heart, ShoppingBag } from 'lucide-react';

export default function MobileBottomBar() {
  const { cartCount, wishlist, setIsCartOpen, setIsWishlistOpen, setIsMobileNavOpen } = useShop();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 pb-[env(safe-area-inset-bottom,0px)] bg-white/95 backdrop-blur-md border-t border-rawaa-border shadow-soft-lg z-40 grid grid-cols-5 items-center px-1"
      aria-label="شريط التنقل السريع للهواتف"
    >
      {/* Navigation button for home screen */}
      <Link
        to="/"
        className={`flex flex-col items-center justify-center gap-1 h-full text-xs font-medium ${
          isHome ? 'text-rawaa-primary font-bold' : 'text-rawaa-muted hover:text-rawaa-primary'
        }`}
        aria-label="الصفحة الرئيسية"
      >
        <Home size={19} />
        <span className="text-[10px]">الرئيسية</span>
      </Link>

      {/* Toggle button for category navigation */}
      <button
        type="button"
        className="flex flex-col items-center justify-center gap-1 h-full text-xs font-medium text-rawaa-muted hover:text-rawaa-primary cursor-pointer"
        onClick={() => setIsMobileNavOpen(true)}
        aria-label="تصفح الأقسام"
      >
        <Layers size={19} />
        <span className="text-[10px]">الأقسام</span>
      </button>

      {/* Central catalog navigation button */}
      <Link
        to="/category/all"
        className="flex flex-col items-center justify-center gap-1 h-full text-xs font-medium text-rawaa-dark"
        aria-label="تصفح الكتالوج والمنتجات"
      >
        <div className="w-10 h-10 -mt-4 bg-rawaa-primary text-white rounded-full flex items-center justify-center shadow-soft-md hover:bg-rawaa-primary-hover transition-transform hover:scale-105">
          <Search size={18} />
        </div>
        <span className="text-[10px] font-bold text-rawaa-primary">المنتجات</span>
      </Link>

      {/* Toggle button for wishlist drawer */}
      <button
        type="button"
        className="flex flex-col items-center justify-center gap-1 h-full text-xs font-medium text-rawaa-muted hover:text-rawaa-primary cursor-pointer"
        onClick={() => setIsWishlistOpen(true)}
        aria-label="المفضلة"
      >
        <div className="relative">
          <Heart size={19} />
          {wishlist.length > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rawaa-sage text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {wishlist.length}
            </span>
          )}
        </div>
        <span className="text-[10px]">المفضلة</span>
      </button>

      {/* Toggle button for cart drawer */}
      <button
        type="button"
        className="flex flex-col items-center justify-center gap-1 h-full text-xs font-medium text-rawaa-muted hover:text-rawaa-primary cursor-pointer"
        onClick={() => setIsCartOpen(true)}
        aria-label="السلة"
      >
        <div className="relative">
          <ShoppingBag size={19} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rawaa-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">السلة</span>
      </button>
    </nav>
  );
}
