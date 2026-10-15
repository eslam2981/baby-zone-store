
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Tag,
  DollarSign,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';

const BRANDS = [
  'Stokke',
  'Cybex',
  'Mushie',
  'Nanit Pro',
  'Philips Avent',
  'Medela',
  'Ergobaby Omni',
  'Mustela Bebe',
  'PlanToys',
  'RAWAA Atelier',
  'Tripp Trapp',
  'Luli Bebe',
  'Love To Dream',
  'BIBS Denmark',
  'Frida Mom',
  'Braun',
  'Pampers Pure'
];

const AGE_GROUPS = [
  'حديث ولادة (0-6 أشهر)',
  '6-12 شهر',
  '1-3 سنوات',
  'حديث ولادة',
  'للأم والرضيع'
];

export default function FilterSidebar({ isMobileOpen = false, onCloseMobile = () => {}, isMobileDrawer = false }) {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    priceRange,
    setPriceRange,
    selectedBrand,
    setSelectedBrand,
    selectedAge,
    setSelectedAge,
    onlyInStock,
    setOnlyInStock,
    onlyDiscounted,
    setOnlyDiscounted,
    onlyOrganic,
    setOnlyOrganic,
    clearAllFilters,
    allProducts,
    formatPrice
  } = useShop();

  const navigate = useNavigate();

  const handlePriceChange = (e) => {
    setPriceRange([0, Number(e.target.value)]);
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(null);
    navigate(`/category/${catId}`);
    if (isMobileOpen && onCloseMobile) onCloseMobile();
  };

  const handleSubcategorySelect = (sub) => {
    setSelectedSubcategory(sub);
    if (isMobileOpen && onCloseMobile) onCloseMobile();
  };

  const getCategoryCount = (catId) => {
    if (catId === 'all') return allProducts.length;
    if (catId === 'offers') return allProducts.filter((p) => p.discountPercent > 0).length;
    return allProducts.filter((p) => p.category === catId).length;
  };

  const content = (
    <div className="flex flex-col text-rawaa-dark">
      {/* Sidebar header with title and reset button */}
      <div className="flex items-center justify-between pb-4 border-b border-rawaa-border mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center shrink-0">
            <SlidersHorizontal size={16} />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-rawaa-dark">تصفية المنتجات</h3>
            <span className="text-[10px] text-rawaa-muted">حددي خياراتك</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rawaa-primary hover:text-white bg-rawaa-primary-light hover:bg-rawaa-primary px-3 py-1.5 rounded-full border border-rawaa-primary/20 transition-all shadow-soft-xs cursor-pointer active:scale-95"
            onClick={clearAllFilters}
            title="إعادة ضبط جميع الفلاتر"
          >
            <RotateCcw size={12} className="transition-transform group-hover:rotate-180" />
            <span>إعادة ضبط</span>
          </button>
          {isMobileOpen && (
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-rawaa-soft hover:bg-rawaa-primary-light text-rawaa-muted hover:text-rawaa-primary flex items-center justify-center transition-colors lg:hidden mr-1"
              onClick={onCloseMobile}
              aria-label="إغلاق نافذة الفلاتر"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main categories selector block */}
      <div className="mb-5 pb-5 border-b border-rawaa-border/60">
        <h4 className="flex items-center gap-2 text-xs font-bold text-rawaa-dark mb-3">
          <Layers size={15} className="text-rawaa-sage" />
          <span>الأقسام الرئيسية</span>
        </h4>
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pl-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <button
                key={cat.id}
                type="button"
                className={`flex items-center gap-2.5 w-full p-2 rounded-lg text-right text-xs transition-colors ${
                  isSelected
                    ? 'bg-rawaa-primary-light text-rawaa-primary font-bold'
                    : 'text-rawaa-muted hover:bg-rawaa-soft hover:text-rawaa-dark'
                }`}
                onClick={() => handleCategorySelect(cat.id)}
              >
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-rawaa-primary' : 'border-rawaa-border'
                }`}>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-rawaa-primary" />}
                </span>
                <span className="flex-1 truncate">{cat.name}</span>
                <span className="text-[11px] text-rawaa-subtle">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategories filter block when a category is selected */}
      {selectedCategory !== 'all' && (
        <div className="mb-5 pb-5 border-b border-rawaa-border/60 animate-in fade-in duration-200">
          <h4 className="flex items-center gap-2 text-xs font-bold text-rawaa-dark mb-3">
            <Tag size={15} className="text-rawaa-primary" />
            <span>الفئات الفرعية</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                !selectedSubcategory
                  ? 'bg-rawaa-primary text-white border-rawaa-primary font-bold'
                  : 'bg-rawaa-soft border-rawaa-border text-rawaa-muted hover:border-rawaa-primary'
              }`}
              onClick={() => handleSubcategorySelect(null)}
            >
              الكل
            </button>
            {categories
              .find((c) => c.id === selectedCategory)
              ?.subcategories?.map((sub, sIdx) => {
                const isSubSelected = selectedSubcategory === sub;
                return (
                  <button
                    key={sIdx}
                    type="button"
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      isSubSelected
                        ? 'bg-rawaa-primary text-white border-rawaa-primary font-bold'
                        : 'bg-rawaa-soft border-rawaa-border text-rawaa-muted hover:border-rawaa-primary'
                    }`}
                    onClick={() => handleSubcategorySelect(isSubSelected ? null : sub)}
                  >
                    {sub}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Price range slider filter block */}
      <div className="mb-5 pb-5 border-b border-rawaa-border/60">
        <div className="flex items-center justify-between mb-2">
          <h4 className="flex items-center gap-1.5 text-xs font-bold text-rawaa-dark">
            <DollarSign size={15} className="text-rawaa-amber" />
            <span>نطاق السعر</span>
          </h4>
          <span className="text-xs font-bold text-rawaa-primary bg-rawaa-primary-light px-2 py-0.5 rounded-full">
            حتى {formatPrice(priceRange[1])}
          </span>
        </div>
        <div className="pt-2">
          <input
            type="range"
            min="100"
            max="3500"
            step="50"
            value={priceRange[1]}
            onChange={handlePriceChange}
            className="w-full accent-rawaa-primary cursor-pointer"
            aria-label="الحد الأقصى للسعر"
          />
          <div className="flex justify-between text-[11px] text-rawaa-subtle mt-1">
            <span>{formatPrice(100)}</span>
            <span>{formatPrice(3500)}</span>
          </div>
        </div>
      </div>

      {/* Special criteria filter checkboxes */}
      <div className="mb-5 pb-5 border-b border-rawaa-border/60">
        <h4 className="flex items-center gap-1.5 text-xs font-bold text-rawaa-dark mb-3">
          <Sparkles size={15} className="text-rawaa-sage" />
          <span>المعايير الخاصة</span>
        </h4>
        <div className="flex flex-col gap-2.5 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-rawaa-dark select-none">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="hidden"
            />
            <span className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              onlyInStock ? 'bg-rawaa-primary border-rawaa-primary text-white' : 'border-rawaa-border bg-white'
            }`}>
              {onlyInStock && <Check size={12} />}
            </span>
            <span>متوفر في المخزون فوراً</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-rawaa-dark select-none">
            <input
              type="checkbox"
              checked={onlyDiscounted}
              onChange={(e) => setOnlyDiscounted(e.target.checked)}
              className="hidden"
            />
            <span className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              onlyDiscounted ? 'bg-rawaa-primary border-rawaa-primary text-white' : 'border-rawaa-border bg-white'
            }`}>
              {onlyDiscounted && <Check size={12} />}
            </span>
            <span>عروض وخصومات خاصة فقط</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-rawaa-dark select-none">
            <input
              type="checkbox"
              checked={onlyOrganic}
              onChange={(e) => setOnlyOrganic(e.target.checked)}
              className="hidden"
            />
            <span className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              onlyOrganic ? 'bg-rawaa-primary border-rawaa-primary text-white' : 'border-rawaa-border bg-white'
            }`}>
              {onlyOrganic && <Check size={12} />}
            </span>
            <span>أقطان وخامات عضوية معتمدة</span>
          </label>
        </div>
      </div>

      {/* Target age group filter options */}
      <div className="mb-5 pb-5 border-b border-rawaa-border/60">
        <h4 className="text-xs font-bold text-rawaa-dark mb-3">المرحلة العمرية</h4>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              selectedAge === 'all'
                ? 'bg-rawaa-sage text-white border-rawaa-sage font-bold'
                : 'bg-rawaa-soft border-rawaa-border text-rawaa-muted hover:border-rawaa-sage'
            }`}
            onClick={() => setSelectedAge('all')}
          >
            الكل
          </button>
          {AGE_GROUPS.map((age, idx) => (
            <button
              key={idx}
              type="button"
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                selectedAge === age
                  ? 'bg-rawaa-sage text-white border-rawaa-sage font-bold'
                  : 'bg-rawaa-soft border-rawaa-border text-rawaa-muted hover:border-rawaa-sage'
              }`}
              onClick={() => setSelectedAge(selectedAge === age ? 'all' : age)}
            >
              {age}
            </button>
          ))}
        </div>
      </div>

      {/* Brand selection filter list */}
      <div>
        <h4 className="text-xs font-bold text-rawaa-dark mb-3">الماركة العالمية</h4>
        <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pl-1">
          <button
            type="button"
            className={`flex items-center justify-between p-1.5 rounded text-xs transition-colors ${
              selectedBrand === 'all'
                ? 'bg-rawaa-primary-light text-rawaa-primary font-bold'
                : 'text-rawaa-muted hover:bg-rawaa-soft hover:text-rawaa-dark'
            }`}
            onClick={() => setSelectedBrand('all')}
          >
            <span>جميع الماركات</span>
            {selectedBrand === 'all' && <Check size={14} className="text-rawaa-primary" />}
          </button>
          {BRANDS.map((brand, idx) => (
            <button
              key={idx}
              type="button"
              className={`flex items-center justify-between p-1.5 rounded text-xs transition-colors ${
                selectedBrand === brand
                  ? 'bg-rawaa-primary-light text-rawaa-primary font-bold'
                  : 'text-rawaa-muted hover:bg-rawaa-soft hover:text-rawaa-dark'
              }`}
              onClick={() => setSelectedBrand(selectedBrand === brand ? 'all' : brand)}
            >
              <span>{brand}</span>
              {selectedBrand === brand && <Check size={14} className="text-rawaa-primary" />}
            </button>
          ))}
        </div>
      </div>

      {isMobileOpen && (
        <div className="mt-6 pt-4 border-t border-rawaa-border sticky bottom-0 bg-white">
          <button
            type="button"
            className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3 rounded-full shadow-soft-sm"
            onClick={onCloseMobile}
          >
            تطبيق الفلاتر وعرض النتائج
          </button>
        </div>
      )}
    </div>
  );

  // Mobile drawer modal overlay
  if (isMobileDrawer) {
    return (
      <div
        className={`fixed inset-0 bg-rawaa-dark/60 backdrop-blur-sm z-50 flex justify-start lg:hidden transition-opacity duration-300 ease-in-out ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseMobile}
        aria-hidden={!isMobileOpen}
      >
        <aside
          className={`w-80 max-w-[85vw] h-full bg-white p-5 overflow-y-auto shadow-soft-xl transform transition-transform duration-300 ease-in-out ${
            isMobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
          aria-label="خيارات التصفية"
        >
          {content}
        </aside>
      </div>
    );
  }

  // Desktop static sidebar layout
  return (
    <div className="w-full" aria-label="خيارات التصفية">
      {content}
    </div>
  );
}
