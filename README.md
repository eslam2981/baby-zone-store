<div align="center">

# 🍼 رَواء الصغير | RAWAA
### المتجر الرقمي المتكامل والراقي لمستلزمات الأم والطفل في مصر
**A Modern, Luxury Mother & Baby E-Commerce Experience**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Vercel Ready](https://img.shields.io/badge/Deployment-Vercel_Ready-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![Author](https://img.shields.io/badge/Author-Eslam_Gamil-C25E3E)](#)
[![License](https://img.shields.io/badge/License-MIT-emerald)](LICENSE)

<p align="center">
  منصة تسوق إلكتروني عصرية وفاخرة تلبي كافة احتياجات الأمهات والمواليد في مصر، تجمع بين الدفء والتصميم الراقي وأحدث معايير تجربة المستخدم (UX/UI) والأمان الطبي المعتمد.
</p>

[استعراض المميزات](#-أبرز-المميزات) •
[الصفحات والمسارات](#-الصفحات-والأقسام) •
[هيكل المشروع](#-هيكل-المشروع) •
[التشغيل محلياً](#-التشغيل-محليا) •
[الترخيص](#-الترخيص)

</div>

---

## ✨ أبرز المميزات

### 1. تجربة تسوق محلية مخصصة لمصر (100% Egyptian Localization)
- الاعتماد الكامل على **الجنيه المصري (ج.م)** في كافة الحسابات والفواتير والخصومات.
- خيارات دفع مرنة تشمل **الدفع عند الاستلام (COD)**، **InstaPay (إنستاباي)**، **فودافون كاش**، والبطاقات البنكية.
- سياسة فحص ومعاينة الشحنة للمشتري قبل سداد القيمة لمندوب التوصيل.
- زر دعم مباشر على الواتساب مخصص لرقم المبيعات المصري (`01211735629`).

### 2. دليل وحاسبة حقيبة الولادة الذكية (Interactive Hospital Bag Checklist)
- أداة تفاعلية متطورة للمقبلين على الولادة مقسمة إلى 4 أقسام رئيسية (حقيبة المولود، حقيبة الأم، غرفة النوم، مستلزمات التنقل).
- مؤشر إنجاز ديناميكي وتفاعلي يحسب نسبة جاهزية الحقيبة لحظياً مع حفظ الخيارات في المتصفح (`localStorage`).
- نصائح طبية معتمدة لكل منتج مع إمكانية إضافة المنتج المقترح مباشرة لسلة المشتريات بلمسة واحدة.
- أدوات طباعة فورية ومشاركة القائمة عبر الواتساب.

### 3. نظام تتبع الشحنات المباشر (Live Order Tracking System)
- إمكانية الاستعلام عن مسار الشحنة برقم الطلب (مثل `RAW-8842`) أو رقم هاتف العميل.
- شريط زمني تفاعلي من 4 مراحل (تأكيد الطلب ➔ التعقيم والتجهيز الطبي ➔ مع المندوب في الطريق ➔ تم التسليم).
- عرض اسم مندوب التوصيل، الموعد التقريبي، كود التحقق الأمني للاستلام، ومحتويات الطرد.
- دليل متكامل لسرعة الشحن وتكلفته لكافة محافظات مصر (القاهرة، الجيزة، الإسكندرية، الدلتا، القناة، والصعيد).

### 4. كتالوج منتجات متقدم وفلاتر ذكية
- 17 قسماً شاملاً تغطي كافة مراحل نمو الطفل (0 إلى 6 سنوات).
- شريط أقسام انسيابي وسلس مع حركة لا نهائية بدون شريط تمرير مزعج.
- فلاتر ديناميكية حسب السعر، العلامة التجارية، العمر، التوفر، المنتجات العضوية، ونسب الخصم.
- ميزة المعاينة السريعة للمنتج (Quick View Modal) دون الحاجة لمغادرة الصفحة.

### 5. سلة مشتريات وقائمة مفضلة متكاملة
- سلة تسوق جانبية تدعم تعديل الكميات واختيار الألوان وتطبيق كوبونات الخصم الترويجية.
- شريط ذكي لحساب الشحن المجاني التلقائي وتنبيه العميل بالقيمة المتبقية.
- حفظ تلقائي للبيانات محلياً عبر `localStorage` لضمان عدم ضياع اختيارات العميل.

---

## 🧭 الصفحات والمسارات

| المسار (Route) | الصفحة | الوصف |
| :--- | :--- | :--- |
| `/` | **الرئيسية (Home)** | الواجهة الترحيبية، البانرات الترويجية، شريط الأقسام، الكتالوج، وقسم الهدايا |
| `/category/:categoryId` | **كتالوج الأقسام (Catalog)** | عرض المنتجات مع فلاتر الفئات والأسعار والترتيب المتقدم |
| `/product/:productId` | **تفاصيل المنتج (Details)** | معرض الصور، الألوان، المقاسات، المواصفات الطبية، والمنتجات المشابهة |
| `/hospital-bag` | **حقيبة الولادة (Checklist)** | حاسبة وقائمة تجهيز حقيبة المستشفى والمولود التفاعلية مع نصائح الأطباء |
| `/track-order` | **تتبع الشحنة (Tracking)** | شريط تتبع حالة الطلب خطوة بخطوة ودليل مواعيد الشحن لمحافظات مصر |

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Frontend Core:** React 19, JavaScript (ES Modules)
- **Bundler & Build Tool:** Vite 6
- **Styling & Design System:** Tailwind CSS v3, Vanilla CSS Design Tokens, Font Cairo & Readex Pro & Tajawal
- **Icons:** Lucide React
- **Routing:** React Router DOM v7 (SPA with client-side history navigation)
- **State Management:** React Context API + LocalStorage persistence
- **Deployment Platform:** Vercel (Configured with `vercel.json` SPA rewrites)

---

## 📁 هيكل المشروع (Project Structure)

```text
e-commerce-app/
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Brand logos and imagery
│   ├── components/         # Reusable modular UI components
│   │   ├── cart/           # Cart drawer & shipping progress bar
│   │   ├── catalog/        # Product cards, grid, filters, and quick view
│   │   ├── common/         # Header, footer, mega menu, toasts, whatsapp button
│   │   ├── home/           # Hero banner, category pills, trust pillars, services
│   │   └── modals/         # Auth modal, wishlist drawer
│   ├── context/            # ShopContext (cart, wishlist, currencies, filters)
│   ├── data/               # Product catalog dataset and category tree
│   ├── layouts/            # MainLayout with persistent header and footer
│   ├── pages/              # Routed pages (Home, Category, Product, Hospital Bag, Track)
│   ├── styles/             # Modular CSS animations and design tokens
│   ├── App.jsx             # React router configuration
│   ├── index.css           # Global typography and Tailwind directives
│   └── main.jsx            # Application entry point
├── .gitignore              # Ignored files including agent and codex tools
├── vercel.json             # Vercel deployment and SPA routing configuration
├── tailwind.config.js      # Custom theme tokens and colors
├── vite.config.js          # Vite build configuration
└── package.json            # Scripts and dependencies
```

---

## 🚀 التشغيل محلياً (Local Development)

### المتطلبات المسبقة
- Node.js (الإصدار 18 أو أحدث)
- npm أو pnpm أو yarn

### خطوات التشغيل
1. **تثبيت الحزم والاعتماديات:**
   ```bash
   npm install
   ```

2. **تشغيل سيرفر التطوير المحلي:**
   ```bash
   npm run dev
   ```
   افتح المتصفح على الرابط: `http://localhost:5173`

3. **بناء النسخة الإنتاجية (Production Build):**
   ```bash
   npm run build
   ```

4. **معاينة النسخة الإنتاجية محلياً:**
   ```bash
   npm run preview
   ```

---

## 📄 الترخيص (License)
هذا المشروع مرخص ومحمي تحت رخصة **MIT** باسم المطور **Eslam Gamil** © 2026.
جميع الحقوق محفوظة للمطور [Eslam Gamil](LICENSE). يمكنك استخدامه وتطويره بحرية.
