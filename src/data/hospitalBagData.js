// Checklist data categorized with medical tips and linked store products for hospital bag preparation
import { Baby, Heart, Car, Bed } from 'lucide-react';

export const CHECKLIST_CATEGORIES = [
  {
    id: 'baby_first',
    name: 'حقيبة المولود الأولى (أول 48 ساعة)',
    icon: Baby,
    description: 'المستلزمات الحيوية للطفل فور الولادة وأثناء التواجد في المستشفى',
    items: [
      {
        id: 'b1',
        title: 'طقمين سالوبيت داخلي قطن عضوي 100% طبيعي',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'احرصي على خامات قطنية معتمدة من Oeko-Tex لعدم تهيج بشرة حديثي الولادة الحساسة',
        productId: 'p3',
        productName: 'طقم سالوبيت مواليد قطن عضوي 100% طبيعي'
      },
      {
        id: 'b2',
        title: 'ببرونة زجاجية طبية مع حلمة تحاكي الرضاعة الطبيعية',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'ضرورية للرضعات الأولى في حال تأخر تدفق حليب الأم بعد الولادة القيصرية',
        productId: 'p5',
        productName: 'مجموعة رضّاعات زجاجية طبية كوموتومو'
      },
      {
        id: 'b3',
        title: 'بطانية استقبال ناعمة ومسامية للتقميط الهادئ',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'التقميط يحاكي بيئة رحم الأم ويمنع فزع المولود أثناء النوم في الساعات الأولى',
        productId: null
      },
      {
        id: 'b4',
        title: 'حفاضات مقاس حديثي الولادة (Newborn) بفتحة الحبل السري',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'اختاري حفاضات تحتوي على انحناء خاص لحماية منطقة السرة من الاحتكاك',
        productId: null
      },
      {
        id: 'b5',
        title: 'قفازات قطنية ناعمة وجوارب دافئة وقبعة قطن',
        importance: 'recommended',
        importanceLabel: 'موصى به طبياً',
        tip: 'تنظيم حرارة الرضيع يبدأ من تدفئة الرأس والأطراف لحمايته من تيارات التكييف',
        productId: null
      },
      {
        id: 'b6',
        title: 'مناديل مبللة بالماء النقي 99.9% بدون كحول أو عطور',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'تجنبي أي مناديل معطرة لحماية طبقة الجلد الأولى الرقيقة من التحسس',
        productId: null
      }
    ]
  },
  {
    id: 'mom_hospital',
    name: 'حقيبة الأم للولادة والإقامة بالمستشفى',
    icon: Heart,
    description: 'كل ما تحتاجه الأم للشعور بالراحة والرعاية بعد رحلة الولادة المباركة',
    items: [
      {
        id: 'm1',
        title: 'مضخة ثدي كهربائية طبية ذكية وهادئة',
        importance: 'recommended',
        importanceLabel: 'موصى به طبياً',
        tip: 'تحفيز إدرار الحليب مبكراً يقي الأم من تحجر الثدي ويشجع الرضاعة الطبيعية',
        productId: 'p7',
        productName: 'مضخة ثدي كهربائية مزدوجة ذكية ميديلا'
      },
      {
        id: 'm2',
        title: 'ثوبين نوم فضفاضين بفتحة أمامية مريحة للرضاعة',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'اختاري قماش قطني ناعم لتسهيل التلامس الجسدي المباشر مع طفلك بعد الولادة',
        productId: null
      },
      {
        id: 'm3',
        title: 'حمالات صدر قطنية مخصصة للرضاعة الطبيعية مع وسادات',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'الوسادات القطنية تمتص أي تسرب مبكر للحليب وتحافظ على نظافة وجفاف الثدي',
        productId: null
      },
      {
        id: 'm4',
        title: 'فوط صحية عالية الامتصاص مخصصة لفترة النفاس',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'تكون أكبر حجماً وأكثر نعومة لحماية منطقة الجرح أثناء المشي والحركة',
        productId: null
      },
      {
        id: 'm5',
        title: 'ملف الأوراق الرسمية وتقارير متابعة الحمل وتحاليل المستشفى',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'احتفظي ببطاقة الهوية والتحاليل في جيب منفصل وسهل الوصول لمرافقي الولادة',
        productId: null
      },
      {
        id: 'm6',
        title: 'حقيبة العناية الشخصية ومرطب شفاه وزيت التدليك الطبيعي',
        importance: 'optional',
        importanceLabel: 'راحة إضافية',
        tip: 'جفاف الشفاه شائع جداً بسبب التنفس العميق أثناء المخاض وتكييف غرف العمليات',
        productId: null
      }
    ]
  },
  {
    id: 'travel_safety',
    name: 'الخروج الآمن والتنقل بالسيارة',
    icon: Car,
    description: 'تجهيزات الخروج من المستشفى والانتقال الآمن إلى المنزل',
    items: [
      {
        id: 't1',
        title: 'مقعد سيارة مخصص لحديثي الولادة بمعيار الأمان الأوروبي i-Size',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي قانونياً',
        tip: 'لا يُسمح طبياً بنقل المولود بالسيارة في حضن الأم لخطورة الصدمات الفجائية',
        productId: 'p2',
        productName: 'مقعد سيارة سايبكس سيلونا دوار 360 درجة'
      },
      {
        id: 't2',
        title: 'عربة أطفال خفيفة الوزن سهلة الطي بيد واحدة مع مهد مسطح',
        importance: 'recommended',
        importanceLabel: 'موصى به طبياً',
        tip: 'المهد المسطح بزاوية 180 درجة ضروري لفتح مجرى تنفس الرضيع وتطوير العمود الفقري',
        productId: 'p1',
        productName: 'عربة أطفال ستوك يويو³ خفيفة الوزن'
      },
      {
        id: 't3',
        title: 'حقيبة تنظيم حفاضات وتنقل واسعة وعازلة للحرارة',
        importance: 'recommended',
        importanceLabel: 'موصى به طبياً',
        tip: 'تحتوي على جيوب معزولة تحفظ درجة حرارة رضعات الحليب وبساط غيار معقم',
        productId: 'p10',
        productName: 'حقيبة حفاضات وتنقل للأمهات مقاومة للماء'
      }
    ]
  },
  {
    id: 'nursery_home',
    name: 'استقبال المولود في المنزل وغرفة النوم',
    icon: Bed,
    description: 'تجهيزات النوم الهادئ والرعاية الصحية في الأسابيع الأولى',
    items: [
      {
        id: 'n1',
        title: 'سرير مواليد جانبي ملحق لسرير الأم متعدد الارتفاعات',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'يوفر نوماً آمناً للمولود بمفرده مع سهولة إرضاعه ليلاً دون مغادرة سريرك',
        productId: 'p4',
        productName: 'سرير مواليد جانبي ملحق لسرير الأم'
      },
      {
        id: 'n2',
        title: 'جهاز مراقبة الأطفال الذكي بالفيديو وكاميرا الرؤية الليلية',
        importance: 'recommended',
        importanceLabel: 'موصى به طبياً',
        tip: 'حساسات الحرارة والصوت تمنحكِ راحة البال ومتابعة تنفس الطفل أثناء النوم',
        productId: 'p9',
        productName: 'جهاز مراقبة الأطفال بالفيديو مع كاميرا ليلية'
      },
      {
        id: 'n3',
        title: 'مقياس حرارة رقمي سريع ودقيق بالأشعة تحت الحمراء',
        importance: 'essential',
        importanceLabel: 'أساسي وإلزامي',
        tip: 'قياس الحرارة الدقيق بدون إيقاظ الرضيع من أهم أدوات الإسعافات المنزلية',
        productId: null
      },
      {
        id: 'n4',
        title: 'كرسي تغذية مريح للأطفال للمراحل اللاحقة',
        importance: 'optional',
        importanceLabel: 'تجهيز مستقبلي',
        tip: 'يدعم الجلوس المستقيم وتناول الأطعمة الأولى بأمان عند بلوغ 4 إلى 6 أشهر',
        productId: 'p8',
        productName: 'كرسي إطعام للأطفال ستوك تريب تراب'
      }
    ]
  }
];
