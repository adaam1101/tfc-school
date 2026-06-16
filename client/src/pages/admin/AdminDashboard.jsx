import React from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UserRound,
  Users,
  XCircle,
  ShieldCheck,
  LayoutDashboard,
  Inbox,
  Wallet,
  Megaphone,
  History,
  IdCard,
  GraduationCap,
  Zap,
  CalendarDays,
  TrendingUp,
  UserPlus,
  ChevronRight,
  Menu,
  X,
  KeyRound,
  Copy
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";
import IDCardModal from "../../components/IDCardModal.jsx";
import EnrollmentsPanel from "./EnrollmentsPanel.jsx";
import PaymentsPanel from "./PaymentsPanel.jsx";
import AnnouncementsPanel from "./AnnouncementsPanel.jsx";
import AuditPanel from "./AuditPanel.jsx";
import SchedulePanel from "./SchedulePanel.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLang } from "../../context/LanguageContext.jsx";
import { T } from "../../translations/dashboards.js";

const NAV_KEYS = [
  { id: "overview",      key: "overview",      icon: LayoutDashboard },
  { id: "users",         key: "users",          icon: Users },
  { id: "enrollments",   key: "enrollments",    icon: Inbox },
  { id: "payments",      key: "payments",       icon: Wallet },
  { id: "timetable",     key: "timetable",      icon: BookOpen },
  { id: "announcements", key: "announcements",  icon: Megaphone },
  { id: "audit",         key: "activity",       icon: History }
];

const emptyForm = {
  role: "student",
  name: "",
  email: "",
  password: "",
  phone: "",
  photo: "",
  status: "active",
  teacherProfile: { subject: "", contactInfo: "", dateOfBirth: "" },
  studentProfile: {
    age: "",
    dateOfBirth: "",
    course: "English",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    mark: "",
    rfidCardId: "",
    rfidCardLast4: "",
    teacher: ""
  }
};

const fileToCompressedDataUrl = (file, maxSize = 400) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const countStatus = (items = [], status) => items.find((item) => item._id === status)?.count || 0;

