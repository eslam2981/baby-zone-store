import { Search } from 'lucide-react';
import ModernSelect from '../../common/ModernSelect';

export default function InventoryFilterBar({
  searchQuery,
  setSearchQuery,
  stockFilter,
  setStockFilter,
  categoryFilter,
  setCategoryFilter,
  categories = [],
  totalItemsCount = 0,
  lowStockCount = 0,
  outOfStockCount = 0,
  filteredCount = 0,
  onReset
}) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-rawaa-border shadow-soft space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-rawaa-dark/40" />
          <input
            type="text"
            placeholder="البحث باسم المنتج أو رقم الكود..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-xs sm:text-sm focus:outline-none focus:border-rawaa-primary focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1 bg-rawaa-soft/60 p-1 rounded-xl border border-rawaa-border text-xs shrink-0">
            <button
              type="button"
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                stockFilter === 'all'
                  ? 'bg-rawaa-dark text-white shadow-xs'
                  : 'text-rawaa-dark/70 hover:text-rawaa-dark'
              }`}
            >
              الكل ({totalItemsCount})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                stockFilter === 'low'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-rawaa-dark/70 hover:text-rawaa-dark'
              }`}
            >
              منخفض ({lowStockCount})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('out')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                stockFilter === 'out'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rawaa-dark/70 hover:text-rawaa-dark'
              }`}
            >
              نفد ({outOfStockCount})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter('normal')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                stockFilter === 'normal'
                  ? 'bg-rawaa-sage text-white shadow-xs'
                  : 'text-rawaa-dark/70 hover:text-rawaa-dark'
              }`}
            >
              مستقر
            </button>
          </div>

          <div className="min-w-[160px] shrink-0">
            <ModernSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: 'كل الأقسام' },
                ...categories.map((cat) => ({ value: cat.id, label: cat.name }))
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-rawaa-dark/60 pt-1 border-t border-rawaa-border/50">
        <span className="whitespace-nowrap">يتم عرض {filteredCount} منتج</span>
        {(searchQuery || stockFilter !== 'all' || categoryFilter !== 'all') && (
          <button
            type="button"
            onClick={onReset}
            className="text-rawaa-primary font-bold hover:underline whitespace-nowrap cursor-pointer"
          >
            إعادة ضبط الفلاتر
          </button>
        )}
      </div>
    </div>
  );
}

