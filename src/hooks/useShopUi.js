import { useState, useEffect } from 'react';
import { CURRENCIES, formatPrice, convertPriceNumber } from '../utils/formatters';
import { STORAGE_KEYS } from '../constants/storageKeys';

export function useShopUi() {
  const [currencyCode, setCurrencyCode] = useState('EGP');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currencyCode);
    } catch (e) {
      console.error('Failed to persist currency code:', e);
    }
  }, [currencyCode]);

  return {
    currencies: CURRENCIES,
    currencyCode,
    setCurrencyCode,
    currentCurrency: CURRENCIES.EGP,
    formatPrice,
    convertPriceNumber,
    isCartOpen,
    setIsCartOpen,
    isWishlistOpen,
    setIsWishlistOpen,
    isAuthOpen,
    setIsAuthOpen,
    isMobileNavOpen,
    setIsMobileNavOpen,
    quickViewProduct,
    setQuickViewProduct
  };
}
