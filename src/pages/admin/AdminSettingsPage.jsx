import React, { useState } from 'react';
import ModernCheckbox from '../../components/common/ModernCheckbox';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import {
  validateEmail,
  validateEgyptianPhone,
  sanitizeText,
  normalizeEgyptianPhone
} from '../../utils/validators';
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
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

/* Store settings and administrative configuration interface */
export default function AdminSettingsPage() {
  const { storeSettings, updateStoreSettings, isSyncing, refreshAllRealtimeData } = useAdmin();
  const { addToast } = useShop();
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
    enableCod: storeSettings?.enableCOD ?? storeSettings?.enableCod ?? true,
    enableInstapay: storeSettings?.enableInstaPay ?? storeSettings?.enableInstapay ?? false,
    enableCard: storeSettings?.enableCreditCard ?? storeSettings?.enableCard ?? false,
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
        enableCod: storeSettings.enableCOD !== undefined ? Boolean(storeSettings.enableCOD) : (storeSettings.enableCod !== undefined ? Boolean(storeSettings.enableCod) : prev.enableCod),
        enableInstapay: storeSettings.enableInstaPay !== undefined ? Boolean(storeSettings.enableInstaPay) : (storeSettings.enableInstapay !== undefined ? Boolean(storeSettings.enableInstapay) : prev.enableInstapay),
        enableCard: storeSettings.enableCreditCard !== undefined ? Boolean(storeSettings.enableCreditCard) : (storeSettings.enableCard !== undefined ? Boolean(storeSettings.enableCard) : prev.enableCard)
      }));
    }
  }, [storeSettings]);

  /* Handle form submission */
  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanStoreName = sanitizeText(formData.storeName);
    if (!cleanStoreName || cleanStoreName.length < 2) {
      if (addToast) addToast('يرجى إدخال اسم صحيح للمتجر (حرفين على الأقل)', 'warning');
      return;
    }

    const cleanEmail = sanitizeText(formData.supportEmail);
    if (cleanEmail) {
      const emailErr = validateEmail(cleanEmail, false);
      if (emailErr) {
        if (addToast) addToast(emailErr, 'warning');
        return;
      }
    }

    let cleanPhone = sanitizeText(formData.supportPhone);
    if (cleanPhone) {
      const phoneErr = validateEgyptianPhone(cleanPhone, false);
      if (phoneErr) {
        if (addToast) addToast(phoneErr, 'warning');
        return;
      }
      cleanPhone = normalizeEgyptianPhone(cleanPhone);
    }

    const freeThreshold = Math.max(0, Number(formData.freeShippingThreshold) || 0);
    const cairoShipping = Math.max(0, Number(formData.cairoShippingCost) || 0);
    const otherShipping = Math.max(0, Number(formData.otherGovernoratesShippingCost) || 0);

    const payload = {
      ...storeSettings,
      ...formData,
      storeName: cleanStoreName,
      tagline: sanitizeText(formData.tagline),
      supportEmail: cleanEmail,
      supportPhone: cleanPhone,
      address: sanitizeText(formData.address),
      freeShippingThreshold: freeThreshold,
      freeShippingLimit: freeThreshold,
      cairoShippingCost: cairoShipping,
      cairoShippingFee: cairoShipping,
      otherGovernoratesShippingCost: otherShipping,
      provincesShippingFee: otherShipping,
      enableCod: Boolean(formData.enableCod),
      enableCOD: Boolean(formData.enableCod),
      enable_cod: Boolean(formData.enableCod),
      enableInstapay: Boolean(formData.enableInstapay),
      enableInstaPay: Boolean(formData.enableInstapay),
      enable_instapay: Boolean(formData.enableInstapay),
      enableCard: Boolean(formData.enableCard),
      enableCreditCard: Boolean(formData.enableCard),
      enable_credit_card: Boolean(formData.enableCard),
      enableVodafoneCash: Boolean(formData.enableInstapay),
      enable_vodafone_cash: Boolean(formData.enableInstapay)
    };

    updateStoreSettings(payload);
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>إعدادات لحظية (0ms)</span>
          </span>

          <button
            type="button"
            onClick={() => refreshAllRealtimeData && refreshAllRealtimeData()}
            disabled={isSyncing}
            title="مزامنة الإعدادات لحظياً الآن"
            className="p-2 rounded-xl border border-rawaa-border hover:bg-rawaa-soft text-rawaa-dark/70 hover:text-rawaa-dark transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-rawaa-peach' : ''}`} />
          </button>

          {savedSuccess && (
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>تم حفظ التعديلات بنجاح!</span>
            </div>
          )}
        </div>
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
            <div
              onClick={() => setFormData((prev) => ({ ...prev, enableCod: !prev.enableCod }))}
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                formData.enableCod
                  ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                  : 'bg-rawaa-soft/40 border-rawaa-border hover:bg-rawaa-soft/70'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-rawaa-dark">الدفع نقداً عند الاستلام (COD)</span>
                  {formData.enableCod ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      مفعل ومتاح للعملاء
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      معطل (غير متاح)
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-rawaa-dark/60 mt-0.5">
                  يتيح للعملاء دفع قيمة الطلب لمندوب الشحن نقداً عند باب المنزل
                </div>
              </div>
              <ModernCheckbox
                checked={Boolean(formData.enableCod)}
                onChange={(checked) => setFormData((prev) => ({ ...prev, enableCod: checked }))}
                color="primary"
                size="md"
              />
            </div>

            <div
              onClick={() => setFormData((prev) => ({ ...prev, enableInstapay: !prev.enableInstapay }))}
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                formData.enableInstapay
                  ? 'bg-purple-50/60 border-purple-300 shadow-2xs'
                  : 'bg-rawaa-soft/40 border-rawaa-border hover:bg-rawaa-soft/70'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-rawaa-dark">الدفع الرقمي عبر إنستاباي والمحافظ الإلكترونية (InstaPay)</span>
                  {formData.enableInstapay ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      مفعل ومتاح للعملاء
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                      معطل (يظهر "قريباً" للعملاء)
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-rawaa-dark/60 mt-0.5">
                  تحويل بنكي فوري فودافون كاش، أورنج، اتصالات، وإنستاباي
                </div>
              </div>
              <ModernCheckbox
                checked={Boolean(formData.enableInstapay)}
                onChange={(checked) => setFormData((prev) => ({ ...prev, enableInstapay: checked }))}
                color="primary"
                size="md"
              />
            </div>

            <div
              onClick={() => setFormData((prev) => ({ ...prev, enableCard: !prev.enableCard }))}
              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                formData.enableCard
                  ? 'bg-blue-50/60 border-blue-300 shadow-2xs'
                  : 'bg-rawaa-soft/40 border-rawaa-border hover:bg-rawaa-soft/70'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-rawaa-dark">البطاقات الائتمانية والخصم المباشر (Visa / Mastercard)</span>
                  {formData.enableCard ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      مفعل ومتاح للعملاء
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
                      معطل (يظهر "قريباً" للعملاء)
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-rawaa-dark/60 mt-0.5">
                  بوابة دفع إلكترونية مؤمنة ومشفرة لمعاملات الفيزا والماستركارد
                </div>
              </div>
              <ModernCheckbox
                checked={Boolean(formData.enableCard)}
                onChange={(checked) => setFormData((prev) => ({ ...prev, enableCard: checked }))}
                color="primary"
                size="md"
              />
            </div>
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
              <div
                onClick={() =>
                  setFormData({ ...formData, notifyOnNewOrder: !formData.notifyOnNewOrder })
                }
                className="flex items-center gap-3 p-3.5 rounded-xl bg-rawaa-soft/40 border border-rawaa-border cursor-pointer w-full select-none hover:bg-rawaa-soft/70 transition-colors"
              >
                <ModernCheckbox
                  checked={Boolean(formData.notifyOnNewOrder)}
                  onChange={(checked) =>
                    setFormData({ ...formData, notifyOnNewOrder: checked })
                  }
                  color="primary"
                  size="md"
                />
                <div>
                  <div className="font-bold text-xs text-rawaa-dark">إشعارات الطلبات الفورية</div>
                  <div className="text-[11px] text-rawaa-dark/60 mt-0.5">
                    إرسال إشعار فوري عند قيام أي عميل بطلب جديد
                  </div>
                </div>
              </div>
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
