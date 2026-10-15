import React, { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';
import { X, User, Mail, Lock, Heart, CheckCircle2, LogOut } from 'lucide-react';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, user, login, logout } = useShop();

  // Active tab state for login and registration views
  const [activeTab, setActiveTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [babyStage, setBabyStage] = useState('expecting');

  const [isRendered, setIsRendered] = useState(isAuthOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAuthOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAuthOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsAuthOpen(false);
      setIsRendered(false);
    }, 300);
  };

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isRendered) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'login') {
      login(email || 'om_rayan@example.com', name || 'أم ريان');
    } else {
      login(email || 'new_mother@example.com', name || 'أميرة');
    }
    handleClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-rawaa-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-panel max-w-md w-full p-6 sm:p-8 shadow-soft-xl relative border border-rawaa-border transition-all duration-300 ease-out transform ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-rawaa-soft hover:bg-rawaa-primary-light text-rawaa-muted hover:text-rawaa-primary flex items-center justify-center transition-colors cursor-pointer"
          onClick={handleClose}
          aria-label="إغلاق نافذة الحساب"
        >
          <X size={18} />
        </button>

        {user ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-3">
              <User size={32} />
            </div>
            <h3 className="font-heading text-xl font-bold text-rawaa-dark">أهلاً بكِ، {user.name}!</h3>
            <p className="text-xs text-rawaa-muted mb-6">{user.email}</p>

            <div className="bg-rawaa-soft rounded-card p-4 text-right flex flex-col gap-2.5 mb-6 text-xs text-rawaa-dark">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-rawaa-sage shrink-0" />
                <span>عضوية نادي رَواء للأمهات مفعلة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-rawaa-sage shrink-0" />
                <span>رصيد نقاط الولاء: <strong className="font-bold">250 نقطة</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-rawaa-sage shrink-0" />
                <span>شحن مجاني دائم على كافة الطلبيات</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full border border-rawaa-border hover:border-red-300 hover:bg-red-50 text-red-600 text-xs font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
              onClick={() => {
                logout();
                handleClose();
              }}
            >
              <LogOut size={16} />
              <span>تسجيل الخروج من الحساب</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-2.5">
                <Heart size={22} />
              </div>
              <h3 className="font-heading text-xl font-bold text-rawaa-dark">عضوية عائلة رَواء</h3>
              <p className="text-xs text-rawaa-muted mt-1">
                سجلي دخولك لتتبع طلبياتك وحفظ مقاسات طفلك وتلقي عروض المناسبات الحصرية
              </p>
            </div>

            {/* Tab switch between login and registration */}
            <div className="flex bg-rawaa-soft rounded-full p-1 mb-5 text-xs font-bold">
              <button
                type="button"
                className={`flex-1 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-rawaa-primary shadow-soft-xs'
                    : 'text-rawaa-muted hover:text-rawaa-dark'
                }`}
                onClick={() => setActiveTab('login')}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-rawaa-primary shadow-soft-xs'
                    : 'text-rawaa-muted hover:text-rawaa-dark'
                }`}
                onClick={() => setActiveTab('register')}
              >
                إنشاء حساب جديد
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {activeTab === 'register' && (
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold text-rawaa-dark mb-1">
                    اسم الأم أو الأب:
                  </label>
                  <div className="flex items-center bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 focus-within:border-rawaa-primary focus-within:bg-white">
                    <User size={16} className="text-rawaa-muted ml-2" />
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="مثال: سارة الشمري"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-transparent text-xs text-rawaa-dark outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-xs font-semibold text-rawaa-dark mb-1">
                  البريد الإلكتروني:
                </label>
                <div className="flex items-center bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 focus-within:border-rawaa-primary focus-within:bg-white">
                  <Mail size={16} className="text-rawaa-muted ml-2" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent text-xs text-rawaa-dark outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-xs font-semibold text-rawaa-dark mb-1">
                  كلمة المرور:
                </label>
                <div className="flex items-center bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2 focus-within:border-rawaa-primary focus-within:bg-white">
                  <Lock size={16} className="text-rawaa-muted ml-2" />
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-transparent text-xs text-rawaa-dark outline-none"
                  />
                </div>
              </div>

              {activeTab === 'register' && (
                <div>
                  <label htmlFor="baby-stage-select" className="block text-xs font-semibold text-rawaa-dark mb-1">
                    مرحلة الطفل الحالية:
                  </label>
                  <select
                    id="baby-stage-select"
                    value={babyStage}
                    onChange={(e) => setBabyStage(e.target.value)}
                    className="w-full bg-rawaa-soft border border-rawaa-border rounded-xl p-2.5 text-xs text-rawaa-dark outline-none"
                  >
                    <option value="expecting">في انتظار المولود (فترة الحمل)</option>
                    <option value="newborn">حديث ولادة (0-6 أشهر)</option>
                    <option value="infant">رضيع (6-12 شهر)</option>
                    <option value="toddler">طفولة مبكرة (1-3 سنوات)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3 rounded-full mt-2 shadow-soft-sm hover:shadow-soft-md transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                {activeTab === 'login' ? 'دخول إلى حسابي' : 'إنشاء الحساب وبدء التجربة'}
              </button>
            </form>

            <p className="text-[11px] text-rawaa-subtle text-center mt-4">
              يمكنك دائماً الشراء كزائر دون الحاجة لتسجيل حساب مسبق
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
