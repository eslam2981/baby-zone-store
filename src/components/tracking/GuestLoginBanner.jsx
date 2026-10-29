import { Lock, User } from 'lucide-react';

export function GuestLoginBanner({ onOpenAuth }) {
  return (
    <div className="bg-gradient-to-r from-white via-rawaa-soft to-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-rawaa-border mb-8 text-center max-w-3xl mx-auto">
      <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
        <Lock size={26} />
      </div>
      <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-rawaa-dark mb-2">
        صفحتكِ الشخصية وسجل طلباتك
      </h2>
      <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed max-w-lg mx-auto mb-5">
        سجّلي دخولك الآن لعرض صفحتكِ الخاصة التي تحتوي على جميع طلباتك السابقة وتتبع شحناتك الحالية تلقائياً دون الحاجة لكتابة رقم الطلب كل مرة.
      </p>
      <button
        type="button"
        onClick={onOpenAuth}
        className="inline-flex items-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3 px-7 rounded-full transition-all shadow-soft-sm hover:shadow-soft-md cursor-pointer"
      >
        <User size={16} />
        <span>تسجيل الدخول / إنشاء حساب جديد</span>
      </button>
    </div>
  );
}

