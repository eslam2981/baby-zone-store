import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { customersApi } from '../services/api';
import { DEFAULT_CUSTOMER_PERMISSIONS } from '../constants/permissions';
import { STORAGE_KEYS, SENSITIVE_LOCAL_STORAGE_KEYS, ADMIN_SESSION_KEYS } from '../constants/storageKeys';
import { syncBus } from '../utils/syncBus';

export function useCustomerAuth({ addToast, setIsAuthOpen, setCart, setWishlist }) {
  const [user, setUser] = useState(() => {
    try {
      // Restore active admin session on refresh if present
      const isAuthAdmin = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('babyzone_admin_auth') === 'true';
      if (isAuthAdmin) {
        const savedAdmin = sessionStorage.getItem('babyzone_admin_user');
        if (savedAdmin) {
          const parsedAdmin = JSON.parse(savedAdmin);
          return {
            id: parsedAdmin.id,
            name: parsedAdmin.name,
            email: parsedAdmin.email,
            isAdmin: true,
            role: parsedAdmin.role,
            permissions: parsedAdmin.permissions || ['all'],
            loggedInAt: new Date().toISOString()
          };
        }
      }

      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.isAdmin) {
          localStorage.removeItem(STORAGE_KEYS.USER);
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const currentUserId = user?.id;
  const currentUserEmail = user?.email ? user.email.toLowerCase().trim() : '';
  const currentUserPhone = user?.phone ? String(user.phone).trim() : '';
  const isCurrentUserAdmin = Boolean(user?.isAdmin);

  // Automatically sanitize and persist customer info
  useEffect(() => {
    try {
      if (user) {
        if (user.isAdmin) {
          localStorage.removeItem(STORAGE_KEYS.USER);
        } else {
          const safeCustomer = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            city: user.city || 'القاهرة',
            address: user.address || '',
            role: user.role || 'customer',
            status: user.status || 'نشط',
            permissions: Array.isArray(user.permissions) ? user.permissions : DEFAULT_CUSTOMER_PERMISSIONS,
            isVip: Boolean(user.isVip)
          };
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeCustomer));
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.error('User persistence error:', e);
    }
  }, [user]);

  // Real-time customer session termination when account is deleted from admin dashboard
  useEffect(() => {
    const purgeSession = () => {
      setUser(null);
      if (setCart) setCart([]);
      if (setWishlist) setWishlist([]);
      try {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.CART);
        localStorage.removeItem(STORAGE_KEYS.ORDERS);
        localStorage.removeItem(STORAGE_KEYS.WISHLIST);
        ADMIN_SESSION_KEYS.forEach((k) => sessionStorage.removeItem(k));
      } catch (err) {
        console.warn('Storage purge warning:', err);
      }
    };

    const unsubDelete = syncBus.on('CUSTOMER_DELETED', ({ customerId, email, phone }) => {
      const active = userRef.current;
      if (!active) return;
      const cleanEmail = email ? email.toLowerCase().trim() : '';
      const userEmail = active.email ? active.email.toLowerCase().trim() : '';
      const matchId = customerId && String(active.id) === String(customerId);
      const matchEmail = cleanEmail && userEmail && cleanEmail === userEmail;
      const matchPhone = phone && active.phone && String(phone).trim() === String(active.phone).trim();

      if (matchId || matchEmail || matchPhone) {
        purgeSession();
        if (addToast) {
          addToast('تم إنهاء الجلسة، الحساب غير متاح حالياً', 'info');
        }
      }
    });

    const unsubUpdate = syncBus.on('CUSTOMER_UPDATED', ({ customerId, customer, email, phone }) => {
      const active = userRef.current;
      if (!active) return;
      const cleanEmail = (email || customer?.email || '').toLowerCase().trim();
      const userEmail = (active.email || '').toLowerCase().trim();
      const matchId = customerId && String(active.id) === String(customerId);
      const matchEmail = cleanEmail && userEmail && cleanEmail === userEmail;
      const matchPhone = (phone || customer?.phone) && active.phone && String(phone || customer?.phone).trim() === String(active.phone).trim();

      if (matchId || matchEmail || matchPhone) {
        if (customer?.status === 'محظور') {
          purgeSession();
          if (addToast) addToast('تم إنهاء الجلسة، يرجى التواصل مع خدمة العملاء', 'warning');
          return;
        }

        const isVip = Boolean(customer?.isVip || customer?.is_vip || customer?.role === 'vip_customer');
        const nextRole = customer?.role || (isVip ? 'vip_customer' : 'customer');
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            name: customer?.name || prev.name,
            phone: customer?.phone || prev.phone,
            city: customer?.city || prev.city,
            address: customer?.address || prev.address,
            role: nextRole,
            isVip,
            permissions: Array.isArray(customer?.permissions) ? customer.permissions : prev.permissions,
            status: customer?.status || prev.status
          };
        });
      }
    });

    const custChannel = supabase
      .channel(`realtime_customer_sync_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'customers' },
        (payload) => {
          const active = userRef.current;
          if (!active) return;
          const old = payload.old;
          if (!old) return;
          const userEmail = active.email ? active.email.toLowerCase().trim() : '';
          const matchId = old.id && String(active.id) === String(old.id);
          const matchEmail = old.email && userEmail && old.email.toLowerCase().trim() === userEmail;
          const matchPhone = old.phone && active.phone && String(old.phone).trim() === String(active.phone).trim();

          if (matchId || matchEmail || matchPhone) {
            purgeSession();
            if (addToast) {
              addToast('تم إنهاء الجلسة، الحساب غير متاح حالياً', 'info');
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'customers' },
        (payload) => {
          const active = userRef.current;
          if (!active) return;
          const updated = payload.new;
          if (!updated) return;
          const userEmail = active.email ? active.email.toLowerCase().trim() : '';
          const matchId = updated.id && String(active.id) === String(updated.id);
          const matchEmail = updated.email && userEmail && updated.email.toLowerCase().trim() === userEmail;

          if (matchId || matchEmail) {
            if (updated.status === 'محظور') {
              purgeSession();
              if (addToast) addToast('تم إنهاء الجلسة، يرجى التواصل مع خدمة العملاء', 'warning');
              return;
            }

            const isVip = Boolean(updated.is_vip || updated.role === 'vip_customer');
            const nextRole = updated.role || (isVip ? 'vip_customer' : 'customer');
            setUser((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                name: updated.name || prev.name,
                phone: updated.phone || prev.phone,
                city: updated.city || prev.city,
                address: updated.address || prev.address,
                role: nextRole,
                isVip,
                permissions: Array.isArray(updated.permissions) ? updated.permissions : prev.permissions,
                status: updated.status || prev.status
              };
            });
          }
        }
      )
      .subscribe();

    if (!isCurrentUserAdmin && (currentUserId || currentUserEmail)) {
      customersApi
        .findByEmailOrPhone(currentUserEmail, currentUserPhone)
        .then((existing) => {
          if (!existing) return;
          if (existing.status === 'محظور') {
            purgeSession();
            if (addToast) addToast('تم إنهاء الجلسة، يرجى التواصل مع خدمة العملاء', 'warning');
            return;
          }
          const isVip = Boolean(existing.is_vip || existing.role === 'vip_customer');
          const nextRole = existing.role || (isVip ? 'vip_customer' : 'customer');
          setUser((prev) => {
            if (!prev) return null;
            // Prevent infinite loop by checking if fields actually changed
            const sameId = !existing.id || existing.id === prev.id;
            const sameName = !existing.name || existing.name === prev.name;
            const samePhone = !existing.phone || existing.phone === prev.phone;
            const sameCity = !existing.city || existing.city === prev.city;
            const sameAddress = !existing.address || existing.address === prev.address;
            const sameRole = prev.role === nextRole;
            const sameVip = prev.isVip === isVip;
            const sameStatus = !existing.status || existing.status === prev.status;
            const samePermissions = JSON.stringify(prev.permissions || []) === JSON.stringify(existing.permissions || prev.permissions || []);

            if (sameId && sameName && samePhone && sameCity && sameAddress && sameRole && sameVip && sameStatus && samePermissions) {
              return prev;
            }

            return {
              ...prev,
              id: existing.id || prev.id,
              name: existing.name || prev.name,
              phone: existing.phone || prev.phone,
              city: existing.city || prev.city,
              address: existing.address || prev.address,
              role: nextRole,
              isVip,
              permissions: Array.isArray(existing.permissions) ? existing.permissions : prev.permissions,
              status: existing.status || prev.status
            };
          });
        })
        .catch(() => {});
    }

    return () => {
      unsubDelete();
      unsubUpdate();
      supabase.removeChannel(custChannel);
    };
  }, [currentUserId, currentUserEmail, currentUserPhone, isCurrentUserAdmin, addToast, setCart, setWishlist]);

  const login = useCallback(async (email, name, extraData = {}) => {
    const cleanEmail = email?.trim()?.toLowerCase() || '';
    const fallbackName = cleanEmail ? cleanEmail.split('@')[0] : 'عميل بيبي زون';
    const displayName = (name && name.trim()) ? name.trim() : fallbackName;

    if (extraData?.isAdmin) {
      const adminUser = {
        email: cleanEmail,
        name: extraData.name || displayName || 'مشرف إداري',
        isAdmin: true,
        role: extraData.role || 'admin',
        permissions: extraData.permissions || ['all'],
        loggedInAt: new Date().toISOString()
      };
      setUser(adminUser);
      if (setIsAuthOpen) setIsAuthOpen(false);
      if (addToast) addToast(`مرحباً بك يا ${adminUser.name}!`, 'success');
      return adminUser;
    }

    const isRegistration = Boolean(extraData?.isRegistration);

    try {
      const { data: dbCust, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (fetchError) {
        console.warn('Supabase customer fetch notice:', fetchError);
      }

      if (dbCust) {
        if (dbCust.status === 'محظور') {
          const errMsg = 'عذراً، هذا الحساب محظور حالياً من قبل الإدارة';
          if (addToast) addToast(errMsg, 'error');
          return { success: false, error: errMsg };
        }

        if (isRegistration) {
          const errMsg = 'هذا البريد الإلكتروني مسجل بالفعل لدينا! ممنوع تكرار التسجيل بنفس الإيميل، يرجى التوجه لتبويب «تسجيل الدخول» أو استخدام بريد آخر.';
          if (addToast) addToast(errMsg, 'warning');
          return { success: false, error: errMsg };
        }

        const isVip = Boolean(dbCust.is_vip || dbCust.role === 'vip_customer');
        const loggedUser = {
          id: dbCust.id,
          email: cleanEmail,
          name: dbCust.name || displayName,
          phone: dbCust.phone || extraData.phone || '',
          city: dbCust.city || extraData.city || 'القاهرة',
          address: dbCust.address || extraData.address || '',
          role: dbCust.role || (isVip ? 'vip_customer' : 'customer'),
          isVip,
          status: dbCust.status || 'نشط',
          permissions: Array.isArray(dbCust.permissions) && dbCust.permissions.length > 0
            ? dbCust.permissions
            : DEFAULT_CUSTOMER_PERMISSIONS,
          isAdmin: false,
          loggedInAt: new Date().toISOString()
        };

        setUser(loggedUser);
        if (setIsAuthOpen) setIsAuthOpen(false);
        if (addToast) addToast(`مرحباً بعودتك يا ${loggedUser.name}!`, 'success');
        return loggedUser;
      }

      if (!isRegistration) {
        const errMsg = 'هذا الحساب غير مسجل أو تم حذفه من قِبل إدارة المتجر. يمكنك إنشاء حساب جديد من تبويب «إنشاء حساب جديد».';
        if (addToast) addToast(errMsg, 'error');
        return { success: false, error: errMsg };
      }

      const newId = `cust-${Date.now()}`;
      const newCustRecord = {
        id: newId,
        name: displayName,
        email: cleanEmail,
        phone: extraData.phone || '',
        city: extraData.city || 'القاهرة',
        address: extraData.address || '',
        role: 'customer',
        permissions: DEFAULT_CUSTOMER_PERMISSIONS,
        is_vip: false,
        status: 'نشط',
        orders_count: 0,
        total_spent: 0
      };

      try {
        await customersApi.create(newCustRecord);
      } catch (err) {
        console.warn('Customer create notice:', err);
      }

      const createdUser = {
        ...newCustRecord,
        isAdmin: false,
        loggedInAt: new Date().toISOString()
      };
      setUser(createdUser);
      if (setIsAuthOpen) setIsAuthOpen(false);
      if (addToast) addToast(`مرحباً بكِ في بيبي زون يا ${createdUser.name}! تم إنشاء حسابك وتسجيل دخولك بنجاح`, 'success');
      return createdUser;
    } catch (err) {
      console.error('Server login error:', err);
      const errMsg = isRegistration
        ? (err?.message || 'تعذر إنشاء الحساب، يرجى التحقق من صحة البيانات أو الاتصال بالدعم')
        : 'تعذر تسجيل الدخول، يرجى التحقق من صحة البيانات أو الاتصال بالدعم';
      if (addToast) addToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  }, [addToast, setIsAuthOpen]);

  const hasPermission = useCallback((permission) => {
    if (!user) return true;
    if (user.isAdmin || user.permissions?.includes('*')) return true;
    if (user.status === 'محظور') return false;
    return Boolean(user.permissions?.includes(permission));
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      SENSITIVE_LOCAL_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
      ADMIN_SESSION_KEYS.forEach((k) => sessionStorage.removeItem(k));
    } catch (err) {
      console.warn('Logout cleanup warning:', err);
    }
    if (addToast) addToast('تم تسجيل الخروج بنجاح', 'info');
  }, [addToast]);

  return {
    user,
    setUser,
    login,
    logout,
    hasPermission
  };
}

