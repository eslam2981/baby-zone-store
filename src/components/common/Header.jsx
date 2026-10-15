import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';

export default function Header({ onOpenMegaMenu, isMegaMenuOpen }) {
  const {
    searchQuery,
    setSearchQuery,
    cartCount,
    cartTotalSAR,
    formatPrice,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsAuthOpen,
    setIsMobileNavOpen,
    user,
    allProducts
  } = useShop();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = searchQuery.trim()
    ? allProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 4)
    : [];

  const handleSelectSuggestion = (product) => {
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    navigate(`/product/${product.id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    if (searchQuery.trim()) {
      navigate(`/category/all?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/category/all');
    }
  };

  return (
    <header className="bg-white border-b border-rawaa-border sticky top-0 z-40 shadow-soft-xs">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile navigation trigger and brand logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="lg:hidden p-2 text-rawaa-dark hover:text-rawaa-primary hover:bg-rawaa-primary-light rounded-lg transition-colors cursor-pointer"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="افتح القائمة الرئيسية"
          >
            <Menu size={22} className="sm:w-6 sm:h-6" />
          </button>

          <Link to="/" className="flex items-center gap-2 sm:gap-3 group text-decoration-none">
            <span className="flex items-center justify-center filter drop-shadow-sm group-hover:rotate-[-6deg] group-hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-10 sm:h-10" fill="none">
                <circle cx="20" cy="20" r="18" fill="#FDF3EF" stroke="#C25E3E" strokeWidth="2" />
                <path d="M12 25 C 16 14, 24 14, 28 25" stroke="#C25E3E" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="16" cy="18" r="1.75" fill="#19211D" />
                <circle cx="24" cy="18" r="1.75" fill="#19211D" />
                <path d="M18 22 Q 20 24 22 22" stroke="#C25E3E" strokeWidth="2" strokeLinecap="round" />
                <path d="M28 10 L30 13 L33 13 L31 15 L32 18 L29 16 L27 18 L27 15 L25 13 L28 13 Z" fill="#EAB308" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="font-heading text-lg sm:text-2xl font-black text-rawaa-dark tracking-tight leading-none whitespace-nowrap">
                رَواء <span className="text-rawaa-primary font-black">الصغير</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-rawaa-sage mt-0.5 hidden sm:block">
                RAWAA ATELIER BÉBÉ
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop search input with autocomplete */}
        <div className="hidden lg:block flex-1 max-w-lg xl:max-w-xl relative" ref={searchContainerRef}>
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-rawaa-soft border border-rawaa-border rounded-full h-11 pr-4 pl-0 focus-within:bg-white focus-within:border-rawaa-primary focus-within:ring-2 focus-within:ring-rawaa-primary/20 transition-all overflow-hidden"
          >
            <Search size={18} className="text-rawaa-subtle shrink-0 ml-2.5" />
            <input
              type="search"
              className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-rawaa-dark placeholder-rawaa-subtle h-full py-0 leading-normal"
              placeholder="ابحثي عن عربة، سرير، رضّاعات، مقعد سيارة، أو ماركة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              aria-label="ابحث عن منتجات الأطفال"
            />
            {searchQuery && (
              <button
                type="button"
                className="p-1 text-rawaa-subtle hover:text-rawaa-dark ml-2 cursor-pointer"
                onClick={() => setSearchQuery('')}
                aria-label="مسح نص البحث"
              >
                <X size={15} />
              </button>
            )}
            <button
              type="submit"
              className="bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold px-6 h-full flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              بحث
            </button>
          </form>

          {/* Autocomplete suggestions dropdown */}
          <div
            className={`absolute top-full right-0 left-0 mt-2 bg-white border border-rawaa-border rounded-panel shadow-soft-xl overflow-hidden z-50 transition-all duration-200 ease-out origin-top ${
              isSearchFocused && searchQuery.trim()
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="flex justify-between items-center px-4 py-2.5 bg-rawaa-soft border-b border-rawaa-border text-xs text-rawaa-muted">
              <span>نتائج البحث الفوري عن «{searchQuery}»</span>
              <span className="font-bold">({suggestions.length} منتجات مقترحة)</span>
            </div>

            {suggestions.length > 0 ? (
              <ul className="py-1 divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 p-3 text-right hover:bg-rawaa-primary-light transition-colors cursor-pointer"
                      onClick={() => handleSelectSuggestion(p)}
                    >
                      <img src={p.mainImage} alt={p.name} className="w-11 h-11 rounded-lg object-cover shrink-0 border border-rawaa-border" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-semibold text-rawaa-sage block">{p.brand}</span>
                        <span className="text-xs font-medium text-rawaa-dark truncate block">{p.name}</span>
                        <span className="text-xs font-bold text-rawaa-primary block mt-0.5">{formatPrice(p.price)}</span>
                      </div>
                      <ArrowLeft size={16} className="text-rawaa-subtle shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-rawaa-muted text-sm">
                <p>لم نجد منتجات تطابق «{searchQuery}» مباشرة</p>
                <small className="text-rawaa-subtle text-xs block mt-1">جربي كلمات عامة مثل عربة وسرير وقطن وحفاضات</small>
              </div>
            )}

            <div className="p-2.5 bg-rawaa-soft border-t border-rawaa-border text-center">
              <button
                type="button"
                className="text-xs font-bold text-rawaa-primary hover:underline cursor-pointer"
                onClick={handleSearchSubmit}
              >
                عرض جميع النتائج المطابقة في الكتالوج &larr;
              </button>
            </div>
          </div>
        </div>

        {/* Header actions and buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile search toggle button */}
          <button
            type="button"
            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rawaa-soft hover:bg-rawaa-primary-light hover:text-rawaa-primary text-rawaa-dark flex items-center justify-center transition-colors"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            aria-label="البحث"
          >
            <Search size={18} />
          </button>

          {/* Mega menu toggle button */}
          <button
            type="button"
            className={`hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all border ${
              isMegaMenuOpen
                ? 'bg-rawaa-primary text-white border-rawaa-primary shadow-soft-sm'
                : 'bg-rawaa-primary-light text-rawaa-primary border-rawaa-primary/20 hover:bg-rawaa-primary hover:text-white'
            }`}
            onClick={onOpenMegaMenu}
            aria-expanded={isMegaMenuOpen}
            aria-label="تصفح جميع أقسام المتجر"
          >
            <span>الأقسام (17)</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Direct link to all products */}
          <Link
            to="/category/all"
            className="hidden lg:inline-flex text-xs font-semibold text-rawaa-muted hover:text-rawaa-primary px-2.5 py-1.5 rounded-lg hover:bg-rawaa-soft transition-colors whitespace-nowrap"
          >
            كل المنتجات
          </Link>

          {/* Direct link to hospital bag checklist */}
          <Link
            to="/hospital-bag"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-rawaa-primary bg-rawaa-primary-light hover:bg-rawaa-primary hover:text-white px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
          >
            <span>حقيبة الولادة</span>
            <span className="text-[10px] bg-white text-rawaa-primary px-1.5 py-0.2 rounded-full font-bold">جديد</span>
          </Link>

          {/* Direct link to live order tracking */}
          <Link
            to="/track-order"
            className="hidden xl:inline-flex items-center gap-1 text-xs font-semibold text-rawaa-muted hover:text-rawaa-primary px-2.5 py-1.5 rounded-lg hover:bg-rawaa-soft transition-colors whitespace-nowrap"
          >
            <span>تتبع طلبيتك</span>
          </Link>

          {/* Wishlist button with count badge */}
          <button
            type="button"
            className="hidden sm:flex relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rawaa-soft hover:bg-rawaa-primary-light hover:text-rawaa-primary text-rawaa-dark items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
            onClick={() => setIsWishlistOpen(true)}
            aria-label={`المفضلة (${wishlist.length} منتجات)`}
            title="المفضلة"
          >
            <Heart size={18} />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rawaa-sage text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart button with count and total */}
          <button
            type="button"
            className="flex items-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white pl-3 sm:pl-4 pr-2.5 sm:pr-3 py-1.5 rounded-full shadow-soft-sm hover:shadow-soft-md transition-all duration-200 hover:-translate-y-0.5"
            onClick={() => setIsCartOpen(true)}
            aria-label={`سلة المشتريات (${cartCount} منتجات)`}
            title="سلة التسوق"
          >
            <div className="relative flex items-center">
              <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rawaa-sage text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden xl:flex flex-col text-right leading-tight">
              <span className="text-[10px] opacity-85">سلة التسوق</span>
              <span className="text-xs font-black">{formatPrice(cartTotalSAR)}</span>
            </div>
          </button>

          {/* User account button */}
          <button
            type="button"
            className="hidden sm:flex relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rawaa-soft hover:bg-rawaa-primary-light hover:text-rawaa-primary text-rawaa-dark items-center justify-center transition-all duration-200"
            onClick={() => setIsAuthOpen(true)}
            aria-label="حسابي"
            title={user ? `حساب: ${user.name}` : 'تسجيل الدخول'}
          >
            <User size={18} />
            {user && (
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable mobile search bar */}
      <div
        className={`lg:hidden bg-white px-4 overflow-hidden transition-all duration-300 ease-in-out shadow-soft-sm ${
          isMobileSearchOpen ? 'max-h-24 py-3 border-t border-rawaa-border opacity-100' : 'max-h-0 py-0 border-t-0 opacity-0 pointer-events-none'
        }`}
      >
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-rawaa-soft rounded-full px-3 py-1.5 border border-rawaa-border">
            <Search size={16} className="text-rawaa-subtle ml-2 shrink-0" />
            <input
              type="search"
              className="w-full bg-transparent text-xs text-rawaa-dark outline-none placeholder-rawaa-subtle"
              placeholder="ابحثي عن مستلزمات طفلك..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus={isMobileSearchOpen}
            />
          </div>
          <button
            type="submit"
            className="bg-rawaa-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shrink-0 cursor-pointer"
          >
            بحث
          </button>
        </form>
      </div>
    </header>
  );
}
