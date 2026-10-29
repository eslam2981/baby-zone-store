// Reusable premium confirmation modal dialog with sleek styling and micro-animations
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'تأكيد الإجراء',
  message = 'هل أنت متأكد من رغبتك في متابعة هذا الإجراء؟ لا يمكن التراجع عن هذه الخطوة.',
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  isDestructive = true,
  onConfirm,
  onCancel,
  icon: CustomIcon
}) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const IconComponent = CustomIcon || (isDestructive ? Trash2 : HelpCircle);

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 text-right shadow-2xl border border-rawaa-border animate-scaleUp relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner accent */}
        <div
          className={`absolute top-0 right-0 left-0 h-1.5 ${
            isDestructive ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-rawaa-primary to-rawaa-sage'
          }`}
        />

        {/* Top close button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 left-4 p-1.5 rounded-full text-rawaa-subtle hover:text-rawaa-dark hover:bg-rawaa-soft transition-colors cursor-pointer"
          aria-label="إغلاق النافذة"
        >
          <X size={16} />
        </button>

        {/* Icon with soft pulse glow */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
            isDestructive
              ? 'bg-rose-50 text-rose-600 border-rose-200/80 shadow-soft-sm'
              : 'bg-rawaa-primary/10 text-rawaa-primary border-rawaa-primary/20 shadow-soft-sm'
          }`}
        >
          <IconComponent size={26} strokeWidth={2.2} />
        </div>

        {/* Title and message */}
        <h3
          id="confirm-modal-title"
          className="font-heading text-lg font-black text-rawaa-dark text-center mb-2"
        >
          {title}
        </h3>
        <p className="text-xs text-rawaa-muted text-center leading-relaxed mb-6 px-1">
          {message}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 text-xs font-bold text-rawaa-dark bg-rawaa-soft hover:bg-rawaa-border rounded-xl transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 text-xs font-bold text-white rounded-xl transition-all shadow-soft-xs active:scale-95 cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-rawaa-primary hover:bg-rawaa-primary-hover shadow-rawaa-primary/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
