import React from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Terminal,
  LifeBuoy
} from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showTechDetails: false,
      copied: false,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI exception captured by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  isAdminSession = () => {
    if (typeof window === 'undefined') return false;
    try {
      const isPathAdmin = window.location.pathname.startsWith('/admin');
      const isAuthAdmin = sessionStorage.getItem('babyzone_admin_auth') === 'true';
      return isPathAdmin || isAuthAdmin;
    } catch {
      return false;
    }
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleGoAdmin = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/admin';
  };

  handleSafeReset = () => {
    this.setState({ isRecovering: true });
    try {
      // Purge volatile runtime caches while preserving core state if possible
      sessionStorage.removeItem('babyzone_admin_auth_temp');
      localStorage.removeItem('babyzone_temp_cache');
      localStorage.removeItem('babyzone_active_tab');
    } catch (err) {
      console.warn('Storage purge warning during error recovery:', err);
    }

    setTimeout(() => {
      this.setState({ hasError: false, error: null, errorInfo: null, isRecovering: false });
      window.location.href = this.isAdminSession() ? '/admin' : '/';
    }, 400);
  };

  handleCopyReport = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;

    const error = this.state.error;
    const errorInfo = this.state.errorInfo;
    const timeStr = new Date().toLocaleString('ar-EG');
    const url = typeof window !== 'undefined' ? window.location.href : 'Unknown';

    const report = [
      '========================================',
      '📌 تقرير فحص الخطأ التقني — بيبي زون (Baby Zone)',
      '========================================',
      `🕒 التاريخ والوقت: ${timeStr}`,
      `🌐 مسار الصفحة: ${url}`,
      `💻 المتصفح: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}`,
      `⚠️ نوع الخطأ: ${error?.name || 'Error'}`,
      `💬 رسالة الخطأ: ${error?.message || String(error)}`,
      '',
      '🔍 تتبع المكونات (Component Stack):',
      errorInfo?.componentStack ? errorInfo.componentStack.trim() : 'غير متوفر',
      '',
      '📜 تتبع الكود البرمجي (Call Stack):',
      error?.stack ? error.stack.trim() : 'غير متوفر',
      '========================================'
    ].join('\n');

    try {
      await navigator.clipboard.writeText(report);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 3000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isAdmin = this.isAdminSession();
    const { error, errorInfo, showTechDetails, copied, isRecovering } = this.state;

    return (
      <div
        className="min-h-screen bg-gradient-to-b from-[#FAF7F2] via-white to-[#F5EFE6] flex items-center justify-center p-4 sm:p-6 text-right selection:bg-rawaa-primary/20"
        dir="rtl"
      >
        <div className="bg-white rounded-3xl p-6 sm:p-9 max-w-xl w-full shadow-2xl border border-rawaa-border relative overflow-hidden animate-fadeIn">
          {/* Subtle decorative top bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rawaa-primary via-amber-500 to-rawaa-primary" />

          {/* Header Icon & Brand Tag */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-rawaa-primary flex items-center justify-center mb-3 shadow-soft-xs">
              <AlertTriangle className="w-8 h-8 text-rawaa-primary" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rawaa-soft border border-rawaa-border text-rawaa-dark mb-2">
              <span className="w-2 h-2 rounded-full bg-rawaa-primary" />
              <span>بيبي زون | رعاية وأمان</span>
              {isAdmin && (
                <span className="mr-1 bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded text-[10px] flex items-center gap-1 font-bold">
                  <ShieldCheck size={11} className="text-amber-600" />
                  وضع الإدارة
                </span>
              )}
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-black text-rawaa-dark">
              {isAdmin ? 'تنبيه استثناء تقني في واجهة الإدارة' : 'نعتذر عن هذا التوقف المؤقت'}
            </h2>

            <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed mt-2 max-w-md">
              {isAdmin
                ? 'تم التقاط خطأ تشغيلي غير متوقع أثناء معالجة عناصر هذه الصفحة. بيانات المتجر وقاعدة البيانات السحابية آمنة ومستقرة تماماً.'
                : 'حدث خطأ مؤقت غير متوقع أثناء عرض الصفحة. سلة مشترياتك وبيانات حسابك محفوظة بأمان.'}
            </p>
          </div>

          {/* Quick Action Buttons Grid */}
          <div className="space-y-2.5 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs sm:text-sm font-bold py-3.5 px-5 rounded-2xl transition-all cursor-pointer shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0"
              >
                <RefreshCw size={16} />
                <span>إعادة المحاولة وتحديث الصفحة</span>
              </button>

              {isAdmin ? (
                <button
                  type="button"
                  onClick={this.handleGoAdmin}
                  className="w-full flex items-center justify-center gap-2 bg-rawaa-soft hover:bg-rawaa-border text-rawaa-dark text-xs sm:text-sm font-bold py-3.5 px-5 rounded-2xl transition-all cursor-pointer border border-rawaa-border"
                >
                  <ShieldCheck size={16} className="text-rawaa-primary" />
                  <span>العودة للوحة التحكم الإدارية</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center gap-2 bg-rawaa-soft hover:bg-rawaa-border text-rawaa-dark text-xs sm:text-sm font-bold py-3.5 px-5 rounded-2xl transition-all cursor-pointer border border-rawaa-border"
                >
                  <Home size={16} />
                  <span>العودة للتسوق والرئيسية</span>
                </button>
              )}
            </div>

            {/* Safe Recovery Cache Reset (Especially helpful if local state was corrupted) */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={this.handleSafeReset}
                disabled={isRecovering}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-50/80 hover:bg-amber-100/90 text-amber-900 border border-amber-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw size={14} className={isRecovering ? 'animate-spin' : ''} />
                <span>{isRecovering ? 'جاري الاستعادة...' : 'إصلاح سريع ومسح الذاكرة المؤقتة'}</span>
              </button>

              <a
                href="https://wa.me/201211735629?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%A8%D9%8A%D8%A8%D9%8A%20%D8%B2%D9%88%D9%86%D8%8C%20%D8%AD%D8%AF%D8%AB%20%D8%AE%D8%B7%D8%A3%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%B5%D9%81%D8%AD%D8%A9%20%D9%88%D8%A3%D8%AD%D8%AA%D8%A7%D8%AC%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                <LifeBuoy size={14} className="text-emerald-600" />
                <span>الدعم الفني المباشر</span>
              </a>
            </div>
          </div>

          {/* Technical Diagnostics Accordion (Available for Admins & Developers) */}
          <div className="border border-rawaa-border/80 rounded-2xl overflow-hidden bg-rawaa-soft/30 transition-all">
            <button
              type="button"
              onClick={() => this.setState((prev) => ({ showTechDetails: !prev.showTechDetails }))}
              className="w-full p-3.5 flex items-center justify-between text-right text-xs font-bold text-rawaa-dark hover:bg-rawaa-soft/60 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-rawaa-primary" />
                <span>تفاصيل الخطأ والتشخيص التقني (للمشرفين والمطورين)</span>
              </div>
              <div className="flex items-center gap-1.5 text-rawaa-muted text-[11px]">
                <span>{showTechDetails ? 'إخفاء' : 'عرض'}</span>
                {showTechDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {showTechDetails && (
              <div className="p-4 border-t border-rawaa-border/70 bg-slate-900 text-slate-100 text-left font-mono text-xs animate-fadeIn" dir="ltr">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/80 flex-wrap gap-2">
                  <div className="text-[11px] text-amber-400 font-bold truncate max-w-xs sm:max-w-md">
                    {error?.name || 'Error'}: {error?.message || String(error)}
                  </div>
                  <button
                    type="button"
                    onClick={this.handleCopyReport}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-sans font-bold transition-colors cursor-pointer border border-slate-600 shadow-2xs"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'تم النسخ!' : 'نسخ تقرير الخطأ'}</span>
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 space-y-1 mb-2">
                  <div><strong className="text-slate-300">Route:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'Unknown'}</div>
                  <div><strong className="text-slate-300">Time:</strong> {new Date().toISOString()}</div>
                </div>

                {error?.stack && (
                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Stack Trace:</span>
                    <pre className="text-[10px] text-rose-300/90 whitespace-pre-wrap overflow-x-auto max-h-48 custom-modal-scroll leading-relaxed p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {errorInfo?.componentStack && (
                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Component Stack:</span>
                    <pre className="text-[10px] text-amber-300/90 whitespace-pre-wrap overflow-x-auto max-h-36 custom-modal-scroll leading-relaxed p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
