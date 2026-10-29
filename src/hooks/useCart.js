import { useState, useEffect, useCallback, useMemo } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { calculateCartTotals, DEFAULT_FREE_SHIPPING_LIMIT } from '../utils/cartCalculations';

const FREE_SHIPPING_LIMIT_SAR = DEFAULT_FREE_SHIPPING_LIMIT;

export function useCart(addToast) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart to storage:', e);
    }
  }, [cart]);

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
      }
      return [
        ...prev,
        {
          product,
          quantity,
          selectedColor: selectedColor || (product.colors && product.colors[0]) || null,
          colorKey
        }
      ];
    });

    if (addToast) {
      addToast(`تمت إضافة «${product.name.substring(0, 32)}...» إلى سلة التسوق`);
    }
  }, [addToast]);

  const removeFromCart = useCallback((productId, colorKey) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.colorKey === colorKey)));
    if (addToast) {
      addToast('تم حذف المنتج من السلة', 'info');
    }
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

  const clearCart = useCallback((options) => {
    setCart([]);
    const isSilent = typeof options === 'boolean' ? options : Boolean(options?.silent);
    if (!isSilent && addToast) {
      addToast('تم إفراغ سلة التسوق', 'info');
    }
  }, [addToast]);

  const totals = useMemo(() => {
    return calculateCartTotals(cart, FREE_SHIPPING_LIMIT_SAR);
  }, [cart]);

  return {
    cart,
    setCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    FREE_SHIPPING_LIMIT_SAR,
    ...totals
  };
}

