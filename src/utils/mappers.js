// Domain data mappers translating Supabase snake_case records into camelCase domain models
import { initialStoreSettings } from '../data/adminData.js';
import {
  DEFAULT_CUSTOMER_PERMISSIONS,
  VIP_CUSTOMER_PERMISSIONS,
  WHOLESALER_PERMISSIONS
} from '../constants/permissions.js';

export function formatDbOrder(dbOrd) {
  if (!dbOrd) return null;
  return {
    id: dbOrd.id,
    customerName: dbOrd.customer_name || 'عميلة بيبي زون',
    customerPhone: dbOrd.customer_phone || '',
    customerEmail: dbOrd.customer_email || '',
    city: dbOrd.city || 'القاهرة',
    district: dbOrd.district || '',
    address: dbOrd.shipping_address || '',
    date: dbOrd.created_at || new Date().toISOString(),
    total: Number(dbOrd.total_amount) || 0,
    totalAmount: Number(dbOrd.total_amount) || 0,
    subtotal: Number(dbOrd.total_amount) || 0,
    shippingFee: 0,
    discountAmount: 0,
    paymentMethod: dbOrd.payment_method || 'الدفع عند الاستلام (COD)',
    paymentStatus: dbOrd.status === 'تم التسليم' ? 'مدفوع بالكامل' : 'بانتظار السداد عند التسليم',
    deliveryStatus: dbOrd.status || 'بانتظار التأكيد',
    status: dbOrd.status || 'بانتظار التأكيد',
    deliveryPin: dbOrd.delivery_pin || '4812',
    courierName: dbOrd.courier_name || 'مندوب التوصيل السريع',
    courierPhone: dbOrd.courier_phone || '01000000000',
    items: Array.isArray(dbOrd.items) ? dbOrd.items : [],
    notes: dbOrd.notes || ''
  };
}

