import React, { useEffect, useState, useCallback } from "react";
import {
  Check, Inbox, Mail, Phone, RefreshCcw, UserRound, X,
  Users, GraduationCap, BookOpen, CheckCircle2, XCircle,
  Clock, Search, BadgeCheck, AlertCircle
} from "lucide-react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";

// ── helpers ───────────────────────────────────────────────────────────────────

const statusBadge = {
  pending:  "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
};

const paymentColor = {
  paid:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  unpaid:  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  overdue: "bg-rose-200 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200",
  pending: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
};

function initials(name = "") {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

const TABS = [
  { id: "students",    label: "Students",    icon: Users },
  { id: "teachers",   label: "Teachers",    icon: GraduationCap },
  { id: "enrollments",label: "Enrollments", icon: Inbox }
];

// ── Students tab ──────────────────────────────────────────────────────────────

function StudentsTab() {
  const [students, setStudents]   = useState([]);
  const [payments, setPayments]   = useState({}); // studentId → latest payment
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [usersRes, paymentsRes] = await Promise.all([
        api.get("/admin/users", { params: { role: "student" } }),
        api.get("/payments")
      ]);
      setStudents(usersRes.data.users || []);

      // Map studentId → most recent payment
      const map = {};
      for (const p of (paymentsRes.data.payments || [])) {
        const sid = p.student?._id || p.student;
        if (sid && (!map[sid] || new Date(p.createdAt) > new Date(map[sid].createdAt))) {
          map[sid] = p;
        }
      }
      setPayments(map);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const q = search.toLowerCase();
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(q) ||
    (s.studentProfile?.course || "").toLowerCase().includes(q) ||
    (s.studentProfile?.teacher?.name || "").toLowerCase().includes(q)
  );

  const present = students.length;
  const paidCount   = students.filter(s => payments[s._id]?.status === "paid").length;
  const unpaidCount = students.filter(s => !payments[s._id] || payments[s._id]?.status === "unpaid" || payments[s._id]?.status === "overdue").length;

  return (
    <div className="space-y-5">
      <ErrorAlert message={error} />

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users,        label: "Total students", value: present,    color: "from-brand-500 to-brand-700",     bg: "bg-brand-50 dark:bg-brand-950/40",    num: "text-brand-800 dark:text-brand-200" },
          { icon: CheckCircle2, label: "Paid",            value: paidCount,  color: "from-emerald-500 to-teal-600",   bg: "bg-emerald-50 dark:bg-emerald-950/40", num: "text-emerald-800 dark:text-emerald-200" },
          { icon: XCircle,      label: "Unpaid / overdue",value: unpaidCount, color: "from-rose-500 to-red-600",       bg: "bg-rose-50 dark:bg-rose-950/40",       num: "text-rose-800 dark:text-rose-200" }
        ].map(({ icon: Icon, label, value, color, bg, num }) => (
          <div key={label} className={`rounded-2xl p-4 ${bg}`}>
            <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <p className={`text-2xl font-black ${num}`}>{value}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pl-9 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="Search by name, course or teacher…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center text-sm text-slate-400 py-10">Loading…</p>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                  {["Student", "Course", "Teacher", "Subject", "Phone", "Payment"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">No students found.</td>
                  </tr>
                )}
                {filtered.map(s => {
                  const pay = payments[s._id];
                  const payStatus = pay?.status || "unpaid";
                  const teacher = s.studentProfile?.teacher;
                  return (
                    <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {s.photo
                            ? <img src={s.photo} alt={s.name} className="h-8 w-8 rounded-xl object-cover shrink-0" />
                            : <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-[10px] font-black text-white">{initials(s.name)}</div>
                          }
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</p>
                            <p className="text-[10px] text-slate-400">Age {s.studentProfile?.age || "–"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{s.studentProfile?.course || "–"}</td>
                      <td className="px-4 py-3">
                        {teacher
                          ? <span className="font-medium text-slate-800 dark:text-slate-200">{teacher.name || "–"}</span>
                          : <span className="text-slate-400 italic">Unassigned</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{teacher?.teacherProfile?.subject || "–"}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {s.phone
                          ? <a href={`tel:${s.phone}`} className="hover:text-brand-600">{s.phone}</a>
                          : "–"
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${paymentColor[payStatus] || paymentColor.pending}`}>
                          {payStatus === "paid" ? <BadgeCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          {payStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Teachers tab (read-only monitor) ─────────────────────────────────────────

function TeachersTab() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    api.get("/admin/users", { params: { role: "teacher" } })
      .then(r => setTeachers(r.data.users || []))
      .catch(err => setError(getApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const q = search.toLowerCase();
  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(q) ||
    (t.teacherProfile?.subject || "").toLowerCase().includes(q)
  );

  return (
    <div className="space-y-5">
      <ErrorAlert message={error} />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pl-9 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="Search by name or subject…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-center text-sm text-slate-400 py-10">Loading…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-14 text-center">
              <GraduationCap className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="font-bold text-slate-500">No teachers found</p>
            </div>
          )}
          {filtered.map(t => {
            const studentCount = t.teacherProfile?.assignedStudents?.length || 0;
            return (
              <div key={t._id} className="card overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-brand-500 to-brand-700" />
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {t.photo
                      ? <img src={t.photo} alt={t.name} className="h-12 w-12 rounded-2xl object-cover shrink-0" />
                      : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-black text-white">{initials(t.name)}</div>
                    }
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 dark:text-slate-100 truncate">{t.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{t.teacherProfile?.subject || "No subject set"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">{studentCount} student{studentCount !== 1 ? "s" : ""} assigned</span>
                    </div>
                    {t.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <a href={`tel:${t.phone}`} className="text-slate-500 dark:text-slate-400 hover:text-brand-600">{t.phone}</a>
                      </div>
                    )}
                    {t.teacherProfile?.contactInfo && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-500 dark:text-slate-400 truncate">{t.teacherProfile.contactInfo}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      t.status === "active"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    }`}>{t.status}</span>
                    <span className="text-[10px] text-slate-300 dark:text-slate-600">read-only</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Enrollments tab (existing logic) ─────────────────────────────────────────

function EnrollmentsTab() {
  const [enrollments, setEnrollments] = useState([]);
  const [filter, setFilter]           = useState("");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/enrollments", { params: filter ? { status: filter } : {} });
      setEnrollments(data.enrollments);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/enrollments/${id}`, { status });
      load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const pendingCount = enrollments.filter(e => e.status === "pending").length;

  return (
    <div className="space-y-4">
      <ErrorAlert message={error} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">{pendingCount} pending review</p>
        <div className="flex gap-2">
          <select className="input text-sm py-2" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="btn-secondary py-2" onClick={load}>
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : enrollments.length ? (
        <div className="grid gap-3">
          {enrollments.map(e => (
            <div key={e._id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{e.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge[e.status]}`}>{e.status}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{e.course}{e.age ? ` · age ${e.age}` : ""}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <a href={`tel:${e.phone}`} className="flex items-center gap-1 hover:text-brand-600"><Phone className="h-3 w-3" />{e.phone}</a>
                    {e.email && <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-brand-600"><Mail className="h-3 w-3" />{e.email}</a>}
                    {e.parentName && <span>Parent: {e.parentName} {e.parentPhone}</span>}
                  </div>
                  {e.message && <p className="mt-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">{e.message}</p>}
                </div>
                <div className="flex gap-2">
                  {e.status !== "approved" && (
                    <button onClick={() => setStatus(e._id, "approved")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 transition" title="Approve">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {e.status !== "rejected" && (
                    <button onClick={() => setStatus(e._id, "rejected")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 transition" title="Reject">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-14 text-center">
          <Inbox className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">No applications {filter ? `(${filter})` : "yet"}</p>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ModeratorDashboard() {
  const [tab, setTab] = useState("students");

  return (
    <AppLayout title="Moderator Dashboard" subtitle="Monitor students, teachers and enrollment applications.">
      <div className="grid gap-6">

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            );
          })}
        </div>

        {tab === "students"     && <StudentsTab />}
        {tab === "teachers"     && <TeachersTab />}
        {tab === "enrollments"  && <EnrollmentsTab />}

      </div>
    </AppLayout>
  );
}
