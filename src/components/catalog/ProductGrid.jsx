// Catalog product grid and list container with empty results fallback

import ProductCard from './ProductCard';
import { useShop } from '../../context/ShopContext';
import { SearchX, RotateCcw } from 'lucide-react';

export default function ProductGrid({ viewMode = 'grid' }) {
  const { products, clearAllFilters, searchQuery } = useShop();

  if (products.length === 0) {
    return (
      <div className="bg-white border-1.5 border-dashed border-rawaa-border rounded-panel p-8 sm:p-14 text-center max-w-lg mx-auto my-8 shadow-soft-xs">
        <div className="w-16 h-16 rounded-full bg-rawaa-soft text-rawaa-subtle flex items-center justify-center mx-auto mb-4">
          <SearchX size={36} />
        </div>
        <h3 className="font-heading text-lg sm:text-xl font-bold text-rawaa-dark mb-2">
          لم نجد أي منتجات تطابق الفلاتر المحددة
        </h3>
        <p className="text-xs sm:text-sm text-rawaa-muted mb-6 leading-relaxed">
          {searchQuery
            ? `لا توجد نتائج تطابق بحثك عن «${searchQuery}». جربي كلمات بحث أوسع أو أعيدي ضبط معايير التصفية.`
            : 'جربي تخفيف معايير التصفية ونطاق الأسعار لاستعراض منتجات أخرى تناسب طفلك.'}
        </p>
        <button
          type="button"
          className="bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-full inline-flex items-center gap-2 shadow-soft-sm transition-transform hover:-translate-y-0.5"
          onClick={clearAllFilters}
        >
          <RotateCcw size={15} />
          <span>إعادة ضبط جميع الفلاتر</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === 'list'
          ? 'grid grid-cols-1 gap-5'
          : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6'
      }
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
}
