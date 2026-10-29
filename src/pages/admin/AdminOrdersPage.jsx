import { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  validateEmail,
  validateEgyptianPhone,
  validatePersonName,
  normalizeEgyptianPhone,
  sanitizeText
} from '../../utils/validators';
import OrdersHeader from '../../components/admin/orders/OrdersHeader';
import OrderStatusPills from '../../components/admin/orders/OrderStatusPills';
import OrdersFilterBar from '../../components/admin/orders/OrdersFilterBar';
import OrdersTable from '../../components/admin/orders/OrdersTable';
import OrderDetailsModal from '../../components/admin/orders/OrderDetailsModal';
import ManualOrderModal from '../../components/admin/orders/ManualOrderModal';

const INITIAL_MANUAL_ORDER = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  city: 'القاهرة',
  address: '',
  productId: '',
  quantity: 1,
  paymentMethod: 'الدفع عند الاستلام (COD)',
  notes: ''
};

export default function AdminOrdersPage() {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
    addOrder,
    isLoadingOrders,
    isRealtimeConnected,
    isSyncing,
    refreshAllRealtimeData
  } = useAdmin();
  const { allProducts, addToast } = useShop();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Selected order details drawer
  const [activeOrder, setActiveOrder] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Manual new order modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [manualOrder, setManualOrder] = useState(INITIAL_MANUAL_ORDER);

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (activeOrder || isAddModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [activeOrder, isAddModalOpen]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return (orders || []).filter((ord) => {
      const matchQuery =
        !searchQuery.trim() ||
        ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customerName.includes(searchQuery) ||
        ord.customerPhone.includes(searchQuery);

      const matchStatus = statusFilter === 'all' || ord.deliveryStatus === statusFilter;
      const matchCity = cityFilter === 'all' || ord.city === cityFilter;
      const matchPayment =
        paymentFilter === 'all' ||
        ord.paymentMethod.toLowerCase().includes(paymentFilter.toLowerCase());

      return matchQuery && matchStatus && matchCity && matchPayment;
    });
  }, [orders, searchQuery, statusFilter, cityFilter, paymentFilter]);

  const handleCreateManualOrder = async (e) => {
    e.preventDefault();

    const cleanName = sanitizeText(manualOrder.customerName);
    const nameErr = validatePersonName(cleanName, true, 2, 70);
    if (nameErr) {
      if (addToast) addToast(nameErr, 'warning');
      return;
    }

    const cleanPhone = normalizeEgyptianPhone(manualOrder.customerPhone);
    const phoneErr = validateEgyptianPhone(cleanPhone);
    if (phoneErr) {
      if (addToast) addToast(phoneErr, 'warning');
      return;
    }

    const cleanEmail = sanitizeText(manualOrder.customerEmail);
    if (cleanEmail) {
      const emailErr = validateEmail(cleanEmail);
      if (emailErr) {
        if (addToast) addToast(emailErr, 'warning');
        return;
      }
    }

    const cleanAddress = sanitizeText(manualOrder.address);
    if (!cleanAddress || cleanAddress.length < 5) {
      if (addToast) addToast('يرجى كتابة عنوان التوصيل بالتفصيل (5 أحرف على الأقل)', 'warning');
      return;
    }

    const qty = parseInt(manualOrder.quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 100) {
      if (addToast) addToast('الكمية المطلوبة يجب أن تكون بين 1 و 100', 'warning');
      return;
    }

    const product = (allProducts || []).find((p) => p.id === manualOrder.productId) || (allProducts || [])[0];
    const price = product ? product.price : 0;
    const total = price * qty;

    const orderPayload = {
      customerName: cleanName,
      customerPhone: cleanPhone,
      customerEmail: cleanEmail,
      city: manualOrder.city || 'القاهرة',
      address: cleanAddress,
      total,
      paymentMethod: manualOrder.paymentMethod || 'الدفع عند الاستلام (COD)',
      deliveryStatus: 'بانتظار التأكيد',
      items: [
        {
          id: product ? product.id : 'custom',
          name: product ? product.name : 'منتج بيبي زون',
          price,
          quantity: qty,
          color: 'اللون القياسي',
          image: product ? product.mainImage : ''
        }
      ],
      notes: sanitizeText(manualOrder.notes || '')
    };

    await addOrder(orderPayload);
    if (addToast) addToast('تم تسجيل الطلب اليدوي بنجاح', 'success');
    setIsAddModalOpen(false);
    setManualOrder(INITIAL_MANUAL_ORDER);
  };

  const handleConfirmDeleteOrder = () => {
    if (!deleteConfirmId) return;
    deleteOrder(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const handleUpdateStatusAndActive = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => ({ ...prev, deliveryStatus: newStatus }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <OrdersHeader
        isRealtimeConnected={isRealtimeConnected}
        isLoadingOrders={isLoadingOrders}
        isSyncing={isSyncing}
        onRefresh={() => refreshAllRealtimeData()}
        onOpenManualOrder={() => {
          setManualOrder({
            ...INITIAL_MANUAL_ORDER,
            productId: allProducts[0]?.id || ''
          });
          setIsAddModalOpen(true);
        }}
      />

      {/* Quick Status Count Pills */}
      <OrderStatusPills
        orders={orders}
        statusFilter={statusFilter}
        onSelectStatus={setStatusFilter}
      />

      {/* Search and Filters Bar */}
      <OrdersFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
      />

      {/* Orders Table & Mobile View */}
      <OrdersTable
        isLoadingOrders={isLoadingOrders}
        filteredOrders={filteredOrders}
        allOrdersCount={orders.length}
        onViewOrder={setActiveOrder}
        onDeleteOrder={setDeleteConfirmId}
        onConfirmOrder={(orderId) => updateOrderStatus(orderId, 'تم تأكيد الطلب')}
        onOpenManualOrder={() => {
          setManualOrder({
            ...INITIAL_MANUAL_ORDER,
            productId: allProducts[0]?.id || ''
          });
          setIsAddModalOpen(true);
        }}
      />

      {/* Order Details Modal Portal */}
      <OrderDetailsModal
        order={activeOrder}
        onClose={() => setActiveOrder(null)}
        onUpdateStatus={handleUpdateStatusAndActive}
      />

      {/* Manual Add Order Modal Portal */}
      <ManualOrderModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setManualOrder(INITIAL_MANUAL_ORDER);
        }}
        allProducts={allProducts}
        manualOrder={manualOrder}
        onChangeManualOrder={(updates) => setManualOrder((prev) => ({ ...prev, ...updates }))}
        onSubmit={handleCreateManualOrder}
      />

      {/* Confirmation modal for order deletion */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="تأكيد حذف الطلب"
        message={`هل أنت متأكد من رغبتك في حذف الطلب رقم #${deleteConfirmId || ''} نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="تأكيد الحذف"
        cancelText="إلغاء"
        isDestructive={true}
        onConfirm={handleConfirmDeleteOrder}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
