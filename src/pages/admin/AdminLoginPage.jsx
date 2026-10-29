import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Store,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { validateEmail, sanitizeText } from '../../utils/validators';

/* Secure administrative login portal with one click demo access */
export default function AdminLoginPage() {
  const { loginAdmin, isAuthenticated } = useAdmin();
  const { user } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const destination = location.state?.from?.pathname || '/admin';

  /* Redirect if already authenticated as admin, or kick out regular customers to storefront */
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    } else if (user && !user.isAdmin) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  /* Handle manual form submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = sanitizeText(email);
    if (!cleanEmail || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    const emailErr = validateEmail(cleanEmail);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginAdmin(cleanEmail, password);
      const isSuccess = typeof res === 'boolean' ? res : res?.success;
      if (isSuccess) {
        navigate(destination, { replace: true });
      } else {
        setError(res?.error || 'بيانات تسجيل الدخول غير صحيحة');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err?.message || 'حدث خطأ أثناء تسجيل الدخول');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rawaa-bg flex flex-col justify-center items-center p-4 relative overflow-hidden font-cairo">
      {/* Background soft ambient accents */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-rawaa-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-rawaa-sage/5 rounded-full blur-3xl pointer-events-none" />

      {/* Return to storefront link */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center text-xs">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-rawaa-dark/70 hover:text-rawaa-primary font-bold transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لمتجر بيبي زون للتسوق</span>
        </Link>
        <span className="text-rawaa-dark/40 font-mono">BABY ZONE EGYPT</span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-rawaa-border shadow-xl p-5 xs:p-7 sm:p-8 relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <img
              src="/logo.png"
              alt="Baby Zone"
              className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-rawaa-primary/20 shadow-md p-1 bg-white"
            />
            <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-rawaa-sage text-white flex items-center justify-center text-xs shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-black font-cairo text-rawaa-dark">
              بيبي <span className="text-rawaa-primary">زون</span>
            </h1>
            <p className="text-xs text-rawaa-dark/60 mt-1">بوابة الإدارة المركزية والتحكم في المتجر</p>
          </div>
        </div>

        {/* Error message alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-rawaa-dark mb-1.5">
              البريد الإلكتروني الإداري
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-rawaa-dark/40" />
              <input
                type="email"
                dir="ltr"
                placeholder="admin@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-medium text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-rawaa-dark mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-rawaa-dark/40" />
              <input
                type="password"
                dir="ltr"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-medium text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-rawaa-primary text-white font-bold text-sm rounded-xl hover:bg-rawaa-primary/90 transition-all shadow-md shadow-rawaa-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>تسجيل الدخول إلى لوحة التحكم</span>
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-rawaa-dark/40 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            <span>منطقة مخصصة لإدارة العمليات والمخزون ببيبي زون مصر</span>
          </p>
        </div>
      </div>
    </div>
  );
}
