import { useState, useEffect, useMemo } from 'react';
import { CHECKLIST_CATEGORIES } from '../data/hospitalBagData';
import { STORAGE_KEYS } from '../constants/storageKeys';

const DEFAULT_INITIAL_CHECKS = ['b1', 'b2', 'm1'];

export function useHospitalBag(addToast) {
  const [activeTab, setActiveTab] = useState('baby_first');
  const [filterMode, setFilterMode] = useState('all');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Local storage persisted set of checked item IDs
  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOSPITAL_BAG);
      return saved ? JSON.parse(saved) : DEFAULT_INITIAL_CHECKS;
    } catch {
      return DEFAULT_INITIAL_CHECKS;
    }
  });

  // Save checklist selections on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOSPITAL_BAG, JSON.stringify(checkedItems));
    } catch (e) {
      console.error('Failed to save hospital bag state:', e);
    }
  }, [checkedItems]);

  // Smooth scroll to top when switching checklist sections
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Calculate totals and checklist completion metrics
  const allItems = useMemo(() => CHECKLIST_CATEGORIES.flatMap((c) => c.items), []);
  const totalCount = allItems.length;
  const completedCount = useMemo(
    () => allItems.filter((i) => checkedItems.includes(i.id)).length,
    [allItems, checkedItems]
  );
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Toggle individual item checkbox
  const handleToggleItem = (itemId) => {
    if (checkedItems.includes(itemId)) {
      setCheckedItems((prev) => prev.filter((id) => id !== itemId));
    } else {
      setCheckedItems((prev) => [...prev, itemId]);
      if (addToast) {
        addToast('أحسنتِ! تم تحديد الغرض كجاهز في حقيبتك', 'success');
      }
    }
  };

  const handleConfirmReset = () => {
    setCheckedItems([]);
    setIsResetConfirmOpen(false);
    if (addToast) {
      addToast('تمت إعادة تعيين القائمة بنجاح', 'info');
    }
  };

  const currentCategory = useMemo(
    () => CHECKLIST_CATEGORIES.find((c) => c.id === activeTab) || CHECKLIST_CATEGORIES[0],
    [activeTab]
  );

  // Filter items in active category by user mode
  const filteredItems = useMemo(() => {
    return currentCategory.items.filter((item) => {
      const isChecked = checkedItems.includes(item.id);
      if (filterMode === 'essential') return item.importance === 'essential';
      if (filterMode === 'completed') return isChecked;
      if (filterMode === 'remaining') return !isChecked;
      return true;
    });
  }, [currentCategory, filterMode, checkedItems]);

  return {
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
  };
}

