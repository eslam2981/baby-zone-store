// Notification toast container for displaying transient user alerts

import { useShop } from '../../context/ShopContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm" role="region" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto bg-white border rounded-full shadow-soft-lg px-4 py-2.5 flex items-center gap-3 text-xs text-rawaa-dark transition-all duration-300 ease-out transform hover:scale-[1.02] ${
            toast.type === 'success'
              ? 'border-emerald-400'
              : toast.type === 'warning'
              ? 'border-amber-400'
              : 'border-rawaa-sage'
          }`}
        >
          <div className="shrink-0">
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600" />}
            {toast.type === 'warning' && <AlertCircle size={16} className="text-amber-600" />}
            {toast.type === 'info' && <Info size={16} className="text-rawaa-sage" />}
          </div>
          <span className="flex-1 font-medium leading-tight">{toast.message}</span>
          <button
            type="button"
            className="p-1 text-rawaa-subtle hover:text-rawaa-dark"
            onClick={() => removeToast(toast.id)}
            aria-label="إغلاق التنبيه"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
