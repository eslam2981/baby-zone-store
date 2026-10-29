import { useState, useCallback } from 'react';
import { ordersApi } from '../../services/api';
import { formatDbOrder } from '../../utils/mappers';
import { syncBus } from '../../utils/syncBus';

export function useAdminOrders({ addToast, addActivity }) {
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    const paymentStatus = newStatus === 'تم التسليم' ? 'مدفوع بالكامل' : undefined;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            deliveryStatus: newStatus,
            status: newStatus,
            paymentStatus: paymentStatus || ord.paymentStatus
          };
        }
        return ord;
      })
    );

    if (addActivity) {
      addActivity('تحديث حالة الطلب', `الطلب ${orderId} أصبح: ${newStatus}`, 'order');
    }
    if (addToast) {
      addToast(`تم تحديث حالة الطلب #${orderId} إلى «${newStatus}»`, 'success');
    }

    syncBus.emit('ORDER_UPDATED', {
      orderId,
      newStatus,
      paymentStatus,
      timestamp: Date.now()
    });

    try {
      await ordersApi.updateStatus(orderId, newStatus);
    } catch (err) {
      console.error('API update order status error:', err);
    }
  }, [addToast, addActivity]);

  const deleteOrder = useCallback(async (orderId) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    if (addActivity) {
      addActivity('حذف طلب', `تم حذف الطلب ${orderId}`, 'order');
    }
    if (addToast) {
      addToast(`تم حذف الطلب #${orderId} بنجاح`, 'info');
    }

    syncBus.emit('ORDER_DELETED', { orderId, timestamp: Date.now() });

    try {
      await ordersApi.softDelete(orderId);
      await ordersApi.hardDelete(orderId);
    } catch (err) {
      console.error('API delete order error:', err);
    }
  }, [addToast, addActivity]);

  const addOrder = useCallback(async (orderData) => {
    const orderId = orderData.id || `EGY-${Date.now().toString().slice(-5)}`;
    const formattedOrder = {
      ...orderData,
      id: orderId,
      total: Number(orderData.total) || 0,
      totalAmount: Number(orderData.total) || 0,
      subtotal: Number(orderData.subtotal || orderData.total) || 0,
      deliveryStatus: orderData.deliveryStatus || 'بانتظار التأكيد',
      status: orderData.deliveryStatus || 'بانتظار التأكيد',
      date: new Date().toISOString()
    };

    setOrders((prev) => [formattedOrder, ...prev.filter((o) => o.id !== orderId)]);
    if (addActivity) {
      addActivity('تسجيل طلب جديد', `الطلب: ${orderId} للعميل: ${formattedOrder.customerName}`, 'order');
    }
    if (addToast) {
      addToast(`تم تسجيل الطلب #${orderId} بنجاح`, 'success');
    }

    syncBus.emit('ORDER_ADDED', { orderId, order: formattedOrder, timestamp: Date.now() });

    try {
      const dbOrder = {
        id: orderId,
        customer_name: formattedOrder.customerName,
        customer_phone: formattedOrder.customerPhone || '',
        customer_email: formattedOrder.customerEmail || '',
        shipping_address: formattedOrder.address || '',
        city: formattedOrder.city || 'القاهرة',
        total_amount: formattedOrder.total,
        payment_method: formattedOrder.paymentMethod || 'الدفع عند الاستلام (COD)',
        status: formattedOrder.deliveryStatus,
        items: formattedOrder.items || []
      };
      await ordersApi.create(dbOrder);
    } catch (err) {
      console.error('API insert order error:', err);
    }
    return formattedOrder;
  }, [addToast, addActivity]);

  const refreshOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      const data = await ordersApi.getAll();
      if (Array.isArray(data)) {
        const active = data.filter(
          (o) => o.status !== 'محذوف' && !o.id.startsWith('EGY-TEST') && o.id !== 'EGY-98421'
        );
        setOrders(active.map(formatDbOrder));
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('API refresh orders error:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  return {
    orders,
    setOrders,
    isLoadingOrders,
    setIsLoadingOrders,
    updateOrderStatus,
    deleteOrder,
    addOrder,
    refreshOrders
  };
}

