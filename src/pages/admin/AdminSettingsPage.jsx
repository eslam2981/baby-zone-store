import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Settings,
  Store,
  Truck,
  CreditCard,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

/* Store settings and administrative configuration interface */
export default function AdminSettingsPage() {
  const { storeSettings, updateStoreSettings } = useAdmin();
  const [formData, setFormData] = useState({
    storeName: storeSettings?.storeName || 'بيبي زون | BABY ZONE',
    tagline: storeSettings?.tagline || 'عالم متكامل لأجود مستلزمات الأم والطفل في مصر',
    supportPhone: storeSettings?.supportPhone || '+20 100 123 4567',
    supportEmail: storeSettings?.supportEmail || 'support@babyzone-egypt.com',
    address: storeSettings?.address || 'القاهرة، التجمع الخامس، مصر',
    currency: storeSettings?.currency || 'ج.م',
    freeShippingThreshold: storeSettings?.freeShippingThreshold || 500,
    cairoShippingCost: storeSettings?.cairoShippingCost || 50,
    otherGovernoratesShippingCost: storeSettings?.otherGovernoratesShippingCost || 75,
    enableCod: storeSettings?.enableCod ?? true,
    enableInstapay: storeSettings?.enableInstapay ?? true,
    enableCard: storeSettings?.enableCard ?? true,
    lowStockThreshold: storeSettings?.lowStockThreshold || 5,
    notifyOnNewOrder: storeSettings?.notifyOnNewOrder ?? true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (storeSettings) {
      setFormData((prev) => ({
        ...prev,
        storeName: storeSettings.storeName || prev.storeName,
        tagline: storeSettings.tagline || prev.tagline,
        supportPhone: storeSettings.supportPhone || prev.supportPhone,
        supportEmail: storeSettings.supportEmail || prev.supportEmail,
        address: storeSettings.address || prev.address,
        currency: storeSettings.currency || prev.currency,
        freeShippingThreshold: storeSettings.freeShippingLimit ?? storeSettings.freeShippingThreshold ?? prev.freeShippingThreshold,
        cairoShippingCost: storeSettings.cairoShippingFee ?? storeSettings.cairoShippingCost ?? prev.cairoShippingCost,
        otherGovernoratesShippingCost: storeSettings.provincesShippingFee ?? storeSettings.otherGovernoratesShippingCost ?? prev.otherGovernoratesShippingCost,
        enableCod: storeSettings.enableCOD !== undefined ? storeSettings.enableCOD : prev.enableCod,
        enableInstapay: storeSettings.enableInstaPay !== undefined ? storeSettings.enableInstaPay : prev.enableInstapay,
        enableCard: storeSettings.enableCreditCard !== undefined ? storeSettings.enableCreditCard : prev.enableCard
      }));
    }
  }, [storeSettings]);

  /* Handle form submission */
  const handleSubmit = (e) => {
    e.preventDefault();
    updateStoreSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-rawaa-primary/10 text-rawaa-primary flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold font-cairo text-rawaa-dark">إعدادات المتجر العامة</h1>
              <p className="text-xs text-rawaa-dark/60 mt-0.5">
                تكوين بيانات وهوية بيبي زون، أسعار الشحن داخل مصر، وبوابات الدفع
              </p>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم حفظ التعديلات بنجاح!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-rawaa-border">
            <Store className="w-5 h-5 text-rawaa-primary" />
            <h2 className="font-bold font-cairo text-base text-rawaa-dark">بيانات وهوية المتجر</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">اسم المتجر الرسمي</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">شعار المتجر (Tagline)</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">رقم خدمة العملاء</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-rawaa-dark/40" />
                <input
                  type="text"
                  dir="ltr"
                  value={formData.supportPhone}
                  onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                  className="w-full pl-3.5 pr-9 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-mono text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">البريد الإلكتروني للدعم</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-rawaa-dark/40" />
                <input
                  type="email"
                  dir="ltr"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  className="w-full pl-3.5 pr-9 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">المقر الرئيسي</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-rawaa-dark/40" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-3.5 pr-9 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-rawaa-border">
            <Truck className="w-5 h-5 text-rawaa-sage" />
            <h2 className="font-bold font-cairo text-base text-rawaa-dark">أسعار وسياسات الشحن في مصر</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">
                الشحن للقاهرة والجيزة (ج.م)
              </label>
              <input
                type="number"
                min="0"
                value={formData.cairoShippingCost}
                onChange={(e) => setFormData({ ...formData, cairoShippingCost: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">
                باقي محافظات الجمهورية (ج.م)
              </label>
              <input
                type="number"
                min="0"
                value={formData.otherGovernoratesShippingCost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    otherGovernoratesShippingCost: Number(e.target.value)
                  })
                }
                className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">
                حد الشحن المجاني (ج.م)
              </label>
              <input
                type="number"
                min="0"
                value={formData.freeShippingThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, freeShippingThreshold: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-rawaa-border">
            <CreditCard className="w-5 h-5 text-rawaa-primary" />
            <h2 className="font-bold font-cairo text-base text-rawaa-dark">خيارات الدفع المتاحة</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-rawaa-soft/40 border border-rawaa-border cursor-pointer hover:bg-rawaa-soft/70 transition-colors">
              <div>
                <div className="font-bold text-xs text-rawaa-dark">الدفع نقداً عند الاستلام (COD)</div>
                <div className="text-[11px] text-rawaa-dark/60 mt-0.5">
                  يتيح للعملاء دفع قيمة الطلب لمندوب الشحن نقداً عند باب المنزل
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.enableCod}
                onChange={(e) => setFormData({ ...formData, enableCod: e.target.checked })}
                className="w-5 h-5 rounded text-rawaa-primary focus:ring-rawaa-primary border-rawaa-border"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-rawaa-soft/40 border border-rawaa-border cursor-pointer hover:bg-rawaa-soft/70 transition-colors">
              <div>
                <div className="font-bold text-xs text-rawaa-dark">الدفع الرقمي عبر إنستاباي والمحافظ الإلكترونية (InstaPay)</div>
                <div className="text-[11px] text-rawaa-dark/60 mt-0.5">
                  تحويل بنكي فوري فودافون كاش، أورنج، اتصالات، وإنستاباي
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.enableInstapay}
                onChange={(e) => setFormData({ ...formData, enableInstapay: e.target.checked })}
                className="w-5 h-5 rounded text-rawaa-primary focus:ring-rawaa-primary border-rawaa-border"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-rawaa-soft/40 border border-rawaa-border cursor-pointer hover:bg-rawaa-soft/70 transition-colors">
              <div>
                <div className="font-bold text-xs text-rawaa-dark">البطاقات الائتمانية والخصم المباشر (Visa / Mastercard)</div>
                <div className="text-[11px] text-rawaa-dark/60 mt-0.5">
                  بوابة دفع إلكترونية مؤمنة ومشفرة لمعاملات الفيزا والماستركارد
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.enableCard}
                onChange={(e) => setFormData({ ...formData, enableCard: e.target.checked })}
                className="w-5 h-5 rounded text-rawaa-primary focus:ring-rawaa-primary border-rawaa-border"
              />
            </label>
          </div>
        </div>

        {/* Inventory alerts */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-rawaa-border shadow-soft space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-rawaa-border">
            <Bell className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold font-cairo text-base text-rawaa-dark">تنبيهات النظام والمخزون</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-rawaa-dark mb-1">
                حد التحذير من انخفاض المخزون (بالقطع)
              </label>
              <input
                type="number"
                min="1"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-bold text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
              />
              <p className="text-[11px] text-rawaa-dark/50 mt-1">
                سيظهر تنبيه عندما يصل رصيد أي منتج لهذا الرقم أو أقل
              </p>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-rawaa-soft/40 border border-rawaa-border cursor-pointer w-full">
                <input
                  type="checkbox"
                  checked={formData.notifyOnNewOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, notifyOnNewOrder: e.target.checked })
                  }
                  className="w-5 h-5 rounded text-rawaa-primary focus:ring-rawaa-primary border-rawaa-border"
                />
                <div>
                  <div className="font-bold text-xs text-rawaa-dark">إشعارات الطلبات الفورية</div>
                  <div className="text-[11px] text-rawaa-dark/60 mt-0.5">
                    إرسال إشعار فوري عند قيام أي عميل بطلب جديد
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-rawaa-primary text-white text-xs font-bold rounded-xl hover:bg-rawaa-primary/90 transition-all shadow-md shadow-rawaa-primary/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
}
