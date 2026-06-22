import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail, Phone, MapPin, ShieldCheck, GraduationCap, UserRound,
  Award, Users, BookOpen, Instagram, Facebook, Globe, Moon, Sun, ChevronRight,
  UserCog, ClipboardList, LogIn
} from "lucide-react";
import { schoolLogo, schoolInfo } from "../config/branding.js";
import { useTheme } from "../hooks/useTheme.js";

/* ── Translations ── */
const translations = {
  en: {
    dir: "ltr",
    nav: { about: "About", contact: "Contact", login: "Login" },
    portalAccess: "Access your portal",
    portalAccessSub: "Admin · Teacher · Student",
    hero: {
      welcome: "Welcome to",
      tagline: "Premier educational institution dedicated to academic excellence and professional growth.",
      btn: "Register Now"
    },
    about: {
      labelPrefix: "About",
      title: "Building Futures in",
      city: "Annaba",
      stats: [
        { label: "Active students" },
        { label: "Expert teachers" },
        { label: "Courses offered" },
        { label: "Years of excellence" }
      ]
    },
    contact: {
      label: "Get in touch",
      title: "Contact Us",
      sub: "We're here to answer your questions.",
      items: [
        { label: "Email", sub: "Send us a message" },
        { label: "Phone 1", sub: "Call us anytime" },
        { label: "Phone 2", sub: "Alternative line" },
        { label: "Location", sub: "Open in Google Maps" },
        { label: "Instagram", sub: "Follow us" },
        { label: "Facebook", sub: "Like our page" }
      ]
    },
    portals: [
      { role: "admin",      label: "Admin",      sub: "Management portal" },
      { role: "sous-admin", label: "Sous-Admin", sub: "Sub-management" },
      { role: "moderator",  label: "Moderator",  sub: "Enrollment review" },
      { role: "teacher",    label: "Teacher",    sub: "Attendance & students" },
      { role: "student",    label: "Student",    sub: "Profile & schedule" }
    ]
  },

  fr: {
    dir: "ltr",
    nav: { about: "À propos", contact: "Contact", login: "Se connecter" },
    portalAccess: "Accéder à votre espace",
    portalAccessSub: "Admin · Enseignant · Élève",
    hero: {
      welcome: "Bienvenue à",
      tagline: "L'institution éducative de référence, dédiée à l'excellence académique et au développement professionnel.",
      btn: "S'inscrire maintenant"
    },
    about: {
      labelPrefix: "À propos de",
      title: "Construire l'avenir à",
      city: "Annaba",
      stats: [
        { label: "Élèves actifs" },
        { label: "Enseignants experts" },
        { label: "Cours proposés" },
        { label: "Années d'excellence" }
      ]
    },
    contact: {
      label: "Contactez-nous",
      title: "Contact",
      sub: "Nous sommes là pour répondre à vos questions.",
      items: [
        { label: "Email", sub: "Envoyez-nous un message" },
        { label: "Téléphone 1", sub: "Appelez-nous" },
        { label: "Téléphone 2", sub: "Ligne alternative" },
        { label: "Localisation", sub: "Ouvrir dans Google Maps" },
        { label: "Instagram", sub: "Suivez-nous" },
        { label: "Facebook", sub: "Notre page Facebook" }
      ]
    },
    portals: [
      { role: "admin",      label: "Admin",       sub: "Portail de gestion" },
      { role: "sous-admin", label: "Sous-Admin",  sub: "Sous-gestion" },
      { role: "moderator",  label: "Modérateur",  sub: "Gestion des inscriptions" },
      { role: "teacher",    label: "Enseignant",  sub: "Présences & élèves" },
      { role: "student",    label: "Élève",       sub: "Profil & emploi du temps" }
    ]
  },

  ar: {
    dir: "rtl",
    nav: { about: "من نحن", contact: "اتصل بنا", login: "تسجيل الدخول" },
    portalAccess: "الدخول إلى حسابك",
    portalAccessSub: "الإدارة · الأستاذ · الطالب",
    hero: {
      welcome: "مرحباً بكم في",
      tagline: "المؤسسة التعليمية الرائدة، ملتزمة بالتميز الأكاديمي والنمو المهني.",
      btn: "سجّل الآن"
    },
    about: {
      labelPrefix: "عن",
      title: "نبني المستقبل في",
      city: "عنابة",
      stats: [
        { label: "طالب نشط" },
        { label: "أستاذ متخصص" },
        { label: "دورة متاحة" },
        { label: "سنة من التميز" }
      ]
    },
    contact: {
      label: "تواصل معنا",
      title: "اتصل بنا",
      sub: "نحن هنا للإجابة على أسئلتك.",
      items: [
        { label: "البريد الإلكتروني", sub: "أرسل لنا رسالة" },
        { label: "الهاتف 1", sub: "اتصل بنا" },
        { label: "الهاتف 2", sub: "خط بديل" },
        { label: "الموقع", sub: "فتح في خرائط Google" },
        { label: "إنستغرام", sub: "تابعنا" },
        { label: "فيسبوك", sub: "صفحتنا" }
      ]
    },
    portals: [
      { role: "admin",      label: "الإدارة",       sub: "لوحة التحكم" },
      { role: "sous-admin", label: "نائب المدير",   sub: "الإدارة الفرعية" },
      { role: "moderator",  label: "المشرف",        sub: "مراجعة التسجيلات" },
      { role: "teacher",    label: "الأستاذ",       sub: "الحضور والطلاب" },
      { role: "student",    label: "الطالب",        sub: "الملف والجدول" }
    ]
  }
};

