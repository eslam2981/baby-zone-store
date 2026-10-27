// Zero-mock initial state: All real data is loaded dynamically from Supabase Cloud APIs
export const initialOrders = [];
export const initialCustomers = [];
export const initialCoupons = [];
export const initialReviews = [];
export const initialActivityLog = [];

export const initialStoreSettings = {
  storeName: "بيبي زون | BABY ZONE",
  tagline: "عالم متكامل لأجود مستلزمات الأم والطفل في مصر",
  description: "المتجر الاستثنائي المعتمد لمستلزمات الأم والطفل في مصر",
  supportPhone: "+20 103 540 1549",
  supportEmail: "care@babyzone-egypt.com",
  address: "القاهرة، مصر",
  currency: "ج.م",
  currencyCode: "EGP",
  freeShippingLimit: 1375,
  cairoShippingFee: 50,
  provincesShippingFee: 75,
  taxRate: 14,
  autoConfirmOrders: false,
  enableCOD: true,
  enableInstaPay: true,
  enableVodafoneCash: true,
  enableCreditCard: true,
  maintenanceMode: false,
  businessHours: "يومياً من 9:00 ص حتى 11:00 م"
};

export const initialAdmins = [
  {
    id: "adm-1",
    name: "إسلام جميل",
    email: "admin@babyzone-egypt.com",
    role: "مدير النظام (Super Admin)",
    avatar: "/logo.png",
    phone: "01035401549",
    lastLogin: "الآن",
    status: "نشط",
    permissions: ["all"]
  }
];
