import React from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Phone,
  UserRound,
  XCircle,
  GraduationCap,
  CreditCard,
  IdCard,
  Wallet,
  RefreshCcw
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api, getApiError } from "../../api/http.js";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import LoadingState from "../../components/LoadingState.jsx";
import StatTile from "../../components/StatTile.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import AppLayout from "../../layouts/AppLayout.jsx";
import AnnouncementsCard from "../../components/AnnouncementsCard.jsx";
import IDCardModal from "../../components/IDCardModal.jsx";
import TimetableGrid from "../../components/TimetableGrid.jsx";

const payStatusBadge = {
  paid:     "bg-emerald-100 text-emerald-700",
  partial:  "bg-amber-100 text-amber-700",
  unpaid:   "bg-rose-100 text-rose-700",
  overdue:  "bg-red-100 text-red-700",
  pending:  "bg-sky-100 text-sky-700"
};

const TABS = [
  { id: "overview",   label: "Overview",   icon: UserRound },
  { id: "timetable",  label: "Timetable",  icon: CalendarDays },
  { id: "payments",   label: "Payments",   icon: Wallet }
];

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [schedules, setSchedules] = useState([]);
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
      <AppLayout title="Student dashboard" subtitle="Profile and attendance history.">
        <LoadingState label="Loading student profile" />
      </AppLayout>
    );
  }

  const student = profile?.student;
  const details = student?.studentProfile || {};

  return (
    <AppLayout title="Student dashboard" subtitle="Your profile and attendance history.">
      <div className="grid gap-6">
        <ErrorAlert message={error} />

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <StatTile icon={CheckCircle2} label="Present records" value={summary.present} tone="teal" />
          <StatTile icon={XCircle}      label="Absent records"  value={summary.absent}  tone="rose" />
          <StatTile icon={BookOpen}     label="Current mark"    value={details.mark || "–"} tone="amber" />
        </section>

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
                    ? "bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Timetable tab */}
        {tab === "timetable" && (
          <section className="card p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-2.5 shadow-sm">
                  <CalendarDays className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">My Timetable</h2>
                  <p className="text-sm text-slate-500">
                    {details.course ? `Course: ${details.course}` : "Your weekly schedule"}
                  </p>
                </div>
              </div>
              <button className="btn-secondary" onClick={loadSchedules}>
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
            <TimetableGrid schedules={schedules} />
          </section>
        )}

        {/* Payments tab */}
        {tab === "payments" && (
          <section className="card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-brand-600 p-2.5 shadow-sm">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">My Payments</h2>
                <p className="text-sm text-slate-500">Your full payment history</p>
              </div>
            </div>

            {payments.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Period / Month", "Amount", "Paid", "Due date", "Status"].map((h) => (
                        <th key={h} className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400 first:pl-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 pl-2 pr-4 font-semibold text-slate-800">{p.period || p.month || "–"}</td>
                        <td className="py-3 pr-4 text-slate-700">{(p.amount || 0).toLocaleString()} DA</td>
                        <td className="py-3 pr-4 text-slate-600">{(p.paidAmount || 0).toLocaleString()} DA</td>
                        <td className="py-3 pr-4 text-xs text-slate-500">
                          {p.dueDate ? new Date(p.dueDate).toLocaleDateString("en-GB") : "–"}
                        </td>
                        <td className="py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${payStatusBadge[p.status] || "bg-slate-100 text-slate-600"}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 text-center">
                <Wallet className="h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-500">No payment records yet</p>
              </div>
            )}
          </section>
        )}

        {/* Overview tab */}
        {tab === "overview" && (
          <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
            {/* Profile card */}
            <div className="card p-6">
              {/* Avatar header */}
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-600 text-3xl font-bold text-white shadow-lg">
                  {student?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900">{student?.name}</h2>
                <p className="mt-0.5 text-sm text-slate-500">{student?.email}</p>
                {details.rfidCardLast4 && (
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                    <CreditCard className="h-3 w-3" />
                    RFID card …{details.rfidCardLast4}
                  </span>
                )}
              </div>

              {/* Attendance rate bar */}
              {summary.total > 0 && (
                <div className="mb-6">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600">Attendance rate</span>
                    <span className={summary.rate >= 75 ? "text-emerald-700" : "text-rose-700"}>
                      {summary.rate}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
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

              {/* Details */}
              <dl className="grid gap-3 text-sm">
                {[
                  { label: "Age",     icon: UserRound,    value: details.age || "–"                              },
                  { label: "Course",  icon: GraduationCap, value: details.course || "–"                          },
                  { label: "Teacher", icon: BookOpen,      value: profile?.teacher?.name || "Not assigned"       },
                  { label: "Parent",  icon: UserRound,     value: details.parentName || "–"                      },
                  { label: "Contact", icon: Phone,         value: details.parentPhone || details.parentEmail || "–" }
                ].map(({ label, icon: Icon, value }) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 text-slate-500">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {label}
                    </span>
                    <span className="font-semibold text-slate-800 text-right">{value}</span>
                  </div>
                ))}
              </dl>

              <button onClick={() => setShowIdCard(true)} className="btn-secondary mt-4 w-full justify-center">
                <IdCard className="h-4 w-4" />
                View my ID card
              </button>
            </div>

            {/* Attendance history */}
            <div className="card p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-2.5 shadow-sm">
                  <CalendarDays className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Attendance history</h2>
                  <p className="text-sm text-slate-500">Most recent 90 records</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 pl-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
                      <th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                      <th className="pb-3 pr-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Teacher</th>
                      <th className="pb-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {profile?.attendanceHistory?.length ? (
                      profile.attendanceHistory.map((record) => (
                        <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 pl-2 pr-4 font-mono text-xs text-slate-600">{record.date}</td>
                          <td className="py-3 pr-4">
                            <StatusBadge value={record.status} />
                          </td>
                          <td className="py-3 pr-4 text-slate-700">{record.teacher?.name || "Teacher"}</td>
                          <td className="py-3 text-slate-500 text-xs">{record.note || "–"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-10 text-center text-sm text-slate-400" colSpan="4">
                          No attendance records yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {tab === "overview" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <AnnouncementsCard />

            {/* My fees (quick summary in overview) */}
            <div className="card p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-brand-600 p-2.5 shadow-sm">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">My fees</h2>
                  <p className="text-sm text-slate-500">Latest payment records</p>
                </div>
              </div>

              {payments.length ? (
                <div className="grid gap-2">
                  {payments.slice(0, 5).map((p) => (
                    <div key={p._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800">{p.period || p.month || "–"}</p>
                        <p className="text-xs text-slate-500">{(p.paidAmount || 0).toLocaleString()} / {(p.amount || 0).toLocaleString()} DA</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${payStatusBadge[p.status] || "bg-slate-100 text-slate-600"}`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                  {payments.length > 5 && (
                    <button
                      type="button"
                      className="btn-secondary w-full justify-center text-xs"
                      onClick={() => setTab("payments")}
                    >
                      View all {payments.length} records
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
                  <Wallet className="h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">No fee records yet</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {showIdCard && student && <IDCardModal user={student} onClose={() => setShowIdCard(false)} />}
    </AppLayout>
  );
}