const portalConfig = [
  { role: "admin",      gradient: "from-violet-600 to-purple-700",  icon: ShieldCheck,   link: "/admin/login" },
  { role: "sous-admin", gradient: "from-indigo-500 to-indigo-700",  icon: UserCog,       link: "/sous-admin/login" },
  { role: "moderator",  gradient: "from-slate-500 to-slate-700",    icon: ClipboardList, link: "/moderator/login" },
  { role: "teacher",    gradient: "from-brand-600 to-brand-700",    icon: GraduationCap, link: "/teacher/login" },
  { role: "student",    gradient: "from-brand-600 to-emerald-700",  icon: UserRound,     link: "/student/login" }
];

const aboutStatIcons  = [Users, GraduationCap, BookOpen, Award];
const aboutStatColors = [
  "from-brand-500 to-emerald-600",
  "from-brand-500 to-brand-700",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-500"
];

const contactItems = [
  { icon: Mail,      color: "from-brand-500 to-brand-700",   value: schoolInfo.email,     href: `mailto:${schoolInfo.email}` },
  { icon: Phone,     color: "from-brand-500 to-emerald-600", value: schoolInfo.phones[0], href: `tel:${schoolInfo.phones[0]?.replace(/\s/g,"")}` },
  { icon: Phone,     color: "from-brand-500 to-emerald-600", value: schoolInfo.phones[1], href: `tel:${schoolInfo.phones[1]?.replace(/\s/g,"")}` },
  { icon: MapPin,    color: "from-rose-500 to-red-600",      value: schoolInfo.address,   href: schoolInfo.mapsUrl },
  { icon: Instagram, color: "from-pink-500 to-rose-600",     value: schoolInfo.instagram?.split("instagram.com/")[1]?.split("?")[0] || "Instagram", href: schoolInfo.instagram },
  { icon: Facebook,  color: "from-blue-600 to-blue-800",     value: schoolInfo.name,      href: schoolInfo.facebook },
].filter(item => item.value && item.href);

const LANGS = [
  { code: "ar", label: "عربي" },
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" }
];

