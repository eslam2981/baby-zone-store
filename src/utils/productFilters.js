// Pure domain logic for catalog searching, multi-criteria filtering, and sorting

export function countActiveFilters({
  searchQuery = '',
  selectedCategory = 'all',
  selectedSubcategory = null,
  priceRange = [0, 3500],
  selectedBrand = 'all',
  selectedAge = 'all',
  onlyInStock = false,
  onlyDiscounted = false,
  onlyOrganic = false
}) {
  let count = 0;
  if (searchQuery.trim()) count++;
  if (selectedCategory !== 'all') count++;
  if (selectedSubcategory) count++;
  if (priceRange[0] > 0 || priceRange[1] < 3500) count++;
  if (selectedBrand !== 'all') count++;
  if (selectedAge !== 'all') count++;
  if (onlyInStock) count++;
  if (onlyDiscounted) count++;
  if (onlyOrganic) count++;
  return count;
}

export function filterAndSortProducts(allProducts = [], filters = {}) {
  const {
    searchQuery = '',
    selectedCategory = 'all',
    selectedSubcategory = null,
    priceRange = [0, 3500],
    selectedBrand = 'all',
    selectedAge = 'all',
    onlyInStock = false,
    onlyDiscounted = false,
    onlyOrganic = false,
    sortBy = 'popularity'
  } = filters;

  let result = [...allProducts];

  // Search query filter
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    result = result.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.shortDesc && p.shortDesc.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (selectedCategory && selectedCategory !== 'all') {
    if (selectedCategory === 'offers') {
      result = result.filter((p) => (p.discountPercent || 0) > 0 || p.isBestSeller || p.id === 'prod-bundle-package-05');
    } else {
      // Exclude bundle package from regular individual product categories (e.g. bedding)
      result = result.filter((p) => p.category === selectedCategory && p.id !== 'prod-bundle-package-05');
    }
  } else {
    // In 'all' category default view, exclude bundle package unless specifically searched for
    const hasSearch = searchQuery && searchQuery.trim().length > 0;
    if (!hasSearch) {
      result = result.filter((p) => p.id !== 'prod-bundle-package-05');
    }
  }

  // Subcategory filter
  if (selectedSubcategory) {
    result = result.filter((p) => p.subcategory === selectedSubcategory);
  }

  // Price range filter
  if (Array.isArray(priceRange) && priceRange.length === 2) {
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
  }

  // Brand filter
  if (selectedBrand && selectedBrand !== 'all') {
    result = result.filter((p) => p.brand === selectedBrand);
  }

  // Age group filter
  if (selectedAge && selectedAge !== 'all') {
    result = result.filter(
      (p) =>
        (p.ageGroup && p.ageGroup.includes(selectedAge)) ||
        (selectedAge && selectedAge.includes(p.ageGroup))
    );
  }

  // Inventory & promotional flags
  if (onlyInStock) {
    result = result.filter((p) => p.inStock);
  }
  if (onlyDiscounted) {
    result = result.filter((p) => (p.discountPercent || 0) > 0);
  }
  if (onlyOrganic) {
    result = result.filter((p) => p.isOrganic);
  }

  // Sorting
  switch (sortBy) {
    case 'price-low':
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-high':
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'rating':
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'newest':
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    case 'popularity':
    default:
      result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      break;
  }

  return result;
}
