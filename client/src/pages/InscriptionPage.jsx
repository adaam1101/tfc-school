import React, { useState } from "react";
import { CheckCircle2, ChevronDown, Globe, Loader2 } from "lucide-react";
import { api, getApiError } from "../api/http.js";
import { schoolLogo, schoolInfo } from "../config/branding.js";
import { COURSES, getCourseLabel } from "../config/courses.js";
import { useLang } from "../context/LanguageContext.jsx";

const LEVELS = [
  { id: "test",  ar: "اختبار تحديد المستوى",      fr: "Test de niveau",               en: "Level Assessment Test" },
  { id: "A1",    ar: "A1 — مبتدئ",                fr: "A1 — Starter / Beginner",       en: "A1 — Beginner" },
  { id: "A2",    ar: "A2 — أساسي",                fr: "A2 — Élémentaire",              en: "A2 — Elementary" },
  { id: "B1",    ar: "B1 — متوسط",                fr: "B1 — Intermédiaire",            en: "B1 — Intermediate" },
  { id: "B1-B2", ar: "B1-B2 — فوق المتوسط",      fr: "B1-B2 — Pré-Intermédiaire",      en: "B1-B2 — Pre-Intermediate" },
  { id: "B2",    ar: "B2 — متقدم",                fr: "B2 — Upper Intermediate",       en: "B2 — Upper Intermediate" },
  { id: "C1",    ar: "C1 — متقدم جداً",           fr: "C1 — Advanced",                 en: "C1 — Advanced" },
];

