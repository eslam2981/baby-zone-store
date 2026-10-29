import { useState, useCallback, useMemo } from 'react';
import { customersApi, ordersApi, reviewsApi } from '../../services/api';
import { DEFAULT_CUSTOMER_PERMISSIONS } from '../../constants/permissions';
import { STORAGE_KEYS, ADMIN_SESSION_KEYS } from '../../constants/storageKeys';
import { syncBus } from '../../utils/syncBus';

export function useAdminCustomers({ orders, setOrders, setReviews, user, setUser, addToast, addActivity }) {
  const [customers, setCustomers] = useState([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);

  const mergedCustomers = useMemo(() => {
    const processedCustomers = (customers || []).map((c) => {
      const custEmail = (c.email || '').trim().toLowerCase();
      const custPhone = (c.phone || '').trim();

      const custOrders = (orders || []).filter((ord) => {
        const ordEmail = (ord.customerEmail || '').trim().toLowerCase();
        const ordPhone = (ord.customerPhone || '').trim();
        return (
          (custEmail && ordEmail && custEmail === ordEmail) ||
          (custPhone && ordPhone && custPhone === ordPhone)
        );
      });

      const actualOrdersCount = custOrders.length > 0 
        ? custOrders.length 
        : (orders.length === 0 ? Number(c.ordersCount || 0) : 0);
      const actualTotalSpent = custOrders.length > 0
        ? custOrders.reduce((sum, ord) => sum + (Number(ord.total) || 0), 0)
        : (orders.length === 0 ? Number(c.totalSpent || 0) : 0);

      const latestOrder = custOrders[0]?.date || c.lastOrder || null;

      return {
        ...c,
        ordersCount: actualOrdersCount,
        totalSpent: actualTotalSpent,
        lastOrder: latestOrder,
        isVip: c.role === 'vip_customer' || Boolean(c.isVip)
      };
    });

    const result = [...processedCustomers];
    for (const ord of (orders || [])) {
      const ordEmail = (ord.customerEmail || '').trim().toLowerCase();
      const ordPhone = (ord.customerPhone || '').trim();
      const ordName = (ord.customerName || '').trim();

      const exists = result.some((c) => {
        const cEmail = (c.email || '').trim().toLowerCase();
        const cPhone = (c.phone || '').trim();
        return (
          (cEmail && ordEmail && cEmail === ordEmail) ||
          (cPhone && ordPhone && cPhone === ordPhone)
        );
      });

      if (!exists && (ordEmail || ordPhone || ordName)) {
        const guestOrders = orders.filter((o) => {
          const oEmail = (o.customerEmail || '').trim().toLowerCase();
          const oPhone = (o.customerPhone || '').trim();
          return (
            (ordEmail && oEmail && ordEmail === oEmail) ||
            (ordPhone && oPhone && ordPhone === oPhone)
          );
        });

        const guestTotal = guestOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        result.push({
          id: `cust-${ord.id}`,
          name: ordName || 'عميل زائر',
          phone: ordPhone,
          email: ordEmail || `guest-${ord.id}@babyzone-egypt.com`,
          city: ord.city || 'القاهرة',
          address: ord.address || '',
          role: 'customer',
          permissions: ['view_catalog', 'place_orders'],
          ordersCount: guestOrders.length,
          totalSpent: guestTotal,
          status: 'نشط',
          joinedDate: ord.date ? ord.date.split('T')[0] : new Date().toISOString().split('T')[0],
          isVip: false,
          lastOrder: guestOrders[0]?.date || ord.date
        });
      }
    }

    return result;
  }, [customers, orders]);

  const updateCustomer = useCallback(async (customerId, updatedData) => {
    setCustomers((prev) => {
      const exists = prev.some(
        (c) =>
          String(c.id) === String(customerId) ||
          (updatedData.email && c.email?.toLowerCase().trim() === updatedData.email.toLowerCase().trim())
      );
      if (exists) {
        return prev.map((c) =>
          String(c.id) === String(customerId) ||
          (updatedData.email && c.email?.toLowerCase().trim() === updatedData.email.toLowerCase().trim())
            ? { ...c, ...updatedData }
            : c
        );
      }
      const synthesized = (mergedCustomers || []).find(
        (c) =>
          String(c.id) === String(customerId) ||
          (updatedData.email && c.email?.toLowerCase().trim() === updatedData.email.toLowerCase().trim())
      );
      return [{ ...(synthesized || {}), id: customerId, ...updatedData }, ...prev];
    });

    // Update active storefront user instantly if matching the edited customer
    const custEmail = (updatedData.email || '').toLowerCase().trim();
    const userEmail = (user?.email || '').toLowerCase().trim();
    const custPhone = (updatedData.phone || '').trim();
    const userPhone = (user?.phone || '').trim();
    const matchId = customerId && user && String(user.id) === String(customerId);
    const matchEmail = custEmail && userEmail && custEmail === userEmail;
    const matchPhone = custPhone && userPhone && custPhone === userPhone;

    if (user && setUser && (matchId || matchEmail || matchPhone)) {
      const isVip = Boolean(updatedData.isVip ?? updatedData.is_vip ?? (updatedData.role === 'vip_customer'));
      const isElevatedAdmin = updatedData.role === 'admin' || updatedData.role === 'supervisor';
      const nextRole = updatedData.role || (isVip ? 'vip_customer' : 'customer');
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...updatedData,
          role: nextRole,
          isVip,
          isAdmin: isElevatedAdmin ? true : prev.isAdmin
        };
      });
    }

    // Broadcast admin elevation or demotion if role changed
    if (updatedData.role === 'admin' || updatedData.role === 'supervisor') {
      syncBus.emit('ADMIN_ADDED', {
        admin: {
          id: customerId,
          name: updatedData.name,
          email: updatedData.email,
          role: updatedData.role,
          status: updatedData.status || 'نشط',
          permissions: updatedData.permissions || ['all']
        },
        timestamp: Date.now()
      });
    } else if (
      updatedData.role === 'customer' ||
      updatedData.role === 'vip_customer' ||
      updatedData.role === 'wholesaler'
    ) {
      syncBus.emit('ADMIN_REMOVED', {
        adminId: customerId,
        email: updatedData.email,
        timestamp: Date.now()
      });
    }

    if (addActivity) {
      addActivity('تحديث ملف وصلاحيات العميل', `العميل ${updatedData.name || customerId}`, 'customer');
    }
    if (addToast) {
      addToast('تم حفظ بيانات وتعديلات العميل بنجاح', 'success');
    }

    syncBus.emit('CUSTOMER_UPDATED', {
      customerId,
      customer: updatedData,
      email: updatedData.email,
      phone: updatedData.phone,
      timestamp: Date.now()
    });

    try {
      const payload = {};
      if (updatedData.name !== undefined) payload.name = updatedData.name;
      if (updatedData.email !== undefined) payload.email = updatedData.email;
      if (updatedData.phone !== undefined) payload.phone = updatedData.phone;
      if (updatedData.city !== undefined) payload.city = updatedData.city;
      if (updatedData.address !== undefined) payload.address = updatedData.address;
      if (updatedData.role !== undefined) payload.role = updatedData.role;
      if (updatedData.permissions !== undefined) payload.permissions = updatedData.permissions;
      if (updatedData.isVip !== undefined) payload.is_vip = Boolean(updatedData.isVip);
      if (updatedData.is_vip !== undefined) payload.is_vip = Boolean(updatedData.is_vip);
      if (updatedData.status !== undefined) payload.status = updatedData.status;
      if (updatedData.notes !== undefined) payload.notes = updatedData.notes;

      if (Object.keys(payload).length > 0) {
        await customersApi.update(customerId, payload);
      }
    } catch (e) {
      console.warn('API customer update notice:', e.message);
    }
  }, [addToast, addActivity, mergedCustomers, setUser, user]);

  const updateCustomerStatus = useCallback((customerId, statusUpdate) => {
    const patch = typeof statusUpdate === 'string' ? { status: statusUpdate } : statusUpdate;
    return updateCustomer(customerId, patch);
  }, [updateCustomer]);

  const updateCustomerPermissions = useCallback((customerId, permissions) => {
    return updateCustomer(customerId, { permissions });
  }, [updateCustomer]);

  const addCustomer = useCallback(async (customerData) => {
    const id = customerData.id || `cust-${Date.now()}`;
    const newCust = {
      ...customerData,
      id,
      ordersCount: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      status: customerData.status || 'نشط',
      permissions: customerData.permissions || DEFAULT_CUSTOMER_PERMISSIONS,
      role: customerData.role || 'customer'
    };

    setCustomers((prev) => [newCust, ...prev]);
    if (addActivity) {
      addActivity('إضافة عميل جديد', `${newCust.name} (${newCust.phone || newCust.email})`, 'customer');
    }
    if (addToast) {
      addToast(`تم إضافة العميل «${newCust.name}» بنجاح`, 'success');
    }

    try {
      await customersApi.create({
        id,
        name: newCust.name,
        email: newCust.email,
        phone: newCust.phone || '',
        city: newCust.city || 'القاهرة',
        address: newCust.address || '',
        role: newCust.role,
        permissions: newCust.permissions,
        is_vip: Boolean(newCust.isVip),
        status: newCust.status,
        notes: newCust.notes || ''
      });
    } catch (e) {
      console.warn('API customer insert notice:', e.message);
    }
  }, [addToast, addActivity]);

  const deleteCustomer = useCallback(async (customerId, emailHint, phoneHint) => {
    const target =
      (mergedCustomers || []).find((c) => String(c.id) === String(customerId)) ||
      (customers || []).find((c) => String(c.id) === String(customerId));
    const targetEmail = (emailHint || target?.email || '').toLowerCase().trim();
    const targetPhone = (phoneHint || target?.phone || '').trim();
    const targetName = target?.name ? target.name.trim() : null;

    setCustomers((prev) =>
      prev.filter(
        (c) =>
          String(c.id) !== String(customerId) &&
          (!targetEmail || (c.email || '').toLowerCase().trim() !== targetEmail) &&
          (!targetPhone || (c.phone || '').trim() !== targetPhone)
      )
    );

    if (setOrders) {
      setOrders((prev) =>
        prev.filter((o) => {
          const oId = String(o.customerId || o.customer_id || '');
          const oEmail = (o.customerEmail || o.customer_email || '').toLowerCase().trim();
          const oPhone = (o.customerPhone || o.customer_phone || '').trim();
          const oName = (o.customerName || o.customer_name || '').trim();

          if (customerId && oId === String(customerId)) return false;
          if (targetEmail && oEmail && oEmail === targetEmail) return false;
          if (targetPhone && oPhone && oPhone === targetPhone) return false;
          if (targetName && oName && oName === targetName) return false;
          return true;
        })
      );
    }

    if (setReviews && targetEmail) {
      setReviews((prev) =>
        prev.filter((r) => {
          const rEmail = (r.customerEmail || r.customer_email || '').toLowerCase().trim();
          return rEmail !== targetEmail;
        })
      );
    }

    if (addActivity) {
      addActivity('حذف عميل وسجل مشترياته', `تم حذف العميل ${targetName || customerId} وكافة سجلات طلباته وصلاحياته`, 'customer');
    }
    if (addToast) {
      addToast('تم حذف العميل وكافة سجلات مشترياته وصلاحياته نهائياً من قاعدة البيانات', 'info');
    }

    syncBus.emit('CUSTOMER_DELETED', {
      customerId: String(customerId),
      email: targetEmail,
      phone: targetPhone,
      name: targetName,
      timestamp: Date.now()
    });

    syncBus.emit('CUSTOMER_UPDATED', {
      action: 'delete',
      customerId: String(customerId),
      email: targetEmail,
      phone: targetPhone
    });

    syncBus.emit('ORDERS_UPDATED', {
      action: 'delete_by_customer',
      customerId: String(customerId),
      email: targetEmail
    });

    // Check if the currently active storefront user matches the deleted customer and purge their session instantly
    if (user && setUser) {
      const activeEmail = (user.email || '').toLowerCase().trim();
      const activePhone = (user.phone || '').trim();
      const isMatch =
        String(user.id) === String(customerId) ||
        (targetEmail && activeEmail && activeEmail === targetEmail) ||
        (targetPhone && activePhone && activePhone === targetPhone);

      if (isMatch) {
        setUser(null);
        try {
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem(STORAGE_KEYS.CART);
          localStorage.removeItem(STORAGE_KEYS.ORDERS);
          localStorage.removeItem(STORAGE_KEYS.WISHLIST);
          ADMIN_SESSION_KEYS.forEach((k) => sessionStorage.removeItem(k));
        } catch (err) {
          console.warn('Storage purge warning:', err);
        }
      }
    }

    try {
      await Promise.allSettled([
        customersApi.delete(customerId, targetEmail),
        ordersApi.deleteByCustomer(customerId, targetEmail, targetPhone),
        reviewsApi.deleteByCustomer(targetEmail)
      ]);
    } catch (e) {
      console.warn('API customer cascade delete notice:', e.message);
    }
  }, [customers, mergedCustomers, user, setUser, setOrders, setReviews, addToast, addActivity]);

  return {
    customers,
    setCustomers,
    mergedCustomers,
    isLoadingCustomers,
    setIsLoadingCustomers,
    updateCustomer,
    updateCustomerStatus,
    updateCustomerPermissions,
    addCustomer,
    deleteCustomer
  };
}

