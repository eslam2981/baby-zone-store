// Pure business logic functions for cart totals, discounts, and shipping thresholds

export const DEFAULT_FREE_SHIPPING_LIMIT = 1375;

export function calculateCartTotals(rawCart = [], freeShippingLimit = DEFAULT_FREE_SHIPPING_LIMIT) {
  const cart = Array.isArray(rawCart) ? rawCart : [];
  const limit = typeof freeShippingLimit === 'number' && !isNaN(freeShippingLimit) && freeShippingLimit > 0
    ? freeShippingLimit
    : DEFAULT_FREE_SHIPPING_LIMIT;

  const cartTotalSAR = cart.reduce((sum, item) => {
    const rawPrice = item?.product?.price;
    const price = typeof rawPrice === 'number' && !isNaN(rawPrice) ? rawPrice : Number(rawPrice) || 0;
    const qty = typeof item?.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 1;
    return sum + (price * qty);
  }, 0);

  const cartOriginalTotalSAR = cart.reduce((sum, item) => {
    const rawOrig = item?.product?.originalPrice ?? item?.product?.price;
    const origPrice = typeof rawOrig === 'number' && !isNaN(rawOrig) ? rawOrig : Number(rawOrig) || 0;
    const qty = typeof item?.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 1;
    return sum + (origPrice * qty);
  }, 0);

  const cartSavingsSAR = Math.max(0, cartOriginalTotalSAR - cartTotalSAR);

  const cartCount = cart.reduce((sum, item) => {
    const qty = typeof item?.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 ? item.quantity : 1;
    return sum + qty;
  }, 0);

  const freeShippingRemainingSAR = Math.max(0, limit - cartTotalSAR);
  const freeShippingProgress = Math.min(
    100,
    Math.round((cartTotalSAR / limit) * 100)
  );

  return {
    cartTotalSAR,
    cartOriginalTotalSAR,
    cartSavingsSAR,
    cartCount,
    freeShippingRemainingSAR,
    freeShippingProgress
  };
}
