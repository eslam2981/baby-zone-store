// Professional notification toast container with modern glassmorphism and icons
import { useShop } from '../../context/ShopContext';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  X
} from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useShop();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2.5 pointer-events-none w-full max-w-md px-4"
      role="region"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        let borderColor = 'border-rawaa-primary/30';
        let bgGradient = 'from-rawaa-primary/[0.04] to-white';
        let iconBg = 'bg-rawaa-primary/10 text-rawaa-primary border-rawaa-primary/20';
        let titleColor = 'text-rawaa-primary';
        let titleText = 'إشعار من بيبي زون';
        let IconComponent = Sparkles;

        if (isSuccess) {
          borderColor = 'border-emerald-500/35';
          bgGradient = 'from-emerald-500/[0.06] to-white';
          iconBg = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25';
          titleColor = 'text-emerald-700';
          titleText = 'تمت العملية بنجاح';
          IconComponent = CheckCircle2;
        } else if (isWarning) {
          borderColor = 'border-amber-500/35';
          bgGradient = 'from-amber-500/[0.06] to-white';
          iconBg = 'bg-amber-500/10 text-amber-600 border-amber-500/25';
          titleColor = 'text-amber-700';
          titleText = 'تنبيه تنفيذي';
          IconComponent = AlertCircle;
        } else if (isError) {
          borderColor = 'border-rose-500/35';
          bgGradient = 'from-rose-500/[0.06] to-white';
          iconBg = 'bg-rose-500/10 text-rose-600 border-rose-500/25';
          titleColor = 'text-rose-700';
          titleText = 'تعذر إتمام الإجراء';
          IconComponent = XCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-gradient-to-l ${bgGradient} backdrop-blur-xl border ${borderColor} rounded-2xl shadow-soft-xl p-3.5 flex items-start gap-3 text-xs text-rawaa-dark transition-all duration-300 ease-out transform animate-slideDown hover:scale-[1.01] relative overflow-hidden`}
          >
            {/* Soft leading accent border */}
            <div
              className={`w-1 absolute right-0 top-0 bottom-0 ${
                isSuccess
                  ? 'bg-emerald-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : isError
                  ? 'bg-rose-500'
                  : 'bg-rawaa-primary'
              }`}
            />

            {/* Icon */}
            <div className={`w-8 h-8 rounded-xl ${iconBg} border flex items-center justify-center shrink-0 shadow-soft-xs`}>
              <IconComponent size={17} strokeWidth={2.2} />
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0 pr-1">
              <span className={`block font-bold text-[11px] mb-0.5 ${titleColor}`}>
                {titleText}
              </span>
              <p className="font-medium text-rawaa-dark text-xs leading-relaxed">
                {toast.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              className="p-1 rounded-lg text-rawaa-subtle hover:text-rawaa-dark hover:bg-black/5 transition-colors cursor-pointer shrink-0"
              onClick={() => removeToast(toast.id)}
              aria-label="إغلاق التنبيه"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