const T = {
  ar: {
    dir: "rtl",
    title: "تسجيل في دورة",
    subtitle: `${schoolInfo.name} — ${schoolInfo.city}`,
    fullname: "الاسم الكامل",
    fullnamePh: "أدخل اسمك الكامل",
    gender: "الجنس",
    male: "ذكر",
    female: "أنثى",
    dob: "تاريخ الميلاد",
    phone: "رقم الهاتف",
    phonePh: "0XXXXXXXXX",
    course: "اختر الدورة",
    coursePh: "— اختر الدورة —",
    level: "المستوى",
    levelPh: "— اختر مستواك —",
    selectLevelHint: "اختر مستواك لعرض السعر",
    hoursLabel: "المدة بالساعات",
    kidsNote: "✨ سيتم تسجيلك في فئة الأطفال تلقائياً",
    feesNote: "💡 رسوم التسجيل: 800 دج",
    feesFree: "✅ إذا سجّلت في دورتين أو لغتين، تُعفى من رسوم التسجيل",
    feesOrphan: "🤝 الأيتام يستفيدون من تخفيض 50% على جميع الدورات",
    feesNoteNM: "💡 رسوم التسجيل: 1000 دج",
    feesFreeNM: "✅ التسجيل في دورتين → رسوم التسجيل مجانية",
    submit: "أرسل طلب التسجيل",
    sending: "جارٍ الإرسال...",
    successTitle: "تم إرسال طلبك بنجاح! 🎉",
    successMsg: `سيتصل بك فريق ${schoolInfo.short} قريباً لتأكيد التسجيل.`,
    newReg: "تسجيل جديد",
    required: "يرجى ملء جميع الحقول المطلوبة",
    errorPhone: "رقم الهاتف يجب أن يكون 10 أرقام على الأقل",
    priceLabel: "السعر",
    durationLabel: "المدة",
    sessionsLabel: "الحصص",
    promoLabel: "عرض خاص",
    perMonth: "/ شهر",
    dzd: "دج",
  },
  fr: {
    dir: "ltr",
    title: "Inscription à une formation",
    subtitle: `${schoolInfo.name} — ${schoolInfo.city}`,
    fullname: "Nom complet",
    fullnamePh: "Entrez votre nom complet",
    gender: "Genre",
    male: "Masculin",
    female: "Féminin",
    dob: "Date de naissance",
    phone: "Numéro de téléphone",
    phonePh: "0XXXXXXXXX",
    course: "Choisir la formation",
    coursePh: "— Sélectionner une formation —",
    level: "Niveau",
    levelPh: "— Sélectionner votre niveau —",
    selectLevelHint: "Sélectionnez votre niveau pour voir le tarif",
    hoursLabel: "Volume",
    kidsNote: "✨ Vous serez automatiquement inscrit(e) dans la catégorie enfants",
    feesNote: "💡 Frais d'inscription : 800 DA",
    feesFree: "✅ Inscription à 2 formations ou 2 langues → frais d'inscription offerts",
    feesOrphan: "🤝 Les orphelins bénéficient de 50% de réduction sur toutes les formations",
    feesNoteNM: "💡 Frais d'inscription : 1 000 DA",
    feesFreeNM: "✅ Inscription à 2 formations → frais d'inscription offerts",
    submit: "Envoyer la demande d'inscription",
    sending: "Envoi en cours...",
    successTitle: "Demande envoyée avec succès ! 🎉",
    successMsg: `L'équipe ${schoolInfo.short} vous contactera prochainement pour confirmer votre inscription.`,
    newReg: "Nouvelle inscription",
    required: "Veuillez remplir tous les champs obligatoires",
    errorPhone: "Le numéro de téléphone doit comporter au moins 10 chiffres",
    priceLabel: "Tarif",
    durationLabel: "Durée",
    sessionsLabel: "Séances",
    promoLabel: "Promotion",
    perMonth: "/ mois",
    dzd: "DA",
  },
  en: {
    dir: "ltr",
    title: "Course Enrollment",
    subtitle: `${schoolInfo.name} — ${schoolInfo.city}`,
    fullname: "Full Name",
    fullnamePh: "Enter your full name",
    gender: "Gender",
    male: "Male",
    female: "Female",
    dob: "Date of Birth",
    phone: "Phone Number",
    phonePh: "0XXXXXXXXX",
    course: "Select Course",
    coursePh: "— Choose a Course —",
    level: "Level",
    levelPh: "— Choose Your Level —",
    selectLevelHint: "Select your level to view course tuition",
    hoursLabel: "Duration / Hours",
    kidsNote: "✨ You will automatically be enrolled in the Kids Category",
    feesNote: "💡 Registration Fee: 800 DA",
    feesFree: "✅ Enroll in 2 courses or languages → Free registration fee",
    feesOrphan: "🤝 Orphan students benefit from 50% discount on all courses",
    feesNoteNM: "💡 Registration Fee: 1,000 DA",
    feesFreeNM: "✅ Enroll in 2 courses → Free registration fee",
    submit: "Submit Enrollment Request",
    sending: "Sending...",
    successTitle: "Enrollment Request Sent! 🎉",
    successMsg: `The ${schoolInfo.short} team will contact you shortly to confirm your enrollment.`,
    newReg: "New Enrollment",
    required: "Please fill in all required fields",
    errorPhone: "Phone number must be at least 10 digits",
    priceLabel: "Tuition",
    durationLabel: "Duration",
    sessionsLabel: "Sessions",
    promoLabel: "Special Promo",
    perMonth: "/ month",
    dzd: "DA",
  }
};

function getAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const LANGS = [
  { code: "ar", label: "عربي" },
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" }
];