const roleLabel  = { admin: "Admin", "sous-admin": "Sous-Admin", moderator: "Moderator", teacher: "Teacher", student: "Student" };
const roleBadge  = {
  admin:       "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
  "sous-admin":"bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  moderator:   "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  teacher:     "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300",
  student:     "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { lang } = useLang(); const t = T[lang];
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [reportFilters, setReportFilters] = useState({ from: "", to: "", status: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("overview");
  const [idCardStudent, setIdCardStudent] = useState(null);
  const [userSubTab, setUserSubTab] = useState("students");
  const [userSearch, setUserSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const teachers = useMemo(() => users.filter((u) => u.role === "teacher"), [users]);
  const students = useMemo(() => users.filter((u) => u.role === "student"), [users]);
  const staff    = useMemo(() => users.filter((u) => ["sous-admin", "moderator", "admin"].includes(u.role)), [users]);

  const filteredUsers = useMemo(() => {
    const list = userSubTab === "students" ? students : userSubTab === "teachers" ? teachers : staff;
    if (!userSearch.trim()) return list;
    const q = userSearch.toLowerCase();
    return list.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.studentProfile?.course?.toLowerCase().includes(q) ||
        u.teacherProfile?.subject?.toLowerCase().includes(q)
    );
  }, [userSubTab, students, teachers, staff, userSearch]);

  const loadData = async () => {
    setError("");
    setLoading(true);
    try {
      const [dashRes, usersRes, reportsRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users"),
        api.get("/admin/reports/attendance")
      ]);
      setDashboard(dashRes.data);
      setUsers(usersRes.data.users);
      setRecords(reportsRes.data.records);
    } catch (loadError) {
      setError(getApiError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const updateForm = (path, value) => {
    if (!path.includes(".")) {
      setForm((c) => ({ ...c, [path]: value }));
      return;
    }
    const [group, key] = path.split(".");
    setForm((c) => ({ ...c, [group]: { ...c[group], [key]: value } }));
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setForm((c) => ({ ...c, photo: dataUrl }));
    } catch {
      setError("Could not read that image. Try a different file.");
    }
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const buildPayload = () => {
    const payload = { role: form.role, name: form.name, email: form.email, phone: form.phone, photo: form.photo, status: form.status };
    if (!editingId || form.password) payload.password = form.password;
    if (form.role === "teacher")  payload.teacherProfile = form.teacherProfile;
    if (form.role === "student")  payload.studentProfile = form.studentProfile;
    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.put(`/admin/users/${editingId}`, buildPayload());
      } else {
        await api.post("/admin/users", buildPayload());
      }
      resetForm();
      await loadData();
    } catch (saveError) {
      setError(getApiError(saveError));
    } finally {
      setSaving(false);
    }
  };

  const editUser = (u) => {
    setEditingId(u._id);
    setForm({
      ...emptyForm,
      role: u.role,
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      photo: u.photo || "",
      status: u.status || "active",
      teacherProfile: { subject: u.teacherProfile?.subject || "", contactInfo: u.teacherProfile?.contactInfo || "", dateOfBirth: u.teacherProfile?.dateOfBirth || "" },
      studentProfile: {
        age: u.studentProfile?.age || "",
        dateOfBirth: u.studentProfile?.dateOfBirth || "",
        course: u.studentProfile?.course || "English",
        parentName: u.studentProfile?.parentName || "",
        parentEmail: u.studentProfile?.parentEmail || "",
        parentPhone: u.studentProfile?.parentPhone || "",
        mark: u.studentProfile?.mark || "",
        rfidCardId: "",
        rfidCardLast4: u.studentProfile?.rfidCardLast4 || "",
        teacher: u.studentProfile?.teacher?._id || u.studentProfile?.teacher || ""
      }
    });
    setShowForm(true);
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    setError("");
    try {
      await api.delete(`/admin/users/${u._id}`);
      await loadData();
    } catch (deleteError) {
      setError(getApiError(deleteError));
    }
  };

  const [resetLink, setResetLink] = useState(null);
  const resetUserPassword = async (u) => {
    try {
      const { data } = await api.post(`/admin/users/${u._id}/reset-password`);
      setResetLink({ name: u.name, url: data.resetUrl });
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const loadReports = async () => {
    setError("");
    try {
      const params = Object.fromEntries(Object.entries(reportFilters).filter(([, v]) => Boolean(v)));
      const { data } = await api.get("/admin/reports/attendance", { params });
      setRecords(data.records);
    } catch (reportError) {
      setError(getApiError(reportError));
    }
  };

  if (loading) {
    return (
      <AppLayout title={t.adminTitle} subtitle={t.adminSubtitle}>
        <LoadingState label={t.loading} />
      </AppLayout>
    );
  }

  const todayPresent = countStatus(dashboard?.stats.todayAttendance, "Present");
  const todayAbsent  = countStatus(dashboard?.stats.todayAttendance, "Absent");

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AD";

  const navigateTo = (id) => {
    setTab(id);
    setSidebarOpen(false);
  };

  return (
    <AppLayout title="" subtitle="" fullHeight>
      <div className="flex h-full">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-brand-700 to-brand-950 transition-transform duration-300 lg:relative lg:z-auto lg:translate-x-0 lg:h-full lg:shrink-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-5 py-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white font-black text-base ring-2 ring-white/20 shadow-lg">
                {initials}
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight truncate max-w-[120px]">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-brand-200 capitalize">{user?.role || "admin"}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-brand-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {NAV_KEYS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              const label = t[item.key];
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center gap-3 rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-150 ${
                    active
                      ? "bg-white text-brand-800 shadow-md"
                      : "text-brand-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                  {active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-brand-400" />}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-3 py-4 border-t border-brand-600/50">
            <button
              onClick={loadData}
              className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-brand-200 hover:bg-white/10 hover:text-white transition-all"
            >
              <RefreshCcw className="h-4 w-4 shrink-0" />
              {t.refreshData}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 overflow-y-auto h-full">
          {/* Mobile top bar */}
          <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-700 dark:bg-slate-900">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {NAV_KEYS.find((n) => n.id === tab) && (() => {
                const Icon = NAV_KEYS.find((n) => n.id === tab).icon;
                return <Icon className="h-4 w-4 text-brand-600" />;
              })()}
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {(() => { const item = NAV_KEYS.find((n) => n.id === tab); return item ? t[item.key] : ""; })()}
              </span>
            </div>
          </div>

          <div className="p-6 lg:p-8 grid gap-6">
            <ErrorAlert message={error} />

            {/* Panel-based tabs */}
            {tab === "enrollments"   && <EnrollmentsPanel />}
            {tab === "payments"      && <PaymentsPanel students={students} />}
            {tab === "timetable"     && <SchedulePanel teachers={teachers} />}
            {tab === "announcements" && <AnnouncementsPanel />}
            {tab === "audit"         && <AuditPanel />}

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <>
                {/* Welcome banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 p-6 text-white shadow-lg">
                  <div className="relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-200">{t.adminSubtitle}</p>
                    <h1 className="mt-1 text-2xl font-black tracking-tight">{t.adminTitle}</h1>
                    <p className="mt-2 text-sm text-brand-100">{new Date().toLocaleDateString(lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-DZ" : "en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
                  <div className="absolute -right-2 bottom-0 h-24 w-24 rounded-full bg-white/5" />
                  <div className="absolute right-32 -bottom-4 h-16 w-16 rounded-full bg-white/5" />
                </div>

                {/* Stats row */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      icon: GraduationCap,
                      label: t.totalStudents,
                      value: dashboard?.stats.totalStudents || 0,
                      bg: "bg-gradient-to-br from-brand-500 to-brand-700",
                      light: "bg-brand-50 dark:bg-brand-950/40",
                      num: "text-brand-700 dark:text-brand-300",
                      desc: t.enrolled
                    },
                    {
                      icon: UserRound,
                      label: t.totalTeachers,
                      value: dashboard?.stats.totalTeachers || 0,
                      bg: "bg-gradient-to-br from-violet-500 to-purple-700",
                      light: "bg-violet-50 dark:bg-violet-950/40",
                      num: "text-violet-700 dark:text-violet-300",
                      desc: t.onStaff
                    },
                    {
                      icon: CheckCircle2,
                      label: t.presentToday,
                      value: todayPresent,
                      bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
                      light: "bg-emerald-50 dark:bg-emerald-950/40",
                      num: "text-emerald-700 dark:text-emerald-300",
                      desc: t.checkedIn
                    },
                    {
                      icon: XCircle,
                      label: t.absentToday,
                      value: todayAbsent,
                      bg: "bg-gradient-to-br from-rose-500 to-red-600",
                      light: "bg-rose-50 dark:bg-rose-950/40",
                      num: "text-rose-700 dark:text-rose-300",
                      desc: t.notPresent
                    }
                  ].map(({ icon: Icon, label, value, bg, light, num, desc }) => (
                    <div key={label} className={`flex items-center gap-4 rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${light}`}>
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${bg} shadow-md`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
                        <p className={`mt-0.5 text-3xl font-black tabular-nums ${num}`}>{value}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Recent absences + Quick actions */}
                <section className="grid gap-6 xl:grid-cols-2">
                  {/* Recent absences */}
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 bg-amber-50 dark:bg-amber-950/20 px-5 py-4">
                      <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2 shadow-sm">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.recentAbsences}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.recentAbsencesDesc}</p>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {dashboard?.recentAbsences?.length ? (
                        dashboard.recentAbsences.map((record) => (
                          <div key={record._id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-xs font-bold text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                                {record.student?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{record.student?.name || "Student"}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {record.date} · {record.teacher?.name || "Teacher"}
                                </p>
                              </div>
                            </div>
                            <StatusBadge value={record.status} />
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <CheckCircle2 className="h-8 w-8 text-emerald-300" />
                          <p className="mt-2 text-sm font-medium text-slate-500">{t.noAbsences}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 bg-brand-50 dark:bg-brand-950/20 px-5 py-4">
                      <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-2 shadow-sm">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.quickActions}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.quickActionsDesc}</p>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {[
                        {
                          label: t.addStudent,
                          desc: t.addStudentDesc,
                          icon: UserPlus,
                          gradient: "from-brand-500 to-emerald-600",
                          action: () => { setForm({ ...emptyForm, role: "student" }); setEditingId(null); setShowForm(true); setTab("users"); setUserSubTab("students"); }
                        },
                        {
                          label: t.addTeacher,
                          desc: t.addTeacherDesc,
                          icon: GraduationCap,
                          gradient: "from-violet-500 to-purple-600",
                          action: () => { setForm({ ...emptyForm, role: "teacher" }); setEditingId(null); setShowForm(true); setTab("users"); setUserSubTab("teachers"); }
                        },
                        {
                          label: t.viewPayments,
                          desc: t.viewPaymentsDesc,
                          icon: Wallet,
                          gradient: "from-emerald-500 to-teal-600",
                          action: () => navigateTo("payments")
                        },
                        {
                          label: t.viewTimetable,
                          desc: t.viewTimetableDesc,
                          icon: CalendarDays,
                          gradient: "from-amber-500 to-orange-500",
                          action: () => navigateTo("timetable")
                        }
                      ].map(({ label, desc, icon: Icon, gradient, action }) => (
                        <button
                          key={label}
                          onClick={action}
                          className="group flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ── USERS ── */}
            {tab === "users" && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-800 dark:to-slate-900 p-5 text-white shadow-md">
                  <div>
                    <h1 className="text-xl font-black tracking-tight">{t.usersTitle}</h1>
                    <p className="mt-0.5 text-sm text-slate-300">
                      {t.usersSubtitle(students.length, teachers.length)}
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-all backdrop-blur-sm"
                    onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
                  >
                    <Plus className="h-4 w-4" />
                    {t.addUser}
                  </button>
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800 w-fit">
                  {[
                    { id: "students", icon: GraduationCap, label: t.students || "Students" },
                    { id: "teachers", icon: UserRound,     label: t.teachers || "Teachers" },
                    { id: "staff",    icon: ShieldCheck,   label: t.staff    || "Staff"    }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setUserSubTab(st.id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold capitalize transition-all ${
                        userSubTab === st.id
                          ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      <st.icon className="h-4 w-4" />
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="input pl-10"
                    placeholder={t.searchUsers(userSubTab)}
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>

                {/* User form modal */}
                {showForm && (
                  <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 pt-16">
                    <div className="card w-full max-w-2xl p-6 shadow-2xl animate-fade-slide-up">
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-xl p-2.5 shadow-sm ${editingId ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-brand-500 to-emerald-600"}`}>
                            {editingId ? <Pencil className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                          </div>
                          <div>
                            <h2 className="text-lg font-bold dark:text-slate-100">{editingId ? t.updateUser : t.createUser}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {editingId ? t.updateAccount : t.addNewAccount}
                            </p>
                          </div>
                        </div>
                        <button type="button" className="btn-secondary" onClick={resetForm}>
                          <X className="h-4 w-4" /> {t.cancel}
                        </button>
                      </div>

                      <form className="grid gap-4" onSubmit={handleSubmit}>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="field">
                            {t.role}
                            <select className="input" value={form.role} disabled={Boolean(editingId)} onChange={(e) => updateForm("role", e.target.value)}>
                              <option value="student">{t.student}</option>
                              <option value="teacher">{t.teacher}</option>
                              <option value="sous-admin">Sous-Admin</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                          </label>
                          <label className="field">
                            {t.status}
                            <select className="input" value={form.status} onChange={(e) => updateForm("status", e.target.value)}>
                              <option value="active">{t.active}</option>
                              <option value="inactive">{t.inactive}</option>
                            </select>
                          </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="field">
                            {t.fullName}
                            <input className="input" value={form.name} onChange={(e) => updateForm("name", e.target.value)} required />
                          </label>
                          <label className="field">
                            {t.email}
                            <input className="input" type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} required />
                          </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="field">
                            {t.password}
                            <input
                              className="input"
                              type="password"
                              value={form.password}
                              onChange={(e) => updateForm("password", e.target.value)}
                              minLength={8}
                              required={!editingId}
                              placeholder={editingId ? t.leaveBlankPassword : ""}
                            />
                          </label>
                          <label className="field">
                            {t.phone}{form.role === "student" && <span className="ml-1 text-rose-500">*</span>}
                            <input className="input" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} required={form.role === "student"} />
                          </label>
                        </div>

                        {form.role !== "admin" && (
                          <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-700/50">
                            {form.photo ? (
                              <img src={form.photo} alt="Preview" className="h-20 w-16 rounded-lg object-cover ring-1 ring-slate-200" />
                            ) : (
                              <div className="flex h-20 w-16 items-center justify-center rounded-lg bg-slate-200 text-slate-400 dark:bg-slate-600">
                                <IdCard className="h-6 w-6" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">ID card photo</p>
                              <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">A clear face photo. Used on the printed ID card.</p>
                              <div className="flex gap-2">
                                <label className="btn-secondary cursor-pointer text-xs">
                                  {form.photo ? "Change photo" : "Upload photo"}
                                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                </label>
                                {form.photo && (
                                  <button type="button" className="btn-secondary text-xs" onClick={() => updateForm("photo", "")}>
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {form.role === "teacher" && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="field">
                              {t.subject}
                              <input className="input" value={form.teacherProfile.subject} onChange={(e) => updateForm("teacherProfile.subject", e.target.value)} required />
                            </label>
                            <label className="field">
                              {t.dateOfBirth}
                              <input className="input" type="date" value={form.teacherProfile.dateOfBirth} onChange={(e) => updateForm("teacherProfile.dateOfBirth", e.target.value)} />
                            </label>
                            <label className="field sm:col-span-2">
                              {t.contactInfo}
                              <input className="input" value={form.teacherProfile.contactInfo} onChange={(e) => updateForm("teacherProfile.contactInfo", e.target.value)} />
                            </label>
                          </div>
                        )}

                        {form.role === "student" && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="field">
                              {t.age} <span className="ml-1 text-rose-500">*</span>
                              <input className="input" type="number" min="3" max="80" value={form.studentProfile.age} onChange={(e) => updateForm("studentProfile.age", e.target.value)} required />
                            </label>
                            <label className="field">
                              {t.dateOfBirth} <span className="text-slate-400 text-xs font-normal">({t.optional})</span>
                              <input className="input" type="date" value={form.studentProfile.dateOfBirth} onChange={(e) => updateForm("studentProfile.dateOfBirth", e.target.value)} />
                            </label>
                            <label className="field">
                              {t.course} <span className="ml-1 text-rose-500">*</span>
                              <input className="input" value={form.studentProfile.course} onChange={(e) => updateForm("studentProfile.course", e.target.value)} required />
                            </label>
                            <label className="field">
                              {t.parentName} <span className="text-slate-400 text-xs font-normal">({t.optional})</span>
                              <input className="input" value={form.studentProfile.parentName} onChange={(e) => updateForm("studentProfile.parentName", e.target.value)} />
                            </label>
                            <label className="field">
                              {t.parentEmail} <span className="text-slate-400 text-xs font-normal">({t.optional})</span>
                              <input className="input" type="email" value={form.studentProfile.parentEmail} onChange={(e) => updateForm("studentProfile.parentEmail", e.target.value)} />
                            </label>
                            <label className="field">
                              {t.parentPhone} <span className="text-slate-400 text-xs font-normal">({t.optional})</span>
                              <input className="input" value={form.studentProfile.parentPhone} onChange={(e) => updateForm("studentProfile.parentPhone", e.target.value)} />
                            </label>
                            <label className="field">
                              {t.mark} <span className="text-slate-400 text-xs font-normal">({t.optional})</span>
                              <input className="input" value={form.studentProfile.mark} onChange={(e) => updateForm("studentProfile.mark", e.target.value)} />
                            </label>
                            <label className="field sm:col-span-2">
                              {t.rfidCard}
                              <span className="relative">
                                <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                  className="input pl-10"
                                  value={form.studentProfile.rfidCardId}
                                  onChange={(e) => updateForm("studentProfile.rfidCardId", e.target.value)}
                                  placeholder={
                                    form.studentProfile.rfidCardLast4
                                      ? `Card assigned, ending …${form.studentProfile.rfidCardLast4}. Tap to replace.`
                                      : "Tap RFID card or type card code"
                                  }
                                  autoComplete="off"
                                />
                              </span>
                            </label>
                            <label className="field sm:col-span-2">
                              {t.assignedTeacher} <span className="ml-1 text-rose-500">*</span>
                              <select className="input" required value={form.studentProfile.teacher} onChange={(e) => updateForm("studentProfile.teacher", e.target.value)}>
                                <option value="">{t.selectTeacher}</option>
                                {teachers.map((t) => (
                                  <option key={t._id} value={t._id}>
                                    {t.name} — {t.teacherProfile?.subject || "Teacher"}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        )}

                        <button className="btn-primary mt-1 justify-center" type="submit" disabled={saving}>
                          {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          {saving ? t.saving : editingId ? t.updateUser : t.createUser}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Users table */}
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/50">
                          {[t.name, t.role, t.courseOrSubject, t.contact, t.actions].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                        {filteredUsers.map((u) => (
                          <tr key={u._id} className="border-l-2 border-l-transparent hover:border-l-brand-500 hover:bg-brand-50/30 transition-colors dark:hover:bg-slate-700/30">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white ${
                                  u.role === "teacher" ? "from-violet-400 to-violet-600" : u.role === "student" ? "from-brand-400 to-brand-600" : "from-slate-400 to-slate-600"
                                }`}>
                                  {u.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadge[u.role]}`}>
                                {roleLabel[u.role]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-xs">
                              {u.role === "student" ? u.studentProfile?.course
                               : u.role === "teacher" ? u.teacherProfile?.subject
                               : t.management}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                              {u.role === "student"
                                ? u.studentProfile?.parentEmail || u.studentProfile?.parentPhone || "–"
                                : u.phone || u.teacherProfile?.contactInfo || "–"}
                              {u.role === "student" && u.studentProfile?.rfidCardLast4 ? (
                                <span className="mt-1 flex items-center gap-1 text-brand-700 dark:text-brand-400">
                                  <CreditCard className="h-3 w-3" />
                                  …{u.studentProfile.rfidCardLast4}
                                </span>
                              ) : null}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:bg-slate-700 dark:hover:text-brand-400" onClick={() => editUser(u)} title="Edit">
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                {u.role !== "admin" && (
                                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:bg-slate-700 dark:hover:text-brand-400" onClick={() => setIdCardStudent(u)} title="ID card">
                                    <IdCard className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:bg-slate-700 dark:hover:text-brand-400" onClick={() => resetUserPassword(u)} title="Reset password">
                                  <KeyRound className="h-3.5 w-3.5" />
                                </button>
                                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-white text-rose-500 shadow-sm transition-all hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900 dark:bg-slate-800 dark:hover:bg-rose-950" onClick={() => deleteUser(u)} title="Delete">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr>
                            <td className="py-12 text-center text-sm text-slate-400" colSpan="5">
                              {t.noUsersFound(userSubTab, userSearch)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {idCardStudent && <IDCardModal user={idCardStudent} onClose={() => setIdCardStudent(null)} />}

      {resetLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-brand-100 p-2.5"><KeyRound className="h-5 w-5 text-brand-700" /></div>
              <div>
                <h3 className="font-bold text-slate-900">Password reset link</h3>
                <p className="text-xs text-slate-500">{resetLink.name} · expires in 30 min</p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 break-all text-xs font-mono text-slate-700">
              {resetLink.url}
            </div>
            <p className="mt-3 text-xs text-slate-400 text-center">Share this link with the user so they can set a new password.</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => navigator.clipboard?.writeText(resetLink.url)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Copy className="h-4 w-4" /> Copy link
              </button>
              <button onClick={() => setResetLink(null)}
                className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
