// Product catalog dataset containing detailed specifications and pricing
export const products = [
  {
    id: "p1",
    name: "عربة أطفال ستوك يويو³ خفيفة الوزن ومناسبة لكابينة الطائرة",
    brand: "Stokke",
    category: "strollers",
    subcategory: "عربات الطائرة والوزن الخفيف",
    price: 1890,
    originalPrice: 2250,
    discountPercent: 16,
    rating: 4.9,
    reviewCount: 142,
    inStock: true,
    stockCount: 12,
    isBestSeller: true,
    isNew: false,
    isOrganic: false,
    ageGroup: "0-3 سنوات",
    badge: "الأكثر مبيعاً",
    mainImage: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "رمادي حجري", hex: "#7E8284" },
      { name: "أخضر زيتوني ناعم", hex: "#435B4E" },
      { name: "أسود فاحم", hex: "#1F2022" }
    ],
    shortDesc: "العربة الشهيرة عالمياً بطي فائقة السهولة بيد واحدة ومقاس معتمد للرحلات الجوية ومساند أمان مبطنة.",
    features: [
      "وزن فائق الخفة: 6.2 كجم فقط",
      "معتمدة من خطوط الطيران كحقيبة كابينة يد",
      "نظام تعليق هيدروليكي بأربع عجلات لامتصاص الصدمات",
      "مظلة شمسية مقاومة للماء مع حماية UPF 50+"
    ]
  },
  {
    id: "p2",
    name: "مقعد سيارة سايبكس سيلونا دوار 360 درجة بمعيار الأمان i-Size",
    brand: "Cybex",
    category: "car-seats",
    subcategory: "مقاعد دوارة 360 درجة",
    price: 2450,
    originalPrice: 2890,
    discountPercent: 15,
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    stockCount: 8,
    isBestSeller: true,
    isNew: true,
    isOrganic: false,
    ageGroup: "حديث ولادة (0-4 سنوات)",
    badge: "معيار أمان ألماني",
    mainImage: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "أسود نايت", hex: "#1C1D21" },
      { name: "رمادي سوهو", hex: "#63676A" },
      { name: "كحلي بحري", hex: "#233348" }
    ],
    shortDesc: "دوران سلس 360 درجة يسهل وضع الرضيع وإخراجه دون إجهاد الظهر، مع دروع جانبية متطورة لامتصاص الصدمات.",
    features: [
      "دوران كامل 360 درجة بقاعدة آيزوفيكس Isofix",
      "نظام حماية خطي ضد الصدمات الجانبية L.S.P",
      "إمالة مريحة بـ 5 وضعيات في كلا الاتجاهين",
      "أقمشة تنفسية تسمح بتدفق الهواء وتقلل تعرق الطفل"
    ]
  },
  {
    id: "p3",
    name: "طقم أفرول ومهاد المواليد من القطن العضوي النقي 100% (3 قطع)",
    brand: "Mushie",
    category: "clothing",
    subcategory: "ملابس المواليد وأزياء الصغار",
    price: 240,
    originalPrice: 295,
    discountPercent: 19,
    rating: 4.8,
    reviewCount: 215,
    inStock: true,
    stockCount: 25,
    isBestSeller: false,
    isNew: true,
    isOrganic: true,
    ageGroup: "حديث ولادة (0-6 أشهر)",
    badge: "قطن عضوي GOTS",
    mainImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "رملي طبيعي", hex: "#E9E2D5" },
      { name: "ميرمية هادئة", hex: "#8DA399" },
      { name: "وردي ترابي", hex: "#D6AFA4" }
    ],
    shortDesc: "مصنوع من أنعم ألياف القطن العضوي الخالي تماماً من المبيدات والأصباغ الكيميائية للحفاظ على بشرة طفلك.",
    features: [
      "شهادة المعيار العالمي للمنسوجات العضوية (GOTS)",
      "سحّاب ثنائي الاتجاه لتغيير الحفاض بسهولة تامة",
      "كفوف مدمجة لحماية وجه الرضيع من الخدوش",
      "درزات مسطحة لمنع احتكاك بشرة الرضيع الحساسة"
    ]
  },
  {
    id: "p4",
    name: "كاميرا مراقبة الطفل الذكية مع مستشعر تنفس ورؤية ليلية 2K",
    brand: "Nanit Pro",
    category: "monitors",
    subcategory: "كاميرات المراقبة بالواي فاي والصوت",
    price: 1350,
    originalPrice: 1590,
    discountPercent: 15,
    rating: 4.9,
    reviewCount: 96,
    inStock: true,
    stockCount: 14,
    isBestSeller: true,
    isNew: true,
    isOrganic: false,
    ageGroup: "0-3 سنوات",
    badge: "ذكاء اصطناعي",
    mainImage: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "أبيض مطفي", hex: "#F3F3F3" }
    ],
    shortDesc: "تتبع حركة تنفس الطفل ونمط نومه في الوقت الحقيقي بدون أي مستشعرات تلامس جسمه، مع بث كريستالي عبر الجوال.",
    features: [
      "دقة وضوح فائقة 2K مع رؤية ليلية بالأشعة تحت الحمراء",
      "تنبيهات فورية عند البكاء أو تغير درجة حرارة الغرفة",
      "تحليل مفصل لجودة النوم وساعات الاستيقاظ تلقائياً",
      "صوت ثنائي الاتجاه للتحدث وتهدئة طفلك عن بُعد"
    ]
  },
  {
    id: "p5",
    name: "جهاز تعقيم وتجفيف الرضّاعات بالبخار المتقدم 4 في 1",
    brand: "Philips Avent",
    category: "bottles",
    subcategory: "أجهزة التعقيم بالبخار والـ UV",
    price: 495,
    originalPrice: 580,
    discountPercent: 15,
    rating: 4.8,
    reviewCount: 310,
    inStock: true,
    stockCount: 19,
    isBestSeller: true,
    isNew: false,
    isOrganic: false,
    ageGroup: "حديث ولادة (0-12 شهر)",
    badge: "معقم طبي",
    mainImage: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "أبيض ناصع", hex: "#FFFFFF" }
    ],
    shortDesc: "يقضي على 99.9% من الجراثيم الضارة في 10 دقائق فقط مع تجفيف كامل بالهواء المفلتر لتكون الرضاعة جاهزة فوراً.",
    features: [
      "تعقيم وتجفيف متكامل بدورة واحدة مدتها 40 دقيقة",
      "يحافظ على المحتويات معقمة لمدة 24 ساعة إذا بقي الغطاء مغلقاً",
      "سعة واسعة تتسع لـ 6 رضّاعات وإكسسوارات الشفاط والمصاصات",
      "فلتر هواء نقي بتقنية تنقية الغبار والروائح"
    ]
  },
  {
    id: "p6",
    name: "مضخة حليب الأم الكهربائية المزدوجة المحمولة بدون أسلاك",
    brand: "Medela",
    category: "feeding",
    subcategory: "مضخات الحليب الكهربائية واليدوية",
    price: 1120,
    originalPrice: 1350,
    discountPercent: 17,
    rating: 4.9,
    reviewCount: 178,
    inStock: true,
    stockCount: 10,
    isBestSeller: true,
    isNew: true,
    isOrganic: false,
    ageGroup: "للأم والرضيع",
    badge: "توصية الأطباء",
    mainImage: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "أصفر ميدلا الكلاسيكي", hex: "#F3BE38" },
      { name: "أبيض رخامي", hex: "#FAFAFA" }
    ],
    shortDesc: "تقنية 2-Phase الرائدة لمحاكاة الرضاعة الطبيعية للطفل لتحفيز تدفق الحليب بسرعة وكفاءة هادئة.",
    features: [
      "قابلة للارتداء داخل حمالة الصدر بدون أسلاك مزعجة",
      "صوت فائق الهدوء لضخ سري ومريح في أي مكان",
      "أقماع سيليكون مرنة تناسب تشريح الثدي الطبيعي",
      "بطارية ليثيوم شحن USB تكفي حتى 8 جلسات ضخ"
    ]
  },
  {
    id: "p7",
    name: "سرير المواليد الخشبي النوردي القابل للتعديل والإلحاق بسرير الأم",
    brand: "Stokke Sleepi",
    category: "bedding",
    subcategory: "مهود مواليد ملحقة بسرير الأم",
    price: 2980,
    originalPrice: 3400,
    discountPercent: 12,
    rating: 4.9,
    reviewCount: 64,
    inStock: true,
    stockCount: 6,
    isBestSeller: false,
    isNew: true,
    isOrganic: true,
    ageGroup: "0-5 سنوات",
    badge: "خشب زان طبيعي",
    mainImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "خشب طبيعي فاتح", hex: "#D6B898" },
      { name: "أبيض لؤلؤي", hex: "#F8F6F2" },
      { name: "رمادي هازي", hex: "#9E9E9E" }
    ],
    shortDesc: "سرير بيضاوي أنيق ينمو مع طفلك من حديث ولادة وحتى عمر 5 سنوات، يضمن تهوية مثالية وتصميماً مهدئاً.",
    features: [
      "مصنوع من خشب الزان الصلب الأوروبي المستدام",
      "قاعدة قابلة لتعديل الارتفاع لتناسب سرير الوالدين",
      "عجلات دوارة صامتة مع قفل أمان للتنقل بين الغرف",
      "مرتبة تنفسية مريحة مع غطاء قطني قابل للغسل"
    ]
  },
  {
    id: "p8",
    name: "حمّالة الأطفال الأرجونومية أول إن ون لراحة الظهر والحوض",
    brand: "Ergobaby Omni",
    category: "carriers",
    subcategory: "حمّالات أطفال مريحة للظهر",
    price: 680,
    originalPrice: 790,
    discountPercent: 14,
    rating: 4.8,
    reviewCount: 156,
    inStock: true,
    stockCount: 15,
    isBestSeller: false,
    isNew: false,
    isOrganic: false,
    ageGroup: "حديث ولادة حتى 20 كجم",
    badge: "صحة الحوض",
    mainImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "كحلي كلاسيكي", hex: "#223348" },
      { name: "رمادي ناعم", hex: "#7A7F82" },
      { name: "أخضر زيتوني", hex: "#4B5848" }
    ],
    shortDesc: "معتمدة من المعهد الدولي لخلل تنسج الورك، تضمن وضعية الجلوس M الطبيعية للطفل مع دعم قطني ممتاز للوالدين.",
    features: [
      "4 وضعيات حمل: للأمام، للداخل، على الورك، وعلى الظهر",
      "نسيج شبكي Cool Air Mesh لتهوية ممتازة في الأيام الحارة",
      "حزام خصر عريض مدعم بوسادة للفقرات القطنية",
      "غطاء حماية مدمج للشمس والخصوصية أثناء الرضاعة"
    ]
  },
  {
    id: "p9",
    name: "مجموعة العناية والاستحمام الكاملة للأطفال بالصبار والبابونج",
    brand: "Mustela Bebe",
    category: "bath",
    subcategory: "شامبو وغسول استحمام طبيعي",
    price: 185,
    originalPrice: 220,
    discountPercent: 16,
    rating: 4.9,
    reviewCount: 430,
    inStock: true,
    stockCount: 38,
    isBestSeller: true,
    isNew: false,
    isOrganic: true,
    ageGroup: "حديث ولادة والرضع",
    badge: "98% مكونات طبيعية",
    mainImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "عبوة طبيعية", hex: "#E8F0EC" }
    ],
    shortDesc: "تركيبة فرنسية خالية من الدموع ومختبرة من قِبل أطباء الجلد والأطفال لحماية الحاجز الجلدي الحساس.",
    features: [
      "تحتوي على أفوكادو بيرسيوس العضوي لترطيب عميق",
      "خالية 100% من البارابين، الفثالات، والفينوكسي إيثانول",
      "تتضمن جل تنظيف، كريم مرطب، وكريم حماية من التهاب الحفاض",
      "عطر موستيلا الأيقوني اللطيف والمهدئ لنوم الطفل"
    ]
  },
  {
    id: "p10",
    name: "مجموعة ألعاب المنتسوري الخشبية لتنمية المهارات الحسية والحركية",
    brand: "PlanToys",
    category: "toys",
    subcategory: "ألعاب الترتيب والتركيب الخشبية",
    price: 290,
    originalPrice: 350,
    discountPercent: 17,
    rating: 4.9,
    reviewCount: 112,
    inStock: true,
    stockCount: 16,
    isBestSeller: false,
    isNew: true,
    isOrganic: true,
    ageGroup: "6-24 شهر",
    badge: "خشب مستدام",
    mainImage: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "ألوان خشبية طبيعية", hex: "#E4C49F" }
    ],
    shortDesc: "ألعاب خشبية ناعمة الحواف مطلية بألوان مائية آمنة للمضغ، تطور التناسق البصري الحركي والتفكير المنطقي.",
    features: [
      "مصنوعة من خشب شجر المطاط الطبيعي بدون غراء كيميائي",
      "تتضمن برج الحلقات الملون، وصندوق الأشكال، وخشخيشة صوتية",
      "تصميم يدعم الاستكشاف الذاتي وفلسفة منتسوري التعليمية",
      "حواف دائرية مصقولة بعناية فائقة لسلامة فم وأيدي الطفل"
    ]
  },
  {
    id: "p11",
    name: "صندوق باقة استقبال المولود الملكية الفاخرة (12 قطعة مخصصة)",
    brand: "RAWAA Atelier",
    category: "gifts",
    subcategory: "صناديق المولود الجديد الفاخرة",
    price: 650,
    originalPrice: 790,
    discountPercent: 18,
    rating: 5.0,
    reviewCount: 78,
    inStock: true,
    stockCount: 10,
    isBestSeller: true,
    isNew: true,
    isOrganic: true,
    ageGroup: "حديث ولادة",
    badge: "هدية فاخرة",
    mainImage: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "صندوق بيج وأشرطة ذهبية", hex: "#D4AF37" },
      { name: "صندوق أخضر ميرمية", hex: "#435B4E" }
    ],
    shortDesc: "تغليف هدايا احترافي يشمل بطانية صوف ناعمة، طقم ملابس قطن مصري، حذاء تذكاري، وفرشاة خشبية باسم الطفل.",
    features: [
      "صندوق صلب مطلي يدوي ومزين بشريط حريري فاخر",
      "بطاقة تهنئة مكتوبة بخط عربي فني مع رسالتك الشخصية",
      "أقمشة قطنية نقية معتمدة صحياً لحديثي الولادة",
      "تذكار بصمة اليد والقدم بالصلصال الآمن الخالي من الحبر"
    ]
  },
  {
    id: "p12",
    name: "كرسي الإطعام المتعدد المراحل من الخشب الطبيعي مع صينية قابلة للفصل",
    brand: "Tripp Trapp",
    category: "nursery",
    subcategory: "طاولات تبديل الحفاض الخشبية",
    price: 1190,
    originalPrice: 1380,
    discountPercent: 14,
    rating: 4.9,
    reviewCount: 94,
    inStock: true,
    stockCount: 7,
    isBestSeller: false,
    isNew: false,
    isOrganic: true,
    ageGroup: "6 أشهر حتى البلوغ",
    badge: "أيقونة تصميم",
    mainImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "خشب طبيعي", hex: "#C8A47E" },
      { name: "أبيض دافئ", hex: "#EAE6DF" },
      { name: "أسود أنثراسايت", hex: "#2B2D2F" }
    ],
    shortDesc: "الكرسي الأسطوري الذي يقرّب طفلك من مائدة العائلة؛ مستويات قابلة للضبط بالكامل للمقعد ومسند القدمين.",
    features: [
      "يتحمل حتى وزن 136 كجم ويدوم مدى الحياة",
      "وضعية جلوس صحية تدعم الظهر بزاوية قائمة 90 درجة",
      "صينية إطعام سهلة الغسيل في غسالة الأطباق",
      "حزام أمان خماسي النقاط قابل للإزالة عند الكبر"
    ]
  },
  {
    id: "p13",
    name: "حقيبة حفاضات وتنظيم مستلزمات البيبي المقاومة للماء مع بساط غيار",
    brand: "Luli Bebe",
    category: "diapers",
    subcategory: "مفارش تغيير الحفاض المقاومة للماء",
    price: 360,
    originalPrice: 430,
    discountPercent: 16,
    rating: 4.8,
    reviewCount: 182,
    inStock: true,
    stockCount: 22,
    isBestSeller: false,
    isNew: true,
    isOrganic: false,
    ageGroup: "للوالدين",
    badge: "جلد نباتي فاخر",
    mainImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "كراميل دافئ", hex: "#9C5D35" },
      { name: "أسود كلاسيكي", hex: "#1D1E20" },
      { name: "عاجي أنيق", hex: "#E8E2D8" }
    ],
    shortDesc: "مظهر جلدي أنيق وحقيبة ظهر عملية بجيوب حرارية معزولة لحفظ حرارة الرضّاعات ومساحة تتسع لكل اللوازم.",
    features: [
      "مصنوعة من جلد نباتي فاخر مقاوم للبقع والماء وسهل المسح",
      "جيوب مخصصة لحفظ برودة وحرارة الرضّاعات لعدة ساعات",
      "تتضمن بساط غيار مبطن ومقاوم للبلل وحزام تعليق بالعربة",
      "مدخل USB خارجي وجيوب سرية للهاتف والمقتنيات الثمينة"
    ]
  },
  {
    id: "p14",
    name: "كيس نوم وقماط المواليد لتقليل الفزع والنوم الهانئ بأمان",
    brand: "Love To Dream",
    category: "bedding",
    subcategory: "أكياس وقماطات النوم الذاتية",
    price: 195,
    originalPrice: 235,
    discountPercent: 17,
    rating: 4.9,
    reviewCount: 290,
    inStock: true,
    stockCount: 30,
    isBestSeller: true,
    isNew: false,
    isOrganic: true,
    ageGroup: "حديث ولادة (0-6 أشهر)",
    badge: "تصميم الأذرع لأعلى",
    mainImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "رمادي سحابي", hex: "#C5C8C9" },
      { name: "أزرق سماوي", hex: "#B8D2E4" },
      { name: "زهري بودري", hex: "#E4B8C1" }
    ],
    shortDesc: "التصميم المبتكر الحائز على جوائز عالمية الذي يسمح للطفل بوضع يديه لأعلى ليهدئ نفسه بطريقة طبيعية.",
    features: [
      "يمنع منعكس مورو (فزع الاستيقاظ المفاجئ) دون تقييد حركة الوركين",
      "سحاب مزدوج لتغيير الحفاض ليلاً بدون إيقاظ الرضيع",
      "أقمشة قطنية مرنة ومريحة تناسب حركة الصدر أثناء التنفس",
      "معترف به من قِبل خبراء طب نوم الأطفال حول العالم"
    ]
  },
  {
    id: "p15",
    name: "رضّاعات زجاجية مضادة للمغص خالية من BPA سعة 240 مل (طقم قطعتين)",
    brand: "BIBS Denmark",
    category: "bottles",
    subcategory: "رضّاعات زجاج وطبية خالية من BPA",
    price: 165,
    originalPrice: 195,
    discountPercent: 15,
    rating: 4.8,
    reviewCount: 164,
    inStock: true,
    stockCount: 28,
    isBestSeller: false,
    isNew: true,
    isOrganic: false,
    ageGroup: "0-12 شهر",
    badge: "زجاج بوروسيليكات",
    mainImage: "https://images.unsplash.com/photo-1584839619929-79883526985a?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1584839619929-79883526985a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "شفاف بغطاء عاجي", hex: "#EBE6DD" },
      { name: "شفاف بغطاء ميرمية", hex: "#7E9487" }
    ],
    shortDesc: "زجاج بوروسيليكات طبي فائق النقاء مقاوم للحرارة والصدمات الحرارية مع حلمة لاتكس طبيعي دائرية.",
    features: [
      "صمام مانع للمغص يقلل ابتلاع الهواء أثناء الرضاعة",
      "آمنة للاستخدام في الميكروويف، غسالة الصحون والتعقيم",
      "حلمات تحاكي مرونة وشكل حلمة الأم الطبيعية تماماً",
      "قابلة لإعادة التدوير 100% وخالية من أي مواد كيميائية"
    ]
  },
  {
    id: "p16",
    name: "حقيبة مستلزمات الأمومة الشاملة لفترة الولادة وما بعد الوضع",
    brand: "Frida Mom",
    category: "maternity",
    subcategory: "حقيبة المستشفى الشاملة للولادة",
    price: 480,
    originalPrice: 560,
    discountPercent: 14,
    rating: 4.9,
    reviewCount: 220,
    inStock: true,
    stockCount: 14,
    isBestSeller: true,
    isNew: false,
    isOrganic: false,
    ageGroup: "للأم في فترة التعافي",
    badge: "حقيبة المستشفى الأساسية",
    mainImage: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "وردي ناعم", hex: "#ECCAC5" }
    ],
    shortDesc: "كل ما تحتاجه الأم للتعافي الفوري بعد الولادة؛ رغوة تبريد، وسادات عشبية، ملخص شطاف مريح وجوارب تدفئة.",
    features: [
      "طقم متكامل للرعاية الشخصية بعد الولادة الطبيعية والقيصرية",
      "شطاف يدوي برأس مائل لتنظيف مريح وموجه بدون انحناء",
      "ملابس داخلية فائقة المرونة للاستخدام في المستشفى والمنزل",
      "وسادات تبريد مهدئة لتسكين الآلام وتسريع الشفاء"
    ]
  },
  {
    id: "p17",
    name: "ميزان حرارة طبي بالأشعة تحت الحمراء بدون لمس مع إنذار حمى",
    brand: "Braun",
    category: "baby-care",
    subcategory: "موازين الحرارة وشفاطات الأنف",
    price: 320,
    originalPrice: 380,
    discountPercent: 16,
    rating: 4.8,
    reviewCount: 340,
    inStock: true,
    stockCount: 24,
    isBestSeller: false,
    isNew: false,
    isOrganic: false,
    ageGroup: "جميع الأعمار",
    badge: "دقة طبية مثبتة",
    mainImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "أبيض وأزرق", hex: "#3A729E" }
    ],
    shortDesc: "تقنية Age Precision الحصرية التي تضبط معايير تفسير درجة الحرارة وفق عمر الطفل بدقة تامة خلال ثانيتين.",
    features: [
      "قراءة حرارة دقيقة دون إيقاظ الطفل النائم",
      "شاشة ملونة بإضاءة خلفية ترمز باللون الأخضر والأصفر والأحمر",
      "ذاكرة تخزين لآخر 9 قراءات لتتبع تطور حالة الطفل",
      "معتمد للاستخدام المنزلي والعيادات الطبية"
    ]
  },
  {
    id: "p18",
    name: "صندوق حفاضات بامبرز الفاخرة النقية مع مناديل أكوا بيور (عرض التوفير)",
    brand: "Pampers Pure",
    category: "diapers",
    subcategory: "حفاضات حديثي الولادة",
    price: 210,
    originalPrice: 260,
    discountPercent: 19,
    rating: 4.8,
    reviewCount: 512,
    inStock: true,
    stockCount: 45,
    isBestSeller: true,
    isNew: false,
    isOrganic: true,
    ageGroup: "حديث ولادة (مقاس 1 و 2)",
    badge: "حماية 12 ساعة",
    mainImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
    ],
    colors: [
      { name: "أبيض نقي بنقشات نباتية", hex: "#FAFAFA" }
    ],
    shortDesc: "حفاضات مصنوعة من قطن فاخر ومواد نباتية ناعمة تحافظ على جفاف بشرة طفلك لمدة تصل إلى 12 ساعة بأمان تام.",
    features: [
      "مؤشر بلل ذكي يتغير لونه لمعرفة موعد التغيير",
      "0% عطور، لوشن تبييض أو مسببات حساسية",
      "فتحة مخصصة لحماية سُرّة حديث الولادة الحساسة",
      "تتضمن 3 عبوات مناديل مبللة بالماء النقي بنسبة 99%"
    ]
  }
];
