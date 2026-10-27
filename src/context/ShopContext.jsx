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

    // Resilient Real-time synchronization for products and categories with auto-reconnect
    let channel = null;
    let reconnectTimeout = null;

    function setupCatalogRealtime() {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e){console.log(e)}
      }

      channel = supabase
        .channel(`realtime_catalog_hub_${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            if (!isMounted) return;
            if (payload.eventType === 'INSERT') {
              setAllProducts((prev) => [payload.new, ...prev.filter((p) => p.id !== payload.new.id)]);
            } else if (payload.eventType === 'UPDATE') {
              setAllProducts((prev) => prev.map((p) => (p.id === payload.new.id ? payload.new : p)));
            } else if (payload.eventType === 'DELETE') {
              setAllProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
            }
          }
        )
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
              console.warn('Real-time categories update error:', e);
            }
          }
        )
        .subscribe((status, err) => {
          if (!isMounted) return;
          if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn(`Catalog channel ${status}, scheduling reconnect...`, err || '');
            clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(() => {
              if (isMounted) setupCatalogRealtime();
            }, 3500);
          }
        });
    }

    setupCatalogRealtime();

    // Instant cross-tab and local window syncBus listeners for products & categories
    const unsubProdAdd = syncBus.on('PRODUCT_ADDED', ({ product }) => {
      if (product) {
        setAllProducts((prev) => [product, ...prev.filter((p) => p.id !== product.id)]);
      }
    });

    const unsubProdUpd = syncBus.on('PRODUCT_UPDATED', (updated) => {
      if (updated?.id) {
        setAllProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
        );
      }
    });

    const unsubProdDel = syncBus.on('PRODUCT_DELETED', ({ productId }) => {
      if (productId) {
        setAllProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    });

    const unsubStockUpd = syncBus.on('STOCK_UPDATED', ({ productId, stockCount }) => {
      if (productId) {
        const inStock = Number(stockCount) > 0;
        setAllProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stockCount: Number(stockCount), inStock } : p))
        );
      }
    });

    const unsubCatUpd = syncBus.on('CATEGORIES_UPDATED', async () => {
      try {
        const fresh = await categoriesApi.getAll();
        if (isMounted && Array.isArray(fresh)) {
          setCategoriesList(mergeCategoriesWithLive(fresh));
        }
      } catch {}
    });

    // Background catch-up when tab becomes visible
    const handleCatalogVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && isMounted) {
        Promise.allSettled([productsApi.getAll(), categoriesApi.getAll()]).then(([pRes, cRes]) => {
          if (isMounted) {
            if (pRes.status === 'fulfilled' && Array.isArray(pRes.value)) setAllProducts(pRes.value);
            if (cRes.status === 'fulfilled' && Array.isArray(cRes.value)) setCategoriesList(mergeCategoriesWithLive(cRes.value));
          }
        });
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleCatalogVisibility);
    }

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleCatalogVisibility);
      }
      if (channel) {
        supabase.removeChannel(channel);
      }
      unsubProdAdd();
      unsubProdUpd();
      unsubProdDel();
      unsubStockUpd();
      unsubCatUpd();
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
      const matchId = customerId && String(user.id) === String(customerId);
      const matchEmail = cleanEmail && userEmail && cleanEmail === userEmail;
      const matchPhone = phone && user.phone && String(phone).trim() === String(user.phone).trim();

      if (matchId || matchEmail || matchPhone) {
        setUser(null);
        setCart([]);
        setWishlist([]);
        try {
          localStorage.removeItem('rawaa_user');
          localStorage.removeItem('rawaa_cart');
          localStorage.removeItem('rawaa_orders');
          localStorage.removeItem('rawaa_wishlist');
          sessionStorage.removeItem('babyzone_admin_auth');
          sessionStorage.removeItem('babyzone_admin_user');
        } catch {}
        addToast('تم حذف حسابك وسجل مشترياتك وإنهاء الجلسة فوراً من قِبل إدارة المتجر', 'warning');
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
          const matchId = old.id && String(user.id) === String(old.id);
          const matchEmail = old.email && userEmail && old.email.toLowerCase().trim() === userEmail;
          const matchPhone = old.phone && user.phone && String(old.phone).trim() === String(user.phone).trim();

          if (matchId || matchEmail || matchPhone) {
            setUser(null);
            setCart([]);
            setWishlist([]);
            try {
              localStorage.removeItem('rawaa_user');
              localStorage.removeItem('rawaa_cart');
              localStorage.removeItem('rawaa_orders');
              localStorage.removeItem('rawaa_wishlist');
              sessionStorage.removeItem('babyzone_admin_auth');
              sessionStorage.removeItem('babyzone_admin_user');
            } catch {}
            addToast('تم حذف حسابك وسجل مشترياتك وإنهاء الجلسة فوراً من قِبل إدارة المتجر', 'warning');
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
    syncBus.emit('PRODUCT_ADDED', { product: newProduct, timestamp: Date.now() });

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
    syncBus.emit('PRODUCT_UPDATED', { id: productId, ...updatedData, timestamp: Date.now() });

    try {
      await productsApi.update(productId, updatedData);
    } catch (e) {
      console.error('API product update error:', e);
    }
  }, [addToast]);

  const deleteProduct = useCallback(async (productId) => {
    setAllProducts((prev) => prev.filter((p) => p.id !== productId));
    addToast('تم حذف المنتج بنجاح', 'info');
    syncBus.emit('PRODUCT_DELETED', { productId, timestamp: Date.now() });

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
    syncBus.emit('STOCK_UPDATED', { productId, stockCount: Math.max(0, newStock), timestamp: Date.now() });
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
    syncBus.emit('CATEGORIES_UPDATED', { timestamp: Date.now() });

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
    syncBus.emit('CATEGORIES_UPDATED', { timestamp: Date.now() });

    try {
      await categoriesApi.update(categoryId, updatedData);
    } catch (e) {
      console.error('API category update error:', e);
    }
  }, [addToast]);

  const deleteCategory = useCallback(async (categoryId) => {
    setCategoriesList((prev) => prev.filter((c) => c.id !== categoryId));
    addToast('تم حذف القسم بنجاح', 'info');
    syncBus.emit('CATEGORIES_UPDATED', { timestamp: Date.now() });

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

    // 1. Admin login handling
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

    // 2. Customer login & registration flow
    const isRegistration = Boolean(extraData?.isRegistration);

    try {
      const { data: dbCust, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (fetchError) {
        console.warn('Supabase customer fetch notice:', fetchError);
      }

      // Case A: User exists in database
      if (dbCust) {
        if (dbCust.status === 'محظور') {
          const errMsg = 'عذراً، هذا الحساب محظور حالياً من قبل الإدارة';
          addToast(errMsg, 'error');
          return { success: false, error: errMsg };
        }

        // STRICT VALIDATION: If the user is trying to REGISTER with an existing email, PREVENT duplicate registration!
        if (isRegistration) {
          const errMsg = 'هذا البريد الإلكتروني مسجل بالفعل لدينا! ممنوع تكرار التسجيل بنفس الإيميل، يرجى التوجه لتبويب «تسجيل الدخول» أو استخدام بريد آخر.';
          addToast(errMsg, 'warning');
          return { success: false, error: errMsg };
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
            : DEFAULT_CUSTOMER_PERMISSIONS,
          isAdmin: false,
          loggedInAt: new Date().toISOString()
        };

        setUser(loggedUser);
        setIsAuthOpen(false);
        addToast(`مرحباً بعودتك يا ${loggedUser.name}!`, 'success');
        return loggedUser;
      }

      // Case B: User does NOT exist in database and is attempting to LOGIN
      if (!isRegistration) {
        const errMsg = 'هذا الحساب غير مسجل أو تم حذفه من قِبل إدارة المتجر. يمكنك إنشاء حساب جديد من تبويب «إنشاء حساب جديد».';
        addToast(errMsg, 'error');
        return { success: false, error: errMsg };
      }

      // Case C: User is explicitly REGISTERING a new account (email is guaranteed unique!)
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
        console.warn('Customer create notice:', err);
      }

      // "وبعد كده سجل دخول" -> Immediately log in the user with their newly verified account
      const createdUser = {
        ...newCustRecord,
        isAdmin: false,
        loggedInAt: new Date().toISOString()
      };
      setUser(createdUser);
      setIsAuthOpen(false);
      addToast(`مرحباً بكِ في بيبي زون يا ${createdUser.name}! تم إنشاء حسابك وتسجيل دخولك بنجاح`, 'success');
      return createdUser;
    } catch (err) {
      console.error('Server login error:', err);
      const errMsg = isRegistration
        ? (err?.message || 'تعذر إنشاء الحساب، يرجى التحقق من صحة البيانات أو الاتصال بالدعم')
        : 'تعذر تسجيل الدخول، يرجى التحقق من صحة البيانات أو الاتصال بالدعم';
      addToast(errMsg, 'error');
      return { success: false, error: errMsg };
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
