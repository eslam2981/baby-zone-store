import { Lock } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useHospitalBag } from '../hooks/useHospitalBag';
import ConfirmModal from '../components/common/ConfirmModal';
import HospitalBagHero from '../components/hospitalBag/HospitalBagHero';
import HospitalBagProgress from '../components/hospitalBag/HospitalBagProgress';
import HospitalBagCategories from '../components/hospitalBag/HospitalBagCategories';
import HospitalBagItemList from '../components/hospitalBag/HospitalBagItemList';
import HospitalBagSupportBanner from '../components/hospitalBag/HospitalBagSupportBanner';

export default function HospitalBagPage() {
  const { addToast, user, hasPermission } = useShop();
  const isUnlocked = Boolean(user && hasPermission('hospital_bag'));

  const {
    activeTab,
    setActiveTab,
    filterMode,
    setFilterMode,
    checkedItems,
    isResetConfirmOpen,
    setIsResetConfirmOpen,
    totalCount,
    completedCount,
    completionPercentage,
    currentCategory,
    filteredItems,
    handleToggleItem,
    handleConfirmReset
  } = useHospitalBag(addToast);

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 sm:py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero & Announcement */}
        <HospitalBagHero />

        {/* Checklist Section Container */}
        <div className="relative">
          {/* Lock / Unlock badge */}
          {isUnlocked ? (
            <div className="mb-4 inline-flex items-center gap-2 bg-emerald-100 text-emerald-950 border border-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>حاسبة شنطة الولادة التفاعلية مفعلة بالكامل لحسابك ⚡</span>
            </div>
          ) : (
            <div className="mb-4 inline-flex items-center gap-2 bg-amber-100 text-amber-950 border border-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black">
              <Lock size={14} className="text-amber-800" />
              <span>عناصر هذا القسم للعرض الاسترشادي فقط · التفاعل التفاعلي يتطلب صلاحية «حاسبة شنطة المستشفى»</span>
            </div>
          )}

          <div className={`${isUnlocked ? 'space-y-6' : 'opacity-60 pointer-events-none select-none filter grayscale-[15%] space-y-6'}`}>
            {/* Progress meter and action buttons card */}
            <HospitalBagProgress
              completionPercentage={completionPercentage}
              completedCount={completedCount}
              totalCount={totalCount}
              onReset={() => setIsResetConfirmOpen(true)}
            />

            {/* Category tabs & Filter modes bar */}
            <HospitalBagCategories
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filterMode={filterMode}
              setFilterMode={setFilterMode}
              checkedItems={checkedItems}
              currentCategory={currentCategory}
            />

            {/* Checklist items interactive list */}
            <HospitalBagItemList
              filteredItems={filteredItems}
              checkedItems={checkedItems}
              onToggleItem={handleToggleItem}
            />
          </div>
        </div>

        {/* Quality and care banner bottom */}
        <HospitalBagSupportBanner />
      </div>

      {/* Confirmation modal for checklist reset */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="إعادة تعيين القائمة"
        message="هل تودين حقاً إعادة تعيين قائمة حقيبة الولادة والبدء من جديد؟"
        confirmText="نعم، ابدأ من جديد"
        cancelText="إلغاء"
        isDestructive={false}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
