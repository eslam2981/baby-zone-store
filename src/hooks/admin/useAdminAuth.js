import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ADMIN_SESSION_KEYS, SENSITIVE_LOCAL_STORAGE_KEYS, STORAGE_KEYS } from '../../constants/storageKeys';
import { syncBus } from '../../utils/syncBus';

export function useAdminAuth({ user, setUser, admins, addToast, addActivity }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('babyzone_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const isAuth = sessionStorage.getItem('babyzone_admin_auth') === 'true';
      if (!isAuth) return null;
      const saved = sessionStorage.getItem('babyzone_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Real-time synchronization of admin authorization with live `admins` state
  useEffect(() => {
    try {
      const isAuthAdmin = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('babyzone_admin_auth') === 'true';
      const savedAdminStr = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('babyzone_admin_user');

      // 1. If currently marked as authenticated admin, verify if still valid in `admins` list
      if ((isAuthAdmin || isAuthenticated || currentAdmin) && admins && admins.length > 0) {
        const activeAdminEmail = (currentAdmin?.email || (savedAdminStr ? JSON.parse(savedAdminStr)?.email : '') || user?.email || '').toLowerCase().trim();
        const activeAdminId = currentAdmin?.id || (savedAdminStr ? JSON.parse(savedAdminStr)?.id : '') || user?.id;
        const envAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();
        const isSuperAdminEnv = Boolean(envAdminEmail && activeAdminEmail === envAdminEmail);

        const liveMatch = (admins || []).find(
          (a) => (String(a.id) === String(activeAdminId) || (a.email && a.email.toLowerCase().trim() === activeAdminEmail))
        );

        // If the admin was removed from admins list OR marked as disabled ('معطل')
        if (!isSuperAdminEnv && (!liveMatch || liveMatch.status === 'معطل')) {
          setIsAuthenticated(false);
          setCurrentAdmin(null);
          ADMIN_SESSION_KEYS.forEach((k) => sessionStorage.removeItem(k));
          if (setUser) {
            setUser((prev) => (prev ? { ...prev, isAdmin: false, role: 'customer' } : null));
          }
          if (addToast) {
            addToast('تم سحب صلاحيات الإدارة لهذا الحساب فوراً من قِبل مدير المتجر', 'warning');
          }
          return;
        } else if (liveMatch && liveMatch.status === 'نشط') {
          setIsAuthenticated(true);
          setCurrentAdmin(liveMatch);
          sessionStorage.setItem('babyzone_admin_auth', 'true');
          sessionStorage.setItem('babyzone_admin_user', JSON.stringify({
            id: liveMatch.id,
            name: liveMatch.name,
            email: liveMatch.email,
            role: liveMatch.role,
            permissions: liveMatch.permissions
          }));
          if (setUser && (!user || !user.isAdmin || user.role !== liveMatch.role)) {
            setUser((prev) => ({
              ...prev,
              id: liveMatch.id,
              name: liveMatch.name || prev?.name,
              email: liveMatch.email || prev?.email,
              isAdmin: true,
              role: liveMatch.role,
              permissions: liveMatch.permissions || ['all']
            }));
          }
          return;
        }
      }

      // 2. If storefront user is logged in as an ordinary user, check if they were added to `admins`
      if (user && !user.isAdmin && admins && admins.length > 0) {
        const activeUserEmail = (user.email || '').toLowerCase().trim();
        const matchingNewAdmin = (admins || []).find(
          (a) => a.email && a.email.toLowerCase().trim() === activeUserEmail && a.status === 'نشط'
        );

        if (matchingNewAdmin) {
          setIsAuthenticated(true);
          setCurrentAdmin(matchingNewAdmin);
          sessionStorage.setItem('babyzone_admin_auth', 'true');
          sessionStorage.setItem('babyzone_admin_user', JSON.stringify({
            id: matchingNewAdmin.id,
            name: matchingNewAdmin.name,
            email: matchingNewAdmin.email,
            role: matchingNewAdmin.role,
            permissions: matchingNewAdmin.permissions || ['all']
          }));
          if (setUser) {
            setUser((prev) => ({
              ...prev,
              isAdmin: true,
              role: matchingNewAdmin.role,
              permissions: matchingNewAdmin.permissions || ['all']
            }));
          }
          if (addToast) {
            addToast(`تم تفعيل وترقية حسابك إلى فريق الإدارة (${matchingNewAdmin.role}) ⚡`, 'success');
          }
          return;
        }
      }

      // 3. Fallback restore if admin session was stored in sessionStorage
      if (isAuthAdmin && savedAdminStr && !currentAdmin) {
        const parsed = JSON.parse(savedAdminStr);
        setIsAuthenticated(true);
        setCurrentAdmin(parsed);
      }
    } catch (err) {
      console.warn('Admin session sync warning:', err);
    }
  }, [admins, isAuthenticated, currentAdmin, user, setUser, addToast]);

  // Real-time zero-latency syncBus listeners for immediate cross-tab/cross-component reactions
  useEffect(() => {
    const unsubRemoved = syncBus.on('ADMIN_REMOVED', ({ adminId, email }) => {
      const activeAdmin = currentAdmin;
      const activeUser = user;
      const cleanEmail = (email || '').toLowerCase().trim();
      const curAdminEmail = (activeAdmin?.email || '').toLowerCase().trim();
      const curUserEmail = (activeUser?.email || '').toLowerCase().trim();

      const matchAdminId = adminId && activeAdmin?.id && String(activeAdmin.id) === String(adminId);
      const matchUserId = adminId && activeUser?.id && String(activeUser.id) === String(adminId);
      const matchAdminEmail = cleanEmail && curAdminEmail && cleanEmail === curAdminEmail;
      const matchUserEmail = cleanEmail && curUserEmail && cleanEmail === curUserEmail;

      if (matchAdminId || matchUserId || matchAdminEmail || matchUserEmail) {
        setIsAuthenticated(false);
        setCurrentAdmin(null);
        ADMIN_SESSION_KEYS.forEach((k) => sessionStorage.removeItem(k));
        if (setUser) {
          setUser((prev) => (prev ? { ...prev, isAdmin: false, role: 'customer' } : null));
        }
        if (addToast) {
          addToast('تم سحب صلاحيات الإدارة فوراً من قِبل مدير المتجر', 'warning');
        }
      }
    });

    const unsubAdded = syncBus.on('ADMIN_ADDED', ({ admin }) => {
      if (!admin || admin.status === 'معطل') return;
      const activeUser = user;
      const cleanEmail = (admin.email || '').toLowerCase().trim();
      const curUserEmail = (activeUser?.email || '').toLowerCase().trim();

      if (cleanEmail && curUserEmail && cleanEmail === curUserEmail) {
        setIsAuthenticated(true);
        setCurrentAdmin(admin);
        sessionStorage.setItem('babyzone_admin_auth', 'true');
        sessionStorage.setItem('babyzone_admin_user', JSON.stringify(admin));
        if (setUser) {
          setUser((prev) => ({
            ...prev,
            isAdmin: true,
            role: admin.role,
            permissions: admin.permissions || ['all']
          }));
        }
        if (addToast) {
          addToast(`تم ترقيتك وتفعيل صلاحيات لوحة الإدارة لحسابك (${admin.role}) ⚡`, 'success');
        }
      }
    });

    return () => {
      unsubRemoved();
      unsubAdded();
    };
  }, [currentAdmin, user, setUser, addToast]);

  const hasAdminPermission = useCallback((requiredPerm) => {
    if (!isAuthenticated || !currentAdmin) return false;
    const perms = currentAdmin.permissions || [];
    if (perms.includes('all') || perms.includes('*') || currentAdmin.role?.includes('Super Admin')) {
      return true;
    }
    if (Array.isArray(requiredPerm)) {
      return requiredPerm.some((p) => perms.includes(p));
    }
    return perms.includes(requiredPerm);
  }, [isAuthenticated, currentAdmin]);

  const establishAdminSession = useCallback((adminProfile) => {
    setCurrentAdmin(adminProfile);
    setIsAuthenticated(true);

    try {
      sessionStorage.setItem('babyzone_admin_auth', 'true');
      sessionStorage.setItem('babyzone_admin_user', JSON.stringify({
        id: adminProfile.id,
        name: adminProfile.name,
        email: adminProfile.email,
        role: adminProfile.role,
        permissions: adminProfile.permissions
      }));
      SENSITIVE_LOCAL_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Admin session storage error:', e);
    }

    if (setUser) {
      setUser({
        email: adminProfile.email,
        name: adminProfile.name,
        isAdmin: true,
        role: adminProfile.role,
        permissions: adminProfile.permissions || ['all'],
        loggedInAt: new Date().toISOString()
      });
    }

    if (addActivity) {
      addActivity('تسجيل الدخول إلى لوحة التحكم', `بواسطة ${adminProfile.name} (${adminProfile.role})`, 'auth');
    }
    if (addToast) {
      addToast(`مرحباً بك يا ${adminProfile.name} في لوحة تحكم بيبي زون`, 'success');
    }
    return { success: true, admin: adminProfile };
  }, [setUser, addActivity, addToast]);

  const loginAdmin = useCallback(async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass
      });

      if (!authError && authData?.user) {
        const matchingAdmin = (admins || []).find(
          (a) => a.email && a.email.trim().toLowerCase() === cleanEmail
        );
        const adminProfile = matchingAdmin || {
          id: authData.user.id,
          name: authData.user.user_metadata?.full_name || 'مدير النظام',
          email: authData.user.email,
          role: authData.user.user_metadata?.role || 'مدير النظام (Super Admin)',
          permissions: ['all'],
          lastLogin: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        };
        return establishAdminSession(adminProfile);
      }
    } catch (authErr) {
      console.warn('Supabase Auth sign-in notice:', authErr?.message);
    }

    const foundAdmin = (admins || []).find(
      (a) => a.email && a.email.trim().toLowerCase() === cleanEmail
    );

    const envAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
    const isSuperAdminEmail = Boolean((envAdminEmail && cleanEmail === envAdminEmail) || (foundAdmin && foundAdmin.role?.includes('Super Admin')));

    if (!foundAdmin && !isSuperAdminEmail) {
      return { success: false, error: 'البريد الإلكتروني غير مسجل ضمن فريق الإدارة' };
    }

    const isDbPasswordMatch = Boolean(foundAdmin?.password && cleanPass === foundAdmin.password);

    if (!isDbPasswordMatch) {
      return { success: false, error: 'كلمة المرور غير صحيحة' };
    }

    const adminProfile = {
      ...foundAdmin,
      lastLogin: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    return establishAdminSession(adminProfile);
  }, [admins, establishAdminSession]);

  const logoutAdmin = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign-out notice:', e);
    }
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    try {
      ADMIN_SESSION_KEYS.forEach((k) => sessionStorage.removeItem(k));
      SENSITIVE_LOCAL_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.warn('Storage removal warning:', e);
    }
    if (setUser) {
      setUser(null);
    }
    if (addToast) {
      addToast('تم تسجيل الخروج من لوحة التحكم بنجاح', 'info');
    }
  }, [setUser, addToast]);

  return {
    isAuthenticated,
    currentAdmin,
    loginAdmin,
    logoutAdmin,
    hasAdminPermission
  };
}

