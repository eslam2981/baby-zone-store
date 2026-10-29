import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { productsApi, categoriesApi } from '../services/api';
import { DEFAULT_CATALOG_CATEGORIES, mergeCategoriesWithLive } from '../data/categories';
import { syncBus } from '../utils/syncBus';

export function useCatalog(addToast) {
  const [allProducts, setAllProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATALOG_CATEGORIES);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let channel = null;
    let reconnectTimeout = null;

    async function loadData() {
      try {
        setIsLoadingProducts(true);
        const [catResult, prodResult] = await Promise.allSettled([
          categoriesApi.getAll(),
          productsApi.getAll()
        ]);

        if (isMounted) {
          if (catResult.status === 'fulfilled' && Array.isArray(catResult.value)) {
            setCategoriesList(mergeCategoriesWithLive(catResult.value));
          }
          if (prodResult.status === 'fulfilled' && Array.isArray(prodResult.value)) {
            setAllProducts(prodResult.value);
          }
        }
      } catch (err) {
        console.error('Error fetching catalog data from Supabase:', err);
      } finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    }
    loadData();

    function setupCatalogRealtime() {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.warn('Realtime catalog channel cleanup notice:', e);
        }
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
      } catch (e) {
        console.warn('Sync categories error:', e);
      }
    });

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
    if (addToast) {
      addToast(`تم إضافة المنتج «${newProduct.name.substring(0, 25)}...» بنجاح`, 'success');
    }
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
    if (addToast) {
      addToast('تم تحديث بيانات المنتج بنجاح', 'success');
    }
    syncBus.emit('PRODUCT_UPDATED', { id: productId, ...updatedData, timestamp: Date.now() });

    try {
      await productsApi.update(productId, updatedData);
    } catch (e) {
      console.error('API product update error:', e);
    }
  }, [addToast]);

  const deleteProduct = useCallback(async (productId) => {
    setAllProducts((prev) => prev.filter((p) => p.id !== productId));
    if (addToast) {
      addToast('تم حذف المنتج بنجاح', 'info');
    }
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

  const addCategory = useCallback(async (catData) => {
    const newCat = {
      ...catData,
      id: catData.id || `cat-${Date.now()}`,
      slug: catData.slug || catData.id || `cat-${Date.now()}`
    };
    setCategoriesList((prev) => [...prev, newCat]);
    if (addToast) {
      addToast(`تم إضافة قسم «${newCat.name}» بنجاح`, 'success');
    }
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
    if (addToast) {
      addToast('تم تحديث بيانات القسم بنجاح', 'success');
    }
    syncBus.emit('CATEGORIES_UPDATED', { timestamp: Date.now() });

    try {
      await categoriesApi.update(categoryId, updatedData);
    } catch (e) {
      console.error('API category update error:', e);
    }
  }, [addToast]);

  const deleteCategory = useCallback(async (categoryId) => {
    setCategoriesList((prev) => prev.filter((c) => c.id !== categoryId));
    if (addToast) {
      addToast('تم حذف القسم بنجاح', 'info');
    }
    syncBus.emit('CATEGORIES_UPDATED', { timestamp: Date.now() });

    try {
      await categoriesApi.delete(categoryId);
    } catch (e) {
      console.error('API category delete error:', e);
    }
  }, [addToast]);

  return {
    allProducts,
    setAllProducts,
    isLoadingProducts,
    categories: categoriesList,
    setCategoriesList,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    addCategory,
    updateCategory,
    deleteCategory
  };
}

