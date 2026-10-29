import React, { useState } from 'react';
import FilterSidebar from './FilterSidebar';
import ActiveFilters from './ActiveFilters';
import ProductGrid from './ProductGrid';
import { useShop } from '../../context/ShopContext';
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import ModernSelect from '../common/ModernSelect';

export default function ProductCatalog({ showHeader = true, initialCategory = null }) {
  const {
    products,
    categories,
    selectedCategory,
    sortBy,
    setSortBy,
    activeFiltersCount
  } = useShop();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const currentCategory = categories.find((c) => c.id === (initialCategory || selectedCategory));
  const categoryTitle = currentCategory ? currentCategory.name : 'جميع المنتجات';
  const categoryDesc = currentCategory ? currentCategory.description : 'تصفحي تشكيلتنا المختارة بعناية لأطفالك';

  return (
    <section className="py-10 bg-rawaa-bg border-b border-rawaa-border" id="product-catalog">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12">
        {/* Catalog section header with category details */}
        {showHeader && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-rawaa-border">
            <div className="flex flex-col items-start text-right">
              <span className="inline-flex items-center gap-1.5 bg-rawaa-primary-light text-rawaa-primary text-xs font-bold px-3 py-1 rounded-full mb-2">
                <Sparkles size={14} />
                <span>كتالوج المنتجات الأصلي</span>
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-rawaa-dark">
                {categoryTitle}
              </h2>
              <p className="text-xs sm:text-sm text-rawaa-muted mt-1 max-w-xl">
                {categoryDesc}
              </p>
            </div>

            {/* Controls for mobile filters sorting and layout switches */}
            <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 self-stretch md:self-auto justify-between md:justify-end">
              {/* Mobile filter toggle trigger */}
              <button
                type="button"
                className="lg:hidden inline-flex items-center gap-2 bg-white border border-rawaa-border px-3.5 py-2 rounded-card text-xs font-bold text-rawaa-dark shadow-soft-xs hover:border-rawaa-primary transition-colors cursor-pointer"
                onClick={() => setIsMobileFilterOpen(true)}
                aria-label="تصفية وفلاتر المنتجات"
              >
                <SlidersHorizontal size={16} className="text-rawaa-primary" />
                <span>تصفية</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rawaa-primary text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sorting select dropdown */}
              <div className="w-52">
                <ModernSelect
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: 'popularity', label: 'الأكثر مبيعاً وشهرة' },
                    { value: 'newest', label: 'وصل حديثاً (الأحدث)' },
                    { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
                    { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
                    { value: 'rating', label: 'الأعلى تقييماً من الأمهات' }
                  ]}
                  buttonClassName="bg-white rounded-card shadow-soft-xs py-1.5"
                />
              </div>

              {/* View mode toggle between grid and list */}
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
        )}

        {/* Active applied filter tags bar */}
        <ActiveFilters />

        {/* Matching products count summary */}
        <div className="text-xs text-rawaa-muted mb-4 font-medium flex items-center justify-between">
          <span>
            تم العثور على <strong className="font-bold text-rawaa-dark">{products.length}</strong> منتج يطابق خياراتك
          </span>
        </div>

        {/* Catalog responsive two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Sticky desktop filter sidebar */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-28 bg-white border border-rawaa-border rounded-panel p-5 shadow-soft-xs">
            <FilterSidebar />
          </aside>

          {/* Mobile slide drawer filter component */}
          <FilterSidebar
            isMobileDrawer={true}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* Main product catalog display container */}
          <main className="lg:col-span-8 xl:col-span-9 min-w-0" id="main-catalog-grid">
            <ProductGrid viewMode={viewMode} />
          </main>
        </div>
      </div>
    </section>
  );
}
