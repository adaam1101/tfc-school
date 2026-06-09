// TFC default courses
const TFC_COURSES = [
  { id: "anglais",     ar: "اللغة الإنجليزية",  fr: "Langue Anglaise",   lang: true },
  { id: "francais",    ar: "اللغة الفرنسية",     fr: "Langue Française",  lang: true },
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
  { id: "design",      ar: "التصميم الداخلي والديكور",     fr: "Design d'Intérieur & Décoration (TBT)" },
  { id: "import",      ar: "التجارة الدولية",              fr: "Commerce International – Import/Export" },
  { id: "client",      ar: "خدمة العملاء",                 fr: "Service Client Professionnel" },
  { id: "startup",     ar: "المشاريع الناشئة",             fr: "Startups & Projets Innovants" },
  { id: "securite",    ar: "تركيب أنظمة المراقبة",        fr: "Installation Systèmes de Sécurité & Alarme" },
  { id: "maintenance", ar: "الصيانة الحاسوبية",           fr: "Maintenance Informatique" },
  { id: "parquet",     ar: "الباركو والبلاتر",             fr: "Professionnel Parquet & Plâtre" },
  { id: "devperso",    ar: "التطوير الشخصي",               fr: "Développement Personnel" },
  { id: "hse",         ar: "الصحة والسلامة المهنية",       fr: "Santé, Sécurité & Environnement (HSE)" },
];

// NextMind Academy courses
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
  { id: "anglais-general",  ar: "اللغة الإنجليزية العامة",  fr: "Anglais Général",       lang: true },
  { id: "francais-general", ar: "اللغة الفرنسية العامة",    fr: "Français Général",      lang: true },
  { id: "esp",              ar: "الإنجليزية للأغراض الخاصة", fr: "ESP (English for Specific Purposes)", lang: true },
  { id: "business-english", ar: "إنجليزية الأعمال",          fr: "Business English",      lang: true },
  { id: "francais-affaires",ar: "فرنسية الأعمال",            fr: "Français des Affaires", lang: true },
];

const schoolShort = import.meta.env.VITE_SCHOOL_SHORT || "TFC";

export const COURSES = schoolShort === "NextMind" ? NEXTMIND_COURSES : TFC_COURSES;
