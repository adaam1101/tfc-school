import React, { useEffect, useState, useMemo } from "react";
import {
  X,
  Printer,
  Calendar,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  TrendingUp,
  Download,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet
} from "lucide-react";
import { api, getApiError } from "../api/http.js";
import ErrorAlert from "./ErrorAlert.jsx";
import StudentPaymentRowWidget from "./StudentPaymentRowWidget.jsx";

export default function MonthlyFinancialRapportModal({
  onClose,
  teacherId = null,
  teacherName = null
}) {
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  ); // e.g. "2026-08"
  const [teachers, setTeachers] = useState([]);
  const [filterTeacher, setFilterTeacher] = useState(teacherId || "all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [rapportData, setRapportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load teachers list if admin
  useEffect(() => {
    if (!teacherId) {
      api.get("/admin/teachers")
        .then(({ data }) => setTeachers(data.teachers || []))
        .catch(() => {});
    }
  }, [teacherId]);

  const loadRapport = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `/payments/monthly-rapport?month=${selectedMonth}`;
      if (filterTeacher && filterTeacher !== "all") {
        url += `&teacherId=${filterTeacher}`;
      }
      const { data } = await api.get(url);
      setRapportData(data);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRapport();
  }, [selectedMonth, filterTeacher]);

  const handlePaymentUpdated = () => {
    loadRapport();
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredStudents = useMemo(() => {
    if (!rapportData?.students) return [];
    const q = (search || "").toLowerCase().trim();
    return rapportData.students.filter((st) => {
      const sName = (st?.name || "").toLowerCase();
      const sCourse = (st?.course || "").toLowerCase();
      const sPhone = (st?.phone || "");

      const matchSearch =
        !q ||
        sName.includes(q) ||
        sCourse.includes(q) ||
        sPhone.includes(q);

      const matchStatus =
        statusFilter === "all" ||
        st?.status === statusFilter ||
        (statusFilter === "assurance_paid" && Boolean(st?.assurancePaid)) ||
        (statusFilter === "assurance_unpaid" && !Boolean(st?.assurancePaid));

      return matchSearch && matchStatus;
    });
  }, [rapportData, search, statusFilter]);

  const summary = rapportData?.summary || {
    totalStudents: 0,
    totalExpectedTuition: 0,
    totalCollectedTuition: 0,
    totalRestTuition: 0,
    totalAssuranceCollected: 0,
    totalGrandCollected: 0,
    countPaid: 0,
    countPartial: 0,
    countUnpaid: 0,
    countAssurancePaid: 0
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-fade-in overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="w-full max-w-6xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden print:max-h-none print:border-none print:shadow-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 px-6 py-5 text-white flex flex-wrap items-center justify-between gap-4 shrink-0 print:bg-none print:text-black print:p-0 print:border-b print:pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-brand-400 print:hidden">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  Monthly Financial Rapport
                </h2>
                <span className="rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2.5 py-0.5 text-xs font-bold print:hidden">
                  Rapport Mensuel
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                {teacherName ? `Teacher: ${teacherName} · ` : ""}
                Tuition (7,500 DA), Rest & Assurance (800 DA) Tracking
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-2xs active:scale-95"
            >
              <Printer className="h-4 w-4" /> Print / PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Header (Shown during print only) */}
        <div className="hidden print:block p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-900">TFC SCHOOL</h1>
              <p className="text-sm text-slate-600 font-bold">Rapport Mensuel des Paiements & Assurances</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold">Mois: {rapportData?.monthName || selectedMonth}</p>
              <p className="text-slate-500">Date d'impression: {new Date().toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <ErrorAlert message={error} />

          {/* Month Selector & Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              {/* Month Picker */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-600" />
                <label className="text-xs font-black uppercase text-slate-500">Month:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Teacher Selector (If Admin) */}
              {!teacherId && teachers.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black uppercase text-slate-500">Teacher:</label>
                  <select
                    value={filterTeacher}
                    onChange={(e) => setFilterTeacher(e.target.value)}
                    className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white shadow-2xs focus:outline-none"
                  >
                    <option value="all">All Teachers</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.teacherProfile?.subject || "Teacher"})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 min-w-[220px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or course..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Status</option>
                <option value="paid">Fully Paid</option>
                <option value="partial">Partial (With Rest)</option>
                <option value="unpaid">Unpaid</option>
                <option value="assurance_paid">Assurance Paid</option>
                <option value="assurance_unpaid">Assurance Unpaid</option>
              </select>
            </div>
          </div>

          {/* ── KPI Summary Cards ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Total Expected Tuition */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-850 p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Expected Tuition
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {summary.totalExpectedTuition.toLocaleString()} <span className="text-xs font-semibold text-slate-400">DA</span>
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {summary.totalStudents} students × 7,500 DA
              </p>
            </div>

            {/* Collected Tuition */}
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-800 dark:to-slate-850 p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Collected Tuition
              </span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {summary.totalCollectedTuition.toLocaleString()} <span className="text-xs font-semibold text-emerald-500/70">DA</span>
              </p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300 font-medium">
                {summary.countPaid} paid · {summary.countPartial} partial
              </p>
            </div>

            {/* Total Rest / Reste à payer */}
            <div className="rounded-2xl border border-rose-200 dark:border-rose-800/60 bg-gradient-to-br from-rose-50/50 to-white dark:from-slate-800 dark:to-slate-850 p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Rest (Remaining)
              </span>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400">
                {summary.totalRestTuition.toLocaleString()} <span className="text-xs font-semibold text-rose-500/70">DA</span>
              </p>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-300 font-medium">
                {summary.countUnpaid} unpaid students
              </p>
            </div>

            {/* Assurance Collected */}
            <div className="rounded-2xl border border-teal-200 dark:border-teal-800/60 bg-gradient-to-br from-teal-50/50 to-white dark:from-slate-800 dark:to-slate-850 p-4 space-y-1 shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Assurance (800 DA)
              </span>
              <p className="text-xl font-black text-teal-600 dark:text-teal-400">
                {summary.totalAssuranceCollected.toLocaleString()} <span className="text-xs font-semibold text-teal-500/70">DA</span>
              </p>
              <p className="text-[11px] text-teal-700/80 dark:text-teal-300 font-medium">
                {summary.countAssurancePaid} / {summary.totalStudents} covered
              </p>
            </div>

            {/* Grand Total Revenue */}
            <div className="rounded-2xl border border-brand-200 dark:border-brand-800/60 bg-gradient-to-br from-brand-500 to-indigo-600 p-4 space-y-1 text-white shadow-md col-span-2 sm:col-span-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-100">
                Grand Total Cash
              </span>
              <p className="text-xl font-black">
                {summary.totalGrandCollected.toLocaleString()} <span className="text-xs font-semibold text-brand-200">DA</span>
              </p>
              <p className="text-[11px] text-brand-100 font-medium">
                Tuition + Assurance
              </p>
            </div>
          </div>

          {/* ── Detailed Students Financial Table ──────────────────────────── */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-600" />
                Student Financial Breakdown ({filteredStudents.length})
              </h3>
              <span className="text-xs font-bold text-slate-400">
                Period: {rapportData?.monthName || selectedMonth}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600 mb-2" />
                <p className="text-xs font-bold">Generating monthly rapport...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
                <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No student records found</p>
                <p className="text-xs text-slate-400">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Course / Teacher</th>
                      <th className="py-3 px-4 text-right">Tuition Fee</th>
                      <th className="py-3 px-4 text-center">Paid Amount</th>
                      <th className="py-3 px-4 text-right">Rest (Remaining)</th>
                      <th className="py-3 px-4 text-center">Assurance (800 DA)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 print:hidden">Quick Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                    {filteredStudents.map((st, index) => {
                      const isFullyPaid = st.paidTuition >= st.tuitionFee && st.tuitionFee > 0;
                      const isPartial = st.paidTuition > 0 && st.paidTuition < st.tuitionFee;

                      return (
                        <tr
                          key={st.studentId}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors"
                        >
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                            {index + 1}
                          </td>

                          {/* Student Name & Photo */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              {st.photo ? (
                                <img
                                  src={st.photo}
                                  alt={st.name}
                                  className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 font-bold text-xs shrink-0">
                                  {st.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white text-xs">
                                  {st.name}
                                </p>
                                {st.phone && (
                                  <p className="text-[10px] text-slate-400 font-mono">{st.phone}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Course & Teacher */}
                          <td className="py-3.5 px-4">
                            <span className="rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                              {st.course}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">{st.teacher}</p>
                          </td>

                          {/* Tuition Fee (7500 DA) */}
                          <td className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-200">
                            {st.tuitionFee.toLocaleString()} DA
                          </td>

                          {/* Paid Amount */}
                          <td className="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                            {st.paidTuition.toLocaleString()} DA
                          </td>

                          {/* Rest */}
                          <td className="py-3.5 px-4 text-right font-black">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-xs ${
                                isFullyPaid
                                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                                  : isPartial
                                  ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 font-black"
                                  : "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 font-black"
                              }`}
                            >
                              {st.rest.toLocaleString()} DA
                            </span>
                          </td>

                          {/* Assurance Status */}
                          <td className="py-3.5 px-4 text-center">
                            {st.assurancePaid ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 text-[10px] font-black text-teal-700 dark:text-teal-300 shadow-2xs">
                                <ShieldCheck className="h-3 w-3 text-teal-600" />
                                Paid (800 DA)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 text-[10px] font-bold">
                                <ShieldAlert className="h-3 w-3" />
                                Unpaid
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                isFullyPaid
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                                  : isPartial
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                              }`}
                            >
                              {st.status}
                            </span>
                          </td>

                          {/* Quick Update Widget */}
                          <td className="py-3.5 px-4 print:hidden">
                            <StudentPaymentRowWidget
                              compact
                              student={{ _id: st.studentId, name: st.name }}
                              month={selectedMonth}
                              initialPayment={{
                                amount: st.tuitionFee,
                                paidAmount: st.paidTuition,
                                assurancePaid: st.assurancePaid
                              }}
                              onPaymentUpdated={handlePaymentUpdated}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <p className="text-xs text-slate-500 font-medium">
            Total of <strong>{filteredStudents.length}</strong> student record(s) in this rapport.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Printer className="h-4 w-4" /> Print Document
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 text-xs font-bold transition-colors shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
