// Track order page component providing live package tracking and delivery estimates
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  Search,
  Truck,
  Package,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Sample mock orders for live demonstration and quick customer testing
const MOCK_ORDERS = {
  'RAW-8842': {
    id: 'RAW-8842',
    phone: '01211735629',
    customerName: 'مريم أحمد عبد العزيز',
    city: 'القاهرة الجديدة',
    district: 'التجمع الخامس - حي النرجس',
    date: '15 أكتوبر 2026',
    estimatedTime: 'اليوم بين الساعة 4:00 عصراً و 7:00 مساءً',
    status: 'out_for_delivery',
    statusLabel: 'الشحنة مع المندوب في طريقها إليكِ',
    paymentMethod: 'الدفع عند الاستلام نقداً أو عبر InstaPay',
    courierName: 'كابتن أحمد سامي',
    courierPhone: '01099887766',
    deliveryPin: '4821',
    currentStep: 3,
    items: [
      {
        id: 'p1',
        name: 'عربة أطفال ستوك يويو³ خفيفة الوزن',
        color: 'أخضر زيتوني ناعم',
        qty: 1,
        price: 1890,
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=400&q=80'
      },
      {
        id: 'p5',
        name: 'مجموعة رضّاعات زجاجية طبية كوموتومو',
        color: 'وردي بودري',
        qty: 2,
        price: 340,
        image: 'https://images.unsplash.com/photo-1595347097560-69238724e7bd?auto=format&fit=crop&w=400&q=80'
      }
    ],
    total: 2230
  },
  'RAW-5412': {
    id: 'RAW-5412',
    phone: '01122334455',
    customerName: 'سارة إبراهيم القاضي',
    city: 'الإسكندرية',
    district: 'سموحة - ش فوزي معاذ',
    date: '15 أكتوبر 2026',
    estimatedTime: 'غداً خلال الفترة المسائية',
    status: 'processing',
    statusLabel: 'جاري التجهيز والتعقيم الحراري بالمخزن',
    paymentMethod: 'فودافون كاش مدفوع مسبقاً',
    courierName: 'فريق التجهيز الطبي',
    courierPhone: '01211735629',
    deliveryPin: '9312',
    currentStep: 2,
    items: [
      {
        id: 'p3',
        name: 'طقم سالوبيت مواليد قطن عضوي 100% طبيعي',
        color: 'طبيعي عاجي',
        qty: 3,
        price: 290,
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'
      }
    ],
    total: 870
  },
  'RAW-3109': {
    id: 'RAW-3109',
    phone: '01011223344',
    customerName: 'نورهان محمود سليم',
    city: 'الجيزة',
    district: 'الشيخ زايد - الحي الثاني',
    date: '13 أكتوبر 2026',
    estimatedTime: 'تم التسليم بنجاح',
    status: 'delivered',
    statusLabel: 'تم التسليم للعميل واستلام المبلغ',
    paymentMethod: 'الدفع عند الاستلام',
    courierName: 'كابتن طارق عبد المنعم',
    courierPhone: '01211735629',
    deliveryPin: '7741',
    currentStep: 4,
    items: [
      {
        id: 'p4',
        name: 'سرير مواليد جانبي ملحق لسرير الأم متعدد الارتفاعات',
        color: 'بيج كتاني',
        qty: 1,
        price: 1350,
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'
      }
    ],
    total: 1350
  }
};

// Shipping guide coverage data across Egyptian regions
const GOVERNORATES = [
  { name: 'القاهرة والجيزة', eta: 'خلال 24 ساعة (نفس اليوم قبل 2 ظهر)', fee: 'مجاني للطلبات فوق 1000 ج.م أو 45 ج.م', speed: 'فائق السرعة' },
  { name: 'الإسكندرية والساحل', eta: 'خلال 24 إلى 48 ساعة كحد أقصى', fee: 'مجاني للطلبات فوق 1000 ج.م أو 55 ج.م', speed: 'سريع ومبرد' },
  { name: 'مدن القناة (الإسماعيلية، السويس، بورسعيد)', eta: 'خلال 48 ساعة عمل', fee: 'مجاني للطلبات فوق 1000 ج.م أو 65 ج.م', speed: 'شحن مؤمن' },
  { name: 'محافظات الدلتا (طنطا، المنصورة، الزقازيق)', eta: 'خلال 48 ساعة عمل', fee: 'مجاني للطلبات فوق 1000 ج.م أو 60 ج.م', speed: 'شحن مباشر' },
  { name: 'شمال ووسط الصعيد (الفيوم، بني سويف، المنيا، أسيوط)', eta: 'من 2 إلى 3 أيام عمل', fee: 'مجاني للطلبات فوق 1000 ج.م أو 75 ج.م', speed: 'مغلف بحماية مزدوجة' },
  { name: 'جنوب الصعيد والمحافظات الحدودية (سوهاج، قنا، الأقصر، أسوان)', eta: 'من 3 إلى 4 أيام عمل', fee: 'مجاني للطلبات فوق 1000 ج.م أو 85 ج.م', speed: 'شحن جوي سريع' }
];

