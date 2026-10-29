import { Heart, AlertCircle, User, Mail, Lock, Phone } from 'lucide-react';
import ModernSelect from '../../common/ModernSelect';

export default function AuthForms({
  activeTab,
  setActiveTab,
  errorMessage,
  setErrorMessage,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  phone,
  setPhone,
  babyStage,
  setBabyStage,
  isSubmitting,
  onSubmit
}) {
  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-2.5">
          <Heart size={22} />
        </div>
        <h3 className="font-heading text-xl font-bold text-rawaa-dark">عضوية عائلة بيبي زون</h3>
        <p className="text-xs text-rawaa-muted mt-1">
          سجلي دخولك لتتبع طلبياتك وحفظ مقاسات طفلك وتلقي عروض المناسبات الحصرية
        </p>
      </div>

      {/* Tab switch between login and registration */}
      <div className="flex bg-rawaa-soft rounded-full p-1 mb-4 text-xs font-bold">
        <button
          type="button"
          className={`flex-1 py-2 rounded-full transition-all cursor-pointer ${
            activeTab === 'login'
              ? 'bg-white text-rawaa-primary shadow-soft-xs'
              : 'text-rawaa-muted hover:text-rawaa-dark'
          }`}
          onClick={() => {
            setActiveTab('login');
            setErrorMessage('');
          }}
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
          onClick={() => {
            setActiveTab('register');
            setErrorMessage('');
          }}
        >
          إنشاء حساب جديد
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
        {activeTab === 'register' && (
          <div>
            <label htmlFor="reg-name" className="block text-xs font-semibold text-rawaa-dark mb-1">
              الاسم:
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
            {activeTab === 'register' ? 'كلمة المرور (6 خانات على الأقل):' : 'كلمة المرور:'}
          </label>
          <div className="flex items-center bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2.5 focus-within:border-rawaa-primary focus-within:bg-white">
            <Lock size={16} className="text-rawaa-muted ml-2 shrink-0" />
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={activeTab === 'register'}
              minLength={activeTab === 'register' ? 6 : undefined}
              className="w-full bg-transparent text-xs text-rawaa-dark outline-none"
            />
          </div>
        </div>

        {activeTab === 'register' && (
          <div>
            <label htmlFor="reg-phone" className="block text-xs font-semibold text-rawaa-dark mb-1">
              رقم الهاتف (اختياري لتأكيد الشحن والتواصل):
            </label>
            <div className="flex items-center bg-rawaa-soft border border-rawaa-border rounded-xl px-3 py-2.5 focus-within:border-rawaa-primary focus-within:bg-white">
              <Phone size={16} className="text-rawaa-muted ml-2 shrink-0" />
              <input
                id="reg-phone"
                type="tel"
                placeholder="01xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent text-xs text-rawaa-dark outline-none font-mono"
                dir="ltr"
              />
            </div>
          </div>
        )}

        {activeTab === 'register' && (
          <div>
            <label htmlFor="baby-stage-select" className="block text-xs font-semibold text-rawaa-dark mb-1">
              مرحلة الطفل الحالية:
            </label>
            <ModernSelect
              id="baby-stage-select"
              value={babyStage}
              onChange={(e) => setBabyStage(e.target.value)}
              options={[
                { value: 'expecting', label: 'في انتظار المولود (فترة الحمل)' },
                { value: 'newborn', label: 'حديث ولادة (0-6 أشهر)' },
                { value: 'infant', label: 'رضيع (6-12 شهر)' },
                { value: 'toddler', label: 'طفولة مبكرة (1-3 سنوات)' }
              ]}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold py-3.5 sm:py-3 rounded-full mt-2 shadow-soft-sm hover:shadow-soft-md transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>جاري معالجة الحساب...</span>
            </>
          ) : (
            <span>{activeTab === 'login' ? 'دخول إلى حسابي' : 'إنشاء الحساب وبدء التجربة'}</span>
          )}
        </button>
      </form>

      <p className="text-[11px] text-rawaa-subtle text-center mt-4">
        يمكنك دائماً الشراء كزائر دون الحاجة لتسجيل حساب مسبق
      </p>
    </div>
  );
}

