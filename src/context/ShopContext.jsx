import { createContext, useContext, useMemo } from 'react';
import { useToasts } from '../hooks/useToasts';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useCatalog } from '../hooks/useCatalog';
import { useShopFilters } from '../hooks/useShopFilters';
import { useCustomerAuth } from '../hooks/useCustomerAuth';
import { useShopUi } from '../hooks/useShopUi';
import { useStoreSettings } from '../hooks/useStoreSettings';

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const { toasts, addToast, removeToast } = useToasts();
  const shopUi = useShopUi();
  const cartState = useCart(addToast);
  const wishlistState = useWishlist(addToast);
  const catalogState = useCatalog(addToast);
  const filterState = useShopFilters(catalogState.allProducts, addToast);
  const settingsState = useStoreSettings();
  const authState = useCustomerAuth({
    addToast,
    setIsAuthOpen: shopUi.setIsAuthOpen,
    setCart: cartState.setCart,
    setWishlist: wishlistState.setWishlist
  });

  const value = useMemo(() => ({
    // Toast notifications
    toasts,
    addToast,
    removeToast,
    // Catalog
    allProducts: catalogState.allProducts,
    setAllProducts: catalogState.setAllProducts,
    isLoadingProducts: catalogState.isLoadingProducts,
    categories: catalogState.categories,
    setCategoriesList: catalogState.setCategoriesList,
    addProduct: catalogState.addProduct,
    updateProduct: catalogState.updateProduct,
    deleteProduct: catalogState.deleteProduct,
    updateProductStock: catalogState.updateProductStock,
    addCategory: catalogState.addCategory,
    updateCategory: catalogState.updateCategory,
    deleteCategory: catalogState.deleteCategory,
    // Filtered products & filters state
    products: filterState.filteredProducts,
    searchQuery: filterState.searchQuery,
    setSearchQuery: filterState.setSearchQuery,
    selectedCategory: filterState.selectedCategory,
    setSelectedCategory: filterState.setSelectedCategory,
    selectedSubcategory: filterState.selectedSubcategory,
    setSelectedSubcategory: filterState.setSelectedSubcategory,
    priceRange: filterState.priceRange,
    setPriceRange: filterState.setPriceRange,
    selectedBrand: filterState.selectedBrand,
    setSelectedBrand: filterState.setSelectedBrand,
    selectedAge: filterState.selectedAge,
    setSelectedAge: filterState.setSelectedAge,
    onlyInStock: filterState.onlyInStock,
    setOnlyInStock: filterState.setOnlyInStock,
    onlyDiscounted: filterState.onlyDiscounted,
    setOnlyDiscounted: filterState.setOnlyDiscounted,
    onlyOrganic: filterState.onlyOrganic,
    setOnlyOrganic: filterState.setOnlyOrganic,
    sortBy: filterState.sortBy,
    setSortBy: filterState.setSortBy,
    clearAllFilters: filterState.clearAllFilters,
    activeFiltersCount: filterState.activeFiltersCount,
    // Cart
    cart: cartState.cart,
    setCart: cartState.setCart,
    addToCart: cartState.addToCart,
    removeFromCart: cartState.removeFromCart,
    updateQuantity: cartState.updateQuantity,
    clearCart: cartState.clearCart,
    cartTotalSAR: cartState.cartTotalSAR,
    cartOriginalTotalSAR: cartState.cartOriginalTotalSAR,
    cartSavingsSAR: cartState.cartSavingsSAR,
    cartCount: cartState.cartCount,
    freeShippingRemainingSAR: cartState.freeShippingRemainingSAR,
    freeShippingProgress: cartState.freeShippingProgress,
    FREE_SHIPPING_LIMIT_SAR: cartState.FREE_SHIPPING_LIMIT_SAR,
    // Wishlist
    wishlist: wishlistState.wishlist,
    setWishlist: wishlistState.setWishlist,
    toggleWishlist: wishlistState.toggleWishlist,
    isInWishlist: wishlistState.isInWishlist,
    // UI & Currency
    currencies: shopUi.currencies,
    currencyCode: shopUi.currencyCode,
    setCurrencyCode: shopUi.setCurrencyCode,
    currentCurrency: shopUi.currentCurrency,
    formatPrice: shopUi.formatPrice,
    convertPriceNumber: shopUi.convertPriceNumber,
    isCartOpen: shopUi.isCartOpen,
    setIsCartOpen: shopUi.setIsCartOpen,
    isWishlistOpen: shopUi.isWishlistOpen,
    setIsWishlistOpen: shopUi.setIsWishlistOpen,
    isAuthOpen: shopUi.isAuthOpen,
    setIsAuthOpen: shopUi.setIsAuthOpen,
    isMobileNavOpen: shopUi.isMobileNavOpen,
    setIsMobileNavOpen: shopUi.setIsMobileNavOpen,
    quickViewProduct: shopUi.quickViewProduct,
    setQuickViewProduct: shopUi.setQuickViewProduct,
    // Store Global Settings
    storeSettings: settingsState.storeSettings,
    setStoreSettings: settingsState.setStoreSettings,
    isLoadingSettings: settingsState.isLoadingSettings,
    // Auth & Permissions
    user: authState.user,
    setUser: authState.setUser,
    login: authState.login,
    logout: authState.logout,
    hasPermission: authState.hasPermission
  }), [
    toasts,
    addToast,
    removeToast,
    catalogState,
    filterState,
    cartState,
    wishlistState,
    shopUi,
    settingsState,
    authState
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
