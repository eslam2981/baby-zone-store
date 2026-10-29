import { Search, Truck, Loader2, Sparkles } from 'lucide-react';
import { sanitizeText, normalizeEgyptianPhone, REGEX_PATTERNS } from '../../utils/validators';

export function TrackingSearchForm({
  searchInput,
  setSearchInput,
  onSearch,
  isSearching,
  addToast
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const rawInput = searchInput.trim();
    if (!rawInput) {
      if (addToast) addToast('يرجى إدخال رقم الطلب أو رقم الهاتف للاستعلام', 'warning');
      return;
    }

    const cleanQuery = sanitizeText(rawInput);
    if (REGEX_PATTERNS.DANGEROUS_HTML.test(rawInput)) {
      if (addToast) addToast('إدخال غير صالح، يحتوي على رموز غير مسموح بها', 'warning');
      return;
    }

    if (cleanQuery.length < 3 || cleanQuery.length > 35) {
      if (addToast) addToast('يرجى التأكد من كتابة رقم الطلب أو رقم الموبايل بشكل صحيح (3 إلى 35 خانة)', 'warning');
      return;
    }

    const normalizedQuery = /^\+?[0-9\s-]+$/.test(cleanQuery)
      ? normalizeEgyptianPhone(cleanQuery)
      : cleanQuery;

    onSearch(normalizedQuery);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-soft-md border border-rawaa-border p-4 sm:p-6 mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="أدخلي كود الطلب (مثل: EGY-...) أو رقم هاتفك..."
            className="w-full bg-[#FAF7F2] border border-rawaa-border rounded-xl pr-11 pl-4 py-3.5 text-sm text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white transition-all placeholder:text-rawaa-subtle"
            dir="rtl"
            required
          />
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-rawaa-subtle" />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-95 text-white text-sm font-bold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-soft-sm transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          {isSearching ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              <span>جاري البحث...</span>
            </>
          ) : (
            <>
              <span>تتبع الشحنة</span>
              <Truck size={17} />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-rawaa-border/60 text-xs text-rawaa-muted">
        <Sparkles size={14} className="text-rawaa-primary shrink-0" />
        <span>يمكنك الاستعلام برقم هاتفك المسجل في الطلب أو كود الشحنة المرسل إليكِ عبر واتساب.</span>
      </div>
    </div>
  );
}

