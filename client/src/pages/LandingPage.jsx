import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail, Phone, MapPin, ShieldCheck, GraduationCap, UserRound,
  Wifi, BarChart3, Bell, Star, ChevronRight, BookOpen,
  Award, Users, ArrowRight, Instagram, Facebook, Globe, Moon, Sun
} from "lucide-react";
import { schoolLogo, schoolInfo } from "../config/branding.js";
import { api } from "../api/http.js";
import StarRating from "../components/StarRating.jsx";
import { useTheme } from "../hooks/useTheme.js";

/* ── Translations ── */
const translations = {
  en: {
    dir: "ltr",
    nav: { about: "About", features: "Features", reviews: "Reviews", contact: "Contact" },
    hero: {
      welcome: "Welcome to",
      title1: "Training Formation",
      title2: "Center",
      tagline: "Annaba's premier educational institution dedicated to academic excellence and professional growth.",
      btn: "Register Now"
    },
    about: {
      label: "About TFC",
      title: "Building Futures in",
      city: "Annaba",
      desc: "TFC — Training Formation Center is a premier private educational institution located in the heart of Annaba, Algeria. Founded with a commitment to academic excellence and professional development, TFC offers a diverse range of programs including English language courses, computer skills, and career-focused certifications.",
      values: [
        { label: "Excellence", desc: "Highest academic standards in every course" },
        { label: "Innovation", desc: "Modern tools and teaching methodologies" },
        { label: "Community", desc: "A warm, inclusive learning environment" },
        { label: "Results", desc: "Track record of successful graduates" }
      ],
      stats: [
        { label: "Active students", value: "200+" },
        { label: "Expert teachers", value: "15+" },
        { label: "Courses offered", value: "27+" },
        { label: "Years of excellence", value: "10+" }
      ]
    },
    features: {
      label: "Platform Features",
      title: "Everything your school needs",
      sub: "A complete school management system built for the modern classroom.",
      items: [
        { title: "RFID Smart Attendance", desc: "Instant attendance tracking with RFID card readers. Students tap their card — the system does the rest." },
        { title: "Real-time Reports", desc: "Comprehensive attendance analytics, exportable reports, and daily summaries for administrators." },
        { title: "Parent Notifications", desc: "Automatic email alerts sent to parents when a student is marked absent." },
        { title: "Role-based Security", desc: "Secure portals for admins, teachers, and students — each with tailored access." },
        { title: "Student Management", desc: "Full student profiles with courses, grades, teacher assignments, and enrollment history." },
        { title: "Academic Records", desc: "90-day attendance history, marks, and notes — accessible to students and teachers." }
      ]
    },
    portals: {
      label: "Secure Access",
      title: "Choose your portal",
      sub: "Each role has a dedicated, secure login portal.",
      loginNow: "Login now"
    },
    ratings: {
      label: "Community Reviews",
      title: "What our community says",
      based: "Based on",
      review: "review",
      reviews: "reviews",
      noReviews: "No reviews yet",
      noReviewsSub: "Be the first to rate TFC School!",
      rateUs: "Want to rate us?",
      rateUsSub: "Log in to your portal and submit your rating.",
      rateBtn: "Rate TFC"
    },
    contact: {
      label: "Get in touch",
      title: "Contact Us",
      sub: "We're here to answer your questions.",
      items: [
        { label: "Email", sub: "Send us a message" },
        { label: "Phone 1", sub: "Call us anytime" },
        { label: "Phone 2", sub: "Alternative line" },
        { label: "Location", sub: "Click to open in Google Maps" },
        { label: "Instagram", sub: "Follow us on Instagram" },
        { label: "Facebook", sub: "Like our Facebook page" }
      ]
    },
    portalsData: [
      { role: "admin", label: "Admin Portal", sub: "Manage users, reports & settings" },
      { role: "teacher", label: "Teacher Portal", sub: "Mark attendance & manage students" },
      { role: "student", label: "Student Portal", sub: "View your profile & attendance" }
    ]
  },

  fr: {
    dir: "ltr",
    nav: { about: "À propos", features: "Fonctionnalités", reviews: "Avis", contact: "Contact" },
    hero: {
      welcome: "Bienvenue à",
      title1: "Training Formation",
      title2: "Center",
      tagline: "L'institution éducative de référence à Annaba, dédiée à l'excellence académique et au développement professionnel.",
      btn: "S'inscrire maintenant"
    },
    about: {
      label: "À propos de TFC",
      title: "Construire l'avenir à",
      city: "Annaba",
      desc: "TFC — Training Formation Center est un établissement privé de premier plan situé au cœur d'Annaba, en Algérie. Fondé avec l'engagement d'excellence académique et de développement professionnel, TFC propose une gamme diversifiée de programmes incluant des cours d'anglais, d'informatique et des certifications professionnelles.",
      values: [
        { label: "Excellence", desc: "Les plus hauts standards académiques dans chaque cours" },
        { label: "Innovation", desc: "Outils modernes et méthodes pédagogiques avancées" },
        { label: "Communauté", desc: "Un environnement d'apprentissage chaleureux et inclusif" },
        { label: "Résultats", desc: "Bilan de diplômés ayant réussi leur carrière" }
      ],
      stats: [
        { label: "Élèves actifs", value: "200+" },
        { label: "Enseignants experts", value: "15+" },
        { label: "Cours proposés", value: "27+" },
        { label: "Années d'excellence", value: "10+" }
      ]
    },
    features: {
      label: "Fonctionnalités",
      title: "Tout ce dont votre école a besoin",
      sub: "Un système complet de gestion scolaire conçu pour la classe moderne.",
      items: [
        { title: "Présence RFID Intelligente", desc: "Suivi instantané des présences par badge RFID. Les élèves tapent leur carte — le système fait le reste." },
        { title: "Rapports en Temps Réel", desc: "Analyses complètes des présences, rapports exportables et résumés quotidiens pour les administrateurs." },
        { title: "Notifications aux Parents", desc: "Alertes e-mail automatiques envoyées aux parents lorsqu'un élève est absent." },
        { title: "Sécurité par Rôles", desc: "Portails sécurisés pour les admins, enseignants et élèves — chacun avec un accès adapté." },
        { title: "Gestion des Élèves", desc: "Profils complets avec cours, notes, affectations d'enseignants et historique d'inscription." },
        { title: "Dossiers Académiques", desc: "Historique des présences sur 90 jours, notes et remarques — accessibles aux élèves et enseignants." }
      ]
    },
    portals: {
      label: "Accès Sécurisé",
      title: "Choisissez votre portail",
      sub: "Chaque rôle dispose d'un portail de connexion dédié et sécurisé.",
      loginNow: "Se connecter"
    },
    ratings: {
      label: "Avis de la Communauté",
      title: "Ce que dit notre communauté",
      based: "Basé sur",
      review: "avis",
      reviews: "avis",
      noReviews: "Aucun avis pour l'instant",
      noReviewsSub: "Soyez le premier à noter TFC !",
      rateUs: "Vous souhaitez nous noter ?",
      rateUsSub: "Connectez-vous à votre portail et soumettez votre note.",
      rateBtn: "Noter TFC"
    },
    contact: {
      label: "Contactez-nous",
      title: "Contact",
      sub: "Nous sommes là pour répondre à vos questions.",
      items: [
        { label: "Email", sub: "Envoyez-nous un message" },
        { label: "Téléphone 1", sub: "Appelez-nous à tout moment" },
        { label: "Téléphone 2", sub: "Ligne alternative" },
        { label: "Localisation", sub: "Cliquez pour ouvrir dans Google Maps" },
        { label: "Instagram", sub: "Suivez-nous sur Instagram" },
        { label: "Facebook", sub: "Aimez notre page Facebook" }
      ]
    },
    portalsData: [
      { role: "admin", label: "Portail Admin", sub: "Gérer les utilisateurs, rapports et paramètres" },
      { role: "teacher", label: "Portail Enseignant", sub: "Marquer les présences et gérer les élèves" },
      { role: "student", label: "Portail Élève", sub: "Voir votre profil et vos présences" }
    ]
  },

  ar: {
    dir: "rtl",
    nav: { about: "من نحن", features: "المميزات", reviews: "التقييمات", contact: "اتصل بنا" },
    hero: {
      welcome: "مرحباً بكم في",
      title1: "مركز التدريب",
      title2: "والتكوين",
      tagline: "المؤسسة التعليمية الرائدة في عنابة، ملتزمة بالتميز الأكاديمي والنمو المهني.",
      btn: "سجّل الآن"
    },
    about: {
      label: "من نحن",
      title: "نبني المستقبل في",
      city: "عنابة",
      desc: "TFC — مركز التدريب والتكوين هو مؤسسة تعليمية خاصة متميزة تقع في قلب عنابة، الجزائر. تأسست بالتزام بالتميز الأكاديمي والتطوير المهني، وتقدم TFC مجموعة متنوعة من البرامج تشمل دورات اللغة الإنجليزية ومهارات الحاسوب والشهادات المهنية.",
      values: [
        { label: "التميز", desc: "أعلى المعايير الأكاديمية في كل دورة" },
        { label: "الابتكار", desc: "أدوات حديثة ومناهج تعليمية متطورة" },
        { label: "المجتمع", desc: "بيئة تعليمية دافئة وشاملة" },
        { label: "النتائج", desc: "سجل حافل من الخريجين الناجحين" }
      ],
      stats: [
        { label: "طالب نشط", value: "+200" },
        { label: "أستاذ متخصص", value: "+15" },
        { label: "دورة متاحة", value: "+27" },
        { label: "سنة من التميز", value: "+10" }
      ]
    },
    features: {
      label: "مميزات المنصة",
      title: "كل ما تحتاجه مدرستك",
      sub: "نظام متكامل لإدارة المدرسة مصمم للفصل الدراسي الحديث.",
      items: [
        { title: "حضور ذكي بـ RFID", desc: "تتبع فوري للحضور ببطاقات RFID. يلمس الطالب بطاقته — والنظام يكمل الباقي." },
        { title: "تقارير فورية", desc: "تحليلات شاملة للحضور وتقارير قابلة للتصدير وملخصات يومية للإداريين." },
        { title: "إشعارات لأولياء الأمور", desc: "تنبيهات بريد إلكتروني تلقائية ترسل لولي الأمر عند غياب الطالب." },
        { title: "أمان متعدد الأدوار", desc: "بوابات آمنة للمدراء والأساتذة والطلاب — كل واحد بصلاحياته الخاصة." },
        { title: "إدارة الطلاب", desc: "ملفات كاملة تشمل الدورات والدرجات وتعيينات الأساتذة وسجل التسجيل." },
        { title: "السجلات الأكاديمية", desc: "سجل الحضور لآخر 90 يوماً والدرجات والملاحظات — متاح للطلاب والأساتذة." }
      ]
    },
    portals: {
      label: "وصول آمن",
      title: "اختر بوابتك",
      sub: "لكل دور بوابة دخول مخصصة وآمنة.",
      loginNow: "تسجيل الدخول"
    },
    ratings: {
      label: "آراء المجتمع",
      title: "ماذا يقول مجتمعنا",
      based: "بناءً على",
      review: "تقييم",
      reviews: "تقييمات",
      noReviews: "لا توجد تقييمات بعد",
      noReviewsSub: "كن أول من يقيّم TFC!",
      rateUs: "هل تريد تقييمنا؟",
      rateUsSub: "سجّل الدخول إلى بوابتك وأرسل تقييمك.",
      rateBtn: "قيّم TFC"
    },
    contact: {
      label: "تواصل معنا",
      title: "اتصل بنا",
      sub: "نحن هنا للإجابة على أسئلتك.",
      items: [
        { label: "البريد الإلكتروني", sub: "أرسل لنا رسالة" },
        { label: "الهاتف 1", sub: "اتصل بنا في أي وقت" },
        { label: "الهاتف 2", sub: "خط بديل" },
        { label: "الموقع", sub: "انقر لفتح في خرائط Google" },
        { label: "إنستغرام", sub: "تابعنا على إنستغرام" },
        { label: "فيسبوك", sub: "أعجبك صفحتنا على فيسبوك" }
      ]
    },
    portalsData: [
      { role: "admin", label: "بوابة الإدارة", sub: "إدارة المستخدمين والتقارير والإعدادات" },
      { role: "teacher", label: "بوابة الأستاذ", sub: "تسجيل الحضور وإدارة الطلاب" },
      { role: "student", label: "بوابة الطالب", sub: "عرض ملفك والحضور" }
    ]
  }
};

