import { Search } from 'lucide-react';
import ModernSelect from '../../common/ModernSelect';

export default function OrdersFilterBar({
  searchQuery,
  setSearchQuery,
  cityFilter,
  setCityFilter,
  paymentFilter,
  setPaymentFilter
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-rawaa-border shadow-soft-xs flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Search */}
      <div className="relative flex-1 w-full md:max-w-md">
        <Search size={16} className="text-rawaa-subtle absolute right-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ابحث برقم الطلب (EGY-...)، اسم العميل، أو الهاتف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl pr-10 pl-4 py-2 text-xs text-rawaa-dark placeholder-rawaa-subtle focus:bg-white focus:border-rawaa-primary outline-none transition-all"
        />
      </div>

      {/* City and Payment filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex items-center gap-2 w-full md:w-auto">
        <div className="w-full sm:w-44">
          <ModernSelect
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'جميع المحافظات' },
              { value: 'القاهرة', label: 'القاهرة' },
              { value: 'الجيزة', label: 'الجيزة' },
              { value: 'الإسكندرية', label: 'الإسكندرية' },
              { value: 'الدقهلية', label: 'الدقهلية (المنصورة)' },
              { value: 'الغربية', label: 'الغربية (طنطا)' },
              { value: 'أسيوط', label: 'أسيوط' }
            ]}
          />
        </div>

        <div className="w-full sm:w-44">
          <ModernSelect
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            options={[
              { value: 'all', label: 'جميع طرق الدفع' },
              { value: 'الدفع عند الاستلام', label: 'الدفع عند الاستلام' },
              { value: 'InstaPay', label: 'إنستاباي (InstaPay)' },
              { value: 'فودافون كاش', label: 'فودافون كاش' },
              { value: 'بطاقة بنكية', label: 'بطاقة بنكية' }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