export function formatDbCustomer(dbCust) {
  if (!dbCust) return null;
  const isVip = Boolean(dbCust.is_vip || dbCust.role === 'vip_customer');
  let defaultPerms = isVip ? VIP_CUSTOMER_PERMISSIONS : DEFAULT_CUSTOMER_PERMISSIONS;
  if (dbCust.role === 'wholesaler') defaultPerms = WHOLESALER_PERMISSIONS;

  return {
    id: dbCust.id,
    name: dbCust.name || 'عميلة بيبي زون',
    email: dbCust.email || '',
    phone: dbCust.phone || '',
    city: dbCust.city || 'القاهرة',
    address: dbCust.address || '',
    role: dbCust.role || (isVip ? 'vip_customer' : 'customer'),
    permissions: Array.isArray(dbCust.permissions) && dbCust.permissions.length > 0
      ? dbCust.permissions
      : defaultPerms,
    isVip: isVip,
    status: dbCust.status || 'نشط',
    ordersCount: Number(dbCust.orders_count) || 0,
    totalSpent: Number(dbCust.total_spent) || 0,
    notes: dbCust.notes || '',
    joinedDate: dbCust.joined_date
      ? dbCust.joined_date.split('T')[0]
      : (dbCust.created_at ? dbCust.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
    membershipTier: isVip ? 'عضوية بلاتينية VIP' : (dbCust.role === 'wholesaler' ? 'تاجر / جملة' : 'عضوية مسجلة')
  };
}

export function formatDbCoupon(dbCp) {
  if (!dbCp) return null;
  const isPercent = dbCp.type === 'percentage' || (Number(dbCp.discount_percent) > 0 && !dbCp.discount_amount);
  const discountVal = isPercent
    ? (Number(dbCp.discount_percent) || Number(dbCp.discount_value) || 0)
    : (Number(dbCp.discount_amount) || Number(dbCp.discount_value) || 0);

  const formattedEndDate = dbCp.end_date
    ? dbCp.end_date.split('T')[0]
    : (dbCp.expiry_date || '2026-12-31');

  return {
    id: dbCp.id,
    code: dbCp.code,
    discountType: isPercent ? 'percentage' : 'fixed',
    type: isPercent ? 'percentage' : 'fixed',
    discountValue: discountVal,
    discountPercent: isPercent ? discountVal : 0,
    discountAmount: !isPercent ? discountVal : 0,
    minSpend: Number(dbCp.min_spend) || 0,
    maxDiscount: Number(dbCp.max_discount) || 0,
    usedCount: Number(dbCp.usage_count) || 0,
    usageCount: Number(dbCp.usage_count) || 0,
    maxUses: Number(dbCp.max_usage) || 100,
    maxUsage: Number(dbCp.max_usage) || 100,
    startDate: dbCp.start_date || '2026-01-01',
    expiryDate: formattedEndDate,
    endDate: formattedEndDate,
    isActive: Boolean(dbCp.is_active),
    description: dbCp.description || ''
  };
}

export function formatDbReview(dbRev) {
  if (!dbRev) return null;
  return {
    id: dbRev.id,
    productId: dbRev.product_id,
    productName: dbRev.product_name || 'منتج من بيبي زون',
    customerName: dbRev.customer_name || 'عميلة بيبي زون',
    customerEmail: dbRev.customer_email || '',
    rating: Number(dbRev.rating) || 5,
    date: dbRev.created_at ? dbRev.created_at.split('T')[0] : '2026-10-26',
    comment: dbRev.comment || '',
    isApproved: Boolean(dbRev.is_approved),
    likes: Number(dbRev.likes) || 0
  };
}

export function formatDbAdmin(dbAdm) {
  if (!dbAdm) return null;
  const rawPerms = Array.isArray(dbAdm.permissions) ? dbAdm.permissions : ['all'];
  const pwdItem = rawPerms.find((p) => typeof p === 'string' && p.startsWith('__pwd:'));
  const extractedPassword = pwdItem ? pwdItem.replace(/^__pwd:/, '').replace(/__$/, '') : null;
  const cleanPermissions = rawPerms.filter((p) => typeof p === 'string' && !p.startsWith('__pwd:'));

  return {
    id: dbAdm.id,
    name: dbAdm.name,
    email: dbAdm.email,
    password: dbAdm.password || extractedPassword || null,
    phone: dbAdm.phone || '',
    role: dbAdm.role || 'مدير النظام (Super Admin)',
    avatar: dbAdm.avatar || '/logo.png',
    status: dbAdm.status || 'نشط',
    permissions: cleanPermissions.length > 0 ? cleanPermissions : ['all'],
    lastLogin: dbAdm.last_login ? new Date(dbAdm.last_login).toLocaleTimeString('ar-EG') : 'الآن'
  };
}

export function formatDbSettings(dbSet) {
  if (!dbSet) return initialStoreSettings;
  return {
    storeName: dbSet.store_name || initialStoreSettings.storeName,
    tagline: dbSet.tagline || initialStoreSettings.tagline,
    description: dbSet.description || initialStoreSettings.description,
    supportPhone: dbSet.support_phone || initialStoreSettings.supportPhone,
    supportEmail: dbSet.support_email || initialStoreSettings.supportEmail,
    address: dbSet.address || initialStoreSettings.address,
    currency: dbSet.currency || initialStoreSettings.currency,
    currencyCode: dbSet.currency_code || initialStoreSettings.currencyCode,
    freeShippingLimit: Number(dbSet.free_shipping_limit) || initialStoreSettings.freeShippingLimit,
    cairoShippingFee: Number(dbSet.cairo_shipping_fee) || initialStoreSettings.cairoShippingFee,
    provincesShippingFee: Number(dbSet.provinces_shipping_fee) || initialStoreSettings.provincesShippingFee,
    taxRate: Number(dbSet.tax_rate) || initialStoreSettings.taxRate,
    autoConfirmOrders: Boolean(dbSet.auto_confirm_orders),
    enableCOD: Boolean(dbSet.enable_cod),
    enableInstaPay: Boolean(dbSet.enable_instapay),
    enableVodafoneCash: Boolean(dbSet.enable_vodafone_cash),
    enableCreditCard: Boolean(dbSet.enable_credit_card),
    maintenanceMode: Boolean(dbSet.maintenance_mode),
    businessHours: dbSet.business_hours || initialStoreSettings.businessHours
  };
}
