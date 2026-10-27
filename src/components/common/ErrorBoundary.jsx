import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI exception captured by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 text-right" dir="rtl">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-soft-xl border border-rawaa-border text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200 shadow-soft-xs">
              <AlertTriangle size={32} />
            </div>

            <h2 className="font-heading text-xl font-black text-rawaa-dark mb-2">
              حدث خطأ غير متوقع في العرض
            </h2>

            <p className="text-xs text-rawaa-muted leading-relaxed mb-6">
              نعتذر عن هذا الخلل المؤقت. تم تسجيل الخطأ داخلياً للحفاظ على استقرار النظام وبياناتك.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs font-bold py-3 px-5 rounded-full transition-all cursor-pointer shadow-soft-xs"
              >
                <RefreshCw size={14} />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center gap-2 bg-rawaa-soft hover:bg-rawaa-border text-rawaa-dark text-xs font-bold py-3 px-5 rounded-full transition-all cursor-pointer"
              >
                <Home size={14} />
                <span>العودة للرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
