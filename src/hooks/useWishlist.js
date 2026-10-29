import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';

export function useWishlist(addToast) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to persist wishlist to storage:', e);
    }
  }, [wishlist]);

  const toggleWishlist = useCallback((product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      if (addToast) {
        addToast(`تمت إزالة «${product.name.substring(0, 25)}» من المفضلة`, 'info');
      }
    } else {
      setWishlist((prev) => [...prev, product]);
      if (addToast) {
        addToast(`أضيف «${product.name.substring(0, 25)}» إلى المفضلة`, 'success');
      }
    }
  }, [wishlist, addToast]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some((item) => item.id === productId);
  }, [wishlist]);

  return {
    wishlist,
    setWishlist,
    toggleWishlist,
    isInWishlist
  };
}
