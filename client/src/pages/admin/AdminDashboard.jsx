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
  IdCard
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import StatTile from "../../components/StatTile.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";
import IDCardModal from "../../components/IDCardModal.jsx";
import EnrollmentsPanel from "./EnrollmentsPanel.jsx";
import PaymentsPanel from "./PaymentsPanel.jsx";
import AnnouncementsPanel from "./AnnouncementsPanel.jsx";
import AuditPanel from "./AuditPanel.jsx";
import SchedulePanel from "./SchedulePanel.jsx";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "enrollments", label: "Enrollments", icon: Inbox },
  { id: "payments", label: "Payments", icon: Wallet },
  { id: "timetable", label: "Timetable", icon: BookOpen },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "audit", label: "Activity", icon: History }
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

// Compress an uploaded image to a small base64 JPEG suitable for an ID card.
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
  admin:       "bg-violet-100 text-violet-800",
  "sous-admin":"bg-indigo-100 text-indigo-800",
  moderator:   "bg-amber-100 text-amber-800",
  teacher:     "bg-brand-100 text-brand-800",
  student:     "bg-brand-100 text-brand-800"
};

export default function AdminDashboard() {
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

  const teachers = useMemo(() => users.filter((u) => u.role === "teacher"), [users]);
  const students = useMemo(() => users.filter((u) => u.role === "student"), [users]);

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

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

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

  const editUser = (user) => {
    setEditingId(user._id);
    setForm({
      ...emptyForm,
      role: user.role,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      photo: user.photo || "",
      status: user.status || "active",
      teacherProfile: { subject: user.teacherProfile?.subject || "", contactInfo: user.teacherProfile?.contactInfo || "", dateOfBirth: user.teacherProfile?.dateOfBirth || "" },
      studentProfile: {
        age: user.studentProfile?.age || "",
        dateOfBirth: user.studentProfile?.dateOfBirth || "",
        course: user.studentProfile?.course || "English",
        parentName: user.studentProfile?.parentName || "",
        parentEmail: user.studentProfile?.parentEmail || "",
        parentPhone: user.studentProfile?.parentPhone || "",
        mark: user.studentProfile?.mark || "",
        rfidCardId: "",
        rfidCardLast4: user.studentProfile?.rfidCardLast4 || "",
        teacher: user.studentProfile?.teacher?._id || user.studentProfile?.teacher || ""
      }
    });
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    setError("");
    try {
      await api.delete(`/admin/users/${user._id}`);
      await loadData();
    } catch (deleteError) {
      setError(getApiError(deleteError));
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
      <AppLayout title="Admin dashboard" subtitle="Overview, profiles, attendance, and reports.">
        <LoadingState label="Loading admin data" />
      </AppLayout>
    );
  }

  const todayPresent = countStatus(dashboard?.stats.todayAttendance, "Present");
  const todayAbsent  = countStatus(dashboard?.stats.todayAttendance, "Absent");

  return (
    <AppLayout title="Admin dashboard" subtitle="Manage users, monitor attendance, and review reports.">
      <div className="grid gap-6">
        <ErrorAlert message={error} />

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "enrollments" && <EnrollmentsPanel />}
        {tab === "payments" && <PaymentsPanel students={students} />}
        {tab === "timetable" && <SchedulePanel teachers={teachers} />}
        {tab === "announcements" && <AnnouncementsPanel />}
        {tab === "audit" && <AuditPanel />}

        {tab === "overview" && (
        <>
        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile icon={Users}        label="Total students"  value={dashboard?.stats.totalStudents || 0} tone="teal" />
          <StatTile icon={UserRound}    label="Total teachers"  value={dashboard?.stats.totalTeachers || 0} tone="sky"  />
          <StatTile icon={CheckCircle2} label="Present today"   value={todayPresent}                        tone="teal" />
          <StatTile icon={XCircle}      label="Absent today"    value={todayAbsent}                         tone="rose" />
        </section>

        {/* User management + profiles */}
        <section className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">

          {/* Create / edit form */}
          <div className="card p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 shadow-sm ${editingId ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-brand-500 to-emerald-600"}`}>
                  {editingId ? <Pencil className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{editingId ? "Edit user" : "Create user"}</h2>
                  <p className="text-sm text-slate-500">
                    {editingId ? "Update the selected account" : "Add a new school account"}
                  </p>
                </div>
              </div>
              {editingId && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Role
                  <select className="input" value={form.role} disabled={Boolean(editingId)} onChange={(e) => updateForm("role", e.target.value)}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="sous-admin">Sous-Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="field">
                  Status
                  <select className="input" value={form.status} onChange={(e) => updateForm("status", e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Full name
                  <input className="input" value={form.name} onChange={(e) => updateForm("name", e.target.value)} required />
                </label>
                <label className="field">
                  Email
                  <input className="input" type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} required />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Password
                  <input
                    className="input"
                    type="password"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    minLength={8}
                    required={!editingId}
                    placeholder={editingId ? "Leave blank to keep current" : ""}
                  />
                </label>
                <label className="field">
                  Phone
                  <input className="input" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} />
                </label>
              </div>

              {/* Photo for ID card (students and teachers) */}
              {form.role !== "admin" && (
                <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                  {form.photo ? (
                    <img src={form.photo} alt="Preview" className="h-20 w-16 rounded-lg object-cover ring-1 ring-slate-200" />
                  ) : (
                    <div className="flex h-20 w-16 items-center justify-center rounded-lg bg-slate-200 text-slate-400">
                      <IdCard className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="mb-1 text-sm font-semibold text-slate-700">ID card photo</p>
                    <p className="mb-2 text-xs text-slate-500">A clear face photo. Used on the printed ID card.</p>
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
                    Subject
                    <input className="input" value={form.teacherProfile.subject} onChange={(e) => updateForm("teacherProfile.subject", e.target.value)} required />
                  </label>
                  <label className="field">
                    Date of birth
                    <input className="input" type="date" value={form.teacherProfile.dateOfBirth} onChange={(e) => updateForm("teacherProfile.dateOfBirth", e.target.value)} />
                  </label>
                  <label className="field sm:col-span-2">
                    Contact info
                    <input className="input" value={form.teacherProfile.contactInfo} onChange={(e) => updateForm("teacherProfile.contactInfo", e.target.value)} />
                  </label>
                </div>
              )}

              {form.role === "student" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="field">
                    Age
                    <input className="input" type="number" min="3" max="80" value={form.studentProfile.age} onChange={(e) => updateForm("studentProfile.age", e.target.value)} required />
                  </label>
                  <label className="field">
                    Date of birth
                    <input className="input" type="date" value={form.studentProfile.dateOfBirth} onChange={(e) => updateForm("studentProfile.dateOfBirth", e.target.value)} />
                  </label>
                  <label className="field">
                    Course
                    <input className="input" value={form.studentProfile.course} onChange={(e) => updateForm("studentProfile.course", e.target.value)} required />
                  </label>
                  <label className="field">
                    Parent name
                    <input className="input" value={form.studentProfile.parentName} onChange={(e) => updateForm("studentProfile.parentName", e.target.value)} />
                  </label>
                  <label className="field">
                    Parent email
                    <input className="input" type="email" value={form.studentProfile.parentEmail} onChange={(e) => updateForm("studentProfile.parentEmail", e.target.value)} />
                  </label>
                  <label className="field">
                    Parent phone
                    <input className="input" value={form.studentProfile.parentPhone} onChange={(e) => updateForm("studentProfile.parentPhone", e.target.value)} />
                  </label>
                  <label className="field">
                    Mark
                    <input className="input" value={form.studentProfile.mark} onChange={(e) => updateForm("studentProfile.mark", e.target.value)} />
                  </label>
                  <label className="field sm:col-span-2">
                    RFID card
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
                    Assigned teacher
                    <select className="input" value={form.studentProfile.teacher} onChange={(e) => updateForm("studentProfile.teacher", e.target.value)}>
                      <option value="">Unassigned</option>
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
                {saving ? "Saving…" : editingId ? "Update user" : "Create user"}
              </button>
            </form>
          </div>

          {/* Profiles table */}
          <div className="card p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Profiles</h2>
                  <p className="text-sm text-slate-500">{users.length} records</p>
                </div>
              </div>
              <button type="button" className="btn-secondary" onClick={loadData}>
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Name", "Role", "Course / Subject", "Contact", "Actions"].map((h) => (
                      <th key={h} className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 first:pl-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/80 transition-colors align-top">
                      <td className="py-3 pl-2 pr-4">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadge[user.role]}`}>
                          {roleLabel[user.role]}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 text-xs">
                        {user.role === "student" ? user.studentProfile?.course
                         : user.role === "teacher" ? user.teacherProfile?.subject
                         : "Management"}
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-600">
                        {user.role === "student"
                          ? user.studentProfile?.parentEmail || user.studentProfile?.parentPhone || "–"
                          : user.phone || user.teacherProfile?.contactInfo || "–"}
                        {user.role === "student" && user.studentProfile?.rfidCardLast4 ? (
                          <span className="mt-1 flex items-center gap-1 text-brand-700">
                            <CreditCard className="h-3 w-3" />
                            …{user.studentProfile.rfidCardLast4}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button type="button" className="icon-btn" onClick={() => editUser(user)} title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {user.role !== "admin" && (
                            <button type="button" className="icon-btn" onClick={() => setIdCardStudent(user)} title="ID card">
                              <IdCard className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button type="button" className="icon-btn-danger" onClick={() => deleteUser(user)} title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Absences + Reports */}
        <section className="grid gap-6 xl:grid-cols-[360px_1fr]">

          {/* Recent absences */}
          <div className="card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 shadow-sm">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Recent absences</h2>
                <p className="text-sm text-slate-500">Latest students marked absent.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {dashboard?.recentAbsences?.length ? (
                dashboard.recentAbsences.map((record) => (
                  <div key={record._id} className="rounded-xl border border-rose-100 bg-rose-50/60 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{record.student?.name || "Student"}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {record.date} · by {record.teacher?.name || "Teacher"}
                        </p>
                      </div>
                      <StatusBadge value={record.status} />
                    </div>
                    {record.note && <p className="mt-2 text-xs text-slate-600">{record.note}</p>}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">No absences recorded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Attendance report */}
          <div className="card p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-2.5 shadow-sm">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Attendance report</h2>
                  <p className="text-sm text-slate-500">Filter and review records.</p>
                </div>
              </div>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <input
                type="date" className="input"
                value={reportFilters.from}
                onChange={(e) => setReportFilters((c) => ({ ...c, from: e.target.value }))}
              />
              <input
                type="date" className="input"
                value={reportFilters.to}
                onChange={(e) => setReportFilters((c) => ({ ...c, to: e.target.value }))}
              />
              <select
                className="input"
                value={reportFilters.status}
                onChange={(e) => setReportFilters((c) => ({ ...c, status: e.target.value }))}
              >
                <option value="">All statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
              <button type="button" className="btn-secondary justify-center" onClick={loadReports}>
                <Search className="h-4 w-4" />
                Filter
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Date", "Student", "Teacher", "Status", "Note"].map((h) => (
                      <th key={h} className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 first:pl-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pl-2 pr-4 font-mono text-xs text-slate-600">{record.date}</td>
                      <td className="py-3 pr-4 font-medium text-slate-800">{record.student?.name || "Student"}</td>
                      <td className="py-3 pr-4 text-slate-600">{record.teacher?.name || "Teacher"}</td>
                      <td className="py-3 pr-4"><StatusBadge value={record.status} /></td>
                      <td className="py-3 text-xs text-slate-500">{record.note || "–"}</td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td className="py-8 text-center text-sm text-slate-400" colSpan="5">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        </>
        )}
      </div>

      {idCardStudent && <IDCardModal user={idCardStudent} onClose={() => setIdCardStudent(null)} />}
    </AppLayout>
  );
}
