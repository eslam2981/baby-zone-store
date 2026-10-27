/**
 * Baby Zone - Centralized Validation & Regex Utility
 * Provides uniform input validation, pattern checking, and sanitization across all storefront and admin forms.
 */

// 1. REGEX PATTERNS
export const REGEX_PATTERNS = {
  // Egyptian Mobile Numbers: Starts with 010, 011, 012, or 015 followed by exactly 8 digits (11 digits total)
  EGYPTIAN_PHONE: /^01[0125][0-9]{8}$/,

  // Standard Email Regex (RFC 5322 compliant simplified)
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // URL (http, https, or relative public/storage path)
  URL_OR_PATH: /^(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=]+|\/[\w\-._~:/?#[\]@!$&'()*+,;=]+)$/i,

  // URL strictly http/https
  ABSOLUTE_URL: /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/i,

  // Coupon codes: 3 to 20 uppercase alphanumeric, hyphens, and underscores only
  COUPON_CODE: /^[A-Z0-9_-]{3,20}$/,

  // Category & Product Slugs: lowercase english letters, numbers, and hyphens (no consecutive hyphens)
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  // Currency / Price: positive decimal with up to 2 decimal places (e.g. 150, 99.50)
  PRICE: /^\d+(\.\d{1,2})?$/,

  // Positive integer (e.g. stock, quantity, views)
  POSITIVE_INTEGER: /^\d+$/,

  // Customer / Person Name: Arabic letters, English letters, spaces, and hyphens (2 to 70 chars)
  PERSON_NAME: /^[\u0621-\u064A\u0660-\u0669a-zA-Z\s.'-]{2,70}$/,

  // Order Tracking Number (e.g. EGY-12345, EGY12345, 12345, or Egyptian phone number)
  ORDER_SEARCH: /^(EGY-?\d{4,8}|01[0125][0-9]{8}|[a-zA-Z0-9_-]{4,25})$/i,

  // Danger HTML / Script tag detector for XSS prevention
  DANGEROUS_HTML: /<[^>]*>|javascript:|data:/i
};

// 2. SANITIZATION FUNCTIONS
/**
 * Strip dangerous HTML tags, leading/trailing whitespace, and null characters
 */
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // remove control chars
    .trim();
};

/**
 * Sanitize and normalize Egyptian phone numbers (converts Arabic numerals to English, removes spaces/dashes)
 */
export const normalizeEgyptianPhone = (phone) => {
  if (!phone) return '';
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let clean = String(phone).trim();
  arabicNumerals.forEach((num, i) => {
    clean = clean.split(num).join(String(i));
  });
  clean = clean.replace(/[\s\-+()]/g, '');
  // If starts with country code +20 or 0020 or 20
  if (clean.startsWith('0020')) clean = '0' + clean.slice(4);
  else if (clean.startsWith('20')) clean = '0' + clean.slice(2);
  return clean;
};

/**
 * Normalize coupon code to uppercase trimmed string
 */
export const normalizeCouponCode = (code) => {
  if (!code) return '';
  return String(code).toUpperCase().trim().replace(/\s+/g, '');
};

/**
 * Auto-generate a valid URL-safe slug from Arabic/English title
 */
export const generateSlug = (text) => {
  if (!text) return '';
  const clean = sanitizeText(text)
    .toLowerCase()
    .replace(/[^\w\u0621-\u064A0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return clean;
};

// 3. VALIDATOR HELPER FUNCTIONS WITH ARABIC ERROR MESSAGES

/**
 * Validate Egyptian Phone
 */
export const validateEgyptianPhone = (phone, isRequired = true) => {
  if (!phone || !phone.trim()) {
    return isRequired ? 'رقم الهاتف مطلوب' : null;
  }
  const normalized = normalizeEgyptianPhone(phone);
  if (!REGEX_PATTERNS.EGYPTIAN_PHONE.test(normalized)) {
    return 'رقم الموبايل غير صحيح، يجب أن يكون 11 رقماً ويبدأ بـ (010 أو 011 أو 012 أو 015)';
  }
  return null;
};

/**
 * Validate Email
 */
export const validateEmail = (email, isRequired = true) => {
  if (!email || !email.trim()) {
    return isRequired ? 'البريد الإلكتروني مطلوب' : null;
  }
  const clean = email.trim();
  if (!REGEX_PATTERNS.EMAIL.test(clean)) {
    return 'صيغة البريد الإلكتروني غير صحيحة (مثال: name@example.com)';
  }
  return null;
};

/**
 * Validate Person/Customer Name
 */
export const validatePersonName = (name, isRequired = true, minLength = 2, maxLength = 70) => {
  if (!name || !name.trim()) {
    return isRequired ? 'الاسم مطلوب' : null;
  }
  const clean = name.trim();
  if (clean.length < minLength) {
    return `الاسم قصير جداً (يجب ألا يقل عن ${minLength} أحرف)`;
  }
  if (clean.length > maxLength) {
    return `الاسم طويل جداً (الحد الأقصى ${maxLength} حرفاً)`;
  }
  if (REGEX_PATTERNS.DANGEROUS_HTML.test(clean)) {
    return 'الاسم يحتوي على رموز أو وسوم غير مسموح بها';
  }
  return null;
};

/**
 * Validate Price
 */
export const validatePrice = (price, fieldName = 'السعر', min = 0.5, max = 500000) => {
  if (price === '' || price === null || price === undefined) {
    return `يرجى إدخال ${fieldName}`;
  }
  const str = String(price).trim();
  if (!REGEX_PATTERNS.PRICE.test(str)) {
    return `${fieldName} يجب أن يكون رقماً صحيحاً أو عشرياً موجباً`;
  }
  const num = parseFloat(str);
  if (isNaN(num) || num < min) {
    return `${fieldName} يجب أن يكون أكبر من أو يساوي ${min} ج.م`;
  }
  if (num > max) {
    return `${fieldName} يتجاوز الحد الأقصى المسموح (${max.toLocaleString('ar-EG')} ج.م)`;
  }
  return null;
};

/**
 * Validate Stock Count
 */
export const validateStock = (stock, min = 0, max = 99999) => {
  if (stock === '' || stock === null || stock === undefined) {
    return 'يرجى إدخال كمية المخزون';
  }
  const str = String(stock).trim();
  if (!REGEX_PATTERNS.POSITIVE_INTEGER.test(str)) {
    return 'كمية المخزون يجب أن تكون عدداً صحيحاً موجباً أو صفراً';
  }
  const num = parseInt(str, 10);
  if (isNaN(num) || num < min || num > max) {
    return `كمية المخزون يجب أن تكون بين ${min} و ${max}`;
  }
  return null;
};

/**
 * Validate Coupon Code
 */
export const validateCouponCode = (code) => {
  if (!code || !code.trim()) {
    return 'يرجى إدخال كود الكوبون';
  }
  const clean = normalizeCouponCode(code);
  if (!REGEX_PATTERNS.COUPON_CODE.test(clean)) {
    return 'كود الكوبون يجب أن يتكون من 3 إلى 20 حرفاً إنجليزياً أو أرقاماً بدون مسافات أو رموز خاصة';
  }
  return null;
};

/**
 * Validate Discount Value
 */
export const validateDiscountValue = (value, type = 'percentage') => {
  if (value === '' || value === null || value === undefined) {
    return 'يرجى إدخال قيمة الخصم';
  }
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    return 'قيمة الخصم يجب أن تكون أكبر من الصفر';
  }
  if (type === 'percentage' && num > 100) {
    return 'نسبة الخصم المئوية لا يمكن أن تتجاوز 100%';
  }
  if (type === 'fixed' && num > 50000) {
    return 'قيمة الخصم الثابت لا يمكن أن تتجاوز 50,000 ج.م';
  }
  return null;
};

/**
 * Validate Password
 */
export const validatePassword = (password, minLength = 6) => {
  if (!password) {
    return 'كلمة المرور مطلوبة';
  }
  if (password.length < minLength) {
    return `كلمة المرور يجب أن لا تقل عن ${minLength} خانات للأمان`;
  }
  return null;
};

/**
 * Validate Product / Item Name
 */
export const validateProductName = (name, minLength = 3, maxLength = 150) => {
  if (!name || !name.trim()) {
    return 'اسم المنتج مطلوب';
  }
  const clean = name.trim();
  if (clean.length < minLength) {
    return `اسم المنتج قصير جداً (أقل من ${minLength} أحرف)`;
  }
  if (clean.length > maxLength) {
    return `اسم المنتج طويل جداً (الحد الأقصى ${maxLength} حرفاً)`;
  }
  if (REGEX_PATTERNS.DANGEROUS_HTML.test(clean)) {
    return 'اسم المنتج يحتوي على وسوم غير مسموح بها';
  }
  return null;
};

/**
 * Validate Category Name
 */
export const validateCategoryName = (name, minLength = 2, maxLength = 60) => {
  if (!name || !name.trim()) {
    return 'اسم القسم مطلوب';
  }
  const clean = name.trim();
  if (clean.length < minLength) {
    return `اسم القسم قصير جداً (أقل من ${minLength} أحرف)`;
  }
  if (clean.length > maxLength) {
    return `اسم القسم طويل جداً (الحد الأقصى ${maxLength} حرفاً)`;
  }
  if (REGEX_PATTERNS.DANGEROUS_HTML.test(clean)) {
    return 'اسم القسم يحتوي على وسوم غير مسموح بها';
  }
  return null;
};
