// Role and capability permissions definitions for Baby Zone
export const DEFAULT_CUSTOMER_PERMISSIONS = [
  'view_catalog',
  'place_orders',
  'view_own_orders',
  'rate_products',
  'hospital_bag',
  'cod_payment'
];

export const VIP_CUSTOMER_PERMISSIONS = [
  'view_catalog',
  'place_orders',
  'view_own_orders',
  'rate_products',
  'hospital_bag',
  'vip_discounts',
  'priority_support',
  'cod_payment'
];

export const WHOLESALER_PERMISSIONS = [
  'view_catalog',
  'place_orders',
  'view_own_orders',
  'rate_products',
  'hospital_bag',
  'vip_discounts',
  'priority_support',
  'cod_payment',
  'bulk_purchasing',
  'invoice_export'
];
