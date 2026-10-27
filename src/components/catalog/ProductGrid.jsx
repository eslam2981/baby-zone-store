// Catalog product grid and list container with empty results fallback

import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeletons';
import { useShop } from '../../context/ShopContext';
import { SearchX, RotateCcw, Sparkles } from 'lucide-react';

export default function ProductGrid({ viewMode = 'grid' }) {
  const {
    products,
    clearAllFilters,
    searchQuery,
    isLoadingProducts,
    selectedCategory,
    categories
  } = useShop();

  if (isLoadingProducts) {
    return (
      <div
        className={
          viewMode === 'list'
            ? 'grid grid-cols-1 gap-5'
            : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6'
        }
      >
        {[...Array(6)].map((_, i) => (
          <ProductCardSkeleton key={i} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const isComingSoonCategory = currentCategory?.isComingSoon || (selectedCategory !== 'all' && products.length === 0 && !searchQuery);

  if (isComingSoonCategory) {
    return (
      <div className="bg-gradient-to-b from-white to-[#FAF8F5] border border-amber-200/80 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-6 shadow-soft-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-100/50 rounded-full blur-2xl -z-10" />
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto mb-4 shadow-soft-xs">
          <Sparkles size={32} className="animate-pulse" />
        </div>
        <span className="inline-block bg-amber-100/90 text-amber-900 text-xs font-black px-3.5 py-1 rounded-full border border-amber-300/80 mb-3 shadow-soft-xs">
          قريباً في بيبي زون ✨ Coming Soon
        </span>
        <h3 className="font-heading text-xl sm:text-2xl font-black text-rawaa-dark mb-2">
          قسم «{currentCategory?.name || 'هذا القسم'}» قريباً
        </h3>
        <p className="text-xs sm:text-sm text-rawaa-muted mb-6 leading-relaxed max-w-md mx-auto">
          {currentCategory?.description ||
            'نعمل حالياً على تجهيز وانتقاء أفضل الماركات والمنتجات المعتمدة لهذا القسم بأعلى معايير الجودة وسلامة الطفل.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://wa.me/201035401549?text=${encodeURIComponent(
              `مرحباً بيبي زون، أود الاستفسار عن موعد توفر منتجات قسم «${currentCategory?.name || ''}»`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-full inline-flex items-center justify-center gap-2 shadow-soft-xs transition-transform hover:-translate-y-0.5"
          >
            <span>استفسر أو اطلب مسبقاً عبر واتساب</span>
          </a>

          <button
            type="button"
            className="w-full sm:w-auto bg-rawaa-soft hover:bg-rawaa-border text-rawaa-dark text-xs font-bold px-5 py-2.5 rounded-full inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            onClick={clearAllFilters}
          >
            <RotateCcw size={14} />
            <span>تصفح الأقسام المتوفرة حالياً</span>
          </button>
        </div>
      </div>
    );
  }

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
