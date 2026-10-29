import { useState, useCallback, useMemo } from 'react';
import { countActiveFilters, filterAndSortProducts } from '../utils/productFilters';

const DEFAULT_PRICE_RANGE = [0, 3500];

export function useShopFilters(allProducts = [], addToast) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedAge, setSelectedAge] = useState('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSubcategory(null);
    setPriceRange(DEFAULT_PRICE_RANGE);
    setSelectedBrand('all');
    setSelectedAge('all');
    setOnlyInStock(false);
    setOnlyDiscounted(false);
    setOnlyOrganic(false);
    setSortBy('popularity');
    if (addToast) {
      addToast('تمت إعادة تعيين جميع الفلاتر', 'info');
    }
  }, [addToast]);

  const activeFiltersCount = useMemo(() => {
    return countActiveFilters({
      searchQuery,
      selectedCategory,
      selectedSubcategory,
      priceRange,
      selectedBrand,
      selectedAge,
      onlyInStock,
      onlyDiscounted,
      onlyOrganic
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    priceRange,
    selectedBrand,
    selectedAge,
    onlyInStock,
    onlyDiscounted,
    onlyOrganic
  ]);

  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(allProducts, {
      searchQuery,
      selectedCategory,
      selectedSubcategory,
      priceRange,
      selectedBrand,
      selectedAge,
      onlyInStock,
      onlyDiscounted,
      onlyOrganic,
      sortBy
    });
  }, [
    allProducts,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    priceRange,
    selectedBrand,
    selectedAge,
    onlyInStock,
    onlyDiscounted,
    onlyOrganic,
    sortBy
  ]);

  return {
    searchQuery,
    setSearchQuery,
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
    sortBy,
    setSortBy,
    clearAllFilters,
    activeFiltersCount,
    filteredProducts
  };
}
