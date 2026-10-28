import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import {
  Sparkles,
  CheckCircle2,
  Truck,
  ShoppingBag,
  ShieldCheck,
  Star,
  ArrowLeft,
  Flame,
  BadgePercent
} from 'lucide-react';

export default function BundleOfferSection() {
  const { allProducts, addToCart, formatPrice } = useShop();
  const navigate = useNavigate();

  // Find the bundle product
  const bundleProduct = allProducts.find((p) => p.id === 'prod-bundle-package-05');

  // Fallback data if products are loading
  const bundle = bundleProduct || {
    id: 'prod-bundle-package-05',
    name: 'الباكدج الكامل 4 في 1 (بيبي نيست + مخدة رضاعة + ساتر + مفرش غيار) توفير أكتر',
    price: 1375,
    originalPrice: 1545,
    colors: [
      { hex: '#C75B7A', name: 'طقم فوشيا يونيكورن كامل', image: 'https://riceqkznjftwadulwbcm.supabase.co/storage/v1/object/public/products/baby-nest-rose.jpg' },
      { hex: '#9C7A5B', name: 'طقم بني موكا سفاري كامل', image: 'https://riceqkznjftwadulwbcm.supabase.co/storage/v1/object/public/products/baby-nest-mocha.jpg' },
      { hex: '#5DADE2', name: 'طقم أزرق سماوي غيوم كامل', image: 'https://riceqkznjftwadulwbcm.supabase.co/storage/v1/object/public/products/baby-nest-blue.jpg' },
      { hex: '#85929E', name: 'طقم رمادي هادئ نجوم كامل', image: 'https://riceqkznjftwadulwbcm.supabase.co/storage/v1/object/public/products/baby-nest-grey.jpg' },
      { hex: '#F4B6C2', name: 'طقم وردي فاتح قمر كامل', image: 'https://riceqkznjftwadulwbcm.supabase.co/storage/v1/object/public/products/baby-nest-pink.jpg' }
    ],
    mainImage: 'https://riceqkznjftwadulwbcm.supabase.co/storage/v1/object/public/products/baby-nest-rose.jpg'
  };

  const [selectedColor, setSelectedColor] = useState(
    bundle.colors && bundle.colors.length > 0 ? bundle.colors[0] : null
  );
  const [activeImage, setActiveImage] = useState(
    selectedColor?.image || bundle.mainImage
  );
  const [isAdding, setIsAdding] = useState(false);

  const handleColorChange = (color) => {
    setSelectedColor(color);
    if (color.image) {
      setActiveImage(color.image);
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(bundle, 1, selectedColor);
    setTimeout(() => {
      setIsAdding(false);
    }, 1200);
  };

  const bundleItems = [
    {
      title: 'بيبي نيست بيضاوي كبير 110×80 سم',
      desc: 'دبل فيس قطن ناعم مع ناموسية واقية ومخدة نوم هدية',
      singlePrice: 650,
      id: 'prod-baby-nest-01',
      badge: 'السرير والمفارش'
    },
    {
      title: 'مخدة رضاعة طبية دبل فيس 50×60 سم',
      desc: 'تدعم ظهر الأم ومرفق الرضاعة + مخدة رأس مانعة للتسطح هدية',
      singlePrice: 450,
      id: 'prod-nursing-pillow-02',
      badge: 'الرضاعة وتغذية الرضيع'
    },
    {
      title: 'ساتر وغطاء رضاعة طبيعية قطني',
      desc: 'دعامة مرنة للرؤية والتنفس + جراب قماش أنيق للحفظ',
      singlePrice: 250,
      id: 'prod-nursing-cover-03',
      badge: 'مستلزمات الأمومة'
    },
    {
      title: 'مفرش غيار بيبي ووتر بروف 60×70 سم',
      desc: 'عازل للسوائل 100% طبقة مايكروفايبر ناعمة يقفل كشنطة يد',
      singlePrice: 195,
      id: 'prod-changing-mat-04',
      badge: 'الحفاضات ومستلزمات الغيار'
    }
  ];

  return (
    <section className="py-10 sm:py-16 bg-gradient-to-b from-white via-[#FCF8F5] to-white border-b border-rawaa-border overflow-hidden" aria-label="عرض الباكدج الشامل">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 xl:px-12">
        {/* Special Offer Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full mb-3 shadow-soft-xs">
            <Flame size={14} className="text-rose-500 animate-pulse" />
            <span>عرض التوفير الأكبر للأم والمولود الجديد</span>
            <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">وفر 240+ ج.م</span>
          </div>
          <h2 className="font-heading text-xl sm:text-3xl lg:text-4xl font-black text-rawaa-dark leading-tight mb-3">
            الباكدج الملكي الكامل 4 في 1 <br className="hidden xs:inline" />
            <span className="text-rawaa-primary relative inline-block">
              طقم متطابق بنفس النقشة والخامة
              <span className="absolute bottom-1 right-0 left-0 h-2 bg-rawaa-primary/15 rounded -z-10" />
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-rawaa-muted leading-relaxed">
            بدلاً من شراء كل قطعة بمفردها ودفع مصاريف شحن متكررة، جمعنا لكِ المستلزمات الـ 4 الأساسية التي تحتاجها كل أم ومولود في باكدج واحد متناسق بتوفير فوري وشحن مجاني لباب منزلك.
          </p>
        </div>

        {/* Interactive Bundle Card */}
        <div className="bg-white border-2 border-rawaa-primary/30 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-soft-md relative">
          {/* Top Promotional Header inside Card - Fully Visible & Never Clipped */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-rawaa-border/60">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rawaa-primary to-rose-600 text-white text-[11px] sm:text-xs font-black px-3.5 sm:px-4 py-2 rounded-full shadow-soft-xs">
              <BadgePercent size={16} />
              <span>توفير مؤكد + شحن مجاني لكافة المحافظات</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              <Sparkles size={14} className="text-emerald-600" />
              <span>وفرتي 170 ج.م نقدياً + 70 ج.م مصاريف شحن مهداة</span>
            </div>
          </div>

          {/* Card Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Visual Showcase */}
            <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full aspect-[4/3.5] sm:aspect-[4/3] rounded-2xl overflow-hidden border border-rawaa-border bg-rawaa-soft relative shadow-soft-xs group">
              <img
                src={activeImage}
                alt={bundle.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-[11px] font-bold text-rawaa-dark px-3 py-1 rounded-full shadow-soft-xs border border-rawaa-border">
                {selectedColor ? selectedColor.name : 'طقم متطابق 4 قطع'}
              </span>
            </div>

            {/* Color Palette Selector */}
            {bundle.colors && bundle.colors.length > 0 && (
              <div className="mt-4 w-full bg-rawaa-bg p-3 rounded-2xl border border-rawaa-border text-center">
                <span className="text-[11px] font-bold text-rawaa-dark block mb-2">
                  اختاري النقشة واللون المفضل لطقمك: <strong className="text-rawaa-primary">{selectedColor?.name}</strong>
                </span>
                <div className="flex items-center justify-center gap-2.5 flex-wrap">
                  {bundle.colors.map((c, idx) => {
                    const isSelected = selectedColor?.name === c.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleColorChange(c)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'ring-2 ring-rawaa-primary ring-offset-2 scale-110 shadow-soft-xs'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                        aria-label={c.name}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: 4 Included Items & Action */}
          <div className="lg:col-span-7 flex flex-col justify-between text-right">
            <div>
              <span className="text-xs font-bold text-rawaa-primary uppercase tracking-wider block mb-1">
                محتويات الباكدج الأربعة الأصلية:
              </span>
              <h3 className="font-heading text-lg sm:text-2xl font-black text-rawaa-dark mb-4">
                كل ما يحتاجه رضيعك للنوم والرضاعة والغيار في طقم واحد
              </h3>

              {/* 4 Items List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {bundleItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-rawaa-bg hover:bg-rawaa-soft border border-rawaa-border rounded-xl flex items-start gap-2.5 transition-colors"
                  >
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <strong className="text-xs font-bold text-rawaa-dark truncate">{item.title}</strong>
                        <span className="text-[10px] text-rawaa-muted shrink-0 line-through">
                          {formatPrice(item.singlePrice)}
                        </span>
                      </div>
                      <p className="text-[11px] text-rawaa-muted leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust highlights */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-rawaa-dark mb-6 border-y border-dashed border-rawaa-border py-3">
                <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold">
                  <Truck size={15} className="text-emerald-600" />
                  <span>توصيل مجاني 100% لباب البيت</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-rawaa-muted">
                  <ShieldCheck size={15} className="text-rawaa-sage" />
                  <span>أقطان تركية ومصرية فاخرة</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-rawaa-muted">
                  <Star size={15} className="text-amber-500 fill-amber-500" />
                  <span>الأعلى تقييماً من الأمهات 4.9/5</span>
                </span>
              </div>
            </div>

            {/* Pricing Box & CTA */}
            <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-rawaa-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-right">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-rawaa-primary">
                    {formatPrice(1375)}
                  </span>
                  <span className="text-xs sm:text-sm text-rawaa-muted line-through font-mono">
                    {formatPrice(1600)}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                  <span>وفرتي 170 ج.م نقدياً + 70 ج.م مصاريف شحن مهداة</span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-rawaa-primary hover:bg-rawaa-primary-hover text-white text-xs sm:text-sm font-bold px-6 sm:px-8 py-3.5 rounded-full shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
                    isAdding ? 'bg-emerald-600' : ''
                  }`}
                >
                  <ShoppingBag size={17} />
                  <span>{isAdding ? 'تمت الإضافة للسلة بنجاح 🤍' : 'أضيفي الباكدج كامل للسلة'}</span>
                </button>

                {bundleProduct && (
                  <button
                    type="button"
                    onClick={() => navigate(`/product/${bundleProduct.id}`)}
                    className="w-11 h-11 rounded-full bg-white hover:bg-rawaa-primary-light border border-rawaa-border text-rawaa-dark hover:text-rawaa-primary flex items-center justify-center transition-colors shrink-0 shadow-soft-xs"
                    title="استعراض تفاصيل الباكدج"
                    aria-label="عرض التفاصيل"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
}