const featureIcons = [Wifi, BarChart3, Bell, ShieldCheck, GraduationCap, BookOpen];
const featureColors = [
  "from-brand-500 to-emerald-600",
  "from-brand-500 to-brand-700",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-red-600",
  "from-amber-500 to-orange-500",
  "from-pink-500 to-rose-500"
];
const portalConfig = [
  { role: "admin",   gradient: "from-violet-600 to-purple-700", shadow: "shadow-violet-200", icon: ShieldCheck, link: "/admin/login" },
  { role: "teacher", gradient: "from-brand-600 to-brand-700",   shadow: "shadow-brand-200",  icon: GraduationCap, link: "/teacher/login" },
  { role: "student", gradient: "from-brand-600 to-emerald-700", shadow: "shadow-brand-200",  icon: UserRound,    link: "/student/login" }
];
const contactValues = [
  { icon: Mail,      color: "from-brand-500 to-brand-700",  value: schoolInfo.email,      href: `mailto:${schoolInfo.email}` },
  { icon: Phone,     color: "from-brand-500 to-emerald-600",value: schoolInfo.phones[0],  href: `tel:${schoolInfo.phones[0].replace(/\s/g, "")}` },
  { icon: Phone,     color: "from-brand-500 to-emerald-600",value: schoolInfo.phones[1],  href: `tel:${schoolInfo.phones[1].replace(/\s/g, "")}` },
  { icon: MapPin,    color: "from-rose-500 to-red-600",     value: schoolInfo.address,    href: "https://maps.app.goo.gl/uUdRPCDM8krT7iJW7" },
  { icon: Instagram, color: "from-pink-500 to-rose-600",    value: "@tfc.annaba",         href: "https://www.instagram.com/tfc.annaba?igsh=NW0wa2o2NWVsb3pv" },
  { icon: Facebook,  color: "from-blue-600 to-blue-800",    value: "TFC Annaba",          href: "https://www.facebook.com/share/1Cqnoy2Pm8/" }
];
const aboutStatIcons = [Users, GraduationCap, BookOpen, Award];
const aboutStatColors = [
  "from-brand-500 to-emerald-600",
  "from-brand-500 to-brand-700",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-500"
];

