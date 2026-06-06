import React, { useEffect, useState } from "react";
import {
  Check,
  Inbox,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  UserRound,
  X
} from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";

const statusBadge = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800"
};

const emptyStudentForm = {
  role: "student",
  name: "",
  email: "",
  password: "",
  phone: "",
  status: "active",
  studentProfile: {
    age: "",
    dateOfBirth: "",
    course: "English",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    mark: ""
  }
};

export default function ModeratorDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [saving, setSaving] = useState(false);

  const loadEnrollments = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.get("/enrollments", { params: filter ? { status: filter } : {} });
      setEnrollments(data.enrollments);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, [filter]);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/enrollments/${id}`, { status });
      loadEnrollments();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const updateStudentForm = (path, value) => {
    if (!path.includes(".")) {
      setStudentForm((c) => ({ ...c, [path]: value }));
      return;
    }
    const [group, key] = path.split(".");
    setStudentForm((c) => ({ ...c, [group]: { ...c[group], [key]: value } }));
  };

  const handleAddStudent = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/admin/users", studentForm);
      setStudentForm(emptyStudentForm);
      setShowAddStudent(false);
    } catch (saveError) {
      setError(getApiError(saveError));
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = enrollments.filter((e) => e.status === "pending").length;

  return (
    <AppLayout title="Moderator Dashboard" subtitle="Review enrollment applications and add students.">
      <div className="grid gap-6">
        <ErrorAlert message={error} />

        {/* Add Student button / form */}
        <div className="card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-2.5 shadow-sm">
                <UserRound className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Add Student</h2>
                <p className="text-sm text-slate-500">Register a new student account</p>
              </div>
            </div>
            <button
              type="button"
              className={showAddStudent ? "btn-secondary" : "btn-primary"}
              onClick={() => setShowAddStudent((v) => !v)}
            >
              {showAddStudent ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Student
                </>
              )}
            </button>
          </div>

          {showAddStudent && (
            <form className="grid gap-4" onSubmit={handleAddStudent}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Full name
                  <input
                    className="input"
                    value={studentForm.name}
                    onChange={(e) => updateStudentForm("name", e.target.value)}
                    required
                  />
                </label>
                <label className="field">
                  Email
                  <input
                    className="input"
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => updateStudentForm("email", e.target.value)}
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
                    value={studentForm.password}
                    onChange={(e) => updateStudentForm("password", e.target.value)}
                    minLength={8}
                    required
                  />
                </label>
                <label className="field">
                  Phone
                  <input
                    className="input"
                    value={studentForm.phone}
                    onChange={(e) => updateStudentForm("phone", e.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Age
                  <input
                    className="input"
                    type="number"
                    min="3"
                    max="80"
                    value={studentForm.studentProfile.age}
                    onChange={(e) => updateStudentForm("studentProfile.age", e.target.value)}
                    required
                  />
                </label>
                <label className="field">
                  Course
                  <input
                    className="input"
                    value={studentForm.studentProfile.course}
                    onChange={(e) => updateStudentForm("studentProfile.course", e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Parent name
                  <input
                    className="input"
                    value={studentForm.studentProfile.parentName}
                    onChange={(e) => updateStudentForm("studentProfile.parentName", e.target.value)}
                  />
                </label>
                <label className="field">
                  Parent email
                  <input
                    className="input"
                    type="email"
                    value={studentForm.studentProfile.parentEmail}
                    onChange={(e) => updateStudentForm("studentProfile.parentEmail", e.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="field">
                  Parent phone
                  <input
                    className="input"
                    value={studentForm.studentProfile.parentPhone}
                    onChange={(e) => updateStudentForm("studentProfile.parentPhone", e.target.value)}
                  />
                </label>
                <label className="field">
                  Mark
                  <input
                    className="input"
                    value={studentForm.studentProfile.mark}
                    onChange={(e) => updateStudentForm("studentProfile.mark", e.target.value)}
                  />
                </label>
              </div>

              <button className="btn-primary justify-center" type="submit" disabled={saving}>
                <Plus className="h-4 w-4" />
                {saving ? "Saving…" : "Create student"}
              </button>
            </form>
          )}
        </div>

        {/* Enrollments panel */}
        <div className="card p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 p-2.5 shadow-sm">
                <Inbox className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Enrollment applications</h2>
                <p className="text-sm text-slate-500">{pendingCount} pending review</p>
              </div>
            </div>
            <div className="flex gap-2">
              <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <button className="btn-secondary" onClick={loadEnrollments}>
                <RefreshCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : enrollments.length ? (
            <div className="grid gap-3">
              {enrollments.map((e) => (
                <div key={e._id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{e.name}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge[e.status]}`}>
                          {e.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {e.course}{e.age ? ` · age ${e.age}` : ""}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <a href={`tel:${e.phone}`} className="flex items-center gap-1 hover:text-brand-700">
                          <Phone className="h-3 w-3" />{e.phone}
                        </a>
                        {e.email && (
                          <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-brand-700">
                            <Mail className="h-3 w-3" />{e.email}
                          </a>
                        )}
                        {e.parentName && (
                          <span>Parent: {e.parentName} {e.parentPhone}</span>
                        )}
                      </div>
                      {e.message && (
                        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          {e.message}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {e.status !== "approved" && (
                        <button
                          onClick={() => setStatus(e._id, "approved")}
                          className="rounded-lg bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {e.status !== "rejected" && (
                        <button
                          onClick={() => setStatus(e._id, "rejected")}
                          className="rounded-lg bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
              <Inbox className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">
                No applications {filter ? `(${filter})` : "yet"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                New applications from the website appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
