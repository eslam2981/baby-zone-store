import { useEffect } from 'react';
import {
  Truck,
  User,
  Wallet,
  CreditCard,
  Smartphone,
  Loader2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import ModernSelect from '../../common/ModernSelect';
import { useShop } from '../../../context/ShopContext';

export default function CheckoutForm({
  user,
  formData,
  setFormData,
  subtotal,
  shippingFee,
  totalAmount,
  formatPrice,
  isSubmitting,
  onSubmit
}) {
  const { storeSettings } = useShop();

  const isWholesaler = user?.role === 'wholesaler' || user?.permissions?.includes('bulk_purchasing');
  const isVip = Boolean(user?.isVip || user?.role === 'vip_customer' || user?.permissions?.includes('vip_discounts'));
  const isSupervisor = user?.role === 'supervisor';
  const isBlocked = user?.status === 'محظور';
  const isInactive = user?.status === 'غير نشط';
  const hasPlaceOrdersPermission = user?.isAdmin || !user?.permissions || user?.permissions?.includes('place_orders') || user?.permissions?.includes('*');

  // Master switches from Store Settings (Admin Settings Page)
  const isCodStoreEnabled = storeSettings?.enableCOD ?? storeSettings?.enableCod ?? true;
  const isInstaPayStoreEnabled = Boolean(storeSettings?.enableInstaPay ?? storeSettings?.enableInstapay ?? false);
  const isCardStoreEnabled = Boolean(storeSettings?.enableCreditCard ?? storeSettings?.enableCard ?? false);

  // Granular customer-level permissions (Admin Customer Drawer)
  const hasCodCustomerPerm = user?.isAdmin || !user?.permissions || user?.permissions?.includes('cod_payment') || user?.permissions?.includes('*');
  const hasInstaPayCustomerPerm = Boolean(user?.isAdmin || user?.permissions?.includes('instapay_payment') || user?.permissions?.includes('*'));
  const hasCardCustomerPerm = Boolean(user?.isAdmin || user?.permissions?.includes('online_payment') || user?.permissions?.includes('*'));

  // Active status per payment method:
  // 1. COD is active if enabled in store AND customer has permission (or admin)
  const isCodActive = (isCodStoreEnabled && hasCodCustomerPerm) || Boolean(user?.isAdmin);
  // 2. InstaPay is active if enabled in store settings OR granted to customer
  const isInstaPayActive = isInstaPayStoreEnabled || hasInstaPayCustomerPerm;
  // 3. Online Cards are active if enabled in store settings OR granted to customer
  const isCardActive = isCardStoreEnabled || hasCardCustomerPerm;

  const hasAnyPaymentMethod = isCodActive || isInstaPayActive || isCardActive;
  const canSubmit = !isBlocked && !isInactive && hasPlaceOrdersPermission && hasAnyPaymentMethod;

  // Auto-switch payment method if selected one is not active
  useEffect(() => {
    const isCurrentActive =
      (formData.paymentMethod === 'الدفع عند الاستلام (COD)' && isCodActive) ||
      (formData.paymentMethod === 'فودافون كاش / إنستاباي' && isInstaPayActive) ||
      (formData.paymentMethod === 'الدفع الإلكتروني (فيزا / ماستركارد)' && isCardActive);

    if (!isCurrentActive) {
      if (isCodActive) {
        setFormData((prev) => ({ ...prev, paymentMethod: 'الدفع عند الاستلام (COD)' }));
      } else if (isInstaPayActive) {
        setFormData((prev) => ({ ...prev, paymentMethod: 'فودافون كاش / إنستاباي' }));
      } else if (isCardActive) {
        setFormData((prev) => ({ ...prev, paymentMethod: 'الدفع الإلكتروني (فيزا / ماستركارد)' }));
      }
    }
  }, [isCodActive, isInstaPayActive, isCardActive, formData.paymentMethod, setFormData]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-rawaa-border">
        <div className="w-9 h-9 rounded-xl bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center shrink-0">
          <Truck size={20} />
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-rawaa-dark">إتمام الطلب والشحن المباشر</h3>
          <p className="text-[11px] text-rawaa-muted">أدخلي بيانات التوصيل وسيتولى مندوبنا توصيل شحنتك حتى باب منزلك</p>
        </div>
      </div>

      {/* Customer account connection & status banner */}
      {isBlocked ? (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
              <Lock size={15} />
            </div>
            <div>
              <span className="font-bold text-rose-950 block">حساب محظور: {user.name}</span>
              <span className="text-[11px] text-rose-700">تم تجميد حسابك وحظر عمليات الشراء من قِبل إدارة المتجر</span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-2.5 py-1 rounded-full shrink-0">
            محظور
          </span>
        </div>
      ) : isInactive ? (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
              <Lock size={15} />
            </div>
            <div>
              <span className="font-bold text-amber-950 block">حساب قيد المراجعة: {user.name}</span>
              <span className="text-[11px] text-amber-700">حسابك بانتظار موافقة واعتماد الإدارة لإتاحة الشراء</span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full shrink-0">
            غير نشط
          </span>
        </div>
      ) : !hasPlaceOrdersPermission ? (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
              <Lock size={15} />
            </div>
            <div>
              <span className="font-bold text-amber-950 block">صلاحية الشراء معطلة</span>
              <span className="text-[11px] text-amber-700">تم تقييد إتمام الطلبات لحسابك من قِبل الإدارة</span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full shrink-0">
            طلب مقيد
          </span>
        </div>
      ) : (
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
              {user.name ? user.name.charAt(0) : <User size={15} />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-950 block">حساب العميل: {user.name}</span>
                {isWholesaler && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.2 rounded-full border border-blue-200">
                    تاجر جملة 🏷️
                  </span>
                )}
                {isVip && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full border border-amber-200">
                    VIP ذهبي 👑
                  </span>
                )}
                {isSupervisor && (
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.2 rounded-full border border-purple-200">
                    مشرفة معتمدة 🛡️
                  </span>
                )}
              </div>
              <span className="text-[11px] text-emerald-700">{user.email} &bull; سيتم ربط هذا الطلب بصفحتك الخاصة</span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs shrink-0">
            حساب موثق
          </span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3.5">
        {/* Customer Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-rawaa-dark mb-1">الاسم بالكامل *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: منى إبراهيم"
              className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-rawaa-dark mb-1">رقم الموبايل / واتساب *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="مثال: 01012345678"
              className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
            />
          </div>
        </div>

        {/* Governorate and Full Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-rawaa-dark mb-1">المحافظة *</label>
            <ModernSelect
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              options={[
                'القاهرة',
                'الجيزة',
                'الإسكندرية',
                'الدقهلية (المنصورة)',
                'الغربية (طنطا)',
                'الشرقية (الزقازيق)',
                'القليوبية',
                'البحيرة',
                'المنوفية',
                'دمياط',
                'بورسعيد',
                'السويس',
                'الإسماعيلية',
                'كفر الشيخ',
                'الفيوم',
                'بني سويف',
                'المنيا',
                'أسيوط',
                'سوهاج',
                'قنا',
                'الأقصر',
                'أسوان'
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-rawaa-dark mb-1">العنوان بالتفصيل *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="الشارع، رقم العمارة، الشقة"
              className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
            />
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-rawaa-dark">طريقة الدفع</label>
            <span className="text-[10.5px] text-rawaa-muted">وسائل الدفع المتوفرة بطلبك</span>
          </div>

          <div className="flex flex-col gap-2">
            {/* 1. Cash on Delivery (COD) */}
            <label
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                !isCodActive
                  ? 'opacity-65 bg-gray-50/70 border-gray-200 cursor-not-allowed'
                  : formData.paymentMethod === 'الدفع عند الاستلام (COD)'
                  ? 'border-rawaa-primary bg-rawaa-primary/5 text-rawaa-dark font-bold cursor-pointer shadow-2xs'
                  : 'border-rawaa-border hover:bg-rawaa-soft/60 text-rawaa-muted cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="paymentMethod"
                  disabled={!isCodActive}
                  value="الدفع عند الاستلام (COD)"
                  checked={isCodActive && formData.paymentMethod === 'الدفع عند الاستلام (COD)'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="accent-[#C25E3E] cursor-pointer"
                  style={{ accentColor: '#C25E3E' }}
                />
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60">
                  <Wallet size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-rawaa-dark">الدفع نقداً عند الاستلام (COD)</div>
                  <div className="text-[10.5px] text-rawaa-muted">السداد لمندوب الشحن عند استلام الطلب عند باب المنزل</div>
                </div>
              </div>

              <div>
                {isCodActive ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-600" />
                    متاح
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                    {!isCodStoreEnabled ? 'معطل بالمتجر' : 'معطل لحسابك'}
                  </span>
                )}
              </div>
            </label>

            {/* 2. InstaPay & Smart Mobile Wallets */}
            <label
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                !isInstaPayActive
                  ? 'opacity-65 bg-gray-50/70 border-gray-200 cursor-not-allowed'
                  : formData.paymentMethod === 'فودافون كاش / إنستاباي'
                  ? 'border-rawaa-primary bg-rawaa-primary/5 text-rawaa-dark font-bold cursor-pointer shadow-2xs'
                  : 'border-rawaa-border hover:bg-rawaa-soft/60 text-rawaa-muted cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="paymentMethod"
                  disabled={!isInstaPayActive}
                  value="فودافون كاش / إنستاباي"
                  checked={isInstaPayActive && formData.paymentMethod === 'فودافون كاش / إنستاباي'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="accent-[#C25E3E] cursor-pointer"
                  style={{ accentColor: '#C25E3E' }}
                />
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200/60">
                  <Smartphone size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-rawaa-dark">إنستاباي والمحافظ الإلكترونية (InstaPay)</div>
                  <div className="text-[10.5px] text-rawaa-muted">تحويل فوري عبر تطبيق إنستاباي أو المحافظ الذكية</div>
                </div>
              </div>

              <div>
                {isInstaPayActive ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-600" />
                    متاح
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    قريباً
                  </span>
                )}
              </div>
            </label>

            {/* 3. Online Cards (Visa / Mastercard) */}
            <label
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                !isCardActive
                  ? 'opacity-65 bg-gray-50/70 border-gray-200 cursor-not-allowed'
                  : formData.paymentMethod === 'الدفع الإلكتروني (فيزا / ماستركارد)'
                  ? 'border-rawaa-primary bg-rawaa-primary/5 text-rawaa-dark font-bold cursor-pointer shadow-2xs'
                  : 'border-rawaa-border hover:bg-rawaa-soft/60 text-rawaa-muted cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="paymentMethod"
                  disabled={!isCardActive}
                  value="الدفع الإلكتروني (فيزا / ماستركارد)"
                  checked={isCardActive && formData.paymentMethod === 'الدفع الإلكتروني (فيزا / ماستركارد)'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="accent-[#C25E3E] cursor-pointer"
                  style={{ accentColor: '#C25E3E' }}
                />
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/60">
                  <CreditCard size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-rawaa-dark">بطاقات الدفع البنكية (فيزا / ماستركارد)</div>
                  <div className="text-[10.5px] text-rawaa-muted">سداد إلكتروني مباشر عبر البطاقة الائتمانية والخصم المباشر</div>
                </div>
              </div>

              <div>
                {isCardActive ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-600" />
                    متاح
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    قريباً
                  </span>
                )}
              </div>
            </label>
          </div>

          {!hasAnyPaymentMethod && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0" />
              <span>تم تعطيل كافة وسائل الدفع لحسابك من قِبل إدارة المتجر. يرجى التواصل مع الدعم.</span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-rawaa-dark mb-1">ملاحظات لشركة الشحن (اختياري)</label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة"
            className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-1.5 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary"
          />
        </div>

        {/* Order total preview */}
        <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-rawaa-border/60 text-xs space-y-1">
          <div className="flex justify-between text-rawaa-muted">
            <span>قيمة المنتجات:</span>
            <span className="font-bold text-rawaa-dark">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-rawaa-muted">
            <span>الشحن:</span>
            <span className="font-bold text-emerald-600">
              {shippingFee === 0 ? 'مجاناً' : formatPrice(shippingFee)}
            </span>
          </div>
          <div className="flex justify-between font-black text-sm text-rawaa-dark pt-1.5 border-t border-rawaa-border">
            <span>المجموع النهائي:</span>
            <span className="text-rawaa-primary font-heading text-base">{formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* Submit button - Sticky bottom bar */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-3 pb-1 border-t border-rawaa-border/60 -mx-4 sm:-mx-6 px-4 sm:px-6 shadow-soft-sm mt-3">
          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className={`w-full text-white text-xs font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-soft-sm transition-all disabled:opacity-50 ${
              !canSubmit
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-98 cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>جاري حفظ الطلب وتأكيده...</span>
              </>
            ) : !canSubmit ? (
              <>
                <Lock size={15} />
                <span>
                  {isBlocked
                    ? 'الحساب محظور من الشراء'
                    : isInactive
                    ? 'الحساب قيد المراجعة والاعتماد'
                    : 'صلاحية إتمام الطلبات معطلة لحسابك'}
                </span>
              </>
            ) : (
              <>
                <Lock size={15} />
                <span>تأكيد وإرسال الطلب الآن ({formatPrice(totalAmount)})</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-rawaa-subtle text-center mt-2">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>شحن سريع مع إمكانية فحص ومعاينة المنتج قبل الاستلام</span>
          </div>
        </div>
      </form>
    </div>
  );
}

