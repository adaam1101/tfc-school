import React, { useState, useEffect } from 'react';
import { useSchool, useLang, useTheme } from '../App';
import { BookOpen, User, Calendar, Phone, Mail, Award, CheckCircle, HelpCircle, Sun, Moon, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function PublicInscription() {
  const { school } = useSchool();
  const { lang, setLang, t } = useLang();
  const { theme, toggleTheme } = useTheme();

  // Form Fields State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [formation, setFormation] = useState('');
  const [level, setLevel] = useState('');
  const [isOrphan, setIsOrphan] = useState(false);
  const [isTwoFormations, setIsTwoFormations] = useState(false);

  // Flow State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Course Details
  const [courseDetails, setCourseDetails] = useState(null);

  // Formations data
  const formationsData = {
    tfc: [
      { id: "info", name: "Informatique (Word/Excel)", price: 7900, isPromo: true, duration: "2 months", isLanguage: false },
      { id: "couture", name: "Couture & Stylisme", price: 12000, duration: "6 months", isLanguage: false },
      { id: "secretariat", name: "Secrétariat-GRH", price: 14000, isPromo: true, duration: "3 months", isLanguage: false },
      { id: "pharmacie", name: "Vendeur en pharmacie", price: 13000, duration: "3 months", isLanguage: false },
      { id: "photo", name: "Photography & Framing", price: 18000, duration: "1 month", isLanguage: false },
      
      // Kids
      { id: "kids_lang", name: "Kids: Anglais & Français", price: 2700, duration: "Monthly", isLanguage: true, isKids: true },
      { id: "kids_soroban", name: "Kids: Soroban (Abacus)", price: 3000, duration: "Monthly", isLanguage: false, isKids: true },
      { id: "kids_calli", name: "Kids: Calligraphie", price: 2000, duration: "Monthly", isLanguage: false, isKids: true },
      { id: "kids_robot", name: "Kids: Robotique", price: 3500, duration: "Monthly", isLanguage: false, isKids: true },
      { id: "kids_soutien", name: "Kids: Soutien scolaire", price: 2500, duration: "Monthly", isLanguage: false, isKids: true },
      { id: "kids_informatique", name: "Kids: Informatique enfants", price: 3000, duration: "Monthly", isLanguage: false, isKids: true },
      { id: "kids_zone", name: "Kids: Kidzone Activity", price: 4000, duration: "Monthly", isLanguage: false, isKids: true },

      // Languages Adults
      { id: "lang_adult_en", name: "Anglais Adultes", price: 9000, duration: "3 months", isLanguage: true },
      { id: "lang_adult_fr", name: "Français Adultes", price: 9000, duration: "3 months", isLanguage: true },
      { id: "lang_adult_de", name: "Allemand Adultes", price: 10000, duration: "3 months", isLanguage: true },
      { id: "lang_adult_it", name: "Italien Adultes", price: 10000, duration: "3 months", isLanguage: true },
      { id: "lang_adult_es", name: "Espagnol Adultes", price: 10000, duration: "3 months", isLanguage: true },
      
      // Professional Formations (Dynamic/No Fixed Price)
      { id: "prof_compta", name: "Comptabilité Générale", price: null, duration: "3 months", isLanguage: false },
      { id: "prof_mkt", name: "Marketing Digital", price: null, duration: "2 months", isLanguage: false },
      { id: "prof_net", name: "Installation Réseaux", price: null, duration: "3 months", isLanguage: false }
    ],
    nextmind: [
      { id: "design", name: "Design Graphique", price: 26000, duration: "24h / 1 month", isLanguage: false },
      { id: "figma", name: "UI/UX Figma", price: 26000, duration: "24h / 1 month", isLanguage: false },
      { id: "video", name: "Video Editing", price: 26000, duration: "24h / 1 month", isLanguage: false },
      { id: "art", name: "Digital Art", price: 35000, duration: "36h / 2 months", isLanguage: false },
      { id: "esp", name: "ESP (English for Specific Purposes)", price: 8000, duration: "20 hours", isLanguage: true },
      { id: "english_level", name: "English Adults (Per-Level Program)", price: 6000, duration: "Monthly", isLanguage: true },
      { id: "dev", name: "Web & Mobile Development", price: 45000, duration: "48h / 2 months", isLanguage: false },
      { id: "ai", name: "AI & Prompt Engineering", price: 50000, duration: "30h / 1 month", isLanguage: false },
      { id: "cyber", name: "Cybersécurité", price: 55000, duration: "40h / 2 months", isLanguage: false },
      { id: "motion", name: "Motion Design & VFX", price: 38000, duration: "32h / 1.5 months", isLanguage: false }
    ]
  };

  const getFormationsList = () => formationsData[school];

  // Calculate pricing dynamics
  useEffect(() => {
    if (!formation) {
      setCourseDetails(null);
      return;
    }

    const list = getFormationsList();
    const selected = list.find(f => f.name === formation);
    if (!selected) {
      setCourseDetails(null);
      return;
    }

    let calculatedPrice = selected.price;

    // NextMind English Adults per-level pricing A1-C1
    if (school === 'nextmind' && selected.id === 'english_level') {
      if (level === 'A1') calculatedPrice = 6000;
      else if (level === 'A2') calculatedPrice = 6500;
      else if (level === 'B1') calculatedPrice = 7000;
      else if (level === 'B2') calculatedPrice = 7500;
      else if (level === 'C1') calculatedPrice = 8000;
      else calculatedPrice = 6000; // default A1
    }

    // Apply special multi-formation / orphan discounts
    let discountApplied = false;
    let finalPrice = calculatedPrice;

    if (calculatedPrice !== null) {
      if (isTwoFormations) {
        finalPrice = 0; // Free if signing 2 formations
        discountApplied = true;
      } else if (isOrphan && school === 'tfc') {
        finalPrice = calculatedPrice * 0.5; // Orphans get 50% off all formations
        discountApplied = true;
      }
    }

    const inscriptionFee = school === 'tfc' ? 800 : 1000;
    const totalDue = finalPrice !== null ? finalPrice + inscriptionFee : null;

    setCourseDetails({
      basePrice: calculatedPrice,
      finalPrice,
      duration: selected.duration,
      inscriptionFee,
      totalDue,
      discountApplied,
      isLanguage: selected.isLanguage
    });
  }, [formation, level, isOrphan, isTwoFormations, school]);

  // Determine levels list
  const getAvailableLevels = () => {
    if (school === 'nextmind') {
      // Always show standard language levels A1-C1 for language courses
      return ['A1', 'A2', 'B1', 'B2', 'C1'];
    } else {
      // TFC School: Age-based level selector for language courses
      const parsedAge = Number(age);
      if (!age || isNaN(parsedAge)) return [];
      if (parsedAge < 14) {
        return ['Kids Starter', 'Kids Level 1', 'Kids Level 2'];
      } else {
        return ['A1 (Beginner)', 'A2 (Elementary)', 'B1 (Intermediate)', 'B2 (Upper Intermediate)', 'C1 (Advanced)'];
      }
    }
  };

  const handleEnrollment = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const selectedObject = getFormationsList().find(f => f.name === formation);
      if (selectedObject && selectedObject.isLanguage && !level) {
        throw new Error(lang === 'ar' ? 'يرجى تحديد مستوى اللغة' : 'Veuillez sélectionner un niveau de langue');
      }

      await api.submitEnrollment({
        name,
        email,
        phone,
        age: Number(age),
        formation,
        level: selectedObject?.isLanguage ? level : undefined,
        isOrphan,
        isTwoFormations
      }, school);

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLanguageSelected = () => {
    const list = getFormationsList();
    const selected = list.find(f => f.name === formation);
    return selected ? selected.isLanguage : false;
  };

  return (
    <div className="min-h-screen bg-slate-55 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-16 transition-colors duration-250 relative">
      
      {/* Absolute top control headers */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 rtl:space-x-reverse">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="fr">Français (FR)</option>
          <option value="ar">العربية (AR)</option>
          <option value="en">English (EN)</option>
        </select>
        <button
          onClick={toggleTheme}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <Link
          to="/login"
          className="px-4 py-1.5 text-xs font-semibold bg-brand-primary hover:bg-brand-hover text-white rounded-lg transition-all"
        >
          Portal Login
        </Link>
      </div>

      {/* Hero Banner Section */}
      <div className="bg-gradient-to-br from-brand-primary/10 via-brand-primary/5 to-transparent py-16 px-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto text-center mt-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold mb-6">
            <Award size={14} />
            <span>{school === 'tfc' ? 'TFC School — Formation Professionnelle' : 'NextMind Academy — Tech & Creative Center'}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
            {lang === 'ar' ? 'التسجيل الإلكتروني المسبق للطلاب' : t('enrollTitle')}
          </h1>
          <p className="text-base sm:text-lg text-slate-650 dark:text-slate-400 max-w-2xl mx-auto">
            {lang === 'ar' ? 'يرجى ملء استمارة التسجيل أدناه. بعد مراجعة وقبول طلبك من قبل الإدارة، سيتم إرسال حسابك الخاص للدخول إلى النظام.' : t('enrollDesc')}
          </p>
        </div>
      </div>

      {/* Registration Content */}
      <div className="max-w-6xl mx-auto px-4 mt-12">
        {success ? (
          // Success Response State
          <div className="max-w-xl mx-auto bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-800/40 p-8 rounded-3xl text-center shadow-xl animate-fade-in">
            <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <CheckCircle size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              {lang === 'ar' ? 'تم تقديم طلبك بنجاح!' : 'Demande d\'inscription envoyée !'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {lang === 'ar' 
                ? 'لقد تم إرسال معلوماتك بنجاح. سيقوم المشرف بمراجعة طلبك وتفعيل حسابك قريبًا. يرجى الاتصال بإدارة المدرسة لاستلام معلومات الدخول.'
                : 'Votre demande a été enregistrée avec succès. Un administrateur va valider votre dossier et générer vos identifiants d\'accès. Veuillez vous rapprocher de l\'école pour les récupérer.'}
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setName('');
                setAge('');
                setPhone('');
                setEmail('');
                setFormation('');
                setLevel('');
                setIsOrphan(false);
                setIsTwoFormations(false);
              }}
              className="px-6 py-2.5 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              {lang === 'ar' ? 'تسجيل طلب آخر' : 'Nouvelle inscription'}
            </button>
          </div>
        ) : (
          // Standard Grid (Form + Prices Sidebar)
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 shadow-xl">
              {error && (
                <div className="mb-6 bg-red-55 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleEnrollment} className="space-y-6">
                
                {/* Bilingual labels: french + arabic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                      <span>Nom Complet</span>
                      <span className="text-slate-400 font-mono">الاسم الكامل</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                        placeholder="e.g. Yacine Belkacem"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                      <span>Âge</span>
                      <span className="text-slate-400 font-mono">العمر</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="number"
                        min={4}
                        max={100}
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                        placeholder="e.g. 21"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                      <span>Téléphone</span>
                      <span className="text-slate-400 font-mono">رقم الهاتف</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                        placeholder="e.g. 0555 123 456"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                      <span>Email (Optionnel)</span>
                      <span className="text-slate-400 font-mono">البريد الإلكتروني</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                        placeholder="e.g. name@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Formation / level selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                      <span>Formation</span>
                      <span className="text-slate-400 font-mono">التكوين</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <BookOpen size={18} />
                      </div>
                      <select
                        value={formation}
                        onChange={(e) => {
                          setFormation(e.target.value);
                          setLevel('');
                        }}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-350 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                        required
                      >
                        <option value="">-- Sélectionnez une formation --</option>
                        {getFormationsList().map((f) => (
                          <option key={f.id} value={f.name}>
                            {f.name} {f.price ? `(${f.price} DA)` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Level Selector - age dependent or always on languages */}
                  {isLanguageSelected() && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
                        <span>Niveau</span>
                        <span className="text-slate-400 font-mono">المستوى المطلوب</span>
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-355 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                        required
                      >
                        <option value="">-- Sélectionnez un niveau --</option>
                        {getAvailableLevels().length > 0 ? (
                          getAvailableLevels().map((lvl) => (
                            <option key={lvl} value={lvl}>{lvl}</option>
                          ))
                        ) : (
                          <option value="" disabled>
                            {school === 'tfc' ? '⚠️ Veuillez entrer votre âge pour charger les niveaux' : 'Aucun niveau disponible'}
                          </option>
                        )}
                      </select>
                    </div>
                  )}
                </div>

                {/* Conditional Rules Checks (Orphan & Double Formation) */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {lang === 'ar' ? 'خيارات الخصم والعروض الخاصة' : 'Options de réduction & offres'}
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Orphan check - TFC Only */}
                    {school === 'tfc' && (
                      <label className="flex items-start space-x-3 rtl:space-x-reverse cursor-pointer p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all">
                        <input
                          type="checkbox"
                          checked={isOrphan}
                          onChange={(e) => setIsOrphan(e.target.checked)}
                          className="mt-1 h-4.5 w-4.5 rounded text-brand-primary border-slate-300 focus:ring-brand-primary"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">Élève Orphelin (-50%)</span>
                          <span className="text-slate-550 dark:text-slate-400">تخفيض 50% للطلاب اليتامى في جميع الفئات</span>
                        </div>
                      </label>
                    )}

                    {/* Double Formation */}
                    <label className="flex items-start space-x-3 rtl:space-x-reverse cursor-pointer p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all">
                      <input
                        type="checkbox"
                        checked={isTwoFormations}
                        onChange={(e) => setIsTwoFormations(e.target.checked)}
                        className="mt-1 h-4.5 w-4.5 rounded text-brand-primary border-slate-300 focus:ring-brand-primary"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Double Formation (Gratuit)</span>
                        <span className="text-slate-550 dark:text-slate-400">الدورة الثانية مجانية عند التسجيل في دورتين معًا</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg hover:shadow-xl text-sm font-semibold text-white bg-brand-primary hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all duration-150 disabled:opacity-50"
                  >
                    {loading ? t('submitting') : t('submitEnroll')}
                  </button>
                </div>

              </form>
            </div>

            {/* Sidebar Pricing & Notes Column */}
            <div className="space-y-6">
              
              {/* Dynamic Price/Duration Card */}
              {courseDetails && (
                <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 dark:from-brand-primary/15 dark:to-brand-primary/5 border border-brand-primary/20 rounded-3xl p-6 shadow-xl animate-fade-in">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                    <Award size={20} className="text-brand-primary" />
                    <span>{t('durationPriceCard')}</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-slate-250/20 dark:border-slate-800 pb-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{t('duration')}</span>
                      <span className="font-bold">{courseDetails.duration}</span>
                    </div>

                    {courseDetails.basePrice !== null ? (
                      <>
                        <div className="flex justify-between border-b border-slate-250/20 dark:border-slate-800 pb-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">Tarif formation / سعر الدورة</span>
                          <span className="font-semibold">{courseDetails.basePrice} DA</span>
                        </div>

                        {courseDetails.discountApplied && (
                          <div className="flex justify-between text-brand-primary font-semibold border-b border-slate-250/20 dark:border-slate-800 pb-2 text-xs">
                            <span>Réduction appliquée / الخصم المطبق</span>
                            <span>{courseDetails.finalPrice === 0 ? "Gratuit / مجاناً" : "-50%"}</span>
                          </div>
                        )}

                        <div className="flex justify-between border-b border-slate-250/20 dark:border-slate-800 pb-2">
                          <span className="text-sm text-slate-500 dark:text-slate-400">Frais d'inscription / رسوم التسجيل</span>
                          <span className="font-semibold">+{courseDetails.inscriptionFee} DA</span>
                        </div>

                        <div className="flex justify-between items-end pt-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">Total à Payer / الإجمالي</span>
                          <span className="text-2xl font-black text-brand-primary">
                            {courseDetails.totalDue} DA
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 bg-white/50 dark:bg-slate-950/40 rounded-xl border border-slate-200/50 dark:border-slate-800 text-xs text-slate-550 dark:text-slate-400 flex items-start space-x-2 rtl:space-x-reverse">
                        <Info size={16} className="shrink-0 mt-0.5 text-brand-primary" />
                        <span>Frais d'inscription de {courseDetails.inscriptionFee} DA applicables à l'inscription. Les frais de cette formation professionnelle spécifique seront convenus avec l'administration.</span>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* School Rules & Guidelines Notes */}
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center space-x-2 rtl:space-x-reverse">
                  <HelpCircle size={16} className="text-brand-primary" />
                  <span>{t('notesTitle')}</span>
                </h3>

                <ul className="space-y-3 text-xs text-slate-650 dark:text-slate-450 list-inside list-disc">
                  {school === 'tfc' ? (
                    <>
                      <li>
                        <strong>800 DA</strong> frais d'inscription applicables à la validation de la candidature.
                      </li>
                      <li>
                        <strong>Deuxième formation GRATUITE</strong> si vous vous inscrivez à deux formations simultanément.
                      </li>
                      <li>
                        <strong>Réduction Orphelin de -50%</strong> applicable sur toutes les formations (sous réserve de justificatif).
                      </li>
                      <li>
                        Les cours pour enfants (Kids) sont dispensés mensuellement avec un encadrement pédagogique adapté.
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <strong>1 000 DA</strong> frais d'inscription applicables à la validation de la candidature.
                      </li>
                      <li>
                        <strong>Deuxième formation GRATUITE</strong> si vous vous inscrivez à deux formations simultanément.
                      </li>
                      <li>
                        Les formations techniques et artistiques (Figma, Montage, Art Digital) incluent des projets pratiques de portfolio.
                      </li>
                      <li>
                        Les niveaux d'anglais adulte (A1–C1) suivent des tarifs progressifs selon le niveau d'apprentissage.
                      </li>
                    </>
                  )}
                </ul>
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}
