import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Home,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Phone,
  UserRound,
  XCircle,
  GraduationCap,
  CreditCard,
  IdCard,
  Wallet,
  RefreshCcw,
  TrendingUp,
  Award,
  Download,
  ClipboardCheck,
  UploadCloud,
  Inbox,
  Sparkles,
  MessageSquare,
  Plus,
  Clock,
  MapPin,
  ChevronRight,
  Globe,
  LogOut,
  Moon,
  Sun,
  Bell,
  ArrowDownCircle,
  FileCheck,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";
import { useLang } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../hooks/useTheme.js";
import AnnouncementsCard from "../../components/AnnouncementsCard.jsx";
import IDCardModal from "../../components/IDCardModal.jsx";
import TimetableGrid from "../../components/TimetableGrid.jsx";
import StudentSubmissionModal from "../../components/StudentSubmissionModal.jsx";
import StudentActionModal from "../../components/StudentActionModal.jsx";

const payStatusBadge = {
  paid:     "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800",
  partial:  "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-emerald-800",
  unpaid:   "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-800",
  overdue:  "bg-red-100 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800",
  pending:  "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800"
};

export default function StudentDashboard() {
  const { lang, setLang } = useLang();
  const { logout } = useAuth();
  const { dark: isDark, toggle: toggleTheme } = useTheme();

  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [coursework, setCoursework] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submittingCoursework, setSubmittingCoursework] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 5 Tabs: "home" | "courses" | "create" (modal) | "payments" | "profile"
  const [activeTab, setActiveTab] = useState("home");
  const [courseView, setCourseView] = useState("lessons"); // "lessons" | "timetable"

  // Gestures & Pull-to-refresh
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const scrollContainerRef = useRef(null);

  const isAr = lang === "ar";

  const loadAllData = async (isPull = false) => {
    if (isPull) setIsRefreshing(true);
    setError("");
    try {
      const [profRes, payRes, cwRes, subRes, schRes] = await Promise.all([
        api.get("/student/profile").catch((err) => ({ error: err })),
        api.get("/payments/mine").catch(() => ({ data: { payments: [] } })),
        api.get("/coursework/mine").catch(() => ({ data: { items: [] } })),
        api.get("/submissions/mine").catch(() => ({ data: { submissions: [] } })),
        api.get("/schedules").catch(() => ({ data: { schedules: [] } }))
      ]);

      if (profRes.error) {
        setError(getApiError(profRes.error));
      } else if (profRes.data) {
        setProfile(profRes.data);
      }

      setPayments(payRes.data?.payments || []);
      setCoursework(cwRes.data?.items || []);
      setSubmissions(subRes.data?.submissions || []);
      setSchedules(schRes.data?.schedules || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setPullY(0);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Touch Gesture Listeners (Pull-to-refresh & Swipe Navigation)
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const diffY = currentY - touchStartY.current;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Pull to refresh only when scrolled to top
    if (scrollTop <= 2 && diffY > 0) {
      const resistance = Math.min(diffY * 0.4, 90);
      setPullY(resistance);
    }
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diffX = endX - touchStartX.current;
    const endY = e.changedTouches[0].clientY;
    const diffY = endY - touchStartY.current;

    // Pull-to-refresh trigger threshold
    if (pullY > 55 && !isRefreshing) {
      loadAllData(true);
    } else {
      setPullY(0);
    }

    // Swipe Back Gesture: Horizontal swipe left (or right in RTL) returns to Home
    if (Math.abs(diffX) > 80 && Math.abs(diffY) < 50) {
      if ((isAr && diffX > 0) || (!isAr && diffX < 0)) {
        if (activeTab !== "home") {
          setActiveTab("home");
        }
      }
    }
  };

  const summary = useMemo(() => {
    const history = profile?.attendanceHistory || [];
    const present = history.filter((r) => r.status === "Present").length;
    const absent  = history.filter((r) => r.status === "Absent").length;
    const total   = history.length;
    const rate    = total > 0 ? Math.round((present / total) * 100) : 100;
    return { present, absent, total, rate };
  }, [profile]);

  // Payment totals
  const paymentStats = useMemo(() => {
    const totalDue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalPaid = payments.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
    const totalRest = Math.max(0, totalDue - totalPaid);
    const hasAssurance = payments.some((p) => p.assurancePaid);
    const isUpToDate = totalRest === 0 && payments.length > 0;
    return { totalDue, totalPaid, totalRest, hasAssurance, isUpToDate };
  }, [payments]);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (isAr) {
      if (hour < 12) return "صباح الخير والنشاط";
      if (hour < 18) return "طاب يومك ومرحباً";
      return "مساء الخير والتألق";
    }
    if (lang === "fr") {
      if (hour < 12) return "Bonjour et bienvenue";
      if (hour < 18) return "Bon après-midi";
      return "Bonsoir et bienvenue";
    }
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, [lang, isAr]);

  if (loading) {
    return (
      <AppLayout title="" subtitle="">
        <LoadingState label={isAr ? "جاري تحميل فضاء الطالب..." : "Chargement de votre espace élève..."} />
      </AppLayout>
    );
  }

  const student = profile?.student;
  const details = student?.studentProfile || {};
  const teacher = profile?.teacher;
  const initials = student?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "ST";
  const assignments = coursework.filter((item) => item.type === "assignment");
  const lessons = coursework.filter((item) => item.type === "lesson");

  return (
    <AppLayout title="" subtitle="">
      <div
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="min-h-screen pb-28 md:pb-12 transition-all"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Pull to Refresh Indicator */}
        {pullY > 0 && (
          <div
            className="flex items-center justify-center transition-transform duration-200 overflow-hidden"
            style={{ height: `${pullY}px` }}
          >
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-600 text-white text-xs font-bold shadow-lg animate-bounce">
              <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing || pullY > 50 ? "animate-spin" : ""}`} />
              <span>{pullY > 50 ? (isAr ? "أفلت للتحديث" : "Relâchez pour actualiser") : (isAr ? "اسحب للتحديث..." : "Glissez pour actualiser...")}</span>
            </div>
          </div>
        )}

        <ErrorAlert message={error} />

        {/* ── TAB 1: HOME WELCOMING DASHBOARD ── */}
        {activeTab === "home" && (
          <div className="space-y-5 animate-fade-in">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 p-6 text-white shadow-xl">
              <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-emerald-500/15 blur-2xl" />
              <div className="pointer-events-none absolute left-10 bottom-0 h-32 w-32 rounded-full bg-brand-400/20 blur-xl" />

              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-white/30 to-white/10 text-2xl font-black text-white shadow-inner ring-2 ring-white/30 backdrop-blur-md">
                    {initials}
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-brand-800">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    </span>
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-200">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      {greeting}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {student?.name || "Élève"}
                    </h1>
                    <p className="text-xs text-brand-200/80">
                      {details.course ? `${isAr ? "الفوج / المستوى :" : "Formation :"} ${details.course}` : "TFC Training School"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowIdCard(true)}
                  className="self-start sm:self-center inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-white/25 active:scale-95 transition-all shadow-sm border border-white/20"
                >
                  <IdCard className="h-4 w-4 text-emerald-300" />
                  <span>{isAr ? "بطاقة الطالب الرقمية" : "Ma Carte Élève"}</span>
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs font-bold">
                {details.rfidCardLast4 && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1 text-white/90">
                    <CreditCard className="h-3.5 w-3.5 text-emerald-300" />
                    RFID …{details.rfidCardLast4}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 text-emerald-200 px-3 py-1 ring-1 ring-emerald-400/30">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {summary.rate}% {isAr ? "نسبة الحضور" : "Assiduité"}
                </span>
                {teacher && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500/20 text-indigo-200 px-3 py-1 ring-1 ring-indigo-400/30">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {teacher.name}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setShowActionModal(true)}
                className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60 shadow-2xs hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all text-center group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <span className="mt-2.5 font-black text-xs text-slate-800 dark:text-white">
                  {isAr ? "سؤال الأستاذ" : "Poser une question"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isAr ? "تواصل فوري" : "Direct & WhatsApp"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("courses");
                  setCourseView("lessons");
                }}
                className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/40 dark:to-slate-900 border border-rose-100 dark:border-rose-900/60 shadow-2xs hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all text-center group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-rose-950 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className="mt-2.5 font-black text-xs text-slate-800 dark:text-white">
                  {isAr ? "الدروس والواجبات" : "Cours & Devoirs"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {assignments.length} {isAr ? "واجبات متاحة" : "tâches en cours"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("courses");
                  setCourseView("timetable");
                }}
                className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-100 dark:border-emerald-900/60 shadow-2xs hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all text-center group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-950 group-hover:scale-110 transition-transform">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <span className="mt-2.5 font-black text-xs text-slate-800 dark:text-white">
                  {isAr ? "استعمال الزمن" : "Emploi du temps"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isAr ? "أيام وحصص الأسبوع" : "Planning hebdomadaire"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("payments")}
                className="flex flex-col items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-900 border border-amber-100 dark:border-amber-900/60 shadow-2xs hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all text-center group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-200 dark:shadow-amber-950 group-hover:scale-110 transition-transform">
                  <Wallet className="h-6 w-6" />
                </div>
                <span className="mt-2.5 font-black text-xs text-slate-800 dark:text-white">
                  {isAr ? "وضعية الرسوم" : "Mes Paiements"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {paymentStats.totalRest > 0 ? `${paymentStats.totalRest.toLocaleString()} DA` : (isAr ? "مكتمل ✓" : "À jour ✓")}
                </span>
              </button>
            </div>

            {/* Attendance & Payment Alert Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {isAr ? "متابعة الحضور والغياب" : "Suivi d'Assiduité"}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {isAr ? "آخر 90 يوماً من الدراسة" : "Derniers 90 jours"}
                      </p>
                    </div>
                  </div>
                  <span className={`text-base font-black ${summary.rate >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                    {summary.rate}%
                  </span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      summary.rate >= 75
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : "bg-gradient-to-r from-amber-500 to-rose-500"
                    }`}
                    style={{ width: `${Math.max(5, summary.rate)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-2.5 border border-emerald-100 dark:border-emerald-900/50">
                    <p className="text-base font-black text-emerald-700 dark:text-emerald-300">{summary.present}</p>
                    <p className="text-[10px] font-bold text-emerald-600/80">{isAr ? "حضور" : "Présences"}</p>
                  </div>
                  <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-2.5 border border-rose-100 dark:border-rose-900/50">
                    <p className="text-base font-black text-rose-700 dark:text-rose-300">{summary.absent}</p>
                    <p className="text-[10px] font-bold text-rose-600/80">{isAr ? "غياب" : "Absences"}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 p-2.5 border border-slate-100 dark:border-slate-700">
                    <p className="text-base font-black text-slate-800 dark:text-white">{details.mark || "–"}</p>
                    <p className="text-[10px] font-bold text-slate-500">{isAr ? "التقييم" : "Note / Mark"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {isAr ? "حالة المستحقات والمصاريف" : "Situation Financière"}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {isAr ? "رسوم التمدرس والتأمين" : "Scolarité et Assurance"}
                        </p>
                      </div>
                    </div>
                    {paymentStats.totalRest > 0 ? (
                      <span className="rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-1 text-[11px] font-black">
                        {isAr ? "غير مكتمل" : "Reste à payer"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 text-[11px] font-black">
                        {isAr ? "مسوى بالكامل ✓" : "À jour ✓"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mt-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">{isAr ? "المبلغ الإجمالي :" : "Frais de scolarité :"}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{paymentStats.totalDue.toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">{isAr ? "المبلغ المسدد :" : "Montant versé :"}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{paymentStats.totalPaid.toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">{isAr ? "المتبقي للدفع :" : "Reste dû :"}</span>
                      <span className={`font-black ${paymentStats.totalRest > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {paymentStats.totalRest.toLocaleString()} DA
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("payments")}
                  className="mt-4 w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1"
                >
                  <span>{isAr ? "تفاصيل الوصلات والدفع" : "Voir l'historique complet"}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <AnnouncementsCard />
          </div>
        )}

        {/* ── TAB 2: COURSES, LESSONS & TIMETABLE ── */}
        {activeTab === "courses" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setCourseView("lessons")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                  courseView === "lessons"
                    ? "bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {isAr ? "الدروس والواجبات المنزلية" : "Leçons & Devoirs"}
              </button>
              <button
                type="button"
                onClick={() => setCourseView("timetable")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                  courseView === "timetable"
                    ? "bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {isAr ? "استعمال الزمن الأسبوعي" : "Emploi du temps"}
              </button>
            </div>

            {courseView === "lessons" && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ClipboardCheck className="h-4 w-4" />
                      {isAr ? "الواجبات والتمارين" : "Devoirs & Exercices"}
                    </h3>
                    <span className="rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950 px-2.5 py-0.5 text-xs font-bold">
                      {assignments.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {assignments.length ? assignments.map((item) => {
                      const existingSub = submissions.find(
                        (s) => String(s.coursework?._id || s.coursework) === String(item._id)
                      );
                      return (
                        <div
                          key={item._id}
                          className="rounded-3xl border border-rose-100 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-950/20 dark:to-slate-900 p-5 shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</p>
                              {item.dueDate && (
                                <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                                  {isAr ? "آخر أجل :" : "Date limite :"} {item.dueDate}
                                </p>
                              )}
                            </div>
                            {existingSub ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 text-[11px] font-bold">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                {isAr ? "تم التسليم" : "Rendu"}
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-1 text-[11px] font-bold">
                                {isAr ? "في الانتظار" : "À faire"}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {item.body}
                          </p>

                          {item.attachments && item.attachments.length > 0 && (
                            <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40 grid gap-2 sm:grid-cols-2">
                              {item.attachments.map((att, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white font-black text-[10px]">
                                    PDF
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{att.fileName}</p>
                                    <a href={att.fileData} download={att.fileName} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                                      <Download className="h-3 w-3" /> Télécharger
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="pt-3 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
                            {existingSub?.grade && (
                              <span className="rounded-xl bg-emerald-600 text-white font-black px-2.5 py-1 text-xs">
                                🏆 {isAr ? "العلامة :" : "Note :"} {existingSub.grade}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setSubmittingCoursework(item)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:from-rose-700 hover:to-brand-700 active:scale-95 transition ml-auto"
                            >
                              <UploadCloud className="h-3.5 w-3.5" />
                              {existingSub ? (isAr ? "تعديل الإجابة" : "Mettre à jour le travail") : (isAr ? "تسليم الحل" : "Rendre le travail")}
                            </button>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-2 text-xs font-bold text-slate-500">
                          {isAr ? "لا توجد واجبات معلقة حالياً. أحسنت!" : "Aucun devoir à rendre pour l'instant !"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      {isAr ? "ملخصات الدروس والوثائق" : "Supports de Cours & Fiches"}
                    </h3>
                    <span className="rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 px-2.5 py-0.5 text-xs font-bold">
                      {lessons.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {lessons.length ? lessons.map((item, index) => (
                      <div
                        key={item._id}
                        className="rounded-3xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 p-5 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</p>
                            {item.course && <p className="text-[11px] text-indigo-600 font-bold">{item.course}</p>}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {item.body}
                        </p>

                        {item.attachments && item.attachments.length > 0 && (
                          <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 grid gap-2 sm:grid-cols-2">
                            {item.attachments.map((att, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-[10px]">
                                  DOC
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{att.fileName}</p>
                                  <a href={att.fileData} download={att.fileName} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600">
                                    <Download className="h-3 w-3" /> Télécharger
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                        <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-2 text-xs font-bold text-slate-500">
                          {isAr ? "سيتم نشر الدروس هنا من طرف الأستاذ" : "Les supports de cours seront publiés ici."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {courseView === "timetable" && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-brand-600" />
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">
                      {isAr ? "جدول الحصص والتوقيت" : "Emploi du Temps Hebdomadaire"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadAllData()}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                </div>
                <TimetableGrid schedules={schedules} />
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: PAYMENTS & RECEIPTS ── */}
        {activeTab === "payments" && (
          <div className="space-y-5 animate-fade-in">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 text-white shadow-xl">
              <span className="text-xs font-bold text-emerald-200">{isAr ? "كشف الحساب الدراسي" : "Récapitulatif Financier"}</span>
              <h2 className="text-2xl font-black mt-1">{paymentStats.totalPaid.toLocaleString()} DA</h2>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                {isAr ? "إجمالي المبالغ المسددة" : "Total des versements enregistrés"}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
                  <span className="text-white/70 block text-[10px] uppercase font-bold">{isAr ? "المستحقات الكلية" : "Total Prévu"}</span>
                  <span className="text-base font-black">{paymentStats.totalDue.toLocaleString()} DA</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-xs">
                  <span className="text-white/70 block text-[10px] uppercase font-bold">{isAr ? "المتبقي" : "Reste à payer"}</span>
                  <span className={`text-base font-black ${paymentStats.totalRest > 0 ? "text-rose-300" : "text-emerald-200"}`}>
                    {paymentStats.totalRest.toLocaleString()} DA
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <h3 className="font-black text-sm text-slate-900 dark:text-white mb-2">
                {isAr ? "وصلات الدفع والتسجيلات" : "Historique des Versements"}
              </h3>

              {payments.length ? payments.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        {p.period || p.month || "Mensualité"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {p.dueDate ? new Date(p.dueDate).toLocaleDateString(isAr ? "ar-DZ" : "fr-FR") : "–"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-xs text-slate-900 dark:text-white">
                      {(p.paidAmount || 0).toLocaleString()} DA
                    </p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${payStatusBadge[p.status] || "bg-slate-100"}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  {isAr ? "لا توجد وصلات مسجلة بعد" : "Aucun versement enregistré"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 5: PROFILE & SETTINGS ── */}
        {activeTab === "profile" && (
          <div className="space-y-5 animate-fade-in">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-600 text-white text-xl font-black shadow-md">
                  {initials}
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">{student?.name}</h3>
                  <p className="text-xs text-slate-400">{student?.email}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[10px] font-bold px-2 py-0.5 mt-1">
                    {details.course || "Étudiant"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">{isAr ? "ولي الأمر :" : "Parent / Contact :"}</span>
                  <span className="font-semibold">{details.parentName || "–"}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">{isAr ? "رقم الهاتف :" : "Téléphone :"}</span>
                  <span className="font-semibold">{details.parentPhone || details.parentEmail || "–"}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">{isAr ? "الأستاذ المشرف :" : "Enseignant :"}</span>
                  <span className="font-semibold">{teacher?.name || "–"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <h4 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-2">
                {isAr ? "إعدادات التطبيق" : "Préférences"}
              </h4>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 text-brand-600" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{isAr ? "اللغة" : "Langue"}</span>
                </div>
                <div className="flex gap-1">
                  {["fr", "ar", "en"].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase transition-all ${
                        lang === l
                          ? "bg-brand-600 text-white shadow-xs"
                          : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2.5">
                  {isDark ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{isAr ? "المظهر الداكن" : "Mode Sombre"}</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  {isDark ? (isAr ? "مفعل" : "Activé") : (isAr ? "معطل" : "Désactivé")}
                </button>
              </div>

              <button
                type="button"
                onClick={logout}
                className="w-full mt-4 flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{isAr ? "تسجيل الخروج" : "Se déconnecter"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── 5-TAB BOTTOM NAVIGATION BAR (JAKOB'S LAW OF UX) ── */}
        <nav
          className="fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 shadow-2xl px-4 py-2 pb-safe"
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="max-w-md mx-auto flex items-center justify-between relative">
            <button
              type="button"
              onClick={() => setActiveTab("home")}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === "home"
                  ? "text-brand-600 dark:text-brand-400 font-black scale-105"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
              }`}
            >
              <Home className={`h-5 w-5 ${activeTab === "home" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[10px] mt-0.5">{isAr ? "الرئيسية" : "Accueil"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("courses")}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === "courses"
                  ? "text-brand-600 dark:text-brand-400 font-black scale-105"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
              }`}
            >
              <BookOpen className={`h-5 w-5 ${activeTab === "courses" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[10px] mt-0.5">{isAr ? "الدروس" : "Cours"}</span>
            </button>

            <div className="flex-1 flex justify-center -mt-6">
              <button
                type="button"
                onClick={() => setShowActionModal(true)}
                aria-label="Action Hub"
                className="flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 via-emerald-600 to-teal-500 text-white shadow-lg shadow-brand-500/40 hover:scale-110 active:scale-95 transition-all ring-4 ring-white dark:ring-slate-900 group"
              >
                <Plus className="h-6 w-6 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("payments")}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === "payments"
                  ? "text-brand-600 dark:text-brand-400 font-black scale-105"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
              }`}
            >
              <Wallet className={`h-5 w-5 ${activeTab === "payments" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[10px] mt-0.5">{isAr ? "الرسوم" : "Paiements"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
                activeTab === "profile"
                  ? "text-brand-600 dark:text-brand-400 font-black scale-105"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
              }`}
            >
              <UserRound className={`h-5 w-5 ${activeTab === "profile" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              <span className="text-[10px] mt-0.5">{isAr ? "حسابي" : "Profil"}</span>
            </button>
          </div>
        </nav>
      </div>

      {showIdCard && student && <IDCardModal user={student} onClose={() => setShowIdCard(false)} />}

      <StudentActionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        student={student}
        teacher={teacher}
        coursework={coursework}
        onSubmitHomework={() => {
          setActiveTab("courses");
          setCourseView("lessons");
        }}
        onRefreshData={() => loadAllData()}
        lang={lang}
      />

      {submittingCoursework && (
        <StudentSubmissionModal
          coursework={submittingCoursework}
          existingSubmission={submissions.find(
            (s) => String(s.coursework?._id || s.coursework) === String(submittingCoursework._id)
          )}
          onSuccess={() => loadAllData()}
          onClose={() => setSubmittingCoursework(null)}
        />
      )}
    </AppLayout>
  );
}