export default function TrackOrderPage() {
  const { formatPrice, addToast } = useShop();
  const [searchInput, setSearchInput] = useState('RAW-8842');
  const [activeOrder, setActiveOrder] = useState(MOCK_ORDERS['RAW-8842']);
  const [hasSearched, setHasSearched] = useState(true);
  const [selectedGovernorate, setSelectedGovernorate] = useState(GOVERNORATES[0]);

  // Handle tracking form submission with lookup logic
  const handleSearch = (e) => {
    e?.preventDefault();
    const cleanQuery = searchInput.trim().toUpperCase();

    // Lookup order by tracking code or phone number
    const found =
      MOCK_ORDERS[cleanQuery] ||
      Object.values(MOCK_ORDERS).find((o) => o.phone === searchInput.trim());

    if (found) {
      setActiveOrder(found);
      setHasSearched(true);
      addToast(`تم العثور على بيانات الطلب #${found.id} بنجاح`, 'success');
    } else {
      setActiveOrder(null);
      setHasSearched(true);
      addToast('لم نتمكن من إيجاد طلب بهذا الرقم، يرجى التأكد من الكود أو رقم الهاتف', 'error');
    }
  };

  // Select demo sample order for instant evaluation
  const handleSelectDemo = (code) => {
    setSearchInput(code);
    setActiveOrder(MOCK_ORDERS[code]);
    setHasSearched(true);
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-8 sm:py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs and navigation path */}
        <div className="flex items-center gap-2 text-xs text-rawaa-muted mb-6">
          <Link to="/" className="hover:text-rawaa-primary transition-colors">الرئيسية</Link>
          <ChevronLeft size={14} />
          <span className="text-rawaa-dark font-medium">تتبع شحنتك المباشر</span>
        </div>

        {/* Hero header with visual badges */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-rawaa-primary-light text-rawaa-primary text-xs font-bold px-4 py-1.5 rounded-full mb-3 shadow-soft-xs">
            <Sparkles size={14} />
            <span>نظام التتبع الذكي لجميع محافظات جمهورية مصر العربية</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-rawaa-dark mb-3 tracking-tight">
            تتبعي مسار طلبيتك وموعد وصولها
          </h1>
          <p className="text-sm sm:text-base text-rawaa-muted leading-relaxed">
            أدخلي رقم الطلب الخاص بكِ أو رقم الهاتف المسجل لتحديثات فورية عن حالة الشحن وموقع المندوب.
          </p>
        </div>

        {/* Search input form card */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-soft-md border border-rawaa-border p-4 sm:p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="أدخلي رقم الطلب (مثال: RAW-8842) أو رقم هاتفك..."
                className="w-full bg-[#FAF7F2] border border-rawaa-border rounded-xl pr-11 pl-4 py-3.5 text-sm text-rawaa-dark focus:outline-none focus:border-rawaa-primary focus:bg-white transition-all placeholder:text-rawaa-subtle"
                dir="rtl"
                required
              />
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-rawaa-subtle" />
            </div>
            <button
              type="submit"
              className="bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-sm font-bold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-soft-sm transition-all cursor-pointer shrink-0"
            >
              <span>تتبع الشحنة</span>
              <Truck size={17} />
            </button>
          </form>

          {/* Quick interactive demo pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-rawaa-border/60 text-xs">
            <span className="text-rawaa-muted font-medium">نماذج جاهزة للاختبار السريع</span>
            <button
              type="button"
              onClick={() => handleSelectDemo('RAW-8842')}
              className="bg-[#EDF4F0] text-[#2D5A46] hover:bg-[#2D5A46] hover:text-white px-3 py-1 rounded-full transition-colors font-medium cursor-pointer"
            >
              طلب في الطريق (RAW-8842)
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemo('RAW-5412')}
              className="bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white px-3 py-1 rounded-full transition-colors font-medium cursor-pointer"
            >
              طلب قيد التجهيز (RAW-5412)
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemo('RAW-3109')}
              className="bg-sky-50 text-sky-800 hover:bg-sky-600 hover:text-white px-3 py-1 rounded-full transition-colors font-medium cursor-pointer"
            >
              طلب تم تسليمه (RAW-3109)
            </button>
          </div>
        </div>

        {/* Live order tracking card results */}
        {hasSearched && activeOrder ? (
          <div className="bg-white rounded-2xl shadow-soft-lg border border-rawaa-border overflow-hidden mb-12">
            {/* Header banner of order status */}
            <div className="bg-gradient-to-r from-rawaa-dark via-[#26352E] to-rawaa-dark text-white p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xs bg-white/15 px-3 py-0.5 rounded-full font-mono font-bold tracking-wider">
                    #{activeOrder.id}
                  </span>
                  <span className="text-xs text-amber-300 font-medium">
                    {activeOrder.date}
                  </span>
                </div>
                <h2 className="font-heading text-lg sm:text-2xl font-bold">
                  {activeOrder.statusLabel}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 mt-1 flex items-center gap-1.5">
                  <Clock size={15} className="text-amber-400 shrink-0" />
                  <span>الموعد المتوقع: <strong>{activeOrder.estimatedTime}</strong></span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2.5 text-right">
                  <div className="text-[11px] text-white/70">كود التحقق الأمني للاستلام</div>
                  <div className="font-mono text-lg font-extrabold text-amber-300 tracking-widest">{activeOrder.deliveryPin}</div>
                </div>
                <a
                  href={`https://wa.me/201211735629?text=${encodeURIComponent(`مرحباً رَواء، أود الاستفسار عن طلبي رقم ${activeOrder.id}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 transition-colors shrink-0 shadow-sm"
                >
                  <Phone size={15} />
                  <span>تواصل بخصوص هذا الطلب</span>
                </a>
              </div>
            </div>

            {/* Visual 4 step tracking stepper */}
            <div className="p-6 sm:p-8 bg-[#FAF7F2] border-b border-rawaa-border">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                {/* Step 1 */}
                <div className={`flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all ${activeOrder.currentStep >= 1 ? 'bg-white shadow-soft-xs border border-emerald-200' : 'opacity-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeOrder.currentStep >= 1 ? 'bg-emerald-500 text-white font-bold' : 'bg-gray-200 text-gray-500'}`}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading text-xs sm:text-sm font-bold text-rawaa-dark">تم تأكيد الطلب</h3>
                    <p className="text-[11px] text-rawaa-muted mt-0.5">تمت المراجعة والتأكيد</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all ${activeOrder.currentStep >= 2 ? 'bg-white shadow-soft-xs border border-emerald-200' : 'opacity-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeOrder.currentStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading text-xs sm:text-sm font-bold text-rawaa-dark">التعقيم والتغليف</h3>
                    <p className="text-[11px] text-rawaa-muted mt-0.5">تغليف طبي معقم 100%</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all ${activeOrder.currentStep >= 3 ? 'bg-white shadow-soft-xs border border-rawaa-primary ring-2 ring-rawaa-primary/20' : 'opacity-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeOrder.currentStep >= 3 ? 'bg-rawaa-primary text-white animate-pulse' : 'bg-gray-200 text-gray-500'}`}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading text-xs sm:text-sm font-bold text-rawaa-dark">مع مندوب التوصيل</h3>
                    <p className="text-[11px] text-rawaa-primary font-semibold mt-0.5">في الطريق إلى عنوانك</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className={`flex sm:flex-col items-center gap-3 text-right sm:text-center p-3 rounded-xl transition-all ${activeOrder.currentStep >= 4 ? 'bg-white shadow-soft-xs border border-emerald-200' : 'opacity-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activeOrder.currentStep >= 4 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading text-xs sm:text-sm font-bold text-rawaa-dark">تم التسليم</h3>
                    <p className="text-[11px] text-rawaa-muted mt-0.5">استلام المنتج ومعاينته</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order details grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Delivery and recipient information */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-[#FAF7F2] rounded-xl p-4 border border-rawaa-border">
                  <h4 className="font-heading text-xs font-bold text-rawaa-dark mb-3 flex items-center gap-2">
                    <MapPin size={15} className="text-rawaa-primary" />
                    <span>عنوان الاستلام ومعلومات المستلم</span>
                  </h4>
                  <div className="text-xs space-y-2 text-rawaa-muted">
                    <div><strong>الاسم:</strong> {activeOrder.customerName}</div>
                    <div><strong>المدينة:</strong> {activeOrder.city}</div>
                    <div><strong>العنوان:</strong> {activeOrder.district}</div>
                    <div><strong>الهاتف:</strong> <span dir="ltr">{activeOrder.phone}</span></div>
                    <div><strong>طريقة السداد:</strong> {activeOrder.paymentMethod}</div>
                  </div>
                </div>

                {/* Courier info card */}
                <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/60">
                  <h4 className="font-heading text-xs font-bold text-emerald-900 mb-2 flex items-center gap-2">
                    <Truck size={15} className="text-emerald-700" />
                    <span>كابتن التوصيل المعين</span>
                  </h4>
                  <div className="text-xs text-emerald-800 space-y-1">
                    <div>{activeOrder.courierName}</div>
                    <div className="text-emerald-700 font-medium">سيارة مبردة ومجهزة لنقل مستلزمات المواليد</div>
                  </div>
                </div>
              </div>

              {/* Package items list */}
              <div className="lg:col-span-2">
                <h4 className="font-heading text-xs font-bold text-rawaa-dark mb-3 flex items-center gap-2">
                  <Package size={15} className="text-rawaa-primary" />
                  <span>محتويات الطرد ({activeOrder.items.length} منتجات)</span>
                </h4>

                <div className="space-y-3">
                  {activeOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-[#FAF7F2] rounded-xl border border-rawaa-border">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover border border-rawaa-border"
                        />
                        <div>
                          <Link to={`/product/${item.id}`} className="font-heading text-xs font-bold text-rawaa-dark hover:text-rawaa-primary transition-colors line-clamp-1">
                            {item.name}
                          </Link>
                          <div className="text-[11px] text-rawaa-muted mt-0.5">
                            اللون: {item.color} | الكمية: {item.qty}
                          </div>
                        </div>
                      </div>
                      <div className="font-heading text-xs font-bold text-rawaa-primary shrink-0">
                        {formatPrice(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-rawaa-border flex items-center justify-between text-sm">
                  <span className="font-heading font-bold text-rawaa-dark">إجمالي الشحنة (شامل الضريبة ومصاريف الشحن):</span>
                  <span className="font-heading text-base font-extrabold text-rawaa-primary">{formatPrice(activeOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="bg-white rounded-2xl shadow-soft-sm border border-rawaa-border p-8 text-center max-w-lg mx-auto mb-12">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} />
            </div>
            <h3 className="font-heading text-base font-bold text-rawaa-dark mb-2">
              لم نعثر على بيانات هذا الطلب
            </h3>
            <p className="text-xs text-rawaa-muted mb-6 leading-relaxed">
              يرجى التأكد من كتابة كود الطلب بالصيغة الصحيحة (مثل RAW-8842) أو إدخال رقم الهاتف المستخدم عند إتمام الشراء.
            </p>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo('RAW-8842')}
                className="bg-rawaa-primary text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
              >
                جربي طلب العرض التجريبي
              </button>
            </div>
          </div>
        ) : null}

        {/* Governorates shipping guide and calculator */}
        <div className="bg-white rounded-2xl shadow-soft-md border border-rawaa-border p-6 sm:p-8 mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-rawaa-border">
            <div>
              <span className="text-xs text-rawaa-primary font-bold">دليل الشحن السريع في مصر</span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-rawaa-dark mt-1">
                مواعيد وتكلفة التوصيل لجميع المحافظات
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck size={16} />
              <span>شحن مبرد ومعقم للمنتجات الحساسة</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GOVERNORATES.map((gov, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-rawaa-border bg-[#FAF7F2] hover:border-rawaa-primary hover:bg-white transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-sm font-bold text-rawaa-dark">{gov.name}</h3>
                  <span className="text-[10px] font-bold bg-rawaa-primary-light text-rawaa-primary px-2 py-0.5 rounded-full">
                    {gov.speed}
                  </span>
                </div>
                <div className="text-xs text-rawaa-muted space-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-rawaa-subtle shrink-0" />
                    <span>{gov.eta}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck size={13} className="text-rawaa-subtle shrink-0" />
                    <span className="text-rawaa-dark font-medium">{gov.fee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safe delivery guarantees pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft-xs text-center">
            <div className="w-12 h-12 rounded-full bg-rawaa-primary-light text-rawaa-primary flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
              حق المعاينة قبل الدفع
            </h3>
            <p className="text-xs text-rawaa-muted leading-relaxed">
              يحق لكِ فحص المنتج والتأكد من سلامته التامة ومطابقته للطلب بحضور المندوب قبل دفع أي مليم.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft-xs text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Truck size={24} />
            </div>
            <h3 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
              سيارات نقل مكيفة
            </h3>
            <p className="text-xs text-rawaa-muted leading-relaxed">
              شحن مخصص يضمن عدم تأثر الخامات العضوية أو السيليكون الطبي أو عبوات الرضاعة بدرجات الحرارة.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rawaa-border shadow-soft-xs text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <Phone size={24} />
            </div>
            <h3 className="font-heading text-sm font-bold text-rawaa-dark mb-1">
              دعم فوري على الواتساب
            </h3>
            <p className="text-xs text-rawaa-muted leading-relaxed">
              فريق خدمة عملاء متواجد على مدار اليوم لتغيير موعد التسليم أو تعديل العنوان فور رغبتك.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
