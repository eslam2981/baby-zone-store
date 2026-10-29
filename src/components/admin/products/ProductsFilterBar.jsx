import { Search } from 'lucide-react';
import ModernSelect from '../../common/ModernSelect';

export default function ProductsFilterBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  stockFilter,
  setStockFilter,
  sortBy,
  setSortBy,
  categories = []
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-rawaa-border shadow-soft-xs flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Search input */}
      <div className="relative flex-1 w-full md:max-w-md">
        <Search size={16} className="text-rawaa-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ابحث بالاسم، الماركة، أو القسم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl pr-10 pl-4 py-2 text-xs text-rawaa-dark placeholder-rawaa-subtle focus:bg-white focus:border-rawaa-primary outline-none transition-all"
        />
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:flex items-center gap-2 w-full md:w-auto">
        {/* Category filter */}
        <div className="w-full sm:w-40">
          <ModernSelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: 'all', label: 'جميع الأقسام' },
              ...categories.map((c) => ({ value: c.id, label: c.name }))
            ]}
          />
        </div>

        {/* Stock filter */}
        <div className="w-full sm:w-40">
          <ModernSelect
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            options={[
              { value: 'all', label: 'جميع حالات المخزون' },
              { value: 'in-stock', label: 'متوفر (> 5 قطع)' },
              { value: 'low-stock', label: 'مخزون منخفض (1-5)' },
              { value: 'out-of-stock', label: 'نفد من المخزون' }
            ]}
          />
        </div>

        {/* Sort order */}
        <div className="w-full sm:w-40">
          <ModernSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'newest', label: 'الأحدث إضافة' },
              { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
              { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
              { value: 'stock-high', label: 'الكمية: الأكثر توفراً' },
              { value: 'stock-low', label: 'الكمية: الأقل توفراً' }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

