// Pure formatting utility functions for currency, numbers, and dates
export const CURRENCIES = {
  EGP: { code: 'EGP', symbol: 'ج.م', rate: 1, name: 'جنيه مصري' }
};

export const formatPrice = (price) => {
  const val = typeof price === 'number' && !isNaN(price) ? Math.round(price) : 0;
  return `${val.toLocaleString('ar-EG')} ج.م`;
};

export const convertPriceNumber = (price) => {
  return typeof price === 'number' && !isNaN(price) ? Math.round(price) : 0;
};

export const formatDateArabic = (dateString, options = { dateStyle: 'medium' }) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('ar-EG', options);
  } catch {
    return dateString;
  }
};