function useRatingSummary() {
  const [data, setData] = useState({ average: 0, count: 0, distribution: [] });
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    api.get("/ratings/summary").then(({ data: d }) => setData(d)).catch(() => {});
    api.get("/ratings/recent").then(({ data: d }) => setReviews(d.ratings || [])).catch(() => {});
  }, []);
  return { ...data, reviews };
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-4 text-right text-slate-500">{star}</span>
      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs text-slate-400">{count}</span>
    </div>
  );
}

const LANGS = [
  { code: "ar", label: "عربي" },
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" }
];

export default function LandingPage() {
  const rating = useRatingSummary();
  const [navOpen, setNavOpen] = useState(false);
  const [lang, setLang] = useState("fr");
  const t = translations[lang];
  const { dark, toggle: toggleDark } = useTheme();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100" dir={t.dir}>

      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-brand-100 bg-white/90 backdrop-blur-md shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={schoolLogo} alt="TFC" className="h-10 w-10 rounded-xl object-contain ring-1 ring-brand-100" />
            <div>
              <p className="text-base font-bold text-slate-900 leading-tight">TFC School</p>
              <p className="text-xs text-brand-600">Training Formation Center</p>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            {[["about", t.nav.about], ["features", t.nav.features], ["ratings", t.nav.reviews], ["contact", t.nav.contact]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="transition hover:text-brand-700">
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 p-1 dark:border-slate-600 dark:bg-slate-800">
              <Globe className="h-3.5 w-3.5 text-brand-500 mx-1 dark:text-brand-400" />
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    lang === l.code
                      ? "bg-brand-700 text-white shadow-sm"
                      : "text-brand-700 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-700 transition hover:bg-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="hidden items-center gap-2 md:flex">
              {portalConfig.map((p) => {
                const pd = t.portalsData.find((x) => x.role === p.role);
                return (
                  <Link
                    key={p.role}
                    to={p.link}
                    className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${p.gradient} px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md`}
                  >
                    <p.icon className="h-3.5 w-3.5" />
                    {pd.label.split(" ")[0]}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-brand-200 py-24 text-slate-900">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-brand-300/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-brand-400/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-brand-200/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-white ring-4 ring-brand-200 shadow-xl shadow-brand-200/50 animate-fade-slide-up">
            <img src={schoolLogo} alt="TFC School" className="h-24 w-24 rounded-2xl object-contain" />
          </div>

          <div className="animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600">{t.hero.welcome}</p>
            <h1 className="mt-3 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl text-slate-900">
              {t.hero.title1}
              <br />
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                {t.hero.title2}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
              {t.hero.tagline}
            </p>
            <Link
              to="/inscription"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-600 px-8 py-4 text-base font-black text-white shadow-lg shadow-brand-900/40 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <GraduationCap className="h-5 w-5" />
              {t.hero.btn}
            </Link>
          </div>

          {/* Portal buttons */}
          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-slide-up" style={{ animationDelay: "0.3s" }}>
            {portalConfig.map((p) => {
              const pd = t.portalsData.find((x) => x.role === p.role);
              return (
                <Link
                  key={p.role}
                  to={p.link}
                  className={`group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r ${p.gradient} px-7 py-4 font-bold text-white shadow-lg ${p.shadow} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                >
                  <p.icon className="h-5 w-5" />
                  <span>
                    <span className="block text-base">{pd.label}</span>
                    <span className="block text-xs font-normal opacity-80">{pd.sub}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>

          {rating.count > 0 && (
            <div className="mt-10 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 ring-1 ring-brand-200 shadow-sm animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <StarRating value={Math.round(rating.average)} readOnly size="sm" />
              <span className="text-sm font-semibold text-slate-900">{rating.average}/5</span>
              <span className="text-sm text-slate-500">({rating.count} {rating.count > 1 ? t.ratings.reviews : t.ratings.review})</span>
            </div>
          )}
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="bg-slate-50 py-24 dark:bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600">{t.about.label}</p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-slate-900 dark:text-slate-100">
                {t.about.title}
                <span className="text-brand-600 dark:text-brand-400"> {t.about.city}</span>
              </h2>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed dark:text-slate-400">{t.about.desc}</p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {t.about.values.map(({ label, desc }) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{label}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {t.about.stats.map(({ label, value }, i) => {
                const Icon = aboutStatIcons[i];
                return (
                  <div key={label} className="card-hover border border-slate-200 p-6 text-center">
                    <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${aboutStatColors[i]} shadow-sm`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-black text-slate-900">{value}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-white py-24 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-700">{t.features.label}</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900 dark:text-slate-100">{t.features.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-500 dark:text-slate-400">{t.features.sub}</p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.items.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <div key={f.title} className="card-hover group border border-slate-100 p-6">
                  <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${featureColors[i]} p-3 shadow-sm transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed dark:text-slate-400">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Portals ── */}
      <section className="bg-gradient-to-br from-brand-100 via-brand-50 to-brand-200 py-24 text-slate-900">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-600">{t.portals.label}</p>
          <h2 className="mt-3 text-4xl font-black text-slate-900">{t.portals.title}</h2>
          <p className="mt-4 text-slate-600">{t.portals.sub}</p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {portalConfig.map((p) => {
              const pd = t.portalsData.find((x) => x.role === p.role);
              return (
                <Link
                  key={p.role}
                  to={p.link}
                  className="group relative overflow-hidden rounded-3xl bg-white p-8 ring-1 ring-brand-100 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:bg-brand-50 hover:ring-brand-200 hover:shadow-xl text-left"
                >
                  <div className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${p.gradient} p-4 shadow-lg`}>
                    <p.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{pd.label}</h3>
                  <p className="mt-2 text-sm text-slate-500">{pd.sub}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-brand-600 group-hover:text-brand-800 transition-colors">
                    {t.portals.loginNow} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Ratings ── */}
      <section id="ratings" className="bg-slate-50 py-24 dark:bg-slate-800/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-600">{t.ratings.label}</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900">{t.ratings.title}</h2>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[320px_1fr]">
            <div className="card border border-slate-200 p-8 text-center">
              <p className="text-7xl font-black text-slate-900">{rating.count > 0 ? rating.average : "–"}</p>
              <div className="mt-3 flex justify-center">
                <StarRating value={Math.round(rating.average)} readOnly size="lg" />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {rating.count > 0
                  ? `${t.ratings.based} ${rating.count} ${rating.count > 1 ? t.ratings.reviews : t.ratings.review}`
                  : t.ratings.noReviews}
              </p>
              <div className="mt-6 grid gap-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const found = rating.distribution?.find((d) => d.star === star);
                  return <RatingBar key={star} star={star} count={found?.count || 0} total={rating.count} />;
                })}
              </div>
              <div className="mt-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4">
                <p className="text-sm font-semibold text-amber-800">{t.ratings.rateUs}</p>
                <p className="mt-1 text-xs text-amber-600">{t.ratings.rateUsSub}</p>
                <Link to="/student/login" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-600">
                  <Star className="h-3.5 w-3.5 fill-white" />
                  {t.ratings.rateBtn}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 content-start">
              {rating.reviews.length > 0 ? (
                rating.reviews.map((r) => (
                  <div key={r._id} className="card border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 text-sm font-bold text-white">
                          {r.user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{r.user?.name || "Anonymous"}</p>
                          <p className="text-xs capitalize text-slate-500">{r.user?.role}</p>
                        </div>
                      </div>
                      <StarRating value={r.stars} readOnly size="sm" />
                    </div>
                    {r.comment && <p className="mt-3 text-sm text-slate-600 leading-relaxed">"{r.comment}"</p>}
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
                  <Star className="h-10 w-10 text-slate-300" />
                  <p className="mt-3 font-medium text-slate-500">{t.ratings.noReviews}</p>
                  <p className="mt-1 text-sm text-slate-400">{t.ratings.noReviewsSub}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="bg-white py-24 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">{t.contact.label}</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900">{t.contact.title}</h2>
            <p className="mt-4 text-slate-500">{t.contact.sub}</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contactValues.map(({ icon: Icon, color, value, href }, i) => {
              const item = t.contact.items[i];
              return (
                <div key={item.label} className="card-hover group border border-slate-100 p-6 text-center">
                  <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-md transition-transform group-hover:scale-110`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-2 block text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors break-all"
                  >
                    {value}
                  </a>
                  <p className="mt-1 text-xs text-slate-400">{item.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gradient-to-br from-brand-500 to-brand-700 py-12 text-center text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-4">
            <img src={schoolLogo} alt="TFC" className="h-16 w-16 rounded-2xl bg-white/90 object-contain p-1 shadow-sm" />
            <p className="text-xl font-black">Training Formation Center</p>
            <p className="text-brand-100 text-sm">{schoolInfo.tagline}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-brand-100">
              <a href={`mailto:${schoolInfo.email}`} className="hover:text-white transition">{schoolInfo.email}</a>
              {schoolInfo.phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-white transition">{p}</a>
              ))}
              <a href="https://maps.app.goo.gl/uUdRPCDM8krT7iJW7" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">{schoolInfo.address}</a>
            </div>

            <div className="mt-4 flex justify-center gap-4">
              <a href="https://www.instagram.com/tfc.annaba?igsh=NW0wa2o2NWVsb3pv" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 transition hover:bg-white/30">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/share/1Cqnoy2Pm8/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 transition hover:bg-white/30">
                <Facebook className="h-5 w-5" />
              </a>
            </div>

            <div className="mt-6 border-t border-white/20 pt-6 w-full">
              <p className="text-xs text-brand-100/80">© {new Date().getFullYear()} TFC — Training Formation Center. All rights reserved.</p>
              <p className="mt-1 text-xs text-brand-100/60">{schoolInfo.credit}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
