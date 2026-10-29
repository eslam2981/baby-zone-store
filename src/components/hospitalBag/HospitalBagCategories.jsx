import { CHECKLIST_CATEGORIES } from '../../data/hospitalBagData';

export default function HospitalBagCategories({
  activeTab,
  setActiveTab,
  filterMode,
  setFilterMode,
  checkedItems,
  currentCategory
}) {
  return (
    <>
      {/* Category tabs navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2">
        {CHECKLIST_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const catItemCount = cat.items.length;
          const catDoneCount = cat.items.filter((i) => checkedItems.includes(i.id)).length;
          const isActive = activeTab === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-rawaa-primary text-white border-rawaa-primary shadow-soft-md scale-[1.02]'
                  : 'bg-white text-rawaa-dark hover:bg-rawaa-soft border-rawaa-border'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-rawaa-primary'} />
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-rawaa-soft text-rawaa-muted'
                }`}
              >
                {catDoneCount}/{catItemCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter modes bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-3.5 rounded-xl border border-rawaa-border">
        <div className="flex items-center gap-1.5 text-xs text-rawaa-muted font-medium">
          <span>تصفية العناصر:</span>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterMode === 'all' ? 'bg-rawaa-dark text-white' : 'hover:bg-rawaa-soft text-rawaa-muted'
            }`}
          >
            الكل ({currentCategory?.items?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('essential')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterMode === 'essential' ? 'bg-rose-600 text-white' : 'hover:bg-rawaa-soft text-rawaa-muted'
            }`}
          >
            الأساسي فقط
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('remaining')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterMode === 'remaining' ? 'bg-amber-600 text-white' : 'hover:bg-rawaa-soft text-rawaa-muted'
            }`}
          >
            المتبقي للتحضير
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterMode === 'completed' ? 'bg-emerald-600 text-white' : 'hover:bg-rawaa-soft text-rawaa-muted'
            }`}
          >
            المكتمل
          </button>
        </div>

        <p className="text-xs text-rawaa-muted hidden sm:block">
          {currentCategory?.description}
        </p>
      </div>
    </>
  );
}

