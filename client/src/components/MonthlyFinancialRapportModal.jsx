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
  FileSpreadsheet,
  Calculator,
  Percent,
  Layers,
  Building2,
  Sparkles
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

  // Teacher payout / percentage configuration
  // Modes: "tiered" (≤7: 15k, 8-11: 20k, 12-19: 30k, 20+: 40k), "percentage", "per_student"
  const [commissionMode, setCommissionMode] = useState("tiered");
  const [customPercentage, setCustomPercentage] = useState(30);
  const [customPerStudent, setCustomPerStudent] = useState(2000);

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
      const sGroup = (st?.groupName || "").toLowerCase();
      const sPhone = (st?.phone || "");

      const matchSearch =
        !q ||
        sName.includes(q) ||
        sCourse.includes(q) ||
        sGroup.includes(q) ||
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

  // ── Compute Teacher Net Share & Group-by-Group Breakdown ────────────────
  const teacherCompensation = useMemo(() => {
    const students = rapportData?.students || [];
    if (students.length === 0) {
      return { totalTeacherNet: 0, totalSchoolNet: 0, groupBreakdowns: [] };
    }

    // Group students by groupName or course
    const groupsMap = {};
    students.forEach((st) => {
      const gKey = st.groupName || st.course || "General";
      if (!groupsMap[gKey]) groupsMap[gKey] = [];
      groupsMap[gKey].push(st);
    });

    let totalTeacherNet = 0;
    const groupBreakdowns = Object.entries(groupsMap).map(([gName, gStudents]) => {
      const count = gStudents.length;
      const collectedTuition = gStudents.reduce((acc, s) => acc + (s.paidTuition || 0), 0);
      const paidStudentsCount = gStudents.filter((s) => (s.paidTuition || 0) > 0).length;

      let groupTeacherPayout = 0;

      if (commissionMode === "tiered") {
        // Standard TFC Tiered Group Logic:
        // ≤ 7 students: 15,000 DA
        // 8 - 11 students: 20,000 DA
        // 12 - 19 students: 30,000 DA
        // 20 - 25 students: 40,000 DA
        // > 25 students: 40,000 DA + 1,500 DA per additional student
        if (count <= 0) groupTeacherPayout = 0;
        else if (count <= 7) groupTeacherPayout = 15000;
        else if (count <= 11) groupTeacherPayout = 20000;
        else if (count <= 19) groupTeacherPayout = 30000;
        else if (count <= 25) groupTeacherPayout = 40000;
        else groupTeacherPayout = 40000 + (count - 25) * 1500;
      } else if (commissionMode === "percentage") {
        const rate = (Number(customPercentage) || 30) / 100;
        groupTeacherPayout = Math.round(collectedTuition * rate);
      } else if (commissionMode === "per_student") {
        const rate = Number(customPerStudent) || 2000;
        groupTeacherPayout = paidStudentsCount * rate;
      }

      totalTeacherNet += groupTeacherPayout;

      const effectivePercentage =
        collectedTuition > 0
          ? ((groupTeacherPayout / collectedTuition) * 100).toFixed(1)
          : 0;

      return {
        groupName: gName,
        totalCount: count,
        paidCount: paidStudentsCount,
        collectedTuition,
        teacherPayout: groupTeacherPayout,
        effectivePercentage
      };
    });

    const totalSchoolNet = Math.max(0, summary.totalGrandCollected - totalTeacherNet);

    return {
      totalTeacherNet,
      totalSchoolNet,
      groupBreakdowns
    };
  }, [rapportData, commissionMode, customPercentage, customPerStudent, summary.totalGrandCollected]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 md:p-6 animate-fade-in overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="w-full max-w-6xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col my-2 sm:my-4 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] overflow-hidden print:max-h-none print:border-none print:shadow-none shrink-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 px-5 sm:px-6 py-3.5 sm:py-4 text-white flex flex-wrap items-center justify-between gap-4 shrink-0 sticky top-0 z-20 print:bg-none print:text-black print:p-0 print:border-b print:pb-4">
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
            <div className="rounded-2xl border border-brand-200 dark:border-brand-800/60 bg-gradient-to-br from-brand-600 to-indigo-700 p-3.5 sm:p-4 space-y-1 text-white shadow-md col-span-2 sm:col-span-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-100">
                Grand Total Cash
              </span>
              <p className="text-lg sm:text-xl font-black">
                {summary.totalGrandCollected.toLocaleString()} <span className="text-xs font-semibold text-brand-200">DA</span>
              </p>
              <p className="text-[11px] text-brand-100 font-medium">
                Tuition + Assurance
              </p>
            </div>
          </div>

          {/* ── Teacher Net Payout & Commission Breakdown (Row 2) ─────────── */}
          <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-slate-850 dark:via-slate-900 dark:to-indigo-950/30 p-4 sm:p-5 shadow-sm space-y-4">
            
            {/* Top Bar: Calculator Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Calculator className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    Teacher Compensation & Share (صافي حصة الأستاذ)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mode: {commissionMode === "tiered" ? "Standard Group Size Scaling (≤7: 15k, 8-11: 20k, 20+: 40k)" : commissionMode === "percentage" ? `${customPercentage}% of Collected Tuition` : `${customPerStudent.toLocaleString()} DA / Student`}
                  </p>
                </div>
              </div>

              {/* Commission Mode Switcher */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-2xs print:hidden">
                <button
                  type="button"
                  onClick={() => setCommissionMode("tiered")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    commissionMode === "tiered"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                  title="≤7: 15,000 DA | 8-11: 20,000 DA | 12-19: 30,000 DA | 20+: 40,000 DA"
                >
                  🏢 Group Tiers (15k/20k/40k)
                </button>

                <button
                  type="button"
                  onClick={() => setCommissionMode("percentage")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    commissionMode === "percentage"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <Percent className="h-3 w-3 inline mr-1" /> Percentage %
                </button>

                <button
                  type="button"
                  onClick={() => setCommissionMode("per_student")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    commissionMode === "per_student"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  👤 Per Student
                </button>
              </div>
            </div>

            {/* Quick Percentage Adjuster (if percentage mode) */}
            {commissionMode === "percentage" && (
              <div className="flex flex-wrap items-center gap-3 bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-indigo-100 dark:border-slate-700 print:hidden">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Quick Rates:</span>
                {[20, 25, 28, 30, 33, 35, 40].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setCustomPercentage(rate)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                      customPercentage === rate
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                  <label className="text-xs font-bold text-slate-500">Custom:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={customPercentage}
                    onChange={(e) => setCustomPercentage(Math.max(1, Number(e.target.value)))}
                    className="w-16 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-black text-slate-900 dark:text-white text-center"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>
            )}

            {/* Quick Per-Student Rate Adjuster */}
            {commissionMode === "per_student" && (
              <div className="flex flex-wrap items-center gap-3 bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl border border-indigo-100 dark:border-slate-700 print:hidden">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Presets:</span>
                {[1500, 1800, 2000, 2200, 2500].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setCustomPerStudent(rate)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                      customPerStudent === rate
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {rate.toLocaleString()} DA
                  </button>
                ))}
              </div>
            )}

            {/* Big Two-Box Financial Share: Teacher Share vs School Net */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Box 1: Teacher Net Payout */}
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 text-white shadow-md flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
                      🧑‍🏫 Teacher Net Share (صافي الأستاذ)
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
                    {teacherCompensation.totalTeacherNet.toLocaleString()}{" "}
                    <span className="text-sm font-bold text-indigo-200">DA</span>
                  </p>
                  <p className="text-[11px] text-indigo-100/90 font-semibold mt-0.5">
                    {summary.totalCollectedTuition > 0
                      ? `≈ ${((teacherCompensation.totalTeacherNet / summary.totalCollectedTuition) * 100).toFixed(1)}% of collected tuition`
                      : "Calculated across active groups"}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm text-white font-black text-sm shadow-sm">
                  {teacherCompensation.groupBreakdowns.length} Grp
                </div>
              </div>

              {/* Box 2: School / Center Net Share */}
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 p-4 text-white shadow-md flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                      🏫 Center / School Net (صافي المركز)
                    </span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
                    {teacherCompensation.totalSchoolNet.toLocaleString()}{" "}
                    <span className="text-sm font-bold text-emerald-200">DA</span>
                  </p>
                  <p className="text-[11px] text-emerald-100/90 font-semibold mt-0.5">
                    Grand Cash ({summary.totalGrandCollected.toLocaleString()} DA) − Teacher Net
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm text-white">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Group-by-Group Roster Breakdown Cards */}
            {teacherCompensation.groupBreakdowns.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Group-by-Group Payout Breakdown:
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {teacherCompensation.groupBreakdowns.map((gb) => (
                    <div
                      key={gb.groupName}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-indigo-500" />
                          {gb.groupName}
                        </span>
                        <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-black">
                          {gb.totalCount} Students
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-700 font-semibold">
                        <span className="text-slate-400 text-[11px]">Collected Tuition:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {gb.collectedTuition.toLocaleString()} DA
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-black bg-indigo-50/50 dark:bg-indigo-950/30 p-2 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40">
                        <span className="text-indigo-900 dark:text-indigo-200 text-[11px]">Teacher Payout:</span>
                        <span className="text-indigo-700 dark:text-indigo-300 text-sm">
                          {gb.teacherPayout.toLocaleString()} DA
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                      <th className="py-3 px-4">Group / Course</th>
                      <th className="py-3 px-4 text-right">Tuition Fee</th>
                      <th className="py-3 px-4 text-center">Paid Amount</th>
                      <th className="py-3 px-4 text-center text-indigo-600 dark:text-indigo-400">Teacher Share</th>
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

                      // Student row teacher share estimate
                      let studentTeacherShare = 0;
                      if (commissionMode === "percentage") {
                        studentTeacherShare = Math.round((st.paidTuition || 0) * ((Number(customPercentage) || 30) / 100));
                      } else if (commissionMode === "per_student") {
                        studentTeacherShare = (st.paidTuition || 0) > 0 ? Number(customPerStudent) || 2000 : 0;
                      } else {
                        // In tiered mode: calculate proportion of group payout
                        studentTeacherShare = Math.round((st.paidTuition || 0) * 0.28);
                      }

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

                          {/* Group & Course */}
                          <td className="py-3.5 px-4">
                            <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                              {st.groupName || st.course}
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

                          {/* Teacher Share */}
                          <td className="py-3.5 px-4 text-center font-black">
                            <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg text-xs font-bold">
                              {studentTeacherShare > 0 ? `${studentTeacherShare.toLocaleString()} DA` : "0 DA"}
                            </span>
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
