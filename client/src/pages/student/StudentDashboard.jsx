import React from "react";
import {
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
  MessageSquare
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";
import { useLang } from "../../context/LanguageContext.jsx";
import { T } from "../../translations/dashboards.js";
import AnnouncementsCard from "../../components/AnnouncementsCard.jsx";
import IDCardModal from "../../components/IDCardModal.jsx";
import TimetableGrid from "../../components/TimetableGrid.jsx";
import StudentSubmissionModal from "../../components/StudentSubmissionModal.jsx";

const payStatusBadge = {
  paid:     "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:ring-emerald-700",
  partial:  "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:ring-amber-700",
  unpaid:   "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-900 dark:text-rose-300 dark:ring-rose-700",
  overdue:  "bg-red-100 text-red-700 ring-red-200 dark:bg-red-900 dark:text-red-300 dark:ring-red-700",
  pending:  "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-900 dark:text-sky-300 dark:ring-sky-700"
};

const TAB_IDS = [
  { id: "overview",  key: "overview",  icon: UserRound    },
  { id: "timetable", key: "timetable", icon: CalendarDays },
  { id: "payments",  key: "payments",  icon: Wallet       }
];

export default function StudentDashboard() {
  const { lang } = useLang(); const t = T[lang];
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [coursework, setCoursework] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submittingCoursework, setSubmittingCoursework] = useState(null);
  const [showIdCard, setShowIdCard] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  const loadSchedules = async () => {
    try {
      const { data } = await api.get("/schedules");
      setSchedules(data.schedules || []);
    } catch {
      // ignore
    }
  };

  const loadSubmissions = async () => {
    try {
      const { data } = await api.get("/submissions/mine");
      setSubmissions(data.submissions || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      setError("");
      try {
        const { data } = await api.get("/student/profile");
        setProfile(data);
      } catch (profileError) {
        setError(getApiError(profileError));
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
    api.get("/payments/mine").then(({ data }) => setPayments(data.payments || [])).catch(() => {});
    api.get("/coursework/mine").then(({ data }) => setCoursework(data.items || [])).catch(() => {});
    loadSubmissions();
    loadSchedules();
  }, []);

  const summary = useMemo(() => {
    const history = profile?.attendanceHistory || [];
    const present = history.filter((r) => r.status === "Present").length;
    const absent  = history.filter((r) => r.status === "Absent").length;
    const total   = history.length;
    const rate    = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, total, rate };
  }, [profile]);

  if (loading) {
    return (
      <AppLayout title={t.studentTitle} subtitle={t.studentSubtitle}>
        <LoadingState label={t.loading} />
      </AppLayout>
    );
  }

  const student = profile?.student;
  const details = student?.studentProfile || {};
  const initials = student?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  const assignments = coursework.filter((item) => item.type === "assignment");
  const lessons = coursework.filter((item) => item.type === "lesson");

  return (
    <AppLayout title="" subtitle="">
      <div className="grid gap-6">
        <ErrorAlert message={error} />

        {/* ── Profile hero card ── */}
        <section className="card overflow-hidden">
          {/* Gradient hero */}
          <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-emerald-800 px-6 pt-8 pb-6">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <div className="pointer-events-none absolute left-1/3 bottom-0 h-24 w-24 rounded-full bg-white/5 translate-y-1/2" />

            <div className="relative flex flex-wrap items-end gap-6">
              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-3xl font-black text-white shadow-xl ring-2 ring-white/30">
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-black text-white leading-tight">{student?.name || "Student"}</h1>
                <p className="mt-0.5 text-sm text-brand-200">{student?.email}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {details.course && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {details.course}
                    </span>
                  )}
                  {details.rfidCardLast4 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                      <CreditCard className="h-3 w-3" />
                      RFID …{details.rfidCardLast4}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                    summary.rate >= 75
                      ? "bg-emerald-500/20 text-emerald-100 ring-emerald-400/30"
                      : "bg-rose-500/20 text-rose-100 ring-rose-400/30"
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    {summary.rate}% attendance
                  </span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex gap-4">
                {[
                  { label: "Present", value: summary.present, color: "text-emerald-200" },
                  { label: "Absent",  value: summary.absent,  color: "text-rose-200" },
                  { label: "Mark",    value: details.mark || "–", color: "text-amber-200" }
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-xs text-white/60">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero footer: attendance bar + ID card button */}
          <div className="px-6 py-4 bg-white dark:bg-slate-800 flex flex-wrap items-center gap-4">
            {summary.total > 0 && (
              <div className="flex-1 min-w-[160px]">
                <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">{t.attendanceRate}</span>
                  <span className={summary.rate >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                    {summary.rate}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      summary.rate >= 75
                        ? "bg-gradient-to-r from-brand-400 to-emerald-500"
                        : "bg-gradient-to-r from-rose-400 to-red-500"
                    }`}
                    style={{ width: `${summary.rate}%` }}
                  />
                </div>
              </div>
            )}
            <button onClick={() => setShowIdCard(true)} className="btn-secondary shrink-0">
              <IdCard className="h-4 w-4" />
              {t.viewIdCard}
            </button>
          </div>
        </section>

        {/* ── Pill tabs ── */}
        <div className="flex flex-wrap gap-2">
          {TAB_IDS.map((tab_item) => {
            const Icon = tab_item.icon;
            const active = tab === tab_item.id;
            return (
              <button
                key={tab_item.id}
                onClick={() => setTab(tab_item.id)}
                className={`inline-flex items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-brand-600 to-emerald-700 text-white shadow-md shadow-brand-200 dark:shadow-brand-900"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t[tab_item.key]}
              </button>
            );
          })}
        </div>

        {/* ── Timetable tab ── */}
        {tab === "timetable" && (
          <section className="card overflow-hidden">
            <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                    <CalendarDays className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{t.myTimetable}</h2>
                    <p className="text-sm text-brand-200">
                      {details.course ? `${t.course}: ${details.course}` : t.weeklyView}
                    </p>
                  </div>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/25" onClick={loadSchedules}>
                  <RefreshCcw className="h-4 w-4" />
                  {t.refresh}
                </button>
              </div>
            </div>
            <div className="p-6">
              <TimetableGrid schedules={schedules} />
            </div>
          </section>
        )}

        {/* ── Payments tab ── */}
        {tab === "payments" && (
          <section className="card overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-brand-700 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 shadow-inner">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t.myPayments}</h2>
                  <p className="text-sm text-emerald-100">{t.fullHistory}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {payments.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700">
                        {[t.periodMonth, t.amount, t.paid, t.dueDate, t.status].map((h) => (
                          <th key={h} className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 first:pl-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {payments.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-700/30">
                          <td className="py-3 pl-2 pr-4 font-semibold text-slate-800 dark:text-slate-100">{p.period || p.month || "–"}</td>
                          <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{(p.amount || 0).toLocaleString()} DA</td>
                          <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{(p.paidAmount || 0).toLocaleString()} DA</td>
                          <td className="py-3 pr-4 text-xs text-slate-500 dark:text-slate-400">
                            {p.dueDate ? new Date(p.dueDate).toLocaleDateString("en-GB") : "–"}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase ring-1 ${payStatusBadge[p.status] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 text-center dark:border-slate-700">
                  <Wallet className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">{t.noPayments}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Overview tab ── */}
        {tab === "overview" && (
          <>
            <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
              {/* Profile details card */}
              <div className="card p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 p-2.5 shadow-sm">
                    <UserRound className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t.profileDetails}</h2>
                </div>

                <dl className="grid gap-2.5 text-sm">
                  {[
                    { label: t.ageLabel,     icon: UserRound,     value: details.age || "–"                              },
                    { label: t.courseLabel,  icon: GraduationCap, value: details.course || "–"                          },
                    { label: t.teacherLabel, icon: BookOpen,       value: profile?.teacher?.name || t.notAssigned       },
                    { label: t.parentLabel,  icon: UserRound,      value: details.parentName || "–"                      },
                    { label: t.contactLabel, icon: Phone,          value: details.parentPhone || details.parentEmail || "–" }
                  ].map(({ label, icon: Icon, value }) => (
                    <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5 dark:bg-slate-700/50">
                      <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {label}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100 text-right text-xs">{value}</span>
                    </div>
                  ))}
                </dl>
                {profile?.teacher && (
                  <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-3 dark:border-brand-900 dark:bg-brand-950/30">
                    <p className="text-xs font-black uppercase tracking-wide text-brand-700 dark:text-brand-300">Contact your teacher</p>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{profile.teacher.name}</p>
                    <p className="text-xs text-slate-500">{profile.teacher.teacherProfile?.subject || "Teacher"}</p>
                    {(profile.teacher.phone || profile.teacher.teacherProfile?.contactInfo || profile.teacher.email) && (
                      <a className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline dark:text-brand-300" href={profile.teacher.phone ? "tel:" + profile.teacher.phone : profile.teacher.email ? "mailto:" + profile.teacher.email : "#"}>
                        <Phone className="h-3.5 w-3.5" /> {profile.teacher.phone || profile.teacher.teacherProfile?.contactInfo || profile.teacher.email}
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Attendance history */}
              <div className="card p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-2.5 shadow-sm">
                    <CalendarDays className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.attendanceHistory}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t.last90}
                      {summary.total > 0 && (
                        <span className={`ml-2 font-semibold ${summary.rate >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          · {summary.rate}% {t.rate}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700">
                        <th className="pb-3 pl-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">{t.date}</th>
                        <th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">{t.status}</th>
                        <th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">{t.teacherLabel}</th>
                        <th className="pb-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">{t.note}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {profile?.attendanceHistory?.length ? (
                        profile.attendanceHistory.map((record) => (
                          <tr key={record._id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-700/30">
                            <td className="py-3 pl-2 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">{record.date}</td>
                            <td className="py-3 pr-4">
                              <StatusBadge value={record.status} />
                            </td>
                            <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{record.teacher?.name || "Teacher"}</td>
                            <td className="py-3 text-slate-500 dark:text-slate-400 text-xs">{record.note || "–"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="py-10 text-center text-sm text-slate-400" colSpan="4">
                            {t.noAttendance}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <section className="card overflow-hidden lg:col-span-2">
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-brand-700 to-emerald-700 px-6 py-6">
                  <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
                  <div className="absolute bottom-0 left-1/2 h-16 w-16 rounded-full bg-white/5" />
                  <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/20"><BookOpen className="h-6 w-6 text-white" /></div>
                      <div><h2 className="text-xl font-black text-white">Your learning space</h2><p className="text-sm text-indigo-100">Lessons and assignments from {profile?.teacher?.name || "your teacher"}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <span className="rounded-xl bg-white/15 px-3 py-2 text-center text-xs font-bold text-white"><strong className="block text-lg">{lessons.length}</strong>Lessons</span>
                      <span className="rounded-xl bg-white/15 px-3 py-2 text-center text-xs font-bold text-white"><strong className="block text-lg">{assignments.length}</strong>Tasks</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6 lg:grid-cols-2">
                  <div>
                    <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">Latest lessons</h3><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">{lessons.length}</span></div>
                    <div className="space-y-3">
                      {lessons.length ? lessons.map((item, index) => (
                        <article key={item._id} className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-indigo-900/60 dark:from-indigo-950/30 dark:to-slate-800">
                          <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500" />
                          <div className="flex gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white">{String(index + 1).padStart(2, "0")}</span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.body}</p>
                              {item.course && <p className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-300">For {item.course}</p>}

                              {item.attachments && item.attachments.length > 0 && (
                                <div className="mt-3 pt-2.5 border-t border-indigo-100 dark:border-indigo-900/60 grid gap-2 sm:grid-cols-2">
                                  {item.attachments.map((att, idx) => (
                                    <div key={idx} className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900/60 p-2 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs">
                                      {att.fileType === "image" ? (
                                        <a href={att.fileData} target="_blank" rel="noreferrer">
                                          <img src={att.fileData} alt={att.fileName} className="h-9 w-9 rounded-lg object-cover border shrink-0" />
                                        </a>
                                      ) : (
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white font-black text-[10px]">
                                          PDF
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{att.fileName}</p>
                                        <a href={att.fileData} download={att.fileName} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                          <Download className="h-3 w-3" /> View / Download
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </article>
                      )) : <div className="rounded-2xl border-2 border-dashed border-indigo-100 p-7 text-center dark:border-indigo-900"><BookOpen className="mx-auto h-9 w-9 text-indigo-200 dark:text-indigo-800" /><p className="mt-3 text-sm font-semibold text-slate-500">New lessons will appear here.</p></div>}
                    </div>
                  </div>
                  <div>
                    <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-black uppercase tracking-widest text-rose-700 dark:text-rose-300">Assignments</h3><span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">{assignments.length}</span></div>
                    <div className="space-y-3">
                      {assignments.length ? assignments.map((item) => {
                        const existingSub = submissions.find(
                          (s) => String(s.coursework?._id || s.coursework) === String(item._id)
                        );
                        return (
                          <article key={item._id} className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 to-white p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-rose-900/60 dark:from-rose-950/25 dark:to-slate-800">
                            <div className="flex items-start gap-3">
                              <div className="rounded-xl bg-rose-500 p-2 text-white shadow-sm shrink-0"><ClipboardCheck className="h-5 w-5" /></div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                                  {item.dueDate && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700 dark:bg-rose-900/50 dark:text-rose-200">Due {item.dueDate}</span>}
                                </div>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.body}</p>

                                {item.attachments && item.attachments.length > 0 && (
                                  <div className="mt-3 pt-2.5 border-t border-rose-100 dark:border-rose-900/60 grid gap-2 sm:grid-cols-2">
                                    {item.attachments.map((att, idx) => (
                                      <div key={idx} className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900/60 p-2 border border-rose-100 dark:border-rose-900/50 shadow-2xs">
                                        {att.fileType === "image" ? (
                                          <a href={att.fileData} target="_blank" rel="noreferrer">
                                            <img src={att.fileData} alt={att.fileName} className="h-9 w-9 rounded-lg object-cover border shrink-0" />
                                          </a>
                                        ) : (
                                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white font-black text-[10px]">
                                            PDF
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{att.fileName}</p>
                                          <a href={att.fileData} download={att.fileName} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                            <Download className="h-3 w-3" /> View / Download
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Submission status & Submit Work button */}
                                <div className="mt-3.5 pt-3 border-t border-rose-100 dark:border-rose-900/50 flex flex-wrap items-center justify-between gap-2">
                                  {existingSub ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-xs font-bold">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Submitted
                                      </span>
                                      {existingSub.grade && (
                                        <span className="rounded-xl bg-emerald-600 text-white font-black px-2.5 py-1 text-xs shadow-2xs">
                                          🏆 Grade: {existingSub.grade}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[11px] font-medium text-slate-400">
                                      Not submitted yet
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => setSubmittingCoursework(item)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-brand-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:from-rose-700 hover:to-indigo-700 transition active:scale-95 ml-auto"
                                  >
                                    <UploadCloud className="h-3.5 w-3.5" />
                                    {existingSub ? "Update Your Work" : "Submit Work"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      }) : <div className="rounded-2xl border-2 border-dashed border-rose-100 p-7 text-center dark:border-rose-900"><CheckCircle2 className="mx-auto h-9 w-9 text-rose-200 dark:text-rose-800" /><p className="mt-3 text-sm font-semibold text-slate-500">No assignments right now. You are all caught up!</p></div>}
                    </div>
                  </div>
                </div>
              </section>

              {/* Submissions & Teacher Feedback Log Card */}
              {submissions.length > 0 && (
                <section className="card p-6 border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/20 via-white to-emerald-50/20 dark:from-slate-900 dark:to-slate-800 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-emerald-600 text-white shadow-sm">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">Your Submitted Work & Teacher Grades</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Track homework grades, answers, and feedback from your teacher</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black px-3 py-1 text-xs">
                      {submissions.length} Turn-in(s)
                    </span>
                  </div>

                  <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                    {submissions.map((sub) => (
                      <div key={sub._id} className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 p-4 space-y-2.5 shadow-2xs flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                {sub.assignmentTitle || sub.coursework?.title || "Homework Submission"}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {new Date(sub.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            {sub.grade ? (
                              <span className="rounded-xl bg-emerald-600 text-white font-black px-2.5 py-1 text-xs shadow-2xs shrink-0">
                                {sub.grade}
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold shrink-0">
                                Pending
                              </span>
                            )}
                          </div>

                          {sub.comment && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                              "{sub.comment}"
                            </p>
                          )}

                          {sub.feedback && (
                            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2.5 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-900 dark:text-emerald-200">
                              <span className="font-bold block text-[10px] uppercase text-emerald-700 dark:text-emerald-400">
                                💬 Teacher Remark:
                              </span>
                              "{sub.feedback}"
                            </div>
                          )}
                        </div>

                        {sub.attachments && sub.attachments.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
                            <span>📎 {sub.attachments.length} attachment(s)</span>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Uploaded</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <AnnouncementsCard />

              {/* My fees quick summary */}
              <div className="card p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-brand-600 p-2.5 shadow-sm">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.myFees}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t.latestPayments}</p>
                    </div>
                  </div>
                  {payments.length > 5 && (
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      onClick={() => setTab("payments")}
                    >
                      {t.viewAll}
                    </button>
                  )}
                </div>

                {payments.length ? (
                  <div className="grid gap-2.5">
                    {payments.slice(0, 5).map((p) => (
                      <div key={p._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-700/30">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{p.period || p.month || "–"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {(p.paidAmount || 0).toLocaleString()} / {(p.amount || 0).toLocaleString()} DA
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase ring-1 ${payStatusBadge[p.status] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
                    <Wallet className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t.noFees}</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {showIdCard && student && <IDCardModal user={student} onClose={() => setShowIdCard(false)} />}

      {submittingCoursework && (
        <StudentSubmissionModal
          coursework={submittingCoursework}
          existingSubmission={submissions.find(
            (s) => String(s.coursework?._id || s.coursework) === String(submittingCoursework._id)
          )}
          onSuccess={() => loadSubmissions()}
          onClose={() => setSubmittingCoursework(null)}
        />
      )}
    </AppLayout>
  );
}
