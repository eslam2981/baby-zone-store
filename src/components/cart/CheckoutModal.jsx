import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
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
import CheckoutAuthGuard from './checkout/CheckoutAuthGuard';
import CheckoutSuccessView from './checkout/CheckoutSuccessView';
import CheckoutForm from './checkout/CheckoutForm';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  totalAmount,
  subtotal,
  shippingFee,
  onOrderSuccess
}) {
  const { formatPrice, addToast, clearCart, user, setUser, setIsAuthOpen, allProducts, updateProductStock } = useShop();
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
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      city: user?.city || 'القاهرة',
      address: user?.address || '',
      notes: '',
      paymentMethod: 'الدفع عند الاستلام (COD)'
    });
    onClose();
  };

  if (!isOpen) return null;

  // Unauthenticated user guard - purchase is strictly restricted to logged in customers
  if (!user) {
    return (
      <CheckoutAuthGuard
        onClose={handleClose}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user?.status === 'محظور') {
      addToast('عذراً، هذا الحساب محظور حالياً من قبل الإدارة', 'error');
      return;
    }
    if (user?.status === 'غير نشط') {
      addToast('حسابك غير نشط وقيد المراجعة من الإدارة. إتمام الطلبات معلق حتى اعتماد الحساب.', 'warning');
      return;
    }
    if (user && !user.isAdmin && user.permissions && !user.permissions.includes('place_orders') && !user.permissions.includes('*')) {
      addToast('صلاحية إتمام الطلبات معطلة لحسابك من قِبل الإدارة.', 'warning');
      return;
    }

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

      // Real-time stock decrement for ordered items across all inventory monitors
      if (Array.isArray(orderItems)) {
        for (const item of orderItems) {
          const prodId = item.id || item.productId;
          if (prodId && typeof updateProductStock === 'function') {
            const currentItem = (allProducts || []).find((p) => p.id === prodId);
            if (currentItem) {
              const currentStock = Number(currentItem.stockCount ?? currentItem.stock ?? 15);
              const deductQty = Number(item.quantity) || 1;
              const nextStock = Math.max(0, currentStock - deductQty);
              updateProductStock(prodId, nextStock);
            }
          }
        }
      }

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
      clearCart({ silent: true });
      // Reset form fields completely after confirmation so the form returns clean/empty
      setFormData({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        city: user?.city || 'القاهرة',
        address: user?.address || '',
        notes: '',
        paymentMethod: 'الدفع عند الاستلام (COD)'
      });
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
      className="fixed inset-0 z-[9999] bg-rawaa-dark/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rawaa-border relative my-auto max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 left-4 z-20 p-1.5 rounded-full bg-rawaa-soft/90 hover:bg-rawaa-border text-rawaa-muted hover:text-rawaa-dark transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex-1 overflow-y-auto custom-modal-scroll p-4 sm:p-6">
          {confirmedOrder ? (
            <CheckoutSuccessView
              order={confirmedOrder}
              formatPrice={formatPrice}
              onNavigateToTracking={() => {
                handleClose();
                navigate('/track-order');
              }}
              onClose={handleClose}
            />
          ) : (
            <CheckoutForm
              user={user}
              formData={formData}
              setFormData={setFormData}
              subtotal={subtotal}
              shippingFee={shippingFee}
              totalAmount={totalAmount}
              formatPrice={formatPrice}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
