import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { productsApi, categoriesApi, customersApi } from '../services/api';
import { DEFAULT_CUSTOMER_PERMISSIONS } from '../constants/permissions';
import { CURRENCIES, formatPrice, convertPriceNumber } from '../utils/formatters';
import { calculateCartTotals, DEFAULT_FREE_SHIPPING_LIMIT } from '../utils/cartCalculations';
import { filterAndSortProducts, countActiveFilters } from '../utils/productFilters';
import { useToasts } from '../hooks/useToasts';
import { DEFAULT_CATALOG_CATEGORIES, mergeCategoriesWithLive } from '../data/categories';
import { syncBus } from '../utils/syncBus';

const ShopContext = createContext(null);

const FREE_SHIPPING_LIMIT_SAR = DEFAULT_FREE_SHIPPING_LIMIT;

export function ShopProvider({ children }) {
  // Product catalog state - strictly server-driven
  const [allProducts, setAllProducts] = useState([]);

  // Categories list state - master catalog with live Supabase categories + roadmap Coming Soon categories
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATALOG_CATEGORIES);

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Toast notification system
  const { toasts, addToast, removeToast } = useToasts(3800);

  // Initial fetch and real-time synchronization from Supabase server
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoadingProducts(true);
        const [catData, prodData] = await Promise.all([
          categoriesApi.getAll(),
          productsApi.getAll()
        ]);

        if (isMounted) {
          if (Array.isArray(catData)) {
            setCategoriesList(mergeCategoriesWithLive(catData));
          }
          if (Array.isArray(prodData)) {
            setAllProducts(prodData);
          }
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      } finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    }
    loadData();

    // Real-time synchronization for products
    const prodChannel = supabase
      .channel('realtime_products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAllProducts((prev) => [payload.new, ...prev.filter((p) => p.id !== payload.new.id)]);
          } else if (payload.eventType === 'UPDATE') {
            setAllProducts((prev) => prev.map((p) => (p.id === payload.new.id ? payload.new : p)));
          } else if (payload.eventType === 'DELETE') {
            setAllProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Real-time synchronization for categories
    const catChannel = supabase
      .channel('realtime_categories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        async () => {
          try {
            const freshCats = await categoriesApi.getAll();
            if (isMounted && Array.isArray(freshCats)) {
              setCategoriesList(mergeCategoriesWithLive(freshCats));
            }
          } catch (e) {
            console.error('Real-time categories update error:', e);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(prodChannel);
      supabase.removeChannel(catChannel);
    };
  }, []);

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

  // Currency state
  const [currencyCode, setCurrencyCode] = useState('EGP');

  // Persisted customer authentication state (admin state is strictly session-based and never stored in localStorage)
  const [user, setUser] = useState(() => {
    try {
      // Check session storage first if admin is authenticated in current tab
      const isSessionAdmin = sessionStorage.getItem('babyzone_admin_auth') === 'true';
      if (isSessionAdmin) {
        const adminData = sessionStorage.getItem('babyzone_admin_user');
        if (adminData) {
          const parsedAdmin = JSON.parse(adminData);
          return {
            ...parsedAdmin,
            isAdmin: true,
            loggedInAt: new Date().toISOString()
          };
        }
      }

      const saved = localStorage.getItem('rawaa_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.isAdmin) {
          localStorage.removeItem('rawaa_user');
          return null;
        }
        return parsed;
      }
      return null;
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
        if (user.isAdmin) {
          // Sensitive administrative accounts must NEVER be persisted to localStorage
          localStorage.removeItem('rawaa_user');
        } else {
          // Only safe non-sensitive customer metadata is persisted
          const safeCustomer = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            city: user.city || 'القاهرة',
            address: user.address || '',
            role: user.role || 'customer',
            isVip: Boolean(user.isVip)
          };
          localStorage.setItem('rawaa_user', JSON.stringify(safeCustomer));
        }
      } else {
        localStorage.removeItem('rawaa_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Real-time customer session termination when account is deleted from admin dashboard
  useEffect(() => {
    // 1. Instant intra-app & cross-tab syncBus notification
    const unsubDelete = syncBus.on('CUSTOMER_DELETED', ({ customerId, email, phone }) => {
      if (!user || user.isAdmin) return;
      const cleanEmail = email ? email.toLowerCase().trim() : '';
      const userEmail = user.email ? user.email.toLowerCase().trim() : '';
      const matchId = customerId && user.id === customerId;
      const matchEmail = cleanEmail && userEmail && cleanEmail === userEmail;
      const matchPhone = phone && user.phone && phone === user.phone;

      if (matchId || matchEmail || matchPhone) {
        setUser(null);
        try {
          localStorage.removeItem('rawaa_user');
          sessionStorage.removeItem('babyzone_admin_auth');
          sessionStorage.removeItem('babyzone_admin_user');
        } catch {}
        addToast('تم حذف حسابك وإنهاء الجلسة من قِبل إدارة المتجر', 'warning');
      }
    });

    // 2. Real-time Supabase websocket listener on customers table
    const custChannel = supabase
      .channel('realtime_customer_deletion_guard')
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'customers' },
        (payload) => {
          if (!user || user.isAdmin) return;
          const old = payload.old;
          if (!old) return;
          const userEmail = user.email ? user.email.toLowerCase().trim() : '';
          const matchId = old.id && user.id === old.id;
          const matchEmail = old.email && userEmail && old.email.toLowerCase().trim() === userEmail;
          const matchPhone = old.phone && user.phone && old.phone === user.phone;

          if (matchId || matchEmail || matchPhone) {
            setUser(null);
            try {
              localStorage.removeItem('rawaa_user');
            } catch {}
            addToast('تم حذف حسابك وإنهاء الجلسة من قِبل إدارة المتجر', 'warning');
          }
        }
      )
      .subscribe();

    // 3. Database session integrity check on mount/user change
    if (user && !user.isAdmin && (user.id || user.email)) {
      customersApi
        .findByEmailOrPhone(user.email, user.phone)
        .then((existing) => {
          if (!existing) {
            setUser(null);
            try {
              localStorage.removeItem('rawaa_user');
            } catch {}
          }
        })
        .catch(() => {});
    }

    return () => {
      unsubDelete();
      supabase.removeChannel(custChannel);
    };
  }, [user, addToast]);

  // Currency formatting helper functions
  const currentCurrency = CURRENCIES.EGP;

  // Cart item modification handlers
  const addToCart = useCallback((product, quantity = 1, selectedColor = null) => {
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
  }, [addToast]);

  const removeFromCart = useCallback((productId, colorKey) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.colorKey === colorKey)));
    addToast('تم حذف المنتج من السلة', 'info');
  }, [addToast]);

  const updateQuantity = useCallback((productId, colorKey, delta) => {
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
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    addToast('تم إفراغ سلة التسوق', 'info');
  }, [addToast]);

  // Computed cart metrics delegated to pure cartCalculations utility
  const {
    cartTotalSAR,
    cartOriginalTotalSAR,
    cartSavingsSAR,
    cartCount,
    freeShippingRemainingSAR,
    freeShippingProgress
  } = useMemo(() => {
    return calculateCartTotals(cart, FREE_SHIPPING_LIMIT_SAR);
  }, [cart]);

  // Wishlist toggle and membership checks
  const toggleWishlist = useCallback((product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      addToast(`تمت إزالة «${product.name.substring(0, 25)}» من المفضلة`, 'info');
    } else {
      setWishlist((prev) => [...prev, product]);
      addToast(`أضيف «${product.name.substring(0, 25)}» إلى المفضلة`, 'success');
    }
  }, [wishlist, addToast]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some((item) => item.id === productId);
  }, [wishlist]);

  // Reset all search and filter values to initial defaults
  const clearAllFilters = useCallback(() => {
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
  }, [addToast]);

  // Calculated count of active search and filter constraints
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

  // Filter and sort products according to user selections (delegated to pure utility)
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

  // Administrative product management methods
  const addProduct = useCallback(async (productData) => {
    const newProduct = {
      ...productData,
      id: productData.id || `p${Date.now()}`,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 1,
      inStock: (productData.stockCount || 0) > 0,
      gallery: productData.gallery && productData.gallery.length > 0 ? productData.gallery : [productData.mainImage]
    };
    setAllProducts((prev) => [newProduct, ...prev]);
    addToast(`تم إضافة المنتج «${newProduct.name.substring(0, 25)}...» بنجاح`, 'success');

    try {
      await productsApi.create(newProduct);
    } catch (e) {
      console.error('API product insert error:', e);
    }
    return newProduct;
  }, [addToast]);

  const updateProduct = useCallback(async (productId, updatedData) => {
    setAllProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = { ...p, ...updatedData };
          if (typeof updatedData.stockCount === 'number') {
            updated.inStock = updatedData.stockCount > 0;
          }
          return updated;
        }
        return p;
      })
    );
    addToast('تم تحديث بيانات المنتج بنجاح', 'success');

    try {
      await productsApi.update(productId, updatedData);
    } catch (e) {
      console.error('API product update error:', e);
    }
  }, [addToast]);

  const deleteProduct = useCallback(async (productId) => {
    setAllProducts((prev) => prev.filter((p) => p.id !== productId));
    addToast('تم حذف المنتج بنجاح', 'info');

    try {
      await productsApi.delete(productId);
    } catch (e) {
      console.error('API product delete error:', e);
    }
  }, [addToast]);

  const updateProductStock = useCallback(async (productId, newStock) => {
    const inStock = newStock > 0;
    setAllProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockCount: Math.max(0, newStock), inStock } : p))
    );
    try {
      await productsApi.updateStock(productId, Math.max(0, newStock));
    } catch (e) {
      console.error('API stock update error:', e);
    }
  }, []);

  // Administrative category management methods
  const addCategory = useCallback(async (catData) => {
    const newCat = {
      ...catData,
      id: catData.id || `cat-${Date.now()}`,
      slug: catData.slug || catData.id || `cat-${Date.now()}`
    };
    setCategoriesList((prev) => [...prev, newCat]);
    addToast(`تم إضافة قسم «${newCat.name}» بنجاح`, 'success');

    try {
      await categoriesApi.create(newCat);
    } catch (e) {
      console.error('API category insert error:', e);
    }
  }, [addToast]);

  const updateCategory = useCallback(async (categoryId, updatedData) => {
    setCategoriesList((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, ...updatedData } : c))
    );
    addToast('تم تحديث بيانات القسم بنجاح', 'success');

    try {
      await categoriesApi.update(categoryId, updatedData);
    } catch (e) {
      console.error('API category update error:', e);
    }
  }, [addToast]);

  const deleteCategory = useCallback(async (categoryId) => {
    setCategoriesList((prev) => prev.filter((c) => c.id !== categoryId));
    addToast('تم حذف القسم بنجاح', 'info');

    try {
      await categoriesApi.delete(categoryId);
    } catch (e) {
      console.error('API category delete error:', e);
    }
  }, [addToast]);

  // Server-driven user login and customer permissions synchronized with Supabase
  const login = useCallback(async (email, name, extraData = {}) => {
    const cleanEmail = email?.trim()?.toLowerCase() || '';
    const isAdminEmail = cleanEmail === 'admin@babyzone-egypt.com';
    const fallbackName = isAdminEmail
      ? 'إسلام جميل'
      : (cleanEmail ? cleanEmail.split('@')[0] : 'عميل بيبي زون');
    const displayName = (name && name.trim()) ? name.trim() : fallbackName;

    if (extraData?.isAdmin || isAdminEmail) {
      const adminUser = {
        email: cleanEmail,
        name: extraData.name || displayName || (isAdminEmail ? 'إسلام جميل' : 'مشرف إداري'),
        isAdmin: true,
        role: extraData.role || (isAdminEmail ? 'super_admin' : 'admin'),
        permissions: extraData.permissions || (isAdminEmail ? ['*'] : ['all']),
        loggedInAt: new Date().toISOString()
      };
      setUser(adminUser);
      setIsAuthOpen(false);
      addToast(`مرحباً بك يا ${adminUser.name}!`, 'success');
      return adminUser;
    }

    try {
      const { data: dbCust } = await supabase
        .from('customers')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (dbCust) {
        if (dbCust.status === 'محظور') {
          addToast('عذراً، هذا الحساب محظور حالياً من قبل الإدارة', 'error');
          return null;
        }

        const isVip = Boolean(dbCust.is_vip || dbCust.role === 'vip_customer');
        const loggedUser = {
          id: dbCust.id,
          email: cleanEmail,
          name: dbCust.name || displayName,
          phone: dbCust.phone || extraData.phone || '',
          city: dbCust.city || extraData.city || 'القاهرة',
          address: dbCust.address || extraData.address || '',
          role: dbCust.role || (isVip ? 'vip_customer' : 'customer'),
          isVip,
          permissions: Array.isArray(dbCust.permissions) && dbCust.permissions.length > 0
            ? dbCust.permissions
            : ['view_catalog', 'place_orders', 'view_own_orders', 'rate_products', 'hospital_bag'],
          isAdmin: false,
          loggedInAt: new Date().toISOString()
        };

        setUser(loggedUser);
        setIsAuthOpen(false);
        addToast(`مرحباً بعودتك يا ${loggedUser.name}!`, 'success');
        return loggedUser;
      } else {
        const newId = `cust-${Date.now()}`;
        const newCustRecord = {
          id: newId,
          name: displayName,
          email: cleanEmail,
          phone: extraData.phone || '',
          city: extraData.city || 'القاهرة',
          address: extraData.address || '',
          role: 'customer',
          permissions: DEFAULT_CUSTOMER_PERMISSIONS,
          is_vip: false,
          status: 'نشط',
          orders_count: 0,
          total_spent: 0
        };

        try {
          await customersApi.create(newCustRecord);
        } catch (err) {
          console.warn('Customer auto-provision notice:', err);
        }

        const createdUser = {
          ...newCustRecord,
          isAdmin: false,
          loggedInAt: new Date().toISOString()
        };
        setUser(createdUser);
        setIsAuthOpen(false);
        addToast(`مرحباً بكِ في بيبي زون يا ${createdUser.name}!`, 'success');
        return createdUser;
      }
    } catch (err) {
      console.error('Server login error:', err);
      const fallbackUser = {
        email: cleanEmail,
        name: displayName,
        isAdmin: false,
        role: 'customer',
        permissions: ['view_catalog', 'place_orders', 'view_own_orders', 'rate_products', 'hospital_bag'],
        loggedInAt: new Date().toISOString()
      };
      setUser(fallbackUser);
      setIsAuthOpen(false);
      addToast(`مرحباً بك يا ${fallbackUser.name}!`, 'success');
      return fallbackUser;
    }
  }, [addToast]);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.isAdmin || user.permissions?.includes('*')) return true;
    return Boolean(user.permissions?.includes(permission));
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem('rawaa_user');
      localStorage.removeItem('babyzone_admin_auth');
      localStorage.removeItem('babyzone_admin_user');
      localStorage.removeItem('babyzone_admins_list');
      localStorage.removeItem('babyzone_activity_log');
      localStorage.removeItem('babyzone_admin_coupons');
      localStorage.removeItem('babyzone_admin_customers');
      sessionStorage.removeItem('babyzone_admin_auth');
      sessionStorage.removeItem('babyzone_admin_user');
    } catch {}
    addToast('تم تسجيل الخروج بنجاح', 'info');
  }, [addToast]);

  const value = {
    // Product catalog data
    allProducts,
    setAllProducts,
    isLoadingProducts,
    products: filteredProducts,
    categories: categoriesList,
    setCategoriesList,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    addCategory,
    updateCategory,
    deleteCategory,
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
    setUser,
    login,
    logout,
    hasPermission
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