export default function LandingPage() {
  const [lang, setLang] = useState("fr");
  const t = translations[lang];
  const { dark, toggle: toggleDark } = useTheme();

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100" dir={t.dir}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-brand-100 bg-white/90 backdrop-blur-md shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={schoolLogo} alt={schoolInfo.short} className="h-14 w-auto max-w-[180px] object-contain" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{schoolInfo.short} School</p>
              <p className="text-xs text-brand-600 dark:text-brand-400">{schoolInfo.name}</p>
            </div>
          </div>

          {/* Links + controls */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-400 md:flex">
              <button onClick={() => scrollTo("about")}   className="hover:text-brand-700 dark:hover:text-brand-300 transition">{t.nav.about}</button>
              <button onClick={() => scrollTo("contact")} className="hover:text-brand-700 dark:hover:text-brand-300 transition">{t.nav.contact}</button>
            </div>

            {/* Login button */}
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">{t.nav.login}</span>
            </Link>

            {/* Lang switcher */}
            <div className="flex items-center gap-0.5 rounded-xl border border-brand-200 bg-brand-50 p-1 dark:border-slate-600 dark:bg-slate-800">
              <Globe className="h-3.5 w-3.5 text-brand-400 mx-1" />
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${lang === l.code ? "bg-brand-700 text-white" : "text-brand-700 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-slate-700"}`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Dark toggle */}
            <button
              onClick={toggleDark}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-700 transition hover:bg-brand-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-brand-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-brand-300/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-brand-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 text-center">
          {/* Logo */}
          <div className="mx-auto mb-8 flex items-center justify-center">
            <img src={schoolLogo} alt={schoolInfo.short} className="h-32 w-auto max-w-[320px] object-contain drop-shadow-xl" />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400">{t.hero.welcome}</p>
          <h1 className="mt-3 text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">
            {schoolInfo.heroLine1}
            <br />
            <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">{schoolInfo.heroLine2}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{t.hero.tagline}</p>

          <Link
            to="/inscription"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-emerald-600 px-8 py-4 text-base font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            <GraduationCap className="h-5 w-5" />
            {t.hero.btn}
          </Link>

          {/* Smart login — auto-routes to the right dashboard by role */}
          <div className="mt-10 flex justify-center">
            <Link
              to="/login"
              className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 px-7 py-4 font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <LogIn className="h-5 w-5" />
              <span className="text-start">
                <span className="block text-sm">{t.portalAccess}</span>
                <span className="block text-xs font-normal opacity-75">{t.portalAccessSub}</span>
              </span>
              <ChevronRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="bg-slate-50 dark:bg-slate-800/40 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">{t.about.labelPrefix} {schoolInfo.short}</p>
              <h2 className="mt-3 text-4xl font-black text-slate-900 dark:text-slate-100">
                {t.about.title}<span className="text-brand-600 dark:text-brand-400"> {t.about.city}</span>
              </h2>
              <p className="mt-5 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{schoolInfo.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {t.about.stats.map(({ label }, i) => {
                const Icon = aboutStatIcons[i];
                const statValues = [schoolInfo.statStudents, schoolInfo.statTeachers, schoolInfo.statCourses, schoolInfo.statYears];
                return (
                  <div key={label} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center shadow-sm">
                    <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${aboutStatColors[i]} shadow-sm`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{statValues[i]}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="bg-white dark:bg-slate-900 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">{t.contact.label}</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900 dark:text-slate-100">{t.contact.title}</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">{t.contact.sub}</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {contactItems.map(({ icon: Icon, color, value, href }, i) => {
              const item = t.contact.items[i];
              return (
                <a
                  key={item.label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-sm transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{item.label}</p>
                    <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{value}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{item.sub}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gradient-to-br from-brand-600 to-brand-800 py-10 text-center text-white">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-4">
          <img src={schoolLogo} alt={schoolInfo.short} className="h-16 w-auto max-w-[180px] rounded-2xl bg-white/90 object-contain p-1 shadow-sm" />
          <p className="text-lg font-black">{schoolInfo.name}</p>
          <p className="text-brand-200 text-sm">{schoolInfo.tagline}</p>
          <div className="flex gap-3">
            {schoolInfo.instagram && (
              <a href={schoolInfo.instagram} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {schoolInfo.facebook && (
              <a href={schoolInfo.facebook} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition">
                <Facebook className="h-5 w-5" />
              </a>
            )}
          </div>
          <div className="mt-2 border-t border-white/20 pt-4 w-full">
            <p className="text-xs text-brand-200/70">© {new Date().getFullYear()} {schoolInfo.short} — {schoolInfo.name} · All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
