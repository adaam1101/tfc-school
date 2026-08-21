// TFC School — official formations with price, duration, sessions
const TFC_COURSES = [
  // ── Adult IT ──────────────────────────────────────────────────────────────
  {
    id: "informatique",
    ar: "إعلام آلي",
    fr: "Informatique",
    en: "Computer Science & IT",
    price: 7900,
    promo: true,
    duration: { ar: "شهرين", fr: "2 mois", en: "2 months" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: false
  },

  // ── Adult languages (have levels) ─────────────────────────────────────────
  {
    id: "anglais-adultes",
    ar: "اللغة الإنجليزية للكبار",
    fr: "Anglais adultes",
    en: "General English (Adults)",
    price: 7500,
    duration: { ar: "شهرين ونصف / مستوى", fr: "2 mois ½ / niveau", en: "2.5 months / level" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: true
  },
  {
    id: "francais-adultes",
    ar: "اللغة الفرنسية للكبار",
    fr: "Français adultes",
    en: "General French (Adults)",
    price: 6500,
    duration: { ar: "شهرين ونصف / مستوى", fr: "2 mois ½ / niveau", en: "2.5 months / level" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: true
  },
  {
    id: "allemand",
    ar: "اللغة الألمانية",
    fr: "Allemand",
    en: "German Language",
    price: 7500,
    duration: { ar: "شهرين ونصف / مستوى", fr: "2 mois ½ / niveau", en: "2.5 months / level" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: true
  },
  {
    id: "italien",
    ar: "اللغة الإيطالية",
    fr: "Italien",
    en: "Italian Language",
    price: 7500,
    duration: { ar: "شهرين ونصف / مستوى", fr: "2 mois ½ / niveau", en: "2.5 months / level" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: true
  },
  {
    id: "espagnol",
    ar: "اللغة الإسبانية",
    fr: "Espagnol",
    en: "Spanish Language",
    price: 7500,
    duration: { ar: "شهرين ونصف / مستوى", fr: "2 mois ½ / niveau", en: "2.5 months / level" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: true
  },

  // ── Photography ───────────────────────────────────────────────────────────
  {
    id: "photographie",
    ar: "التصوير الفوتوغرافي",
    fr: "Photographie",
    en: "Photography & Videography",
    price: 18000,
    duration: { ar: "دورة كاملة", fr: "Formation complète", en: "Full course" },
    sessions: { ar: "حصص أسبوعية", fr: "Séances hebdomadaires", en: "Weekly sessions" },
    lang: false
  },

  // ── Sewing & Fashion ───────────────────────────────────────────────────────
  {
    id: "couture",
    ar: "خياطة",
    fr: "Couture",
    en: "Sewing & Tailoring",
    price: 4000,
    priceUnit: { ar: "/ شهر", fr: "/ mois", en: "/ month" },
    duration: { ar: "4 أشهر", fr: "4 mois", en: "4 months" },
    sessions: { ar: "حصة واحدة / أسبوع (4 ساعات)", fr: "1 séance / semaine (4h)", en: "1 session / week (4h)" },
    lang: false
  },
  {
    id: "stylisme",
    ar: "تصميم الأزياء",
    fr: "Stylisme & Design de mode",
    en: "Fashion Design & Styling",
    price: 4000,
    priceUnit: { ar: "/ شهر", fr: "/ mois", en: "/ month" },
    duration: { ar: "4 أشهر", fr: "4 mois", en: "4 months" },
    sessions: { ar: "حصة واحدة / أسبوع (4 ساعات)", fr: "1 séance / semaine (4h)", en: "1 session / week (4h)" },
    lang: false
  },

  // ── Professional ──────────────────────────────────────────────────────────
  {
    id: "secretariat-grh",
    ar: "سكريتارية و GRH",
    fr: "Secrétariat & GRH",
    en: "Secretarial & HR Management",
    price: 14000,
    promo: true,
    duration: { ar: "شهرين", fr: "2 mois", en: "2 months" },
    sessions: { ar: "حصص أسبوعية", fr: "Séances hebdomadaires", en: "Weekly sessions" },
    lang: false
  },
  {
    id: "vendeur-pharmacie",
    ar: "بائع صيدلية",
    fr: "Vendeur en pharmacie",
    en: "Pharmacy Assistant",
    price: 13000,
    duration: { ar: "دورة كاملة", fr: "Formation complète", en: "Full course" },
    sessions: { ar: "حصص أسبوعية", fr: "Séances hebdomadaires", en: "Weekly sessions" },
    lang: false
  },

  // ── Other professional formations ─────────────────────────────────────────
  { id: "sec3en1",     ar: "سكريتاريا - مساعدة إدارية - موظفة استقبال (3 في 1)", fr: "Secrétariat – Assistante Administrative – Réceptionniste (3 en 1)", en: "Secretariat – Administrative Assistant – Receptionist (3 in 1)" },
  { id: "recep",       ar: "موظفة استقبال فندقي وسياحي",  fr: "Réceptionniste Hôtelière et Touristique", en: "Hotel & Tourism Receptionist" },
  { id: "entrepren",   ar: "مقاولتية وإدارة المشاريع",    fr: "Entrepreneuriat et Gestion de Projets", en: "Entrepreneurship & Project Management" },
  { id: "gestion",     ar: "إدارة الأعمال",               fr: "Gestion des Affaires", en: "Business Administration" },
  { id: "rh",          ar: "تسيير الموارد البشرية",        fr: "Gestion RH et Outils Qualité", en: "HR Management & Quality Tools" },
  { id: "commercial",  ar: "مندوب مبيعات",                 fr: "Délégué Commercial", en: "Commercial Sales Representative" },
  { id: "marketing",   ar: "التسويق الإلكتروني",           fr: "Marketing Digital", en: "Digital Marketing" },
  { id: "ecommerce",   ar: "التجارة الإلكترونية",          fr: "E-Commerce", en: "E-Commerce" },
  { id: "management",  ar: "مناجمنت المؤسسات",             fr: "Management des Organisations", en: "Organizational Management" },
  { id: "comadmin",    ar: "الاتصال الإداري",              fr: "Communication Administrative", en: "Administrative Communication" },
  { id: "ai",          ar: "الذكاء الاصطناعي",             fr: "Intelligence Artificielle", en: "Artificial Intelligence (AI)" },
  { id: "compta",      ar: "محاسبة تطبيقية",               fr: "Comptabilité Appliquée", en: "Applied Accounting" },
  { id: "webdesign",   ar: "المعلوماتية وتصميم المواقع",   fr: "Informatique & Web Design", en: "Computer Science & Web Design" },
  { id: "prog",        ar: "البرمجة وإدارة المشاريع",      fr: "Programmation & Gestion Technique", en: "Programming & Technical Management" },
  { id: "stocks",      ar: "إدارة وتسيير المخازن",         fr: "Gestion des Stocks et Ressources Sociales", en: "Stock & Inventory Management" },
  { id: "contenu",     ar: "صناعة المحتوى والغرافيك",      fr: "Création de Contenu & Graphisme", en: "Content Creation & Graphic Design" },
  { id: "design",      ar: "التصميم الداخلي والديكور",     fr: "Design d'Intérieur & Décoration", en: "Interior Design & Decoration" },
  { id: "import",      ar: "التجارة الدولية",              fr: "Commerce International – Import/Export", en: "International Trade – Import/Export" },
  { id: "client",      ar: "خدمة العملاء",                 fr: "Service Client Professionnel", en: "Customer Service & Relations" },
  { id: "startup",     ar: "المشاريع الناشئة",             fr: "Startups & Projets Innovants", en: "Startups & Innovative Projects" },
  { id: "securite",    ar: "تركيب أنظمة المراقبة",        fr: "Installation Systèmes de Sécurité & Alarme", en: "Security & Surveillance Systems Installation" },
  { id: "maintenance", ar: "الصيانة الحاسوبية",           fr: "Maintenance Informatique", en: "Computer Hardware & Network Maintenance" },
  { id: "parquet",     ar: "الباركو والبلاتر",             fr: "Professionnel Parquet & Plâtre", en: "Parquet Flooring & Plaster Professional" },
  { id: "devperso",    ar: "التطوير الشخصي",               fr: "Développement Personnel", en: "Personal Development" },
  { id: "hse",         ar: "الصحة والسلامة المهنية",       fr: "Santé, Sécurité & Environnement (HSE)", en: "Health, Safety & Environment (HSE)" },

  // ── Kids / Monthly ────────────────────────────────────────────────────────
  {
    id: "langues-enfants",
    ar: "إنجليزية وفرنسية للأطفال",
    fr: "Anglais & Français enfants",
    en: "English & French for Kids",
    price: 2700,
    priceUnit: { ar: "/ شهر", fr: "/ mois", en: "/ month" },
    duration: { ar: "شهري", fr: "Mensuel", en: "Monthly" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: false,
    kids: true
  },
  {
    id: "soroban",
    ar: "سوروبان",
    fr: "Soroban (calcul mental)",
    en: "Soroban (Mental Math)",
    price: 2000,
    priceUnit: { ar: "/ شهر", fr: "/ mois", en: "/ month" },
    duration: { ar: "شهري", fr: "Mensuel", en: "Monthly" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: false,
    kids: true
  },
  {
    id: "calligraphie",
    ar: "تحسين الخط",
    fr: "Calligraphie & Amélioration de l'écriture",
    en: "Calligraphy & Handwriting Improvement",
    price: 2000,
    priceUnit: { ar: "/ شهر", fr: "/ mois", en: "/ month" },
    duration: { ar: "شهري", fr: "Mensuel", en: "Monthly" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: false,
    kids: true
  },
  {
    id: "robotique",
    ar: "روبوتيك",
    fr: "Robotique",
    en: "Robotics for Kids & Teens",
    price: 2900,
    priceUnit: { ar: "/ شهر", fr: "/ mois", en: "/ month" },
    duration: { ar: "شهري", fr: "Mensuel", en: "Monthly" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: false,
    kids: true
  },
  {
    id: "soutien-scolaire",
    ar: "تحسين المستوى (عربية ورياضيات)",
    fr: "Soutien scolaire (Arabe & Maths)",
    en: "Academic Support (Arabic & Math)",
    price: 2700,
    priceUnit: { ar: "/ شهر", fr: "/ mois", en: "/ month" },
    duration: { ar: "شهري", fr: "Mensuel", en: "Monthly" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: false,
    kids: true
  },
  {
    id: "informatique-enfants",
    ar: "إعلام آلي للأطفال (12+)",
    fr: "Informatique enfants (12 ans+)",
    en: "Computer Science for Kids (12+)",
    price: 2700,
    priceUnit: { ar: "/ شهر", fr: "/ mois", en: "/ month" },
    duration: { ar: "شهري", fr: "Mensuel", en: "Monthly" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: false,
    kids: true
  },
  {
    id: "kidzone",
    ar: "كيدزون",
    fr: "Kidzone",
    en: "KidZone Activities",
    price: 1900,
    priceUnit: { ar: "/ شهر", fr: "/ mois", en: "/ month" },
    duration: { ar: "شهري", fr: "Mensuel", en: "Monthly" },
    sessions: { ar: "حصتان / أسبوع", fr: "2 séances / semaine", en: "2 sessions / week" },
    lang: false,
    kids: true
  }
];

// NextMind Academy courses
const NEXTMIND_COURSES = [
  // ── Design ────────────────────────────────────────────────────────────────
  {
    id: "design-graphique",
    ar: "التصميم الغرافيكي",
    fr: "Design Graphique",
    en: "Graphic Design",
    price: 26000,
    hours: 24,
    duration: { ar: "شهر", fr: "1 mois", en: "1 month" },
    sessions: { ar: "مرتين في الأسبوع", fr: "2 fois / semaine", en: "2 times / week" }
  },
  {
    id: "ui-ux",
    ar: "تصميم واجهات المستخدم — Figma",
    fr: "UI/UX Design — Figma",
    en: "UI/UX Design — Figma",
    price: 26000,
    hours: 24,
    duration: { ar: "شهر", fr: "1 mois", en: "1 month" },
    sessions: { ar: "مرتين في الأسبوع", fr: "2 fois / semaine", en: "2 times / week" }
  },
  {
    id: "digital-art",
    ar: "الفن الرقمي",
    fr: "Digital Art",
    en: "Digital Art",
    price: 35000,
    hours: 36,
    duration: { ar: "شهرين", fr: "2 mois", en: "2 months" },
    sessions: { ar: "مرتين في الأسبوع", fr: "2 fois / semaine", en: "2 times / week" }
  },
  { id: "3d",     ar: "النمذجة ثلاثية الأبعاد", fr: "Modélisation 3D & Product Visualization", en: "3D Modeling & Product Visualization" },
  {
    id: "video",
    ar: "مونتاج فيديو",
    fr: "Video Editing",
    en: "Video Editing & Production",
    price: 26000,
    hours: 24,
    duration: { ar: "شهر", fr: "1 mois", en: "1 month" },
    sessions: { ar: "مرتين في الأسبوع", fr: "2 fois / semaine", en: "2 times / week" }
  },
  { id: "motion", ar: "موشن غرافيك",             fr: "Motion Graphics", en: "Motion Graphics" },
  { id: "photo",  ar: "التصوير الفوتوغرافي",     fr: "Photographie & Vidéographie", en: "Photography & Videography" },

  // ── Dev ───────────────────────────────────────────────────────────────────
  { id: "web",    ar: "تطوير المواقع",            fr: "Développement Web", en: "Web Development" },
  { id: "mobile", ar: "تطوير التطبيقات",          fr: "Développement d'Applications Mobiles", en: "Mobile App Development" },
  { id: "python", ar: "بايثون",                   fr: "Python", en: "Python Programming" },
  { id: "ai",     ar: "الذكاء الاصطناعي",         fr: "Intelligence Artificielle", en: "Artificial Intelligence" },
  { id: "cyber",  ar: "الأمن السيبراني",           fr: "Cybersécurité", en: "Cybersecurity" },

  // ── Kids & Teens ──────────────────────────────────────────────────────────
  {
    id: "prog-kids",
    ar: "البرمجة للأطفال (7 – 12 سنة)",
    fr: "Programmation enfants (7 – 12 ans)",
    en: "Coding for Kids (7 – 12 yrs)",
    price: 12000,
    duration: { ar: "شهر", fr: "1 mois", en: "1 month" },
    sessions: { ar: "مرتين في الأسبوع", fr: "2 fois / semaine", en: "2 times / week" }
  },
  {
    id: "prog-teens",
    ar: "البرمجة للمراهقين (13 – 17 سنة)",
    fr: "Programmation adolescents (13 – 17 ans)",
    en: "Coding for Teens (13 – 17 yrs)",
    price: 12000,
    duration: { ar: "شهر", fr: "1 mois", en: "1 month" },
    sessions: { ar: "مرتين في الأسبوع", fr: "2 fois / semaine", en: "2 times / week" }
  },

  // ── Languages ─────────────────────────────────────────────────────────────
  {
    id: "anglais-general",
    ar: "اللغة الإنجليزية للكبار",
    fr: "Anglais adultes",
    en: "General English (Adults)",
    lang: true,
    pricePerLevel: { test: 6000, A1: 6000, A2: 6000, "B1-B2": 6500, B1: 6500, B2: 7000, C1: 8000 },
    priceUnit: { ar: "/ شهر", fr: "/ mois", en: "/ month" },
    duration: { ar: "شهري / مستوى", fr: "Mensuel / niveau", en: "Monthly / level" },
    sessions: { ar: "مرتين في الأسبوع", fr: "2 fois / semaine", en: "2 times / week" }
  },
  {
    id: "esp",
    ar: "الإنجليزية للأغراض الخاصة (ESP)",
    fr: "ESP — Anglais pour Objectifs Spécifiques",
    en: "ESP — English for Specific Purposes",
    price: 8000,
    hours: 20,
    duration: { ar: "حسب الطلب", fr: "Selon le besoin", en: "On demand" },
    sessions: { ar: "حسب الطلب", fr: "Selon le besoin", en: "On demand" }
  },
  { id: "francais-general",  ar: "اللغة الفرنسية العامة",    fr: "Français Général", en: "General French", lang: true },
  { id: "business-english",  ar: "إنجليزية الأعمال",          fr: "Business English", en: "Business English", lang: true },
  { id: "francais-affaires", ar: "فرنسية الأعمال",            fr: "Français des Affaires", en: "Business French", lang: true },
];

const schoolShort = import.meta.env.VITE_SCHOOL_SHORT || "TFC";
export const COURSES = schoolShort === "NextMind" ? NEXTMIND_COURSES : TFC_COURSES;

export function getCourseLabel(course, lang = "fr") {
  if (!course) return "";
  if (typeof course === "string") {
    const found = COURSES.find((c) => c.id === course);
    if (found) return found[lang] || found.en || found.fr || found.ar || course;
    return course;
  }
  return course[lang] || course.en || course.fr || course.ar || course.name || "";
}
