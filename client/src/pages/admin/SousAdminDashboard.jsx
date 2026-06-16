import React, { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Megaphone,
  Pencil,
  Pin,
  Plus,
  RefreshCcw,
  Users
} from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";
import { useLang } from "../../context/LanguageContext.jsx";
import { T } from "../../translations/dashboards.js";

const emptyForm = {
  role: "student",
  name: "",
  email: "",
  password: "",
  phone: "",
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
    teacher: ""
  }
};

const TAB_IDS = [
  { id: "students",      key: "students",      icon: Users },
  { id: "teachers",      key: "teachers",      icon: GraduationCap },
  { id: "announcements", key: "announcements", icon: Megaphone }
];

export default function SousAdminDashboard() {
  const { lang } = useLang(); const t = T[lang];
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [tab, setTab] = useState("students");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const teachers = useMemo(() => users.filter((u) => u.role === "teacher"), [users]);
  const students = useMemo(() => users.filter((u) => u.role === "student"), [users]);

  const loadUsers = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const { data } = await api.get("/announcements");
      setAnnouncements(data.announcements);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  useEffect(() => {
    loadUsers();
    loadAnnouncements();
  }, []);

  const updateForm = (path, value) => {
    if (!path.includes(".")) {
      setForm((c) => ({ ...c, [path]: value }));
      return;
    }
    const [group, key] = path.split(".");
    setForm((c) => ({ ...c, [group]: { ...c[group], [key]: value } }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const buildPayload = () => {
    const payload = {
      role: form.role,
      name: form.name,
      email: form.email,
      phone: form.phone,
      status: form.status
    };
    if (!editingId || form.password) payload.password = form.password;
    if (form.role === "teacher") payload.teacherProfile = form.teacherProfile;
    if (form.role === "student") payload.studentProfile = form.studentProfile;
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
      await loadUsers();
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
      status: user.status || "active",
      teacherProfile: {
        subject: user.teacherProfile?.subject || "",
        contactInfo: user.teacherProfile?.contactInfo || "",
        dateOfBirth: user.teacherProfile?.dateOfBirth || ""
      },
      studentProfile: {
        age: user.studentProfile?.age || "",
        dateOfBirth: user.studentProfile?.dateOfBirth || "",
        course: user.studentProfile?.course || "English",
        parentName: user.studentProfile?.parentName || "",
        parentEmail: user.studentProfile?.parentEmail || "",
        parentPhone: user.studentProfile?.parentPhone || "",
        mark: user.studentProfile?.mark || "",
        rfidCardId: "",
        teacher: user.studentProfile?.teacher?._id || user.studentProfile?.teacher || ""
      }
    });
    setShowForm(true);
  };

  const openAddForm = (role) => {
    setForm({ ...emptyForm, role });
    setEditingId(null);
    setShowForm(true);
  };

  const removeAnnouncement = async (id) => {
    if (!window.confirm(t.deleteAnnouncement)) return;
    try {
      await api.delete(`/announcements/${id}`);
      loadAnnouncements();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const currentList = tab === "students" ? students : tab === "teachers" ? teachers : [];

  return (
    <AppLayout title={t.sousAdminTitle} subtitle={t.sousAdminSubtitle}>
      <div className="grid gap-6">
        <ErrorAlert message={error} />

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {TAB_IDS.map((tab_item) => {
            const Icon = tab_item.icon;
            const active = tab === tab_item.id;
            return (
              <button
                key={tab_item.id}
                onClick={() => { setTab(tab_item.id); resetForm(); }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t[tab_item.key]}
              </button>
            );
          })}
        </div>

        {/* Announcements tab */}
        {tab === "announcements" && (
          <div className="card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 shadow-sm">
                  <Megaphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{t.announcements}</h2>
                  <p className="text-sm text-slate-500">{announcements.length} {t.published}</p>
                </div>
              </div>
              <button className="btn-secondary" onClick={loadAnnouncements}>
                <RefreshCcw className="h-4 w-4" />
              </button>
            </div>
            {announcements.length ? (
              <div className="grid gap-3">
                {announcements.map((a) => (
                  <div
                    key={a._id}
                    className={`rounded-xl border p-4 ${a.pinned ? "border-amber-200 bg-amber-50/60" : "border-slate-100"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="flex items-center gap-1.5 font-bold text-slate-900">
                        {a.pinned && <Pin className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />}
                        {a.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                          {a.audience}
                        </span>
                        <button
                          onClick={() => removeAnnouncement(a._id)}
                          className="icon-btn-danger"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm text-slate-600">{a.body}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
                <Megaphone className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-500">{t.noAnnouncements}</p>
              </div>
            )}
          </div>
        )}

        {/* Students / Teachers tabs */}
        {(tab === "students" || tab === "teachers") && (
          <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">

            {/* Add / Edit form */}
            <div className="card p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2.5 shadow-sm ${editingId ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-brand-500 to-brand-700"}`}>
                    {editingId ? <Pencil className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">
                      {editingId ? t.updateUser : `${t.addUser} — ${tab === "students" ? t.student : t.teacher}`}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {editingId ? t.updateSelected : t.createAccount}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!showForm && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => openAddForm(tab === "students" ? "student" : "teacher")}
                    >
                      <Plus className="h-4 w-4" />
                      {tab === "students" ? t.addStudent : t.addTeacher}
                    </button>
                  )}
                  {showForm && (
                    <button type="button" className="btn-secondary" onClick={resetForm}>
                      {t.cancel}
                    </button>
                  )}
                </div>
              </div>

              {showForm && (
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="field">
                      {t.fullName}
                      <input
                        className="input"
                        value={form.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                        required
                      />
                    </label>
                    <label className="field">
                      {t.email}
                      <input
                        className="input"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        required
                      />
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
                      {t.phone}
                      <input
                        className="input"
                        value={form.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                      />
                    </label>
                  </div>

                  <label className="field">
                    {t.status}
                    <select
                      className="input"
                      value={form.status}
                      onChange={(e) => updateForm("status", e.target.value)}
                    >
                      <option value="active">{t.active}</option>
                      <option value="inactive">{t.inactive}</option>
                    </select>
                  </label>

                  {form.role === "teacher" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="field">
                        {t.subject}
                        <input
                          className="input"
                          value={form.teacherProfile.subject}
                          onChange={(e) => updateForm("teacherProfile.subject", e.target.value)}
                          required
                        />
                      </label>
                      <label className="field">
                        {t.dateOfBirth}
                        <input
                          className="input"
                          type="date"
                          value={form.teacherProfile.dateOfBirth}
                          onChange={(e) => updateForm("teacherProfile.dateOfBirth", e.target.value)}
                        />
                      </label>
                      <label className="field sm:col-span-2">
                        {t.contactInfo}
                        <input
                          className="input"
                          value={form.teacherProfile.contactInfo}
                          onChange={(e) => updateForm("teacherProfile.contactInfo", e.target.value)}
                        />
                      </label>
                    </div>
                  )}

                  {form.role === "student" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="field">
                        {t.age}
                        <input
                          className="input"
                          type="number"
                          min="3"
                          max="80"
                          value={form.studentProfile.age}
                          onChange={(e) => updateForm("studentProfile.age", e.target.value)}
                          required
                        />
                      </label>
                      <label className="field">
                        {t.dateOfBirth}
                        <input
                          className="input"
                          type="date"
                          value={form.studentProfile.dateOfBirth}
                          onChange={(e) => updateForm("studentProfile.dateOfBirth", e.target.value)}
                        />
                      </label>
                      <label className="field">
                        {t.course}
                        <input
                          className="input"
                          value={form.studentProfile.course}
                          onChange={(e) => updateForm("studentProfile.course", e.target.value)}
                          required
                        />
                      </label>
                      <label className="field">
                        {t.parentName}
                        <input
                          className="input"
                          value={form.studentProfile.parentName}
                          onChange={(e) => updateForm("studentProfile.parentName", e.target.value)}
                        />
                      </label>
                      <label className="field">
                        {t.parentEmail}
                        <input
                          className="input"
                          type="email"
                          value={form.studentProfile.parentEmail}
                          onChange={(e) => updateForm("studentProfile.parentEmail", e.target.value)}
                        />
                      </label>
                      <label className="field">
                        {t.parentPhone}
                        <input
                          className="input"
                          value={form.studentProfile.parentPhone}
                          onChange={(e) => updateForm("studentProfile.parentPhone", e.target.value)}
                        />
                      </label>
                      <label className="field">
                        {t.mark}
                        <input
                          className="input"
                          value={form.studentProfile.mark}
                          onChange={(e) => updateForm("studentProfile.mark", e.target.value)}
                        />
                      </label>
                      <label className="field">
                        {t.assignedTeacher}
                        <select
                          className="input"
                          value={form.studentProfile.teacher}
                          onChange={(e) => updateForm("studentProfile.teacher", e.target.value)}
                        >
                          <option value="">{t.unassigned}</option>
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
              )}

              {!showForm && (
                <p className="text-sm text-slate-400">
                  {t.clickToAdd(tab)}
                </p>
              )}
            </div>

            {/* List */}
            <div className="card p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-2.5 shadow-sm">
                    {tab === "students" ? (
                      <Users className="h-5 w-5 text-white" />
                    ) : (
                      <GraduationCap className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">
                      {tab === "students" ? t.students : t.teachers}
                    </h2>
                    <p className="text-sm text-slate-500">{currentList.length} {t.records}</p>
                  </div>
                </div>
                <button type="button" className="btn-secondary" onClick={loadUsers}>
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  {t.refresh}
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-slate-400">{t.loading}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {[t.name, t.email, tab === "students" ? t.course : t.subject, t.status, t.edit].map((h) => (
                          <th
                            key={h}
                            className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 first:pl-2"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {currentList.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 pl-2 pr-4 font-semibold text-slate-900">{user.name}</td>
                          <td className="py-3 pr-4 text-xs text-slate-500">{user.email}</td>
                          <td className="py-3 pr-4 text-xs text-slate-600">
                            {user.role === "student"
                              ? user.studentProfile?.course || "–"
                              : user.teacherProfile?.subject || "–"}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                user.status === "active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => editUser(user)}
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {currentList.length === 0 && (
                        <tr>
                          <td className="py-8 text-center text-sm text-slate-400" colSpan="5">
                            {t.noData}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
