import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  X,
  Lock,
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Wallet,
  Sparkles,
  Loader2,
  User,
  ArrowLeft
} from 'lucide-react';
import { ordersApi, customersApi } from '../../services/api';
import { useShop } from '../../context/ShopContext';
import { syncBus } from '../../utils/syncBus';
import {
  validateEmail,
  validateEgyptianPhone,
  validatePersonName,
  normalizeEgyptianPhone,
  sanitizeText
} from '../../utils/validators';

export default function CheckoutModal({ isOpen, onClose, cart, totalAmount, subtotal, shippingFee, discountAmount, onOrderSuccess }) {
  const { formatPrice, addToast, clearCart, user, setUser, setIsAuthOpen } = useShop();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: user?.city || 'القاهرة',
    address: user?.address || '',
    notes: '',
    paymentMethod: 'الدفع عند الاستلام (COD)'
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: user.email || prev.email || '',
        phone: prev.phone || user.phone || '',
        city: prev.city || user.city || 'القاهرة',
        address: prev.address || user.address || ''
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setConfirmedOrder(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    setConfirmedOrder(null);
    onClose();
  };

  if (!isOpen) return null;

  // Unauthenticated user guard - purchase is strictly restricted to logged in customers
  if (!user) {
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] bg-rawaa-dark/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-soft-xl border border-rawaa-border relative my-8 text-center animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-5 left-5 p-1.5 rounded-full bg-rawaa-soft hover:bg-rawaa-border text-rawaa-muted transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-soft-xs">
            <Lock size={30} />
          </div>
          <h3 className="font-heading text-xl font-black text-rawaa-dark mb-2">
            تسجيل الدخول مطلوب لإتمام الطلب
          </h3>
          <p className="text-xs text-rawaa-muted leading-relaxed mb-6">
            لضمان توفير صفحتك الشخصية الخاصة وتوثيق سجل مشترياتك ومتابعة مسار شحنتك لحظة بلحظة، يجب تسجيل الدخول أو إنشاء حسابك أولاً.
          </p>
          <button
            type="button"
            onClick={() => {
              handleClose();
              setIsAuthOpen(true);
            }}
            className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3.5 px-6 rounded-full transition-all shadow-soft-sm hover:shadow-soft-md cursor-pointer mb-2.5 flex items-center justify-center gap-2"
          >
            <User size={16} />
            <span>تسجيل الدخول / إنشاء حساب جديد</span>
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="w-full text-xs text-rawaa-muted hover:text-rawaa-dark py-2 transition-colors cursor-pointer"
          >
            العودة إلى سلة التسوق
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = sanitizeText(formData.name);
    const cleanPhone = normalizeEgyptianPhone(formData.phone);
    const cleanAddress = sanitizeText(formData.address);
    const cleanEmail = sanitizeText(formData.email);

    const nameErr = validatePersonName(cleanName, true, 3, 70);
    if (nameErr) {
      addToast(nameErr, 'warning');
      return;
    }

    const phoneErr = validateEgyptianPhone(cleanPhone);
    if (phoneErr) {
      addToast(phoneErr, 'warning');
      return;
    }

    if (!cleanAddress || cleanAddress.length < 8) {
      addToast('يرجى كتابة العنوان بالتفصيل لضمان دقة وسرعة التوصيل', 'warning');
      return;
    }

    if (cleanEmail) {
      const emailErr = validateEmail(cleanEmail);
      if (emailErr) {
        addToast(emailErr, 'warning');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const orderId = `EGY-${Math.floor(10000 + Math.random() * 90000)}`;

      const orderItems = cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        color: item.selectedColor?.name || 'اللون المختار',
        image: item.product.mainImage
      }));

      const dbOrder = {
        id: orderId,
        customer_name: cleanName,
        customer_phone: cleanPhone,
        customer_email: user.email.trim(),
        shipping_address: cleanAddress,
        city: formData.city,
        total_amount: totalAmount,
        payment_method: formData.paymentMethod,
        status: 'بانتظار التأكيد',
        items: orderItems
      };

      const orderSnapshot = {
        id: orderId,
        name: cleanName,
        phone: cleanPhone,
        city: formData.city,
        paymentMethod: formData.paymentMethod,
        totalAmount: totalAmount
      };

      await ordersApi.create(dbOrder);

      // Instantly notify Dashboard and Customer tracking pages via zero-latency syncBus
      syncBus.emit('ORDER_ADDED', { orderId, order: dbOrder, timestamp: Date.now() });

      // Synchronize customer profile and permissions via customers domain service safely
      const customerEmail = user?.email ? user.email.trim() : (formData.email || '').trim();
      await customersApi.syncOnOrder({
        name: cleanName,
        email: customerEmail,
        phone: cleanPhone,
        city: formData.city,
        address: cleanAddress,
        totalAmount
      });
      syncBus.emit('CUSTOMER_UPDATED', { email: customerEmail, phone: cleanPhone, timestamp: Date.now() });

      // Update current user state so saved phone and address persist
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          name: cleanName,
          phone: cleanPhone,
          city: formData.city,
          address: cleanAddress
        }));
      }

      setConfirmedOrder(orderSnapshot);
      clearCart();
      if (onOrderSuccess) onOrderSuccess(orderId);
      addToast(`تم تأكيد طلبك بنجاح! رقم الطلب #${orderId}`, 'success');
    } catch (err) {
      console.error('Order creation error:', err);
      addToast('حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-rawaa-dark/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-soft-xl border border-rawaa-border relative my-auto sm:my-8 max-h-[92vh] overflow-y-auto overflow-x-hidden custom-modal-scroll animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 left-5 p-1.5 rounded-full bg-rawaa-soft hover:bg-rawaa-border text-rawaa-muted transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {confirmedOrder ? (
          /* Success confirmation screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 className="font-heading text-xl font-black text-rawaa-dark mb-1">
                تهانينا! تم استلام طلبك بنجاح
              </h3>
              <p className="text-xs text-rawaa-muted max-w-sm mx-auto">
                شكراً لثقتك في بيبي زون. رقم طلبك المعتمد هو:
              </p>
              <div className="inline-block bg-rawaa-soft border border-rawaa-border text-rawaa-primary font-mono text-lg font-black px-4 py-2 rounded-2xl mt-2">
                #{confirmedOrder.id}
              </div>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-rawaa-border/60 text-xs text-right space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between font-bold text-rawaa-dark">
                <span>الاسم:</span>
                <span>{confirmedOrder.name}</span>
              </div>
              <div className="flex justify-between text-rawaa-muted">
                <span>المحافظة:</span>
                <span>{confirmedOrder.city}</span>
              </div>
              <div className="flex justify-between text-rawaa-muted">
                <span>طريقة الدفع:</span>
                <span>{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-bold text-rawaa-primary pt-2 border-t border-rawaa-border">
                <span>المبلغ المطلوب:</span>
                <span>{formatPrice(confirmedOrder.totalAmount)}</span>
              </div>
            </div>

            <p className="text-[11px] text-rawaa-muted">
              سيتواصل معك فريق خدمة العملاء على رقم <strong>{confirmedOrder.phone}</strong> لتأكيد ميعاد التوصيل مع مندوب الشحن.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  navigate('/track-order');
                }}
                className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3.5 px-6 rounded-full transition-all shadow-soft-sm hover:shadow-soft-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Truck size={16} />
                <span>الانتقال إلى صفحة طلباتي ومتابعة الشحنة</span>
                <ArrowLeft size={14} />
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full border border-rawaa-border hover:bg-rawaa-soft text-rawaa-muted hover:text-rawaa-dark text-xs font-semibold py-2.5 px-4 rounded-full transition-colors cursor-pointer"
              >
                متابعة تصفح المتجر
              </button>
            </div>
          </div>
        ) : (
          /* Order input form */
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

            {/* Customer account connection banner */}
            <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 mb-4 flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name ? user.name.charAt(0) : <User size={15} />}
                </div>
                <div>
                  <span className="font-bold text-emerald-950 block">حساب العميل: {user.name}</span>
                  <span className="text-[11px] text-emerald-700">{user.email} &bull; سيتم ربط هذا الطلب بصفحتك الخاصة</span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs shrink-0">
                حساب موثق
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
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
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl px-3.5 py-2 text-xs text-rawaa-dark outline-none focus:bg-white focus:border-rawaa-primary cursor-pointer"
                  >
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                    <option value="الدقهلية">الدقهلية (المنصورة)</option>
                    <option value="الغربية">الغربية (طنطا)</option>
                    <option value="الشرقية">الشرقية (الزقازيق)</option>
                    <option value="القليوبية">القليوبية</option>
                    <option value="البحيرة">البحيرة</option>
                    <option value="المنوفية">المنوفية</option>
                    <option value="دمياط">دمياط</option>
                    <option value="بورسعيد">بورسعيد</option>
                    <option value="السويس">السويس</option>
                    <option value="الإسماعيلية">الإسماعيلية</option>
                    <option value="كفر الشيخ">كفر الشيخ</option>
                    <option value="بني سويف">بني سويف</option>
                    <option value="الفيوم">الفيوم</option>
                    <option value="المنيا">المنيا</option>
                    <option value="أسيوط">أسيوط</option>
                    <option value="سوهاج">سوهاج</option>
                    <option value="قنا">قنا</option>
                    <option value="الأقصر">الأقصر</option>
                    <option value="أسوان">أسوان</option>
                  </select>
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
              <div>
                <label className="block text-xs font-bold text-rawaa-dark mb-1.5">طريقة الدفع المفضلة</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      formData.paymentMethod.includes('الاستلام')
                        ? 'border-rawaa-primary bg-rawaa-primary/5 text-rawaa-dark font-bold'
                        : 'border-rawaa-border hover:bg-rawaa-soft text-rawaa-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="الدفع عند الاستلام (COD)"
                      checked={formData.paymentMethod === 'الدفع عند الاستلام (COD)'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="accent-rawaa-primary"
                    />
                    <Wallet size={15} className="text-rawaa-primary shrink-0" />
                    <span className="text-xs">نقداً عند الاستلام</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      formData.paymentMethod.includes('فودافون')
                        ? 'border-rawaa-primary bg-rawaa-primary/5 text-rawaa-dark font-bold'
                        : 'border-rawaa-border hover:bg-rawaa-soft text-rawaa-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="فودافون كاش / إنستاباي"
                      checked={formData.paymentMethod === 'فودافون كاش / إنستاباي'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="accent-rawaa-primary"
                    />
                    <CreditCard size={15} className="text-rawaa-primary shrink-0" />
                    <span className="text-xs">فودافون كاش / إنستاباي</span>
                  </label>
                </div>
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

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover active:scale-98 text-white text-xs font-bold py-3 rounded-full flex items-center justify-center gap-2 shadow-soft-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>جاري حفظ الطلب وتأكيده...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>تأكيد وإرسال الطلب الآن ({formatPrice(totalAmount)})</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-rawaa-subtle text-center">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>شحن سريع مع إمكانية فحص ومعاينة المنتج قبل الاستلام</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

