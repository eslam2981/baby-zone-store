import { Search, Crown } from 'lucide-react';
import ModernSelect from '../../common/ModernSelect';

export default function CustomersFilterBar({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedCity,
  setSelectedCity,
  cities = [],
  totalCount = 0,
  filteredCount = 0,
  onReset
}) {
  return (
    <div className="bg-white p-4 rounded-3xl border border-rawaa-border shadow-soft space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-rawaa-muted" />
          <input
            type="text"
            placeholder="البحث بالاسم، رقم الهاتف، البريد الإلكتروني، أو المحافظة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-rawaa-primary focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-rawaa-soft/60 p-1 rounded-2xl border border-rawaa-border text-xs shrink-0">
            <button
              type="button"
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-rawaa-primary text-white shadow-soft-xs'
                  : 'text-rawaa-muted hover:text-rawaa-dark'
              }`}
            >
              الكل ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('active')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-soft-xs'
                  : 'text-rawaa-muted hover:text-rawaa-dark'
              }`}
            >
              نشط
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('vip')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedStatus === 'vip'
                  ? 'bg-amber-600 text-white shadow-soft-xs'
                  : 'text-rawaa-muted hover:text-rawaa-dark'
              }`}
            >
              <span>VIP</span>
              <Crown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('blocked')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedStatus === 'blocked'
                  ? 'bg-rose-600 text-white shadow-soft-xs'
                  : 'text-rawaa-muted hover:text-rawaa-dark'
              }`}
            >
              محظور
            </button>
          </div>

          {/* City Selector */}
          <div className="w-44 shrink-0">
            <ModernSelect
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              options={[
                { value: 'all', label: 'كل المحافظات' },
                ...cities.filter((c) => c !== 'all').map((c) => ({ value: c, label: c }))
              ]}
              buttonClassName="rounded-2xl py-2"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-rawaa-muted pt-1 border-t border-rawaa-border/50">
        <span>يتم عرض {filteredCount} عميل من أصل {totalCount} عميل مسجل</span>
        {(searchQuery || selectedStatus !== 'all' || selectedCity !== 'all') && (
          <button
            type="button"
            onClick={onReset}
            className="text-rawaa-primary font-bold hover:underline cursor-pointer"
          >
            إعادة ضبط الفلاتر
          </button>
        )}
      </div>
    </div>
  );
}

