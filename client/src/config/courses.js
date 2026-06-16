// TFC School — official formations with price, duration, sessions
const TFC_COURSES = [
  // ── Adult IT ──────────────────────────────────────────────────────────────
  {
    id: "informatique",
    ar: "إعلام آلي",
    fr: "Informatique",
    price: 7900,
    promo: true,         // currently on promotion (was 10 000)
    duration: { ar: "شهرين", fr: "2 mois" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: false
  },

  // ── Adult languages (have levels) ─────────────────────────────────────────
  {
    id: "anglais-adultes",
    ar: "اللغة الإنجليزية للكبار",
    fr: "Anglais adultes",
    price: 7500,
    duration: { ar: "شهرين ونصف / مستوى", fr: "2 mois ½ / niveau" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: true
  },
  {
    id: "francais-adultes",
    ar: "اللغة الفرنسية للكبار",
    fr: "Français adultes",
    price: 6500,
    duration: { ar: "شهرين ونصف / مستوى", fr: "2 mois ½ / niveau" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: true
  },
  {
    id: "allemand",
    ar: "اللغة الألمانية",
    fr: "Allemand",
    price: 7500,
    duration: { ar: "شهرين ونصف / مستوى", fr: "2 mois ½ / niveau" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: true
  },
  {
    id: "italien",
    ar: "اللغة الإيطالية",
    fr: "Italien",
    price: 7500,
    duration: { ar: "شهرين ونصف / مستوى", fr: "2 mois ½ / niveau" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: true
  },
  {
    id: "espagnol",
    ar: "اللغة الإسبانية",
    fr: "Espagnol",
    price: 7500,
    duration: { ar: "شهرين ونصف / مستوى", fr: "2 mois ½ / niveau" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: true
  },

  // ── Photography ───────────────────────────────────────────────────────────
  {
    id: "photographie",
    ar: "التصوير الفوتوغرافي",
    fr: "Photographie",
    price: 18000,
    duration: { ar: "دورة كاملة", fr: "Formation complète" },
    sessions: { ar: "حصص أسبوعية", fr: "Séances hebdomadaires" },
    lang: false
  },

  // ── Sewing & Fashion ───────────────────────────────────────────────────────
  {
    id: "couture",
    ar: "خياطة",
    fr: "Couture",
    price: 4000,
    priceUnit: { ar: "/ شهر", fr: "/ mois" },
    duration: { ar: "4 أشهر", fr: "4 mois" },
    sessions: { ar: "حصة واحدة / أسبوع (4 ساعات)", fr: "1 séance / semaine (4h)" },
    lang: false
  },
  {
    id: "stylisme",
    ar: "تصميم الأزياء",
    fr: "Stylisme & Design de mode",
    price: 4000,
    priceUnit: { ar: "/ شهر", fr: "/ mois" },
    duration: { ar: "4 أشهر", fr: "4 mois" },
    sessions: { ar: "حصة واحدة / أسبوع (4 ساعات)", fr: "1 séance / semaine (4h)" },
    lang: false
  },

  // ── Professional ──────────────────────────────────────────────────────────
  {
    id: "secretariat-grh",
    ar: "سكريتارية و GRH",
    fr: "Secrétariat & GRH",
    price: 14000,
    promo: true,         // promo (was 18 000)
    duration: { ar: "شهرين", fr: "2 mois" },
    sessions: { ar: "حصص أسبوعية", fr: "Séances hebdomadaires" },
    lang: false
  },
  {
    id: "vendeur-pharmacie",
    ar: "بائع صيدلية",
    fr: "Vendeur en pharmacie",
    price: 13000,
    duration: { ar: "دورة كاملة", fr: "Formation complète" },
    sessions: { ar: "حصص أسبوعية", fr: "Séances hebdomadaires" },
    lang: false
  },

  // ── Other professional formations (no fixed price) ────────────────────────
  { id: "sec3en1",     ar: "سكريتاريا - مساعدة إدارية - موظفة استقبال (3 في 1)", fr: "Secrétariat – Assistante Administrative – Réceptionniste (3 en 1)" },
  { id: "recep",       ar: "موظفة استقبال فندقي وسياحي",  fr: "Réceptionniste Hôtelière et Touristique" },
  { id: "entrepren",   ar: "مقاولتية وإدارة المشاريع",    fr: "Entrepreneuriat et Gestion de Projets" },
  { id: "gestion",     ar: "إدارة الأعمال",               fr: "Gestion des Affaires" },
  { id: "rh",          ar: "تسيير الموارد البشرية",        fr: "Gestion RH et Outils Qualité" },
  { id: "commercial",  ar: "مندوب مبيعات",                 fr: "Délégué Commercial" },
  { id: "marketing",   ar: "التسويق الإلكتروني",           fr: "Marketing Digital" },
  { id: "ecommerce",   ar: "التجارة الإلكترونية",          fr: "E-Commerce" },
  { id: "management",  ar: "مناجمنت المؤسسات",             fr: "Management des Organisations" },
  { id: "comadmin",    ar: "الاتصال الإداري",              fr: "Communication Administrative" },
  { id: "ai",          ar: "الذكاء الاصطناعي",             fr: "Intelligence Artificielle" },
  { id: "compta",      ar: "محاسبة تطبيقية",               fr: "Comptabilité Appliquée" },
  { id: "webdesign",   ar: "المعلوماتية وتصميم المواقع",   fr: "Informatique & Web Design" },
  { id: "prog",        ar: "البرمجة وإدارة المشاريع",      fr: "Programmation & Gestion Technique" },
  { id: "stocks",      ar: "إدارة وتسيير المخازن",         fr: "Gestion des Stocks et Ressources Sociales" },
  { id: "contenu",     ar: "صناعة المحتوى والغرافيك",      fr: "Création de Contenu & Graphisme" },
  { id: "design",      ar: "التصميم الداخلي والديكور",     fr: "Design d'Intérieur & Décoration" },
  { id: "import",      ar: "التجارة الدولية",              fr: "Commerce International – Import/Export" },
  { id: "client",      ar: "خدمة العملاء",                 fr: "Service Client Professionnel" },
  { id: "startup",     ar: "المشاريع الناشئة",             fr: "Startups & Projets Innovants" },
  { id: "securite",    ar: "تركيب أنظمة المراقبة",        fr: "Installation Systèmes de Sécurité & Alarme" },
  { id: "maintenance", ar: "الصيانة الحاسوبية",           fr: "Maintenance Informatique" },
  { id: "parquet",     ar: "الباركو والبلاتر",             fr: "Professionnel Parquet & Plâtre" },
  { id: "devperso",    ar: "التطوير الشخصي",               fr: "Développement Personnel" },
  { id: "hse",         ar: "الصحة والسلامة المهنية",       fr: "Santé, Sécurité & Environnement (HSE)" },

  // ── Kids / Monthly ────────────────────────────────────────────────────────
  {
    id: "langues-enfants",
    ar: "إنجليزية وفرنسية للأطفال",
    fr: "Anglais & Français enfants",
    price: 2700,
    priceUnit: { ar: "/ شهر", fr: "/ mois" },
    duration: { ar: "شهري", fr: "Mensuel" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: false,
    kids: true
  },
  {
    id: "soroban",
    ar: "سوروبان",
    fr: "Soroban (calcul mental)",
    price: 2000,
    priceUnit: { ar: "/ شهر", fr: "/ mois" },
    duration: { ar: "شهري", fr: "Mensuel" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: false,
    kids: true
  },
  {
    id: "calligraphie",
    ar: "تحسين الخط",
    fr: "Calligraphie & Amélioration de l'écriture",
    price: 2000,
    priceUnit: { ar: "/ شهر", fr: "/ mois" },
    duration: { ar: "شهري", fr: "Mensuel" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: false,
    kids: true
  },
  {
    id: "robotique",
    ar: "روبوتيك",
    fr: "Robotique",
    price: 2900,
    priceUnit: { ar: "/ شهر", fr: "/ mois" },
    duration: { ar: "شهري", fr: "Mensuel" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: false,
    kids: true
  },
  {
    id: "soutien-scolaire",
    ar: "تحسين المستوى (عربية ورياضيات)",
    fr: "Soutien scolaire (Arabe & Maths)",
    price: 2700,
    priceUnit: { ar: "/ شهر", fr: "/ mois" },
    duration: { ar: "شهري", fr: "Mensuel" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: false,
    kids: true
  },
  {
    id: "informatique-enfants",
    ar: "إعلام آلي للأطفال (12+)",
    fr: "Informatique enfants (12 ans+)",
    price: 2700,
    priceUnit: { ar: "/ شهر", fr: "/ mois" },
    duration: { ar: "شهري", fr: "Mensuel" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: false,
    kids: true
  },
  {
    id: "kidzone",
    ar: "كيدزون",
    fr: "Kidzone",
    price: 1900,
    priceUnit: { ar: "/ شهر", fr: "/ mois" },
    duration: { ar: "شهري", fr: "Mensuel" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine" },
    lang: false,
    kids: true
  }
];

// NextMind Academy courses (unchanged)
const NEXTMIND_COURSES = [
  { id: "design-graphique", ar: "تصميم غرافيك",             fr: "Design Graphique" },
  { id: "ui-ux",            ar: "تصميم واجهات المستخدم",    fr: "UI/UX Design" },
  { id: "digital-art",      ar: "الفن الرقمي",               fr: "Digital Art" },
  { id: "3d",               ar: "النمذجة ثلاثية الأبعاد",    fr: "Modélisation 3D & Product Visualization" },
  { id: "video",            ar: "مونتاج الفيديو",            fr: "Video Editing" },
  { id: "motion",           ar: "موشن غرافيك",               fr: "Motion Graphics" },
  { id: "photo",            ar: "التصوير الفوتوغرافي",       fr: "Photographie & Vidéographie" },
  { id: "web",              ar: "تطوير المواقع",              fr: "Développement Web" },
  { id: "mobile",           ar: "تطوير التطبيقات",           fr: "Développement d'Applications Mobiles" },
  { id: "python",           ar: "بايثون",                    fr: "Python" },
  { id: "ai",               ar: "الذكاء الاصطناعي",          fr: "Intelligence Artificielle" },
  { id: "cyber",            ar: "الأمن السيبراني",           fr: "Cybersécurité" },
  { id: "anglais-general",  ar: "اللغة الإنجليزية العامة",  fr: "Anglais Général", lang: true },
  { id: "francais-general", ar: "اللغة الفرنسية العامة",    fr: "Français Général", lang: true },
];

const schoolShort = import.meta.env.VITE_SCHOOL_SHORT || "TFC";
export const COURSES = schoolShort === "NextMind" ? NEXTMIND_COURSES : TFC_COURSES;
