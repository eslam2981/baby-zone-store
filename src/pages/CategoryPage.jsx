import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import FilterSidebar from '../components/catalog/FilterSidebar';
import ActiveFilters from '../components/catalog/ActiveFilters';
import ProductGrid from '../components/catalog/ProductGrid';
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronLeft,
  Sparkles
} from 'lucide-react';

export default function CategoryPage() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const subParam = searchParams.get('sub');
  const queryParam = searchParams.get('q');

  const {
    products,
    categories,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    setSearchQuery,
    sortBy,
    setSortBy,
    activeFiltersCount
  } = useShop();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Synchronize url parameters with context state
  useEffect(() => {
    const activeCatId = categoryId || 'all';
    setSelectedCategory(activeCatId);

    if (subParam) {
      setSelectedSubcategory(subParam);
    }

    if (queryParam) {
      setSearchQuery(queryParam);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryId, subParam, queryParam]);

  const currentCategory = categories.find((c) => c.id === (categoryId || 'all'));
  const categoryTitle = currentCategory ? currentCategory.name : 'جميع المنتجات';
  const categoryDesc = currentCategory
    ? currentCategory.description
    : 'تصفحي جميع مستلزمات الأطفال والأمهات المختارة بأعلى معايير الأمان العالمية';
  const subcategories = currentCategory ? currentCategory.subcategories || [] : [];

  const handleSubcategoryClick = (subName) => {
    if (selectedSubcategory === subName) {
      setSelectedSubcategory(null);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('sub');
        return next;
      });
    } else {
      setSelectedSubcategory(subName);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('sub', subName);
        return next;
      });
    }
  };

  return (
    <div className="bg-rawaa-bg min-h-screen py-6 sm:py-8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12">
        {/* Breadcrumb navigation trail */}
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-rawaa-muted mb-6">
          <Link to="/" className="hover:text-rawaa-primary transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft size={14} className="text-rawaa-subtle shrink-0" />
          <Link to="/category/all" className="hover:text-rawaa-primary transition-colors">
            الأقسام
          </Link>
          <ChevronLeft size={14} className="text-rawaa-subtle shrink-0" />
          <span className="font-bold text-rawaa-dark">{categoryTitle}</span>
          {selectedSubcategory && (
            <>
              <ChevronLeft size={14} className="text-rawaa-subtle shrink-0" />
              <span className="text-rawaa-primary font-bold">{selectedSubcategory}</span>
            </>
          )}
        </nav>

        {/* Category header card with description */}
        <div className="bg-white border border-rawaa-border rounded-panel p-6 sm:p-8 lg:p-10 mb-8 shadow-soft-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-rawaa-primary/5 rounded-full blur-3xl -z-10" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 text-right">
              {currentCategory?.isComingSoon ? (
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-soft-xs">
                  <Sparkles size={14} className="text-amber-600 animate-pulse" />
                  <span>قريباً في بيبي زون (Coming Soon)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-rawaa-primary-light text-rawaa-primary text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-soft-xs">
                  <Sparkles size={14} />
                  <span>تشكيلة حصرية ومضمونة</span>
                </div>
              )}
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-rawaa-dark mb-2">
                {categoryTitle}
              </h1>
              <p className="text-xs sm:text-sm text-rawaa-muted max-w-2xl leading-relaxed mb-4">
                {categoryDesc}
              </p>

              {/* Subcategory selection filter chips */}
              {subcategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rawaa-border/60">
                  <span className="text-xs font-bold text-rawaa-muted ml-1">التصنيفات الفرعية:</span>
                  <button
                    type="button"
                    onClick={() => handleSubcategoryClick(null)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      !selectedSubcategory
                        ? 'bg-rawaa-primary text-white border-rawaa-primary font-bold shadow-soft-xs'
                        : 'bg-rawaa-soft hover:bg-rawaa-primary-light/60 text-rawaa-dark border-rawaa-border'
                    }`}
                  >
                    الكل ({products.length})
                  </button>
                  {subcategories.map((sub, i) => {
                    const isSubActive = selectedSubcategory === sub;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSubcategoryClick(sub)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isSubActive
                            ? 'bg-rawaa-primary text-white border-rawaa-primary font-bold shadow-soft-xs'
                            : 'bg-rawaa-soft hover:bg-rawaa-primary-light/60 text-rawaa-dark border-rawaa-border'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-rawaa-soft rounded-card border border-rawaa-border text-center shrink-0 min-w-[160px]">
              <span className="text-3xl font-black text-rawaa-primary font-heading">
                {products.length}
              </span>
              <span className="text-xs font-semibold text-rawaa-muted mt-1">منتجات متوفرة</span>
            </div>
          </div>
        </div>

        {/* Catalog control bar with sorting and layout options */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-rawaa-border">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-rawaa-muted font-medium">
            <span>
              عرض <strong className="font-bold text-rawaa-dark">{products.length}</strong> منتج يطابق معاييرك
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter toggle button */}
            <button
              type="button"
              className="lg:hidden inline-flex items-center gap-2 bg-white border border-rawaa-border px-3.5 py-2 rounded-card text-xs font-bold text-rawaa-dark shadow-soft-xs hover:border-rawaa-primary transition-colors cursor-pointer"
              onClick={() => setIsMobileFilterOpen(true)}
              aria-label="تصفية وفلاتر المنتجات"
            >
              <SlidersHorizontal size={16} className="text-rawaa-primary" />
              <span>تصفية وفلاتر</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-rawaa-primary text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sorting selection dropdown */}
            <div className="relative inline-flex items-center bg-white border border-rawaa-border rounded-card px-3 py-2 shadow-soft-xs text-xs font-bold text-rawaa-dark hover:border-rawaa-primary/50 transition-colors">
              <ArrowUpDown size={14} className="text-rawaa-muted ml-1.5 shrink-0" />
              <label htmlFor="category-sort" className="sr-only">ترتيب المنتجات</label>
              <select
                id="category-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-rawaa-dark focus:outline-none cursor-pointer pr-1 pl-4"
                aria-label="ترتيب المنتجات"
              >
                <option value="popularity">الأكثر مبيعاً وشهرة</option>
                <option value="newest">وصل حديثاً (الأحدث)</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييماً من الأمهات</option>
              </select>
            </div>

            {/* Grid and list layout switcher */}
            <div className="hidden sm:inline-flex items-center bg-rawaa-soft p-1 rounded-card border border-rawaa-border gap-1" role="group" aria-label="طريقة العرض">
              <button
                type="button"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-rawaa-primary shadow-soft-xs font-bold'
                    : 'text-rawaa-muted hover:text-rawaa-dark'
                }`}
                onClick={() => setViewMode('grid')}
                aria-label="عرض شبكي"
                title="عرض شبكي"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-rawaa-primary shadow-soft-xs font-bold'
                    : 'text-rawaa-muted hover:text-rawaa-dark'
                }`}
                onClick={() => setViewMode('list')}
                aria-label="عرض قائمة"
                title="عرض قائمة"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Active applied filter chips bar */}
        <ActiveFilters />

        {/* Responsive two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Desktop sticky filter sidebar */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-28 bg-white border border-rawaa-border rounded-panel p-5 shadow-soft-xs">
            <FilterSidebar />
          </aside>

          {/* Mobile filter slide drawer */}
          <FilterSidebar
            isMobileDrawer={true}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* Products catalog display container */}
          <main className="lg:col-span-8 xl:col-span-9 min-w-0">
            <ProductGrid viewMode={viewMode} />
          </main>
        </div>
      </div>
    </div>
  );
}
