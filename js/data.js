/* Case-study content. Everything here is based on what the live sites and
   screenshots actually show. [EDIT] marks values only Yousef can confirm. */
(function (YH) {
'use strict';
YH.PROJECTS = [
  {
    id: 'sedra-store', idx: '01', img: 'sedra-store', url: 'https://sedrastores.com', domain: 'sedrastores.com',
    year: '2026', // orders in the bot screenshot are dated 2026
    title: { en: 'Sedra Store', ar: 'سيدرا ستور' },
    cat: { en: 'E-commerce · Live store', ar: 'متجر إلكتروني · يعمل الآن' },
    role: { en: 'Design · Development · Automation', ar: 'تصميم · تطوير · أتمتة' }, // [EDIT] add "Ads" if you ran them
    lead: {
      en: 'A live Arabic store for prayer mats, built end to end — storefront, order system, shipping logic, admin dashboard and a Telegram bot that delivers every order the second it is placed.',
      ar: 'متجر عربي حيّ للمصليات، مبنيّ بالكامل من البداية للنهاية — واجهة المتجر، نظام الطلبات، منطق الشحن، لوحة التحكم، وبوت تيليجرام يوصل كل طلب لحظة تسجيله.',
    },
    built: {
      en: [
        'Arabic (RTL) storefront with three product lines — padded, back-support and memory-foam prayer mats — each with its own design gallery.',
        'Order form with cash on delivery and shipping fees calculated by region.',
        'Telegram order bot: every order arrives with the product photo, order ID, customer details, items, totals, shipping, payment method, device and timestamp.',
        'Admin dashboard for orders, categories and products — plus analytics: visitors, page views, funnel, conversion, top governorates and best-selling designs.',
        'A trust layer that answers objections up front: inspect before you pay, cash on delivery, nationwide shipping, easy returns.',
        'A “not sure which one suits you?” guide that matches a mat to the customer’s need — knee pain, back pain or everyday use.',
      ],
      ar: [
        'واجهة متجر عربية (RTL) بثلاثة أصناف — مصليات مبطنة إسفنج، ومصليات بمسند للظهر، ومصليات ميموري فوم للركبة — لكل صنف معرض تصاميمه.',
        'نموذج طلب مع الدفع عند الاستلام ورسوم شحن تُحسب حسب المنطقة.',
        'بوت تيليجرام للطلبات: يصل كل طلب بصورة المنتج ورقم الطلب وبيانات العميل والمنتجات والإجمالي والشحن وطريقة الدفع والجهاز والتوقيت.',
        'لوحة تحكم للطلبات والأصناف والمنتجات، مع إحصائيات: الزوار والمشاهدات ومسار الشراء ونسبة التحويل وأكثر المحافظات وأكثر التصاميم مبيعاً.',
        'طبقة ثقة تجيب عن مخاوف العميل مسبقاً: عاين قبل أن تدفع، الدفع عند الاستلام، شحن لكل المحافظات، واسترجاع سهل.',
        'دليل «مش متأكد أي نوع يناسبك؟» يرشّح المصلية حسب احتياج العميل — ألم الركبة أو تعب الظهر أو الاستخدام اليومي.',
      ],
    },
    stack: { en: ['HTML', 'CSS', 'JavaScript', 'Telegram Bot API', 'Custom admin dashboard', 'Analytics'], ar: ['HTML', 'CSS', 'JavaScript', 'Telegram Bot API', 'لوحة تحكم مخصّصة', 'إحصائيات'] },
    metrics: [
      { v: '9.5K+', en: 'Visitors', ar: 'زائر' },
      { v: '330+', en: 'Order-form opens', ar: 'فتح نموذج الطلب' },
      { v: '180+', en: 'Orders', ar: 'طلب' },
      { v: '1.9%', en: 'Conversion', ar: 'نسبة التحويل' },
    ],
  },
  {
    id: 'sedra-luxury', idx: '02', img: 'sedra-luxury', url: 'https://youdefharby407-blip.github.io/Sedra-Store/', domain: 'youdefharby407-blip.github.io/Sedra-Store',
    year: '2026', // [EDIT]
    title: { en: 'Sedra Stores — Luxury concept', ar: 'سيدرا ستورز — المفهوم الفاخر' },
    cat: { en: 'E-commerce · Concept', ar: 'متجر إلكتروني · مفهوم تصميمي' },
    role: { en: 'Concept · Design · Development', ar: 'مفهوم · تصميم · تطوير' },
    lead: {
      en: 'A premium English storefront concept for the same brand — “Comfort in Every Prayer” — exploring a quieter, editorial luxury direction in black and gold.',
      ar: 'تصوّر فاخر لواجهة متجر باللغة الإنجليزية لنفس العلامة — «Comfort in Every Prayer» — يستكشف اتجاهاً فاخراً هادئاً بطابع تحريري بالأسود والذهبي.',
    },
    built: {
      en: [
        'Editorial luxury art direction: serif typography, gold accents and generous spacing.',
        'Collections, products, brand story and contact sections, with a cart.',
        'Floating WhatsApp contact and a dedicated admin entry.',
      ],
      ar: [
        'توجيه فني فاخر بطابع تحريري: خطوط سيريف ولمسات ذهبية ومساحات واسعة.',
        'أقسام للمجموعات والمنتجات وقصة العلامة والتواصل، مع سلة مشتريات.',
        'زر واتساب عائم ومدخل خاص للوحة التحكم.',
      ],
    },
    stack: { en: ['HTML', 'CSS', 'JavaScript'], ar: ['HTML', 'CSS', 'JavaScript'] },
  },
  {
    id: 'yours-beauty', idx: '03', img: 'yours-beauty', url: 'https://yousefharby.github.io/yours/', domain: 'yousefharby.github.io/yours',
    year: '2026', // [EDIT]
    title: { en: 'YOURS Beauty Treatment', ar: 'YOURS للعناية بالشعر' },
    cat: { en: 'E-commerce · Hair care · AR/EN', ar: 'متجر إلكتروني · عناية بالشعر · عربي/إنجليزي' },
    role: { en: 'Design · Development', ar: 'تصميم · تطوير' },
    lead: {
      en: 'A bilingual (Arabic/English) luxury hair-care store for a salon brand — bringing the salon routine home.',
      ar: 'متجر فاخر ثنائي اللغة (عربي/إنجليزي) لمنتجات العناية بالشعر لعلامة صالون — روتين الصالون في بيتك.',
    },
    built: {
      en: [
        'Arabic/English storefront with an instant language switch.',
        'A four-step routine — shampoo, conditioner, mask, serum — built around olive-oil and argan formulas.',
        'Consultation call-to-action and WhatsApp contact.',
        'Trust badges: inspect before you receive, cash on delivery or e-transfer, nationwide shipping, and an in-salon visit option.',
      ],
      ar: [
        'واجهة متجر بالعربية والإنجليزية مع تبديل فوري للغة.',
        'روتين من أربع خطوات — شامبو، بلسم، ماسك، سيروم — بتركيبات زيت الزيتون والأرجان.',
        'دعوة لطلب الاستشارة وتواصل عبر واتساب.',
        'شارات ثقة: عاين قبل الاستلام، الدفع عند الاستلام أو تحويل إلكتروني، شحن لكل المحافظات، وإمكانية زيارة الصالون.',
      ],
    },
    stack: { en: ['HTML', 'CSS', 'JavaScript', 'AR / EN'], ar: ['HTML', 'CSS', 'JavaScript', 'عربي / إنجليزي'] },
  },
  {
    id: 'om-nour', idx: '04', img: 'om-nour', url: 'https://youdefharby407-blip.github.io/Om-nour/', domain: 'youdefharby407-blip.github.io/Om-nour',
    year: '2026', // bot order dated 30 Apr 2026
    title: { en: 'Om Nour — Luxury Herbs', ar: 'أم نور — أعشاب فاخرة' },
    cat: { en: 'E-commerce · Herbs · Order bot', ar: 'متجر إلكتروني · أعشاب · بوت طلبات' },
    role: { en: 'Design · Development · Order bot', ar: 'تصميم · تطوير · بوت الطلبات' },
    lead: {
      en: 'A luxury herbs & natural-essence store with a deep green and gold identity — wired to its own Telegram bot so no order is ever missed.',
      ar: 'متجر أعشاب وزيوت طبيعية بهوية فاخرة بالأخضر الداكن والذهبي — مربوط ببوت تيليجرام خاص حتى لا يضيع أي طلب.',
    },
    built: {
      en: [
        'Brand-led storefront: “Pure & Purposeful” story, collections, shop and “why us” sections.',
        'Arabic cart and checkout flow.',
        'Telegram order bot posting every new order with customer details, items, total, payment method and timestamp (#OmNour #NewOrder).',
        'WhatsApp contact button and an admin entry.',
      ],
      ar: [
        'واجهة متجر تقودها الهوية: قصة «Pure & Purposeful» والمجموعات والمتجر وقسم «لماذا نحن».',
        'سلة مشتريات وإتمام طلب بالعربية.',
        'بوت تيليجرام ينشر كل طلب جديد ببيانات العميل والمنتجات والإجمالي وطريقة الدفع والتوقيت (#OmNour #NewOrder).',
        'زر تواصل عبر واتساب ومدخل للوحة التحكم.',
      ],
    },
    stack: { en: ['HTML', 'CSS', 'JavaScript', 'Telegram Bot API'], ar: ['HTML', 'CSS', 'JavaScript', 'Telegram Bot API'] },
  },
  {
    id: '27-juniors', idx: '05', img: '27-juniors', url: 'https://yousefharby.github.io/Zmls/', domain: 'yousefharby.github.io/Zmls',
    year: '2025', // [EDIT]
    title: { en: '27 Juniors', ar: '27 Juniors' },
    cat: { en: 'Community website · School class', ar: 'موقع مجتمعي · دفعة دراسية' },
    role: { en: 'Design · Development', ar: 'تصميم · تطوير' },
    lead: {
      en: 'A community website for a school class — “classmates turned family” — with students, teachers, a gallery and a way to join.',
      ar: 'موقع مجتمعي لدفعة دراسية — «دفعة مش شبه أي دفعة» — يضم الطلاب والمعلمين ومعرض الصور وطريقة للانضمام.',
    },
    built: {
      en: [
        'Bold identity built around the class logo, in a purple night-sky look.',
        'Students, teachers and gallery sections.',
        'Bilingual tagline and a “join the class” call to action.',
        'Admin entry for managing content.',
      ],
      ar: [
        'هوية جريئة حول شعار الدفعة بطابع بنفسجي كسماء الليل.',
        'أقسام للطلاب والمعلمين ومعرض الصور.',
        'شعار ثنائي اللغة ودعوة «انضم للدفعة».',
        'مدخل للوحة التحكم لإدارة المحتوى.',
      ],
    },
    stack: { en: ['HTML', 'CSS', 'JavaScript'], ar: ['HTML', 'CSS', 'JavaScript'] },
  },
  {
    id: 'yousef-venom', idx: '06', img: 'yousef-venom', url: 'https://youdefharby407-blip.github.io/Yousef-X-Venom/', domain: 'youdefharby407-blip.github.io/Yousef-X-Venom',
    year: '2026', // [EDIT]
    title: { en: 'Yousef × Venom', ar: 'يوسف × فينوم' },
    cat: { en: 'Creative · Interactive alter ego', ar: 'إبداعي · شخصية بديلة تفاعلية' },
    role: { en: 'Concept · Design · Development', ar: 'مفهوم · تصميم · تطوير' },
    lead: {
      en: 'A personal creative experiment — an alter-ego page in red and black where hovering reveals “the symbiote”.',
      ar: 'تجربة إبداعية شخصية — صفحة لشخصية بديلة بالأحمر والأسود، يتكشّف فيها «الوجه الآخر» بمجرد تمرير المؤشر.',
    },
    built: {
      en: [
        'Hover-to-reveal portrait interaction.',
        'Cinematic red and black art direction with bold display type.',
        'About, character, portfolio, experience and contact sections.',
      ],
      ar: [
        'تفاعل يكشف الصورة عند تمرير المؤشر.',
        'توجيه فني سينمائي بالأحمر والأسود مع خطوط عرض جريئة.',
        'أقسام: نبذة، الشخصية، الأعمال، الخبرات، والتواصل.',
      ],
    },
    stack: { en: ['HTML', 'CSS', 'JavaScript'], ar: ['HTML', 'CSS', 'JavaScript'] },
  },
  {
    id: 'portfolio-v1', idx: '07', img: 'portfolio-v1', url: 'https://youdefharby407-blip.github.io/My-Portfolio/', domain: 'youdefharby407-blip.github.io/My-Portfolio',
    year: '2024', // [EDIT]
    title: { en: 'Portfolio v1 — Gold', ar: 'معرض الأعمال 1 — ذهبي' },
    cat: { en: 'Archive · Personal portfolio', ar: 'أرشيف · معرض أعمال شخصي' },
    role: { en: 'Design · Development', ar: 'تصميم · تطوير' },
    lead: {
      en: 'My first portfolio: black and gold with classic serif type — “Creative Designer · Digital Artist · Developer”.',
      ar: 'أول معرض أعمال لي: أسود وذهبي بخطوط سيريف كلاسيكية — «Creative Designer · Digital Artist · Developer».',
    },
    built: {
      en: ['Black and gold editorial design with a subtle particle field.', 'About, work, gallery, skills and contact sections.'],
      ar: ['تصميم تحريري بالأسود والذهبي مع حقل جزيئات خفيف.', 'أقسام: نبذة، الأعمال، المعرض، المهارات، والتواصل.'],
    },
    stack: { en: ['HTML', 'CSS', 'JavaScript'], ar: ['HTML', 'CSS', 'JavaScript'] },
  },
  {
    id: 'portfolio-v3', idx: '08', img: 'portfolio-v3', url: 'https://youdefharby407-blip.github.io/My-Protifolio-3/', domain: 'youdefharby407-blip.github.io/My-Protifolio-3',
    year: '2025', // [EDIT]
    title: { en: 'Portfolio v3 — Neon', ar: 'معرض الأعمال 3 — نيون' },
    cat: { en: 'Archive · Personal portfolio', ar: 'أرشيف · معرض أعمال شخصي' },
    role: { en: 'Design · Development', ar: 'تصميم · تطوير' },
    lead: {
      en: 'A later portfolio version with a neon-gradient, tech-forward look — “Yousef Harby Creates Digital Experiences”.',
      ar: 'نسخة لاحقة من معرض أعمالي بطابع تقني وتدرجات نيون — «Yousef Harby Creates Digital Experiences».',
    },
    built: {
      en: ['Oversized display type with a teal-to-blue gradient.', 'Availability badge, stats strip and a double call to action.', 'About, projects, skills, experience and contact sections.'],
      ar: ['خطوط عرض ضخمة بتدرج من الفيروزي إلى الأزرق.', 'شارة الإتاحة للعمل وشريط أرقام ودعوتان لاتخاذ إجراء.', 'أقسام: نبذة، المشاريع، المهارات، الخبرات، والتواصل.'],
    },
    stack: { en: ['HTML', 'CSS', 'JavaScript'], ar: ['HTML', 'CSS', 'JavaScript'] },
  },
];
})(window.YH = window.YH || {});
