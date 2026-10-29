import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ProductCard from '../catalog/ProductCard';

export function RelatedProductsSection({
  relatedProducts = [],
  categoryName,
  categorySlug
}) {
  const scrollContainerRef = useRef(null);

  if (!relatedProducts || relatedProducts.length === 0) return null;

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const isSingle = relatedProducts.length === 1;

  return (
    <section className="mt-12 sm:mt-16 pt-8 border-t border-rawaa-border/60" aria-label="منتجات ذات صلة">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rawaa-primary tracking-wider mb-1">
            <Sparkles size={13} className="text-rawaa-amber" />
            <span>مختارات تكمل طلبيتك</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black text-rawaa-dark">
            منتجات ذات صلة مقترحة لكِ
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {categorySlug && (
            <Link
              to={`/category/${categorySlug}`}
              className="text-xs font-bold text-rawaa-primary hover:text-rawaa-primary-hover hover:underline flex items-center gap-1 transition-colors"
            >
              <span>مشاهدة الكل في {categoryName || 'القسم'}</span>
              <ChevronLeft size={16} />
            </Link>
          )}

          {/* Desktop scroll navigation buttons if multiple products */}
          {relatedProducts.length > 2 && (
            <div className="hidden md:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-8 h-8 rounded-full bg-rawaa-soft hover:bg-rawaa-border text-rawaa-dark flex items-center justify-center transition-colors cursor-pointer"
                aria-label="السابق"
                title="السابق"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-8 h-8 rounded-full bg-rawaa-soft hover:bg-rawaa-border text-rawaa-dark flex items-center justify-center transition-colors cursor-pointer"
                aria-label="التالي"
                title="التالي"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* When only 1 product exists: Spacious and centered, never cramped into a half-empty column */}
      {isSingle ? (
        <div className="max-w-sm sm:max-w-md mx-auto">
          <ProductCard product={relatedProducts[0]} />
        </div>
      ) : (
        /* When multiple products exist: Smooth swipeable snap-scroll rail on mobile, spacious grid on tablet/desktop */
        <div
          ref={scrollContainerRef}
          className="flex sm:grid overflow-x-auto sm:overflow-visible gap-3.5 sm:gap-5 lg:gap-6 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scrollbar-none sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        >
          {relatedProducts.map((relProduct) => (
            <div
              key={relProduct.id}
              className="w-[74vw] max-w-[290px] min-w-[240px] sm:w-auto sm:min-w-0 sm:max-w-none shrink-0 sm:shrink snap-start flex"
            >
              <ProductCard product={relProduct} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