export default function InscriptionPage() {
  const { lang, setLang } = useLang();
  const currentLang = T[lang] ? lang : "fr";
  const t = T[currentLang];
  const isAr = currentLang === "ar";

  const [form, setForm] = useState({
    name: "", gender: "", dob: "", phone: "", course: "", level: ""
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  const age        = getAge(form.dob);
  const courseObj  = COURSES.find(c => c.id === form.course);
  const isLangCourse = courseObj?.lang === true;
  const isKid      = isLangCourse && !courseObj?.pricePerLevel && age !== null && age >= 0 && age <= 12;
  const needsLevel = courseObj?.pricePerLevel || (isLangCourse && age !== null && age >= 13 && age <= 50);

  const activePrice = courseObj?.pricePerLevel
    ? (form.level && courseObj.pricePerLevel[form.level]) || null
    : courseObj?.price || null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.gender || !form.dob || !form.phone || !form.course) {
      setError(t.required); return;
    }
    if (form.phone.replace(/\D/g, "").length < 10) {
      setError(t.errorPhone); return;
    }
    if (needsLevel && !form.level) {
      setError(t.required); return;
    }

    const courseLabel = getCourseLabel(courseObj, currentLang) || form.course;
    const levelLabel  = needsLevel
      ? LEVELS.find(l => l.id === form.level)?.[currentLang] || form.level
      : isKid ? (currentLang === "ar" ? "فئة الأطفال" : currentLang === "fr" ? "Catégorie Enfants" : "Kids Category") : "";

    const messageparts = [
      `Langue: ${currentLang.toUpperCase()}`,
      `Genre: ${form.gender === "male" ? t.male : t.female}`,
      levelLabel ? `Niveau: ${levelLabel}` : "",
    ].filter(Boolean).join(" | ");

    setLoading(true);
    try {
      await api.post("/enrollments", {
        name:      form.name.trim(),
        phone:     form.phone.trim(),
        age:       age || undefined,
        course:    courseLabel,
        courseId:  courseObj?.id,
        price:     activePrice || courseObj?.price,
        priceUnit: courseObj?.priceUnit ? (courseObj.priceUnit[currentLang] || courseObj.priceUnit.fr) : undefined,
        message:   messageparts,
      });
      setDone(true);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-2xl border border-brand-200 bg-brand-50/40 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 placeholder:text-slate-400";
  const selectCls = inputCls + " appearance-none cursor-pointer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex flex-col items-center justify-start px-4 py-8"
         dir={t.dir}>

      {/* Lang toggle */}
      <div className="w-full max-w-md flex justify-end mb-4 gap-1">
        {LANGS.map(l => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              currentLang === l.code
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-brand-200 bg-white text-slate-600 hover:bg-brand-50"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-md animate-fade-slide-up rounded-3xl bg-white shadow-2xl shadow-brand-200/40 ring-1 ring-brand-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 to-brand-500 px-6 py-6 text-white text-center">
          <img src={schoolLogo} alt={schoolInfo.short}
               className="mx-auto mb-3 h-16 w-16 rounded-2xl bg-white/20 object-contain p-1 ring-2 ring-white/40" />
          <h1 className="text-xl font-black">{t.title}</h1>
          <p className="mt-1 text-sm text-brand-200">{t.subtitle}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-7">

          {done ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-4 py-6 text-center animate-success-pop">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900">{t.successTitle}</h2>
              <p className="text-sm text-slate-500 max-w-xs">{t.successMsg}</p>
              <button
                onClick={() => { setDone(false); setForm({ name:"", gender:"", dob:"", phone:"", course:"", level:"" }); }}
                className="mt-2 btn-primary"
              >
                {t.newReg}
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <form className="grid gap-5" onSubmit={handleSubmit}>

              {/* Full name */}
              <div className="grid gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  {t.fullname} *
                </label>
                <input className={inputCls} placeholder={t.fullnamePh}
                       value={form.name} onChange={e => set("name", e.target.value)} required />
              </div>

              {/* Gender */}
              <div className="grid gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  {t.gender} *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["male", "female"].map(g => (
                    <button key={g} type="button"
                      onClick={() => set("gender", g)}
                      className={`rounded-2xl border-2 py-3 text-sm font-bold transition ${
                        form.gender === g
                          ? "border-brand-700 bg-brand-700 text-white"
                          : "border-brand-200 bg-white text-slate-700 hover:border-brand-400"
                      }`}>
                      {g === "male" ? "👨 " + t.male : "👩 " + t.female}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date of birth */}
              <div className="grid gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  {t.dob} *
                </label>
                <input type="date" className={inputCls}
                       value={form.dob} onChange={e => { set("dob", e.target.value); set("level", ""); }}
                       max={new Date().toISOString().split("T")[0]}
                       required />
              </div>

              {/* Phone */}
              <div className="grid gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  {t.phone} *
                </label>
                <input type="tel" className={inputCls} placeholder={t.phonePh}
                       value={form.phone} onChange={e => set("phone", e.target.value.replace(/[^\d+\s()-]/g, ""))} required />
              </div>

              {/* Course */}
              <div className="grid gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-700">
                  {t.course} *
                </label>
                <div className="relative">
                  <select className={selectCls}
                          value={form.course}
                          onChange={e => { set("course", e.target.value); set("level", ""); }}
                          required>
                    <option value="">{t.coursePh}</option>
                    {COURSES.map(c => (
                      <option key={c.id} value={c.id}>
                        {getCourseLabel(c, currentLang)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400 ${isAr ? "left-4" : "right-4"}`} />
                </div>
              </div>

              {/* Course info card */}
              {(activePrice || (courseObj && !courseObj.pricePerLevel && courseObj.price)) && (
                <div className="animate-fade-slide-up rounded-2xl bg-brand-50 border border-brand-200 px-4 py-4 grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600">{t.priceLabel}</span>
                    <div className="flex items-center gap-1.5">
                      {courseObj.promo && (
                        <span className="rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 uppercase">{t.promoLabel}</span>
                      )}
                      <span className="text-lg font-black text-brand-800">
                        {(activePrice || courseObj.price).toLocaleString()} {t.dzd}
                        {courseObj.priceUnit ? <span className="text-sm font-semibold text-brand-500"> {courseObj.priceUnit[currentLang] || courseObj.priceUnit.fr}</span> : null}
                      </span>
                    </div>
                  </div>
                  {courseObj.duration && (
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold text-slate-500">{t.durationLabel}</span>
                      <span className="font-bold">{courseObj.duration[currentLang] || courseObj.duration.fr}</span>
                    </div>
                  )}
                  {courseObj.sessions && (
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold text-slate-500">{t.sessionsLabel}</span>
                      <span className="font-bold">{courseObj.sessions[currentLang] || courseObj.sessions.fr}</span>
                    </div>
                  )}
                  {courseObj.hours && (
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold text-slate-500">{t.hoursLabel}</span>
                      <span className="font-bold">{courseObj.hours}h</span>
                    </div>
                  )}
                </div>
              )}

              {/* For level-priced courses: show hint before level is chosen */}
              {courseObj?.pricePerLevel && !activePrice && (
                <div className="animate-fade-slide-up rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-500 text-center">
                  {t.selectLevelHint}
                </div>
              )}

              {/* Level (only for EN/FR courses, age 13-50) */}
              {needsLevel && (
                <div className="grid gap-1.5 animate-fade-slide-up">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-700">
                    {t.level} *
                  </label>
                  <div className="relative">
                    <select className={selectCls} value={form.level}
                            onChange={e => set("level", e.target.value)} required>
                      <option value="">{t.levelPh}</option>
                      {LEVELS.map(l => (
                        <option key={l.id} value={l.id}>{l[currentLang] || l.fr}</option>
                      ))}
                    </select>
                    <ChevronDown className={`pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400 ${isAr ? "left-4" : "right-4"}`} />
                  </div>
                </div>
              )}

              {/* Kids auto-note */}
              {isKid && (
                <div className="animate-fade-slide-up rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 text-center">
                  {t.kidsNote}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 text-center">
                  {error}
                </div>
              )}

              {/* Inscription fees info — TFC only */}
              {schoolInfo.short === "TFC" && (
                <div className="rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3 grid gap-1.5 text-xs text-slate-600">
                  <p className="font-bold text-brand-700">{t.feesNote}</p>
                  <p>{t.feesFree}</p>
                  <p>{t.feesOrphan}</p>
                </div>
              )}

              {/* Inscription fees info — NextMind only */}
              {schoolInfo.short !== "TFC" && (
                <div className="rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3 grid gap-1.5 text-xs text-slate-600">
                  <p className="font-bold text-brand-700">{t.feesNoteNM}</p>
                  <p>{t.feesFreeNM}</p>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t.sending}</span>
                  </>
                ) : (
                  <span>{t.submit}</span>
                )}
              </button>

            </form>
          )}

        </div>
      </div>

      {/* Footer copyright */}
      <p className="mt-8 text-xs text-slate-400 text-center">
        © {new Date().getFullYear()} {schoolInfo.name}. All rights reserved.
      </p>

    </div>
  );
}
