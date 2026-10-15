// Global store context provider managing cart wishlist authentication and filters
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { products as initialProducts } from '../data/products';
import { categories } from '../data/categories';

const ShopContext = createContext(null);

const CURRENCIES = {
  EGP: { code: 'EGP', symbol: 'ج.م', rate: 1, name: 'جنيه مصري' }
};

const FREE_SHIPPING_LIMIT_SAR = 1000;

export function ShopProvider({ children }) {
  // Persisted cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('rawaa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persisted wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('rawaa_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Egyptian pound currency state
  const [currencyCode, setCurrencyCode] = useState('EGP');

  // Persisted user authentication state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rawaa_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // UI state for modals and slide drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Notification alerts queue
  const [toasts, setToasts] = useState([]);

  // Product catalog search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 3500]);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedAge, setSelectedAge] = useState('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');

  // Synchronize cart state with local storage
  useEffect(() => {
    try {
      localStorage.setItem('rawaa_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('rawaa_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('rawaa_currency', currencyCode);
    } catch (e) {
      console.error(e);
    }
  }, [currencyCode]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('rawaa_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('rawaa_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Helper methods for managing notification toasts
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Currency formatting helper functions
  const currentCurrency = CURRENCIES.EGP;

  const formatPrice = (price) => {
    const val = typeof price === 'number' ? Math.round(price) : 0;
    return `${val.toLocaleString('ar-EG')} ج.م`;
  };

  const convertPriceNumber = (price) => {
    return typeof price === 'number' ? Math.round(price) : 0;
  };

  // Cart item modification handlers
  const addToCart = (product, quantity = 1, selectedColor = null) => {
    const colorKey = selectedColor ? selectedColor.name : 'default';
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.colorKey === colorKey
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            selectedColor: selectedColor || (product.colors && product.colors[0]) || null,
            colorKey
          }
        ];
      }
    });

    addToast(`تمت إضافة «${product.name.substring(0, 32)}...» إلى سلة التسوق`);
  };

  const removeFromCart = (productId, colorKey) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.colorKey === colorKey)));
    addToast('تم حذف المنتج من السلة', 'info');
  };

  const updateQuantity = (productId, colorKey, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.colorKey === colorKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
    addToast('تم إفراغ سلة التسوق', 'info');
  };

  // Computed totals and free shipping indicators for cart
  const cartTotalSAR = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartOriginalTotalSAR = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (item.product.originalPrice || item.product.price) * item.quantity,
      0
    );
  }, [cart]);

  const cartSavingsSAR = cartOriginalTotalSAR - cartTotalSAR;

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const freeShippingRemainingSAR = Math.max(0, FREE_SHIPPING_LIMIT_SAR - cartTotalSAR);
  const freeShippingProgress = Math.min(100, Math.round((cartTotalSAR / FREE_SHIPPING_LIMIT_SAR) * 100));

  // Wishlist toggle and membership checks
  const toggleWishlist = (product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      addToast(`تمت إزالة «${product.name.substring(0, 25)}» من المفضلة`, 'info');
    } else {
      setWishlist((prev) => [...prev, product]);
      addToast(`أضيف «${product.name.substring(0, 25)}» إلى المفضلة ❤️`, 'success');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Reset all search and filter values to initial defaults
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSubcategory(null);
    setPriceRange([0, 3500]);
    setSelectedBrand('all');
    setSelectedAge('all');
    setOnlyInStock(false);
    setOnlyDiscounted(false);
    setOnlyOrganic(false);
    setSortBy('popularity');
    addToast('تمت إعادة تعيين جميع الفلاتر', 'info');
  };

  // Calculated count of active search and filter constraints
  const activeFiltersCount = useMemo(() => {
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

  // Filter and sort products according to user selections
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter products by search query across multiple fields
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.shortDesc.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q)
      );
    }

    // Filter products by selected category
    if (selectedCategory && selectedCategory !== 'all') {
      if (selectedCategory === 'offers') {
        result = result.filter((p) => p.discountPercent > 0 || p.isBestSeller);
      } else {
        result = result.filter((p) => p.category === selectedCategory);
      }
    }

    // Filter products by selected subcategory
    if (selectedSubcategory) {
      result = result.filter((p) => p.subcategory === selectedSubcategory);
    }

    // Filter products within selected price range
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Filter products by selected brand
    if (selectedBrand !== 'all') {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // Filter products by targeted child age group
    if (selectedAge !== 'all') {
      result = result.filter((p) => p.ageGroup.includes(selectedAge) || selectedAge.includes(p.ageGroup));
    }

    // Filter products by inventory and promotional flags
    if (onlyInStock) {
      result = result.filter((p) => p.inStock);
    }
    if (onlyDiscounted) {
      result = result.filter((p) => p.discountPercent > 0);
    }
    if (onlyOrganic) {
      result = result.filter((p) => p.isOrganic);
    }

    // Sort products by selected ordering criteria
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'popularity':
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return result;
  }, [
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

  // User login and logout handlers
  const login = (email, name) => {
    const newUser = { email, name: name || 'أم ريان', loggedInAt: new Date().toISOString() };
    setUser(newUser);
    setIsAuthOpen(false);
    addToast(`مرحباً بك مجدداً يا ${newUser.name}!`, 'success');
  };

  const logout = () => {
    setUser(null);
    addToast('تم تسجيل الخروج بنجاح', 'info');
  };

  const value = {
    // Product catalog data
    allProducts: initialProducts,
    products: filteredProducts,
    categories,
    // Shopping cart state and methods
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotalSAR,
    cartOriginalTotalSAR,
    cartSavingsSAR,
    cartCount,
    freeShippingRemainingSAR,
    freeShippingProgress,
    FREE_SHIPPING_LIMIT_SAR,
    // Wishlist state and methods
    wishlist,
    toggleWishlist,
    isInWishlist,
    // Egyptian pound currency settings and formatters
    currencies: CURRENCIES,
    currencyCode,
    setCurrencyCode,
    currentCurrency,
    formatPrice,
    convertPriceNumber,
    // Modal visibility states and triggers
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isAuthOpen,
    setIsAuthOpen,
    isMobileNavOpen,
    setIsMobileNavOpen,
    quickViewProduct,
    setQuickViewProduct,
    // Toast notification queue and controls
    toasts,
    addToast,
    removeToast,
    // Catalog filters and active query state
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
    // User authentication state and session handlers
    user,
    login,
    logout
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
