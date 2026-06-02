import React from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UserRound,
  Users,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import StatTile from "../../components/StatTile.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";

const emptyForm = {
  role: "student",
  name: "",
  email: "",
  password: "",
  phone: "",
  status: "active",
  teacherProfile: {
    subject: "",
    contactInfo: ""
  },
  studentProfile: {
    age: "",
    course: "English",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    mark: "",
    teacher: ""
  }
};

const countStatus = (items = [], status) => items.find((item) => item._id === status)?.count || 0;

const roleLabel = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student"
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

  const teachers = useMemo(() => users.filter((user) => user.role === "teacher"), [users]);

  const loadData = async () => {
    setError("");
    setLoading(true);

    try {
      const [dashboardResponse, usersResponse, reportsResponse] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users"),
        api.get("/admin/reports/attendance")
      ]);

      setDashboard(dashboardResponse.data);
      setUsers(usersResponse.data.users);
      setRecords(reportsResponse.data.records);
    } catch (loadError) {
      setError(getApiError(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateForm = (path, value) => {
    if (!path.includes(".")) {
      setForm((current) => ({ ...current, [path]: value }));
      return;
    }

    const [group, key] = path.split(".");
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [key]: value
      }
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const buildPayload = () => {
    const payload = {
      role: form.role,
      name: form.name,
      email: form.email,
      phone: form.phone,
      status: form.status
    };

    if (!editingId || form.password) {
      payload.password = form.password;
    }

    if (form.role === "teacher") {
      payload.teacherProfile = form.teacherProfile;
    }

    if (form.role === "student") {
      payload.studentProfile = form.studentProfile;
    }

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
      status: user.status || "active",
      teacherProfile: {
        subject: user.teacherProfile?.subject || "",
        contactInfo: user.teacherProfile?.contactInfo || ""
      },
      studentProfile: {
        age: user.studentProfile?.age || "",
        course: user.studentProfile?.course || "English",
        parentName: user.studentProfile?.parentName || "",
        parentEmail: user.studentProfile?.parentEmail || "",
        parentPhone: user.studentProfile?.parentPhone || "",
        mark: user.studentProfile?.mark || "",
        teacher: user.studentProfile?.teacher?._id || user.studentProfile?.teacher || ""
      }
    });
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) {
      return;
    }

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
      const params = Object.fromEntries(
        Object.entries(reportFilters).filter(([, value]) => Boolean(value))
      );
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
  const todayAbsent = countStatus(dashboard?.stats.todayAttendance, "Absent");

  return (
    <AppLayout title="Admin dashboard" subtitle="Overview, profiles, attendance, and reports.">
      <div className="grid gap-6">
        <ErrorAlert message={error} />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            icon={Users}
            label="Total students"
            value={dashboard?.stats.totalStudents || 0}
            tone="teal"
          />
          <StatTile
            icon={UserRound}
            label="Total teachers"
            value={dashboard?.stats.totalTeachers || 0}
            tone="sky"
          />
          <StatTile icon={CheckCircle2} label="Present today" value={todayPresent} tone="teal" />
          <StatTile icon={XCircle} label="Absent today" value={todayAbsent} tone="rose" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">User management</h2>
                <p className="text-sm text-slate-500">Create and update school accounts.</p>
              </div>
              {editingId ? (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Role
                  <select
                    className="input"
                    value={form.role}
                    disabled={Boolean(editingId)}
                    onChange={(event) => updateForm("role", event.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="field">
                  Status
                  <select
                    className="input"
                    value={form.status}
                    onChange={(event) => updateForm("status", event.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Full name
                  <input
                    className="input"
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    required
                  />
                </label>
                <label className="field">
                  Email
                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateForm("email", event.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Password
                  <input
                    className="input"
                    type="password"
                    value={form.password}
                    onChange={(event) => updateForm("password", event.target.value)}
                    minLength={8}
                    required={!editingId}
                    placeholder={editingId ? "Leave blank to keep current password" : ""}
                  />
                </label>
                <label className="field">
                  Phone
                  <input
                    className="input"
                    value={form.phone}
                    onChange={(event) => updateForm("phone", event.target.value)}
                  />
                </label>
              </div>

              {form.role === "teacher" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="field">
                    Subject
                    <input
                      className="input"
                      value={form.teacherProfile.subject}
                      onChange={(event) => updateForm("teacherProfile.subject", event.target.value)}
                      required
                    />
                  </label>
                  <label className="field">
                    Contact info
                    <input
                      className="input"
                      value={form.teacherProfile.contactInfo}
                      onChange={(event) => updateForm("teacherProfile.contactInfo", event.target.value)}
                    />
                  </label>
                </div>
              ) : null}

              {form.role === "student" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="field">
                    Age
                    <input
                      className="input"
                      type="number"
                      min="3"
                      max="80"
                      value={form.studentProfile.age}
                      onChange={(event) => updateForm("studentProfile.age", event.target.value)}
                      required
                    />
                  </label>
                  <label className="field">
                    Course
                    <input
                      className="input"
                      value={form.studentProfile.course}
                      onChange={(event) => updateForm("studentProfile.course", event.target.value)}
                      required
                    />
                  </label>
                  <label className="field">
                    Parent name
                    <input
                      className="input"
                      value={form.studentProfile.parentName}
                      onChange={(event) => updateForm("studentProfile.parentName", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    Parent email
                    <input
                      className="input"
                      type="email"
                      value={form.studentProfile.parentEmail}
                      onChange={(event) => updateForm("studentProfile.parentEmail", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    Parent phone
                    <input
                      className="input"
                      value={form.studentProfile.parentPhone}
                      onChange={(event) => updateForm("studentProfile.parentPhone", event.target.value)}
                    />
                  </label>
                  <label className="field">
                    Mark
                    <input
                      className="input"
                      value={form.studentProfile.mark}
                      onChange={(event) => updateForm("studentProfile.mark", event.target.value)}
                    />
                  </label>
                  <label className="field sm:col-span-2">
                    Assigned teacher
                    <select
                      className="input"
                      value={form.studentProfile.teacher}
                      onChange={(event) => updateForm("studentProfile.teacher", event.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} - {teacher.teacherProfile?.subject || "Teacher"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}

              <button className="btn-primary justify-center" type="submit" disabled={saving}>
                {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {saving ? "Saving" : editingId ? "Update user" : "Create user"}
              </button>
            </form>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Profiles</h2>
                <p className="text-sm text-slate-500">{users.length} active records in this view.</p>
              </div>
              <button type="button" className="btn-secondary" onClick={loadData}>
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Name</th>
                    <th className="px-3 py-3 font-semibold">Role</th>
                    <th className="px-3 py-3 font-semibold">Course/Subject</th>
                    <th className="px-3 py-3 font-semibold">Contact</th>
                    <th className="px-3 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user._id} className="align-top">
                      <td className="px-3 py-3">
                        <p className="font-medium text-slate-950">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {roleLabel[user.role]}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {user.role === "student"
                          ? user.studentProfile?.course
                          : user.role === "teacher"
                            ? user.teacherProfile?.subject
                            : "Management"}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {user.role === "student"
                          ? user.studentProfile?.parentEmail || user.studentProfile?.parentPhone
                          : user.phone || user.teacherProfile?.contactInfo || "No contact"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className="icon-btn" onClick={() => editUser(user)} title="Edit user">
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="icon-btn-danger"
                            onClick={() => deleteUser(user)}
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
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

        <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-md bg-amber-50 p-2 text-amber-900">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Recent absences</h2>
                <p className="text-sm text-slate-500">Latest students marked absent.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {dashboard?.recentAbsences?.length ? (
                dashboard.recentAbsences.map((record) => (
                  <div key={record._id} className="rounded-md border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{record.student?.name || "Student"}</p>
                        <p className="text-sm text-slate-500">
                          {record.date} by {record.teacher?.name || "Teacher"}
                        </p>
                      </div>
                      <StatusBadge value={record.status} />
                    </div>
                    {record.note ? <p className="mt-2 text-sm text-slate-600">{record.note}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No absences recorded yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-sky-50 p-2 text-sky-800">
                  <ClipboardList className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Attendance report</h2>
                  <p className="text-sm text-slate-500">Filter and review attendance records.</p>
                </div>
              </div>
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <input
                type="date"
                className="input"
                value={reportFilters.from}
                onChange={(event) => setReportFilters((current) => ({ ...current, from: event.target.value }))}
              />
              <input
                type="date"
                className="input"
                value={reportFilters.to}
                onChange={(event) => setReportFilters((current) => ({ ...current, to: event.target.value }))}
              />
              <select
                className="input"
                value={reportFilters.status}
                onChange={(event) => setReportFilters((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="">All statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
              <button type="button" className="btn-secondary justify-center" onClick={loadReports}>
                <Search className="h-4 w-4" aria-hidden="true" />
                Filter
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Date</th>
                    <th className="px-3 py-3 font-semibold">Student</th>
                    <th className="px-3 py-3 font-semibold">Teacher</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((record) => (
                    <tr key={record._id}>
                      <td className="px-3 py-3">{record.date}</td>
                      <td className="px-3 py-3">{record.student?.name || "Student"}</td>
                      <td className="px-3 py-3">{record.teacher?.name || "Teacher"}</td>
                      <td className="px-3 py-3">
                        <StatusBadge value={record.status} />
                      </td>
                      <td className="px-3 py-3 text-slate-600">{record.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
