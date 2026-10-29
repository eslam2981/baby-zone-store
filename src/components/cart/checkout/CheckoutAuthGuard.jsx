import { createPortal } from 'react-dom';
import { X, Lock, User } from 'lucide-react';

export default function CheckoutAuthGuard({
  onClose,
  onOpenAuth
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-rawaa-dark/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-soft-xl border border-rawaa-border relative my-8 text-center animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-1.5 rounded-full bg-rawaa-soft hover:bg-rawaa-border text-rawaa-muted transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X size={18} />
        </button>
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-soft-xs">
          <Lock size={30} />
        </div>
        <h3 className="font-heading text-xl font-black text-rawaa-dark mb-2">
          تسجيل الدخول مطلوب لإتمام الطلب
        </h3>
        <p className="text-xs text-rawaa-muted leading-relaxed mb-6">
          لضمان توفير صفحتك الشخصية الخاصة وتوثيق سجل مشترياتك ومتابعة مسار شحنتك لحظة بلحظة، يجب تسجيل الدخول أو إنشاء حسابك أولاً.
        </p>
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenAuth();
          }}
          className="w-full bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3.5 px-6 rounded-full transition-all shadow-soft-sm hover:shadow-soft-md cursor-pointer mb-2.5 flex items-center justify-center gap-2"
        >
          <User size={16} />
          <span>تسجيل الدخول / إنشاء حساب جديد</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full text-xs text-rawaa-muted hover:text-rawaa-dark py-2 transition-colors cursor-pointer"
        >
          العودة إلى سلة التسوق
        </button>
      </div>
    </div>,
    document.body
  );
}

