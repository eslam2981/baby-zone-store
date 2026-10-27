// Complete taxonomy and roadmap of store departments for Baby Zone
// Live categories from Supabase take top priority, while other categories remain visible as 'Coming Soon'

export const DEFAULT_CATALOG_CATEGORIES = [
  {
    id: "bedding",
    name: "أسرّة، مفارش ومستلزمات النوم",
    slug: "bedding",
    icon: "Bed",
    description: "بيبي نيست، أسرّة ومفارش نوم مريحة وآمنة لراحة رضيعك",
    badge: "راحة وأمان",
    subcategories: ["بيبي نيست ومفارش", "أسرّة ومفارش", "وسائد ومخدات"],
    isComingSoon: false
  },
  {
    id: "feeding",
    name: "الرضاعة وتغذية الرضيع",
    slug: "feeding",
    icon: "Soup",
    description: "مخدات الرضاعة الطبية ومستلزمات تغذية الرضيع المريحة",
    badge: "أمومة ورعاية",
    subcategories: ["مخدات ووسائد الرضاعة", "تغذية الرضيع", "مستلزمات الأمومة"],
    isComingSoon: false
  },
  {
    id: "diapers",
    name: "الحفاضات ومستلزمات الغيار",
    slug: "diapers",
    icon: "Package",
    description: "مفارش غيار ووتر بروف ومستلزمات التغيير اليومية للرضيع",
    badge: "يومي وعملي",
    subcategories: ["مفارش غيار ووتر بروف", "حفاضات ومناديل", "مستلزمات الغيار"],
    isComingSoon: false
  },
  {
    id: "baby-care",
    name: "العناية بالنظافة وصحة الرضيع",
    slug: "baby-care",
    icon: "HeartPulse",
    description: "منتجات طبية مرخصة وخالية من الكيماويات لصحة رضيعك",
    badge: "قريباً",
    subcategories: ["كريمات الترطيب والوقاية", "موازين الحرارة وشفاطات الأنف", "العناية بالأظافر والشعر", "الإسعافات الأولية للرضيع"],
    isComingSoon: true
  },
  {
    id: "bottles",
    name: "الرضّاعات، المعقمات والإكسسوارات",
    slug: "bottles",
    icon: "Milk",
    description: "رضّاعات زجاجية ومضادة للمغص مع أجهزة التعقيم والتسخين الذكية",
    badge: "قريباً",
    subcategories: ["رضّاعات زجاج وطبية خالية من BPA", "حلمات تدفق بطيء وسريع", "أجهزة التعقيم بالبخار والـ UV", "سخانات الرضّاعات السريعة", "فرش التنظيف والتجفيف"],
    isComingSoon: true
  },
  {
    id: "clothing",
    name: "ملابس المواليد وأزياء الصغار",
    slug: "clothing",
    icon: "Shirt",
    description: "أقطان عضوية 100% GOTS معتمدة وناعمة على بشرة حديثي الولادة",
    badge: "قريباً",
    subcategories: ["أفرولات وبدلات حديثي الولادة", "أطقم قطنية للمستشفى", "قبعات وكفوف قطنية", "أرواب وبيجامات قطيفة دافئة", "أحذية المشي الأولى"],
    isComingSoon: true
  },
  {
    id: "strollers",
    name: "عربات الأطفال وأنظمة التنقل",
    slug: "strollers",
    icon: "Compass",
    description: "عربات خفيفة الوزن للطي بيد واحدة وأنظمة سفر متكاملة",
    badge: "قريباً",
    subcategories: ["عربات الطائرة والوزن الخفيف", "أنظمة السفر المتكاملة 3 في 1", "عربات التوائم والأطفال المتقاربين", "حقائب سفر وإكسسوارات العربة"],
    isComingSoon: true
  },
  {
    id: "car-seats",
    name: "مقاعد السيارات وسلامة السفر",
    slug: "car-seats",
    icon: "ShieldCheck",
    description: "مقاعد معتمدة بمعايير الأمان الأوروبية i-Size وقواعد آيزوفيكس",
    badge: "قريباً",
    subcategories: ["مقاعد المواليد (0 إلى 15 شهر)", "مقاعد دوارة 360 درجة", "مقاعد معززة Booster للطفولة المبكرة", "مرايا مراقبة الطفل في السيارة"],
    isComingSoon: true
  },
  {
    id: "carriers",
    name: "حمّالات الأطفال وإكسسوارات الحركة",
    slug: "carriers",
    icon: "Footprints",
    description: "حمّالات مريحة لصحة الحوض والظهر تدعم وضعية الجلوس M",
    badge: "قريباً",
    subcategories: ["حمّالات أطفال مريحة للظهر", "شالات وقماطات اللف القطنية", "حمّالات للمشي والأنشطة الخارجية", "واقيات الرياح والمطر للحمّالات"],
    isComingSoon: true
  },
  {
    id: "toys",
    name: "الألعاب التعليمية والمهارية",
    slug: "toys",
    icon: "Sparkles",
    description: "ألعاب منتسوري خشبية وتطوير حسي حركي آمن خالٍ من الرصاص",
    badge: "قريباً",
    subcategories: ["ألعاب التحفيز الحسي للمواليد", "خشخيشات وعضاضات سيليكون طبية", "ألعاب الترتيب والتركيب الخشبية", "سجادات اللعب والأنشطة التفاعلية"],
    isComingSoon: true
  },
  {
    id: "bath",
    name: "مستحضرات الاستحمام والعناية الشخصية",
    slug: "bath",
    icon: "Droplets",
    description: "أحواض استحمام ذكية مزودة بميزان حرارة، ومناشف قطنية ناعمة",
    badge: "قريباً",
    subcategories: ["أحواض استحمام قابلة للطي", "شامبو وغسول استحمام طبيعي", "مناشف بقبعة رأس قطيفة", "ألعاب مائية آمنة وخالية من العفن"],
    isComingSoon: true
  },
  {
    id: "nursery",
    name: "أثاث غرف الأطفال وديكورات الحضانة",
    slug: "nursery",
    icon: "Home",
    description: "تصاميم خشبية نوردية هادئة، وحدات تنظيم وخزائن حفاضات",
    badge: "قريباً",
    subcategories: ["طاولات تبديل الحفاض الخشبية", "كراسي الرضاعة الهزازة المريحة", "صناديق ومنظمات الألعاب والملابس", "إضاءات ليلية خافتة للرضاعة"],
    isComingSoon: true
  },
  {
    id: "monitors",
    name: "أجهزة المراقبة وحماية المنزل",
    slug: "monitors",
    icon: "Camera",
    description: "كاميرات ذكية برؤية ليلية فائقة وأجهزة استشعار تنفس وحرارة",
    badge: "قريباً",
    subcategories: ["كاميرات المراقبة بالواي فاي والصوت", "أجهزة مراقبة التنفس ومعدل النبض", "بوابات أمان الأدراج والأبواب", "أقفال الزوايا وحماية المقابس الكهربائية"],
    isComingSoon: true
  },
  {
    id: "maternity",
    name: "مستلزمات الأمومة وفترة ما بعد الولادة",
    slug: "maternity",
    icon: "Flower2",
    description: "كل ما تحتاجه الأم الجديدة للتعافي والراحة والعناية بالذات",
    badge: "قريباً",
    subcategories: ["حقيبة المستشفى الشاملة للولادة", "حمالات وملابس الرضاعة المرنة", "مستحضرات العناية بتشققات الرضاعة", "أحزمة دعم البطن والظهر بعد الولادة"],
    isComingSoon: true
  },
  {
    id: "gifts",
    name: "باقات الهدايا ومجموعات التهنئة",
    slug: "gifts",
    icon: "Gift",
    description: "صناديق هدايا فاخرة مغلفة بأناقة ومخصصة لاستقبال المواليد",
    badge: "قريباً",
    subcategories: ["صناديق المولود الجديد الفاخرة", "باقات هدايا استحمام الطفل (Baby Shower)", "بطاقات إهداء مخصصة ومجموعات تذكارية", "أطقم تذكار البصمة والصور"],
    isComingSoon: true
  },
  {
    id: "offers",
    name: "الأكثر مبيعاً والعروض الحصرية",
    slug: "offers",
    icon: "Flame",
    description: "عروض موسمية وتخفيضات تصل إلى 40% على أفضل الماركات",
    badge: "قريباً",
    subcategories: ["عروض الأسبوع الكبرى", "باقات التوفير العائلية", "تصفية نهاية الموسم", "المنتجات الأكثر طلباً في مصر"],
    isComingSoon: true
  }
];

/**
 * Merges live categories from Supabase with the store roadmap.
 * Categories currently in Supabase are marked `isComingSoon: false`.
 * Other roadmap categories remain visible as `isComingSoon: true` with badge 'قريباً'.
 */
export function mergeCategoriesWithLive(liveCategories = []) {
  if (!Array.isArray(liveCategories) || liveCategories.length === 0) {
    return DEFAULT_CATALOG_CATEGORIES;
  }

  const liveMap = new Map();
  liveCategories.forEach((cat) => {
    liveMap.set(cat.id, {
      ...cat,
      isComingSoon: false
    });
  });

  // 1. Live categories from Supabase come first
  const result = liveCategories.map((cat) => ({
    ...cat,
    isComingSoon: false
  }));

  // 2. Append all other roadmap categories as Coming Soon
  DEFAULT_CATALOG_CATEGORIES.forEach((roadmapCat) => {
    if (!liveMap.has(roadmapCat.id)) {
      result.push({
        ...roadmapCat,
        isComingSoon: true,
        badge: 'قريباً'
      });
    }
  });

  return result;
}

export const categories = DEFAULT_CATALOG_CATEGORIES;
