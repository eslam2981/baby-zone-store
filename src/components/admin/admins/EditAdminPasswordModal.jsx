import { createPortal } from 'react-dom';
import { Key, X } from 'lucide-react';

export default function EditAdminPasswordModal({
  admin,
  onClose,
  newPassword,
  onChangePassword,
  onSubmit
}) {
  if (!admin) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-rawaa-border overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-rawaa-soft/60 border-b border-rawaa-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-rawaa-primary" />
            <h3 className="font-bold text-sm text-rawaa-dark">
              تعديل كلمة مرور المشرف
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-rawaa-dark/40 hover:text-rawaa-dark hover:bg-rawaa-soft cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <span className="block text-xs font-semibold text-rawaa-dark mb-1">
              المشرف: <strong className="font-bold text-rawaa-primary">{admin.name}</strong> ({admin.email})
            </span>
            <label className="block text-xs font-bold text-rawaa-dark mt-3 mb-1">
              كلمة المرور الجديدة:
            </label>
            <input
              type="text"
              dir="ltr"
              placeholder="أدخل كلمة مرور جديدة"
              value={newPassword}
              onChange={(e) => onChangePassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-rawaa-soft/60 border border-rawaa-border rounded-xl text-sm font-mono text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white"
              required
              autoFocus
            />
            <span className="text-[10px] text-rawaa-muted mt-1 block">
              سيتم حفظ وتفعيل كلمة المرور الجديدة فورياً
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-rawaa-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-rawaa-border text-rawaa-dark text-xs font-bold rounded-xl hover:bg-rawaa-soft transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rawaa-primary text-white text-xs font-bold rounded-xl hover:bg-rawaa-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              حفظ وتحديث كلمة المرور
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

