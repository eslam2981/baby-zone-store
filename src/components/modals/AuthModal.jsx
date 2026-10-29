import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useShop } from '../../context/ShopContext';
import { useAdmin } from '../../context/AdminContext';
import { ordersApi, customersApi } from '../../services/api';
import { X } from 'lucide-react';
import {
  validateEmail,
  validateEgyptianPhone,
  validatePersonName,
  validatePassword,
  sanitizeText,
  normalizeEgyptianPhone
} from '../../utils/validators';
import AuthAdminView from './auth/AuthAdminView';
import AuthCustomerProfileView from './auth/AuthCustomerProfileView';
import AuthForms from './auth/AuthForms';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, user, login, logout } = useShop();
  const { isAuthenticated, currentAdmin, admins, loginAdmin, logoutAdmin } = useAdmin();

  // Active tab state for login and registration views
  const [activeTab, setActiveTab] = useState('login');
  const [userOrders, setUserOrders] = useState([]);
  const [isLoadingUserOrders, setIsLoadingUserOrders] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [babyStage, setBabyStage] = useState('expecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRendered, setIsRendered] = useState(isAuthOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAuthOpen) {
      setIsRendered(true);
      setErrorMessage('');
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAuthOpen]);

  // Fetch real customer stats from Supabase Cloud when modal is open
  const userEmail = user?.email?.toLowerCase()?.trim() || '';
  const userPhone = user?.phone ? String(user.phone).trim() : '';
  const userIsAdmin = Boolean(user?.isAdmin);

  useEffect(() => {
    let isMounted = true;
    async function loadCustomerStats() {
      if (!userEmail && !userPhone) {
        setUserOrders([]);
        return;
      }
      try {
        // Only trigger loading state on initial fetch to avoid flickering
        setIsLoadingUserOrders((prev) => (userOrders.length === 0 ? true : prev));
        const data = await ordersApi.getByCustomer(userEmail, userPhone);
        if (isMounted && Array.isArray(data)) {
          setUserOrders(data);
        }
      } catch (err) {
        console.warn('Error loading customer orders in modal:', err);
      } finally {
        if (isMounted) setIsLoadingUserOrders(false);
      }
    }

    if (isAuthOpen && (userEmail || userPhone) && !userIsAdmin) {
      loadCustomerStats();
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthOpen, userEmail, userPhone, userIsAdmin, userOrders.length]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIsAuthOpen(false);
      setIsRendered(false);
      setErrorMessage('');
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
    }, 300);
  }, [setIsAuthOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleClose]);

  if (!isRendered || typeof document === 'undefined') return null;

  const isAdmin = Boolean(
    isAuthenticated && currentAdmin && (user?.isAdmin || currentAdmin)
  );

  const handleLogoutAll = () => {
    logout();
    logoutAdmin();
    handleClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    const cleanEmail = sanitizeText(email);
    const emailErr = validateEmail(cleanEmail);
    if (emailErr) {
      setErrorMessage(emailErr);
      return;
    }

    // Check if the email belongs to any registered admin member
    const matchingAdmin = (admins || []).find(
      (a) => a.email && a.email.trim().toLowerCase() === cleanEmail.toLowerCase()
    );

    setIsSubmitting(true);
    try {
      if (matchingAdmin) {
        if (activeTab === 'register') {
          setErrorMessage('هذا البريد الإلكتروني مسجل كحساب إداري للمتجر. يرجى التوجه لتبويب «تسجيل الدخول» لإدخال كلمة المرور.');
          setIsSubmitting(false);
          return;
        }
        if (!password) {
          setErrorMessage('يرجى إدخال كلمة المرور لتسجيل الدخول كمدير');
          setIsSubmitting(false);
          return;
        }
        const res = await loginAdmin(cleanEmail, password);
        const isSuccess = typeof res === 'boolean' ? res : res?.success;
        if (!isSuccess) {
          setErrorMessage(res?.error || 'كلمة المرور الخاصة بمدير النظام غير صحيحة');
          setIsSubmitting(false);
          return;
        }
        await login(cleanEmail, matchingAdmin.name, {
          isAdmin: true,
          role: matchingAdmin.role,
          permissions: matchingAdmin.permissions || ['all']
        });
        handleClose();
        return;
      }

      if (activeTab === 'login') {
        const derivedName = cleanEmail.split('@')[0] || 'عميل بيبي زون';
        const res = await login(cleanEmail, derivedName, { isRegistration: false });
        if (res && res.id && res.success !== false) {
          handleClose();
        } else {
          setErrorMessage(
            res?.error ||
              'هذا الحساب غير مسجل أو تم حذفه من قِبل الإدارة. يمكنك إنشاء حساب جديد من تبويب "إنشاء حساب جديد".'
          );
        }
      } else {
        // activeTab === 'register'
        const cleanName = sanitizeText(name);
        const nameErr = validatePersonName(cleanName, true, 2, 70);
        if (nameErr) {
          setErrorMessage(nameErr);
          setIsSubmitting(false);
          return;
        }

        if (password) {
          const passErr = validatePassword(password, 6);
          if (passErr) {
            setErrorMessage(passErr);
            setIsSubmitting(false);
            return;
          }
        }

        let cleanPhone = undefined;
        if (phone && phone.trim()) {
          const phoneErr = validateEgyptianPhone(phone);
          if (phoneErr) {
            setErrorMessage(phoneErr);
            setIsSubmitting(false);
            return;
          }
          cleanPhone = normalizeEgyptianPhone(phone);
        }

        // Pre-validation: verify email does NOT already exist in database
        try {
          const existingCustomer = await customersApi.getByEmail(cleanEmail);
          if (existingCustomer) {
            setErrorMessage(
              'هذا البريد الإلكتروني مسجل بالفعل لدينا! يرجى التوجه لتبويب «تسجيل الدخول» أو استخدام بريد إلكتروني آخر.'
            );
            setIsSubmitting(false);
            return;
          }
        } catch (err) {
          console.warn('Customer email check error:', err);
        }

        const res = await login(cleanEmail, cleanName, {
          isRegistration: true,
          babyStage,
          phone: cleanPhone
        });

        if (res && res.id && res.success !== false) {
          handleClose();
        } else {
          setErrorMessage(
            res?.error ||
              'تعذر إنشاء الحساب، يرجى التأكد من أن البريد الإلكتروني غير مستخدم مسبقاً.'
          );
        }
      }
    } catch (err) {
      console.error('Auth submit error:', err);
      setErrorMessage(err?.message || 'حدث خطأ غير متوقع أثناء معالجة الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 bg-rawaa-dark/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-hidden transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-3xl max-w-md w-full shadow-2xl relative border border-rawaa-border my-auto max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ease-out transform ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-rawaa-soft/90 hover:bg-rawaa-primary-light text-rawaa-muted hover:text-rawaa-primary flex items-center justify-center transition-colors cursor-pointer"
          onClick={handleClose}
          aria-label="إغلاق نافذة الحساب"
        >
          <X size={18} />
        </button>

        {user ? (
          isAdmin ? (
            <AuthAdminView
              currentAdmin={currentAdmin}
              user={user}
              onLogout={handleLogoutAll}
              onClose={handleClose}
            />
          ) : (
            <AuthCustomerProfileView
              user={user}
              userOrders={userOrders}
              isLoadingUserOrders={isLoadingUserOrders}
              onLogout={handleLogoutAll}
              onClose={handleClose}
            />
          )
        ) : (
          <div className="flex-1 min-h-0 p-5 sm:p-7 overflow-y-auto custom-modal-scroll">
            <AuthForms
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              phone={phone}
              setPhone={setPhone}
              babyStage={babyStage}
              setBabyStage={setBabyStage}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
