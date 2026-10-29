import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  Package,
  Phone
} from 'lucide-react';

export function OrderTrackingStepper({ activeOrder }) {
  if (activeOrder.isCancelled) {
    return (
      <div className="p-6 sm:p-8 bg-red-50/80 border-b border-red-200 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 border border-red-300 flex items-center justify-center shrink-0 shadow-soft-xs">
          <AlertCircle size={32} />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-base sm:text-lg font-black text-red-950 mb-1">
            تم إلغاء هذا الطلب (الشحنة ملغية ولن يتم تسليمها)
          </h3>
          <p className="text-xs sm:text-sm text-red-800 leading-relaxed max-w-2xl">
            تم تسجيل هذا الطلب كـ «ملغي» في النظام ولن يتم تجهيزه أو تسليمه لشركة الشحن. إذا تم إلغاء الطلب بالخطأ أو تودين استبدال المنتجات وإعادة شحنها، فريق خدمة عملاء بيبي زون في خدمتك دائماً عبر الواتساب.
          </p>
        </div>
        <a
          href={`https://wa.me/201035401549?text=${encodeURIComponent(`مرحباً بيبي زون، بخصوص طلبي الملغي #${activeOrder.id}، أود إعادة تأكيده.`)}`}
          target="_blank"
          rel="noreferrer"
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-soft-xs flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Phone size={15} />
          <span>مراسلة الدعم لإعادة الطلب</span>
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 bg-[#FAF7F2] border-b border-rawaa-border">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
        {/* Step 1: Confirmation */}
        {activeOrder.currentStep >= 1 ? (
          <div className="flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all bg-white shadow-soft-xs border border-emerald-200">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-500 text-white font-bold">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="font-heading text-xs sm:text-sm font-bold text-rawaa-dark">تم تأكيد الطلب</h3>
              <p className="text-[11px] text-rawaa-muted mt-0.5">تمت المراجعة والتأكيد</p>
            </div>
          </div>
        ) : (
          <div className="flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all bg-amber-50/80 shadow-soft-xs border border-amber-300 ring-2 ring-amber-400/20">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-amber-500 text-white font-bold animate-pulse">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-heading text-xs sm:text-sm font-bold text-amber-950">بانتظار التأكيد</h3>
              <p className="text-[11px] text-amber-800 font-medium mt-0.5">جاري مراجعة الطلب من الإدارة</p>
            </div>
          </div>
        )}

        {/* Step 2: Sanitization & Packaging */}
        <div className={`flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all ${
          activeOrder.currentStep >= 2
            ? activeOrder.currentStep === 2
              ? 'bg-purple-50/70 shadow-soft-xs border border-purple-300 ring-2 ring-purple-400/20'
              : 'bg-white shadow-soft-xs border border-emerald-200'
            : 'opacity-50'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            activeOrder.currentStep > 2
              ? 'bg-emerald-500 text-white'
              : activeOrder.currentStep === 2
              ? 'bg-purple-600 text-white animate-pulse'
              : 'bg-gray-200 text-gray-500'
          }`}>
            {activeOrder.currentStep > 2 ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <h3 className="font-heading text-xs sm:text-sm font-bold text-rawaa-dark">
              {activeOrder.currentStep === 2 ? 'قيد التجهيز الطبي' : 'التعقيم والتغليف'}
            </h3>
            <p className="text-[11px] text-rawaa-muted mt-0.5">
              {activeOrder.currentStep === 2 ? 'جاري التعقيم والتغليف' : 'تغليف طبي معقم 100%'}
            </p>
          </div>
        </div>

        {/* Step 3: Out for Delivery */}
        <div className={`flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all ${
          activeOrder.currentStep >= 3
            ? activeOrder.currentStep === 3
              ? 'bg-white shadow-soft-xs border border-rawaa-primary ring-2 ring-rawaa-primary/20'
              : 'bg-white shadow-soft-xs border border-emerald-200'
            : 'opacity-50'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            activeOrder.currentStep > 3
              ? 'bg-emerald-500 text-white'
              : activeOrder.currentStep === 3
              ? 'bg-rawaa-primary text-white animate-pulse'
              : 'bg-gray-200 text-gray-500'
          }`}>
            {activeOrder.currentStep > 3 ? <CheckCircle2 size={20} /> : <Truck size={20} />}
          </div>
          <div>
            <h3 className="font-heading text-xs sm:text-sm font-bold text-rawaa-dark">مع مندوب التوصيل</h3>
            <p className={`text-[11px] mt-0.5 ${activeOrder.currentStep === 3 ? 'text-rawaa-primary font-semibold' : 'text-rawaa-muted'}`}>
              {activeOrder.currentStep > 3 ? 'وصل المندوب للعنوان' : activeOrder.currentStep === 3 ? 'في الطريق إلى عنوانك الآن' : 'تسليم الشحنة لمندوب الشحن'}
            </p>
          </div>
        </div>

        {/* Step 4: Delivered */}
        <div className={`flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all ${
          activeOrder.currentStep >= 4
            ? 'bg-white shadow-soft-xs border border-emerald-300 ring-2 ring-emerald-400/20'
            : 'opacity-50'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            activeOrder.currentStep >= 4
              ? 'bg-emerald-500 text-white font-bold'
              : 'bg-gray-200 text-gray-500'
          }`}>
            <Package size={20} />
          </div>
          <div>
            <h3 className="font-heading text-xs sm:text-sm font-bold text-rawaa-dark">
              {activeOrder.currentStep >= 4 ? 'تم التسليم بنجاح' : 'تم التسليم'}
            </h3>
            <p className="text-[11px] text-rawaa-muted mt-0.5">
              {activeOrder.currentStep >= 4 ? 'تم استلام المنتج ومعاينته' : 'استلام المنتج ومعاينته'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

