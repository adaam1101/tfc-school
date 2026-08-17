import React, { useContext } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  MessageSquareText,
  RefreshCcw,
  Users,
  XCircle,
  UserRound,
  IdCard,
  Clock,
  Smartphone,
  LayoutList,
  Megaphone,
  Trash2,
  BookOpen,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import TeacherGroupsPanel, { GroupBroadcastModal } from "../../components/TeacherGroupsPanel.jsx";
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
import TeacherCourseworkPanel from "../../components/TeacherCourseworkPanel.jsx";
import StudentPaymentRowWidget from "../../components/StudentPaymentRowWidget.jsx";
import MonthlyFinancialRapportModal from "../../components/MonthlyFinancialRapportModal.jsx";

const TAB_IDS = [
  { id: "attendance", key: "attendance", icon: ClipboardCheck },
  { id: "groups",     key: "studentsGroups", icon: LayoutList },
  { id: "timetable",  key: "timetable",  icon: CalendarDays },
  { id: "coursework", label: "Lessons & assignments", icon: BookOpen }
];

const countStatus = (students, status) =>
  students.filter((s) => s.todayAttendance?.status === status).length;

const getTodayDateKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const shiftDateKey = (currentDateStr, days) => {
  const d = new Date((currentDateStr || getTodayDateKey()) + "T00:00:00");
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatDisplayDate = (dateStr, lang = "en") => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const locale = lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-GB";
  return d.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

export default function TeacherDashboard() {
  const { lang } = useLang(); const t = T[lang];
  const [data, setData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [notes, setNotes] = useState({});
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showIdCard, setShowIdCard] = useState(false);
  const [tab, setTab] = useState("attendance");
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateKey());

  // Filtering states
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [expandedNotes, setExpandedNotes] = useState({});
  const [showFilterGroupBroadcast, setShowFilterGroupBroadcast] = useState(false);
  const [editingSessionsStudent, setEditingSessionsStudent] = useState(null);
  const [editingCourseStudent, setEditingCourseStudent] = useState(null);
  const [observationsStudent, setObservationsStudent] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [showMonthlyRapport, setShowMonthlyRapport] = useState(false);

  const handleBulkAttendance = async (status) => {
    if (filteredStudents.length === 0) return;
    if (!window.confirm(`Mark all ${filteredStudents.length} displayed student(s) as ${status} for ${selectedDate}?`)) return;

    setBulkSaving(true);
    try {
      const studentIds = filteredStudents.map((s) => s._id);
      await api.post("/teacher/attendance/bulk", { studentIds, status, date: selectedDate });
      await loadDashboard(selectedDate);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBulkSaving(false);
    }
  };

  const getAvatarGradient = (name = "") => {
    const gradients = [
      "from-indigo-500 via-purple-500 to-pink-500",
      "from-blue-500 via-teal-500 to-emerald-500",
      "from-amber-500 via-orange-500 to-rose-500",
      "from-cyan-500 via-blue-600 to-indigo-700",
      "from-pink-500 via-rose-500 to-red-500"
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  const students = data?.students || [];

  const courses = useMemo(() => {
    const list = new Set();
    students.forEach((s) => {
      if (s.studentProfile?.course) {
        list.add(s.studentProfile.course);
      }
    });
    return Array.from(list);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedGroup !== "all") {
        const group = groups.find((g) => g._id === selectedGroup);
        if (!group) return false;
        const studentIds = (group.students || []).map((st) => st._id || st);
        if (!studentIds.includes(s._id)) return false;
      }
      if (selectedCourse !== "all") {
        if (s.studentProfile?.course !== selectedCourse) return false;
      }
      if (selectedStatus !== "all") {
        const isStopped = s.studentProfile?.isStopped || s.status === "stopped";
        if (selectedStatus === "stopped" && !isStopped) return false;
        if (selectedStatus === "active" && isStopped) return false;
      }
      return true;
    });
  }, [students, groups, selectedGroup, selectedCourse, selectedStatus]);

  const presentCount = countStatus(students, "Present");
  const absentCount = countStatus(students, "Absent");
  const unmarkedCount = students.length - presentCount - absentCount;

  const loadDashboard = async (targetDate) => {
    const activeDate = targetDate || selectedDate;
    setError("");
    setLoading(true);
    try {
      const [dashRes, groupsRes] = await Promise.all([
        api.get(`/teacher/dashboard?date=${activeDate}`),
        api.get("/teacher/groups")
      ]);
      setData(dashRes.data);
      setGroups(groupsRes.data.groups || []);
      
      const nextNotes = {};
      dashRes.data.students.forEach((s) => {
        nextNotes[s._id] = s.todayAttendance?.note || "";
      });
      setNotes(nextNotes);
    } catch (loadError) {
      setError(getApiError(loadError));
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    if (!newDate) return;
    setSelectedDate(newDate);
    loadDashboard(newDate);
  };

  const handleResetAttendance = async () => {
    if (!window.confirm("Are you sure you want to clear all previous attendance history to start counting fresh from Next Monday?")) return;
    try {
      const { data: res } = await api.post("/teacher/attendance/clear-past");
      setMessage(res.message || "Attendance history cleared! Counting starts fresh from Next Monday.");
      await loadDashboard(selectedDate);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleToggleStatus = async (student) => {
    const isCurrentlyStopped = student.studentProfile?.isStopped || student.status === "stopped";
    const nextStopped = !isCurrentlyStopped;
    const confirmMsg = nextStopped
      ? `Mark ${student.name} as STOPPED? They will be flagged as no longer attending.`
      : `Mark ${student.name} as ACTIVE again?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/teacher/students/${student._id}/status`, { isStopped: nextStopped });
      setMessage(`${student.name} marked as ${nextStopped ? "Stopped ⛔" : "Active 🟢"}.`);
      await loadDashboard(selectedDate);
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const loadSchedules = async () => {
    try {
      const { data: res } = await api.get("/schedules");
      setSchedules(res.schedules || []);
    } catch {
      // silently ignore timetable load errors
    }
  };

  useEffect(() => {
    loadDashboard(selectedDate);
    loadSchedules();
  }, []);

  const markAttendance = async (student, status) => {
    setSavingId(student._id);
    setMessage("");
    setError("");
    try {
      const { data: response } = await api.post("/teacher/attendance", {
        studentId: student._id,
        status,
        note: notes[student._id] || "",
        date: selectedDate
      });

      setData((current) => ({
        ...current,
        students: current.students.map((item) =>
          item._id === student._id ? { ...item, todayAttendance: response.attendance } : item
        )
      }));

      if (status === "Absent") {
        const n = response.attendance.parentNotification;
        setMessage(
          n?.sent
            ? `Parent alert sent for ${student.name}.`
            : `Absent saved for ${student.name}. ${n?.error || "Notification not sent."}`
        );
      } else {
        setMessage(`${student.name} marked present for ${formatDisplayDate(selectedDate, lang)}.`);
      }
    } catch (markError) {
      setError(getApiError(markError));
    } finally {
      setSavingId("");
    }
  };

  if (loading) {
    return (
      <AppLayout title={t.teacherTitle} subtitle={t.teacherSubtitle}>
        <LoadingState label={t.loading} />
      </AppLayout>
    );
  }

  return (
    <AppLayout title={t.teacherTitle} subtitle={t.teacherSubtitle}>
      <div className="grid gap-6">
        {/* Mobile app banner */}
        <div className="flex items-center justify-between rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-emerald-50 dark:border-brand-800 dark:from-brand-950/40 dark:to-emerald-950/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-800 dark:text-brand-200">{t.mobileApp}</p>
              <p className="text-xs text-brand-600 dark:text-brand-400">{t.mobileAppDesc}</p>
            </div>
          </div>
          <Link
            to="/teacher/app"
            className="shrink-0 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:from-brand-700 hover:to-brand-800"
          >
            {t.open}
          </Link>
        </div>

        <ErrorAlert message={error} />

        {message && (
          <div className="animate-fade-slide-up rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
            {message}
          </div>
        )}

        {/* Stats row */}
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users,        label: t.assigned,      value: students.length, gradient: "from-brand-500 to-brand-700",     border: "border-brand-100 dark:border-brand-900",   num: "text-brand-900 dark:text-brand-200"   },
            { icon: CheckCircle2, label: selectedDate === getTodayDateKey() ? t.presentToday2 : `Present (${selectedDate})`,  value: presentCount,    gradient: "from-emerald-500 to-teal-600",    border: "border-emerald-100 dark:border-emerald-900", num: "text-emerald-900 dark:text-emerald-200" },
            { icon: XCircle,      label: selectedDate === getTodayDateKey() ? t.absentToday2 : `Absent (${selectedDate})`,   value: absentCount,     gradient: "from-rose-500 to-red-600",        border: "border-rose-100 dark:border-rose-900",      num: "text-rose-900 dark:text-rose-200"     }
          ].map(({ icon: Icon, label, value, gradient, border, num }) => (
            <div key={label} className={`card-hover border p-5 ${border}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className={`mt-2 text-4xl font-black tracking-tight ${num}`}>{value}</p>
                </div>
                <div className={`rounded-2xl bg-gradient-to-br p-3 shadow-sm ${gradient}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Pill tabs & Monthly Rapport trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {TAB_IDS.map((tab_item) => {
              const Icon = tab_item.icon;
              const active = tab === tab_item.id;
              const label = tab_item.label || t[tab_item.key];
              return (
                <button
                  key={tab_item.id}
                  onClick={() => setTab(tab_item.id)}
                  className={`inline-flex items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-200 dark:shadow-brand-900"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-600 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {tab_item.id === "attendance" && unmarkedCount > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${active ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"}`}>
                      {unmarkedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowMonthlyRapport(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white px-5 py-3 text-sm font-black shadow-md hover:shadow-lg active:scale-98 transition-all"
          >
            <Wallet className="h-4 w-4" />
            <span>📊 Monthly Rapport (7,500 DA / Rest / Assurance)</span>
          </button>
        </div>

        {/* ── Students & Groups tab ── */}
        {tab === "groups" && (
          <section>
            <TeacherGroupsPanel />
          </section>
        )}

        {/* ── Timetable tab ── */}
        {tab === "timetable" && (
          <section>
            <div className="card overflow-hidden">
              {/* Timetable header card */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                      <CalendarDays className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{t.myTimetable}</h2>
                      <p className="text-sm text-brand-200">
                        {data?.teacher?.teacherProfile?.subject || t.myTimetable} · {t.weeklyView}
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
            </div>
          </section>
        )}
        {tab === "coursework" && <TeacherCourseworkPanel />}

        {/* ── Attendance tab ── */}
        {tab === "attendance" && (
          <section>
            {/* Day & Date Attendance Header Card */}
            <div className="card overflow-hidden mb-4">
              <div className="bg-gradient-to-r from-brand-600 via-indigo-700 to-emerald-700 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Left: Day Name, Formatted Date & Completion */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner text-white shrink-0">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight capitalize">
                          {formatDisplayDate(selectedDate, lang)}
                        </h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-sm ${
                          selectedDate === getTodayDateKey()
                            ? "bg-emerald-400 text-emerald-950"
                            : "bg-white/20 text-white"
                        }`}>
                          {selectedDate === getTodayDateKey() ? "🟢 Today" : `📆 ${selectedDate}`}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-emerald-100 font-semibold">
                        <span>{data?.teacher?.teacherProfile?.subject || t.assignedClass}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 opacity-60" />
                        <span>{(presentCount + absentCount)} / {students.length} marked</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 opacity-60" />
                        <span>{students.length > 0 ? Math.round(((presentCount + absentCount) / students.length) * 100) : 0}% Complete</span>
                      </div>

                      {/* Animated completion bar */}
                      <div className="mt-2.5 w-64 max-w-full bg-white/15 backdrop-blur-sm h-2 rounded-full overflow-hidden shadow-inner relative">
                        <div 
                          className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                          style={{ width: `${students.length > 0 ? Math.round(((presentCount + absentCount) / students.length) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Date Navigation & Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Day-by-Day Navigator */}
                    <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleDateChange(shiftDateKey(selectedDate, -1))}
                        className="px-2.5 py-1.5 rounded-xl hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                        title="Previous Day"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" /> Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDateChange(getTodayDateKey())}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          selectedDate === getTodayDateKey()
                            ? "bg-white text-brand-900 shadow-sm"
                            : "hover:bg-white/20 text-white"
                        }`}
                        title="Jump to Today"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDateChange(shiftDateKey(selectedDate, 1))}
                        className="px-2.5 py-1.5 rounded-xl hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                        title="Next Day"
                      >
                        Next <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-2 py-1 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
                        title="Select Date"
                      />
                    </div>

                    <button type="button" className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/25 hover:bg-rose-500/35 border border-rose-300/30 px-3 py-2 text-xs font-bold text-white transition-all active:scale-95" onClick={handleResetAttendance} title="Clear past attendance records">
                      <Trash2 className="h-3.5 w-3.5 text-rose-200" />
                      Reset Past
                    </button>
                    <button type="button" className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-white/25" onClick={() => setShowIdCard(true)}>
                      <IdCard className="h-3.5 w-3.5" />
                      {t.myId}
                    </button>
                    <button type="button" className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-white/25" onClick={() => loadDashboard(selectedDate)}>
                      <RefreshCcw className="h-3.5 w-3.5" />
                      {t.refresh}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Student cards grid */}
            {students.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-700">
                <UserRound className="h-12 w-12 text-slate-350 dark:text-slate-600 mb-3" />
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t.noStudentsAssigned}</p>
                <p className="text-xs text-slate-400 mt-1">{t.askAdmin}</p>
              </div>
            ) : (
              <>
                {/* Filter Bar */}
                <div className="flex flex-wrap gap-4 items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl mb-6 shadow-sm">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Filter by Group
                    </label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 dark:text-slate-250 font-bold"
                    >
                      <option value="all">📁 All Groups</option>
                      {groups.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Filter by Course / Level
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 dark:text-slate-250 font-bold"
                    >
                      <option value="all">🎓 All Levels / Courses</option>
                      {courses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-[170px]">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Status Marker
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 dark:text-slate-250 font-bold"
                    >
                      <option value="all">⚡ All Statuses</option>
                      <option value="active">🟢 Active Only</option>
                      <option value="stopped">⛔ Stopped Only</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-2 self-end">
                    <button
                      type="button"
                      disabled={bulkSaving || filteredStudents.length === 0}
                      onClick={() => handleBulkAttendance("Present")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-600 hover:to-teal-700 transition-all active:scale-95 disabled:opacity-50"
                      title="Mark all displayed students as Present"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Mark All Present ({filteredStudents.length})
                    </button>
                    <button
                      type="button"
                      disabled={bulkSaving || filteredStudents.length === 0}
                      onClick={() => handleBulkAttendance("Absent")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-rose-600 hover:to-red-700 transition-all active:scale-95 disabled:opacity-50"
                      title="Mark all displayed students as Absent"
                    >
                      <XCircle className="h-4 w-4" /> Mark All Absent ({filteredStudents.length})
                    </button>
                    {selectedGroup !== "all" && (
                      <button
                        type="button"
                        onClick={() => setShowFilterGroupBroadcast(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-650 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-teal-600 hover:to-indigo-755 transition-all active:scale-95"
                        title="Broadcast message to the selected group"
                      >
                        <Megaphone className="h-4 w-4" /> Group Broadcast
                      </button>
                    )}
                    {(selectedGroup !== "all" || selectedCourse !== "all" || selectedStatus !== "all") && (
                      <button
                        type="button"
                        onClick={() => { setSelectedGroup("all"); setSelectedCourse("all"); setSelectedStatus("all"); }}
                        className="rounded-xl border border-rose-250 bg-rose-50/50 hover:bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-455 px-3.5 py-2 text-xs font-bold transition-all active:scale-95"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-14 text-center">
                    <Users className="h-12 w-12 text-slate-350 dark:text-slate-650 mb-3 animate-pulse" />
                    <p className="font-bold text-slate-500 dark:text-slate-400">No students match filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting filters to show all students.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredStudents.map((student, index) => {
                      const status = student.todayAttendance?.status;
                      const isStopped = student.studentProfile?.isStopped || student.status === "stopped";
                      const initials = student.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                      const avatarGradient = getAvatarGradient(student.name);

                      const statusBorder = isStopped
                        ? "border-rose-250/70 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 opacity-85"
                        : status === "Present" ? "border-emerald-500/30 shadow-emerald-500/10 dark:shadow-emerald-500/5 bg-gradient-to-b from-white to-emerald-50/20 dark:from-slate-900 dark:to-emerald-950/10"
                        : status === "Absent" ? "border-rose-500/30 shadow-rose-500/10 dark:shadow-rose-500/5 bg-gradient-to-b from-white to-rose-50/20 dark:from-slate-900 dark:to-rose-950/10"
                        : "border-slate-200/70 dark:border-slate-800/70 hover:border-brand-500/40 hover:shadow-brand-500/5 dark:hover:border-brand-500/30";

                      const noteHasContent = notes[student._id]?.trim().length > 0;
                      const noteOpen = expandedNotes[student._id] || noteHasContent;

                      return (
                        <div
                          key={student._id}
                          className={`card relative overflow-hidden transition-all duration-300 backdrop-blur-md hover:scale-[1.02] hover:-translate-y-0.5 shadow-sm hover:shadow-md animate-fade-slide-up opacity-0 ${statusBorder}`}
                          style={{
                            animationFillMode: 'forwards',
                            animationDelay: `${index * 40}ms`
                          }}
                        >
                          {/* Accent status strip */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                            isStopped ? "bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)]"
                            : status === "Present" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            : status === "Absent" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                            : "bg-slate-200 dark:bg-slate-800"
                          }`} />

                          {isStopped && (
                            <div className="bg-rose-500/15 border-b border-rose-200/50 dark:border-rose-900/50 px-4 py-1.5 text-[11px] font-black text-rose-700 dark:text-rose-300 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                ⛔ Student Has Stopped Studying
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(student)}
                                className="underline text-[10px] hover:text-rose-900 font-bold"
                              >
                                Reactivate
                              </button>
                            </div>
                          )}

                          <div className="p-4 pl-5">
                            {/* Student info */}
                            <div className="mb-4 flex items-center gap-3">
                              <div className="relative">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-black text-white shadow-sm ${avatarGradient}`}>
                                  {initials}
                                </div>
                                {status === "Present" && (
                                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900 shadow-sm animate-scale-up">
                                    <CheckCircle2 className="h-3 w-3" />
                                  </div>
                                )}
                                {status === "Absent" && (
                                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white ring-2 ring-white dark:ring-slate-900 shadow-sm animate-scale-up">
                                    <XCircle className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm">{student.name}</h3>
                                  <StatusBadge value={status} />
                                </div>
                                
                                <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                                  <button
                                    type="button"
                                    onClick={() => setEditingCourseStudent(student)}
                                    className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs group"
                                    title="Click to switch or promote level (e.g. A1 -> A2)"
                                  >
                                    <span>🎓 {student.studentProfile?.course || "Course"}</span>
                                    <Pencil className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100 ml-0.5" />
                                  </button>
                                  {student.studentProfile?.age && (
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                      Age {student.studentProfile.age}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setEditingSessionsStudent(student)}
                                    className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-350 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs group"
                                    title="Click to edit total sessions studied"
                                  >
                                    <span>📖 {student.sessionsAttended ?? 0} {student.sessionsAttended === 1 ? "Session" : "Sessions"}</span>
                                    <Pencil className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100 ml-0.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(student)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black transition-all active:scale-95 cursor-pointer shadow-2xs ${
                                      isStopped
                                        ? "bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                    }`}
                                    title={isStopped ? "Click to set status to Active" : "Click to mark student as Stopped"}
                                  >
                                    {isStopped ? "⛔ Stopped" : "🟢 Active"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setObservationsStudent(student)}
                                    className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-2xs group"
                                    title="Upload pictures, PDF files, homework or write teacher observations"
                                  >
                                    <span>📝 Files & Notes</span>
                                  </button>
                                </div>

                                {student.studentProfile?.parentPhone && (
                                  <a 
                                    href={`https://wa.me/${student.studentProfile.parentPhone.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-500 transition-colors"
                                  >
                                    💬 Parent: {student.studentProfile.parentPhone}
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Student Monthly Payment, Rest & Assurance row widget */}
                            <div className="mb-3">
                              <StudentPaymentRowWidget
                                student={student}
                                month={selectedDate?.slice(0, 7)}
                              />
                            </div>

                            {/* Note Section header & toggle */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                <MessageSquareText className="h-3.5 w-3.5" />
                                {t.optionalNote}
                              </span>
                              <button
                                type="button"
                                onClick={() => setExpandedNotes(prev => ({ ...prev, [student._id]: !prev[student._id] }))}
                                className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                              >
                                {noteOpen ? "Collapse" : noteHasContent ? "Edit Note" : "+ Add Note"}
                              </button>
                            </div>

                            {/* Collapsible Textarea */}
                            <div className={`transition-all duration-300 overflow-hidden ${noteOpen ? "max-h-[100px] opacity-100 mb-4" : "max-h-0 opacity-0 mb-0 pointer-events-none"}`}>
                              <textarea
                                className="input text-xs resize-none w-full bg-slate-50/50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 min-h-[64px]"
                                value={notes[student._id] ?? ""}
                                onChange={(event) =>
                                  setNotes((current) => ({ ...current, [student._id]: event.target.value }))
                                }
                                placeholder={t.noteReason}
                                rows={2}
                              />
                            </div>

                            {/* Dynamic Segmented Sliding Controller */}
                            <div className="relative flex rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 p-1 select-none w-full border border-slate-200/30 dark:border-slate-700/20">
                              {/* Sliding capsule background */}
                              <div 
                                className={`absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-out shadow-sm ${
                                  status === "Present" 
                                    ? "left-1 w-[48%] bg-gradient-to-r from-emerald-500 to-teal-600" 
                                    : status === "Absent" 
                                    ? "left-[51%] w-[48%] bg-gradient-to-r from-rose-500 to-red-600" 
                                    : "opacity-0 pointer-events-none"
                                }`}
                              />
                              
                              <button
                                type="button"
                                disabled={savingId === student._id}
                                onClick={() => markAttendance(student, "Present")}
                                className={`relative z-10 flex-1 text-center py-2.5 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                                  status === "Present" ? "text-white scale-102" : "text-slate-600 dark:text-slate-400 hover:text-brand-500"
                                }`}
                              >
                                <CheckCircle2 className={`h-4 w-4 transition-transform duration-300 ${status === "Present" ? "scale-110" : ""}`} />
                                {t.present}
                              </button>
                              
                              <button
                                type="button"
                                disabled={savingId === student._id}
                                onClick={() => markAttendance(student, "Absent")}
                                className={`relative z-10 flex-1 text-center py-2.5 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                                  status === "Absent" ? "text-white scale-102" : "text-slate-600 dark:text-slate-400 hover:text-rose-500"
                                }`}
                              >
                                <XCircle className={`h-4 w-4 transition-transform duration-300 ${status === "Absent" ? "scale-110" : ""}`} />
                                {t.absent}
                              </button>
                            </div>

                            {/* Notification status */}
                            {status === "Absent" && (
                              <p className="mt-2 text-center text-[10px] text-slate-450 dark:text-slate-500 font-semibold animate-pulse">
                                WhatsApp Alert:{" "}
                                {student.todayAttendance?.parentNotification?.sent
                                  ? "Sent ✓"
                                  : student.todayAttendance?.parentNotification?.error || t.notSent}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {showFilterGroupBroadcast && selectedGroup !== "all" && (
          <GroupBroadcastModal
            group={groups.find((g) => g._id === selectedGroup)}
            onClose={() => setShowFilterGroupBroadcast(false)}
          />
        )}

        <AnnouncementsCard />
      </div>

      {showIdCard && data?.teacher && <IDCardModal user={data.teacher} onClose={() => setShowIdCard(false)} />}
      {editingSessionsStudent && (
        <EditSessionsModal
          student={editingSessionsStudent}
          onClose={() => setEditingSessionsStudent(null)}
          onSaved={loadDashboard}
        />
      )}
      {editingCourseStudent && (
        <SwitchLevelModal
          student={editingCourseStudent}
          onClose={() => setEditingCourseStudent(null)}
          onSaved={loadDashboard}
        />
      )}
      {observationsStudent && (
        <StudentObservationsModal
          student={observationsStudent}
          onClose={() => setObservationsStudent(null)}
        />
      )}
      {showMonthlyRapport && (
        <MonthlyFinancialRapportModal
          teacherId={data?.teacher?._id}
          teacherName={data?.teacher?.name}
          onClose={() => setShowMonthlyRapport(false)}
        />
      )}
    </AppLayout>
  );
}

// ── Edit Sessions Modal ───────────────────────────────────────────────────

export function EditSessionsModal({ student, onClose, onSaved }) {
  const [count, setCount] = useState(student.sessionsAttended ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/teacher/students/${student._id}/sessions`, { count });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm font-bold text-sm">
              📖
            </span>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm">Sessions Studied</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{student.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <ErrorAlert message={error} />
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Total Sessions Attended
            </label>
            <input
              type="number"
              min="0"
              max="999"
              required
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-lg font-black text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-center"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              autoFocus
            />
            <p className="mt-2 text-[11px] text-slate-400 text-center">
              Enter how many sessions {student.name} has completed.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Sessions"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Switch / Promote Level Modal ──────────────────────────────────────────────

export function SwitchLevelModal({ student, onClose, onSaved }) {
  const currentCourse = student.studentProfile?.course || "";
  const [course, setCourse] = useState(currentCourse);
  const [resetSessions, setResetSessions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const LEVEL_PRESETS = ["A1", "A2", "B1", "B2", "C1", "C2"];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!course.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.put(`/teacher/students/${student._id}/course`, {
        course: course.trim(),
        resetSessions
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm font-bold text-sm">
              🎓
            </span>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm">Switch / Promote Level</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{student.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <ErrorAlert message={error} />

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Course / Level Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. A2 or English A2"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2.5 text-sm font-bold text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
              Quick Level Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {LEVEL_PRESETS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setCourse(lvl)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                    course === lvl
                      ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              checked={resetSessions}
              onChange={(e) => setResetSessions(e.target.checked)}
            />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              Reset sessions counter for new level
            </span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !course.trim()}
              className="flex-1 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-brand-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Promote Level 🌟"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
