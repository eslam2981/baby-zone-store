import { useShop } from '../../context/ShopContext';
import { X, RotateCcw } from 'lucide-react';

export default function ActiveFilters() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    selectedBrand,
    setSelectedBrand,
    selectedAge,
    setSelectedAge,
    onlyInStock,
    setOnlyInStock,
    onlyDiscounted,
    setOnlyDiscounted,
    onlyOrganic,
    setOnlyOrganic,
    priceRange,
    setPriceRange,
    categories,
    clearAllFilters,
    activeFiltersCount,
    formatPrice
  } = useShop();

  if (activeFiltersCount === 0) return null;

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="bg-white border border-rawaa-border rounded-xl p-3 sm:p-4 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-soft-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-rawaa-muted">الفلاتر المطبقة:</span>

        {/* Applied search query chip */}
        {searchQuery.trim() && (
          <span className="inline-flex items-center gap-1.5 bg-rawaa-soft border border-rawaa-border text-rawaa-dark text-xs px-2.5 py-1 rounded-full">
            <span>بحث: «{searchQuery}»</span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-rawaa-subtle hover:text-red-600"
              aria-label="إلغاء فلتر البحث"
            >
              <X size={13} />
            </button>
          </span>
        )}

        {/* Applied category filter chip */}
        {selectedCategory !== 'all' && currentCategoryObj && (
          <span className="inline-flex items-center gap-1.5 bg-rawaa-soft border border-rawaa-border text-rawaa-dark text-xs px-2.5 py-1 rounded-full">
            <span>قسم: {currentCategoryObj.name}</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory(null);
              }}
              className="text-rawaa-subtle hover:text-red-600"
              aria-label="إلغاء فلتر القسم"
            >
              <X size={13} />
            </button>
          </span>
        )}

        {/* Applied subcategory filter chip */}
        {selectedSubcategory && (
          <span className="inline-flex items-center gap-1.5 bg-rawaa-soft border border-rawaa-border text-rawaa-dark text-xs px-2.5 py-1 rounded-full">
            <span>فئة: {selectedSubcategory}</span>
            <button
              type="button"
              onClick={() => setSelectedSubcategory(null)}
              className="text-rawaa-subtle hover:text-red-600"
              aria-label="إلغاء فلتر الفئة الفرعية"
            >
              <X size={13} />
            </button>
          </span>
        )}

        {/* Applied brand filter chip */}
        {selectedBrand !== 'all' && (
          <span className="inline-flex items-center gap-1.5 bg-rawaa-soft border border-rawaa-border text-rawaa-dark text-xs px-2.5 py-1 rounded-full">
            <span>ماركة: {selectedBrand}</span>
            <button
              type="button"
              onClick={() => setSelectedBrand('all')}
              className="text-rawaa-subtle hover:text-red-600"
              aria-label="إلغاء فلتر الماركة"
            >
              <X size={13} />
            </button>
          </span>
        )}

        {/* Applied age filter chip */}
        {selectedAge !== 'all' && (
          <span className="inline-flex items-center gap-1.5 bg-rawaa-soft border border-rawaa-border text-rawaa-dark text-xs px-2.5 py-1 rounded-full">
            <span>عمر: {selectedAge}</span>
            <button
              type="button"
              onClick={() => setSelectedAge('all')}
              className="text-rawaa-subtle hover:text-red-600"
              aria-label="إلغاء فلتر العمر"
            >
              <X size={13} />
            </button>
          </span>
        )}

        {/* Applied price range filter chip */}
        {(priceRange[0] > 0 || priceRange[1] < 3500) && (
          <span className="inline-flex items-center gap-1.5 bg-rawaa-soft border border-rawaa-border text-rawaa-dark text-xs px-2.5 py-1 rounded-full">
            <span>السعر: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</span>
            <button
              type="button"
              onClick={() => setPriceRange([0, 3500])}
              className="text-rawaa-subtle hover:text-red-600"
              aria-label="إلغاء فلتر السعر"
            >
              <X size={13} />
            </button>
          </span>
        )}

        {/* Applied in stock filter chip */}
        {onlyInStock && (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-2.5 py-1 rounded-full">
            <span>متوفر فقط</span>
            <button
              type="button"
              onClick={() => setOnlyInStock(false)}
              className="text-emerald-500 hover:text-red-600"
              aria-label="إلغاء فلتر التوفر"
            >
              <X size={13} />
            </button>
          </span>
        )}

        {/* Applied discounted products filter chip */}
        {onlyDiscounted && (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-2.5 py-1 rounded-full">
            <span>خصومات فقط</span>
            <button
              type="button"
              onClick={() => setOnlyDiscounted(false)}
              className="text-amber-500 hover:text-red-600"
              aria-label="إلغاء فلتر الخصومات"
            >
              <X size={13} />
            </button>
          </span>
        )}

        {/* Applied organic certification filter chip */}
        {onlyOrganic && (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-2.5 py-1 rounded-full">
            <span>عضوي 100%</span>
            <button
              type="button"
              onClick={() => setOnlyOrganic(false)}
              className="text-emerald-500 hover:text-red-600"
              aria-label="إلغاء فلتر العضوي"
            >
              <X size={13} />
            </button>
          </span>
        )}
      </div>

      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs text-red-700 font-bold bg-red-50 hover:bg-red-100 border border-red-200/80 px-3 py-1.5 rounded-full shadow-soft-xs transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        onClick={clearAllFilters}
      >
        <RotateCcw size={13} className="text-red-600" />
        <span>مسح جميع الفلاتر</span>
      </button>
    </div>
  );
}
