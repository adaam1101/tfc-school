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
  ChevronRight,
  Wallet,
  TrendingUp,
  BarChart2,
  UserPlus,
  FileSpreadsheet,
  Search
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
import DigitalBulletinModal from "../../components/DigitalBulletinModal.jsx";
import TeacherCreateStudentModal from "../../components/TeacherCreateStudentModal.jsx";
import { exportStudentsToExcel } from "../../utils/excelExport.js";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNotes, setExpandedNotes] = useState({});
  const [showFilterGroupBroadcast, setShowFilterGroupBroadcast] = useState(false);
  const [editingSessionsStudent, setEditingSessionsStudent] = useState(null);
  const [editingCourseStudent, setEditingCourseStudent] = useState(null);
  const [observationsStudent, setObservationsStudent] = useState(null);
  const [bulletinStudent, setBulletinStudent] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [showMonthlyRapport, setShowMonthlyRapport] = useState(false);
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);

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
    const query = searchQuery.trim().toLowerCase();
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
      if (query) {
        const name = (s.name || "").toLowerCase();
        const email = (s.email || "").toLowerCase();
        const course = (s.studentProfile?.course || "").toLowerCase();
        const phone = (s.studentProfile?.phone || "").toLowerCase();
        const parentPhone = (s.studentProfile?.parentPhone || "").toLowerCase();
        const username = (s.username || "").toLowerCase();
        const groupName = (s.groupName || "").toLowerCase();
        if (
          !name.includes(query) &&
          !email.includes(query) &&
          !course.includes(query) &&
          !phone.includes(query) &&
          !parentPhone.includes(query) &&
          !username.includes(query) &&
          !groupName.includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [students, groups, selectedGroup, selectedCourse, selectedStatus, searchQuery]);

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

  const markAttendance = async (studentOrId, status) => {
    const sId = typeof studentOrId === "object" ? studentOrId?._id : studentOrId;
    const sName = typeof studentOrId === "object" ? studentOrId?.name : (students.find(s => s._id === sId)?.name || "Student");
    if (!sId) return;

    setSavingId(sId);
    setMessage("");
    setError("");
    try {
      const { data: response } = await api.post("/teacher/attendance", {
        studentId: sId,
        status,
        note: notes[sId] || "",
        date: selectedDate
      });

      setData((current) => ({
        ...current,
        students: (current?.students || []).map((item) =>
          item._id === sId ? { ...item, todayAttendance: response.attendance } : item
        )
      }));

      if (status === "Absent") {
        const n = response.attendance?.parentNotification;
        setMessage(
          n?.sent
            ? `Parent alert sent for ${sName}.`
            : `Absent saved for ${sName}. ${n?.error || "Notification not sent."}`
        );
      } else {
        setMessage(`${sName} marked present for ${formatDisplayDate(selectedDate, lang)}.`);
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

                    <button
                      type="button"
                      onClick={() => setShowCreateStudentModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 px-3.5 py-2 text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                      title="Créer un nouveau compte élève"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>+ Add Student</span>
                    </button>
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
                <p className="text-xs text-slate-400 mt-1 mb-4">Créez directement les comptes de vos élèves pour commencer.</p>
                <button
                  type="button"
                  onClick={() => setShowCreateStudentModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white px-5 py-2.5 text-xs font-black shadow-md transition-all active:scale-95"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>+ Create Student Account</span>
                </button>
              </div>
            ) : (
              <>
                {/* Filter Bar */}
                <div className="flex flex-wrap gap-4 items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl mb-6 shadow-sm">
                  <div className="flex-1 min-w-[220px]">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                      <span>Search Student</span>
                      {searchQuery && (
                        <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold lowercase">
                          filtering
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name, course, phone..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 dark:text-slate-250 font-bold placeholder:font-normal placeholder:text-slate-400"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Clear search"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-[180px]">
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

                  <div className="flex-1 min-w-[180px]">
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

                  <div className="flex-1 min-w-[160px]">
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
                      onClick={() => {
                        const activeGroupName = selectedGroup !== "all"
                          ? (groups.find((g) => g._id === selectedGroup)?.name || "Group")
                          : "All Students";
                        exportStudentsToExcel({
                          students: filteredStudents,
                          groupName: activeGroupName,
                          teacherName: data?.teacher?.name || "Ameyoud Adam"
                        });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-3.5 py-2 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                      title="Export displayed student roster to Microsoft Excel (.xlsx)"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-400 dark:text-emerald-600" /> Export Excel ({filteredStudents.length})
                    </button>
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
                    {(selectedGroup !== "all" || selectedCourse !== "all" || selectedStatus !== "all" || searchQuery.trim() !== "") && (
                      <button
                        type="button"
                        onClick={() => { setSelectedGroup("all"); setSelectedCourse("all"); setSelectedStatus("all"); setSearchQuery(""); }}
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
                    <p className="font-bold text-slate-500 dark:text-slate-400">
                      {searchQuery ? `No students found matching "${searchQuery}"` : "No students match filters"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing search or resetting filters to show all students.</p>
                    {(selectedGroup !== "all" || selectedCourse !== "all" || selectedStatus !== "all" || searchQuery.trim() !== "") && (
                      <button
                        type="button"
                        onClick={() => { setSelectedGroup("all"); setSelectedCourse("all"); setSelectedStatus("all"); setSearchQuery(""); }}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:hover:bg-brand-900/40 px-3.5 py-1.5 text-xs font-bold transition-all"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredStudents.map((student, index) => {
                      const status = student.todayAttendance?.status;
                      const isStopped = student.studentProfile?.isStopped || student.status === "stopped";
                      const initials = student.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                      const avatarGradient = getAvatarGradient(student.name);

                      const noteHasContent = notes[student._id]?.trim().length > 0;
                      const noteOpen = expandedNotes[student._id] || noteHasContent;

                      return (
                        <div
                          key={student._id}
                          className={`group relative flex flex-col justify-between rounded-3xl border bg-white/95 dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-xl dark:shadow-black/40 transition-all duration-300 animate-fade-slide-up backdrop-blur-md ${
                            isStopped
                              ? "border-rose-300/80 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20"
                              : status === "Present"
                              ? "border-emerald-500/40 dark:border-emerald-500/30 shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                              : status === "Absent"
                              ? "border-rose-500/40 dark:border-rose-500/30 shadow-rose-500/5 ring-1 ring-rose-500/20"
                              : "border-slate-200/80 dark:border-slate-800 hover:border-brand-500/40 dark:hover:border-brand-500/40"
                          }`}
                          style={{
                            animationFillMode: 'forwards',
                            animationDelay: `${index * 30}ms`
                          }}
                        >
                          {/* Top Accent Strip */}
                          <div
                            className={`absolute top-0 left-6 right-6 h-1 rounded-full transition-all duration-300 ${
                              isStopped
                                ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                                : status === "Present"
                                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                                : status === "Absent"
                                ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                                : "bg-transparent"
                            }`}
                          />

                          <div>
                            {/* Student Header */}
                            <div className="flex items-start justify-between gap-3 mb-3.5">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative shrink-0">
                                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarGradient} text-white font-black text-sm shadow-md`}>
                                    {initials}
                                  </div>
                                  {status === "Present" && (
                                    <div className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900 shadow-sm">
                                      <CheckCircle2 className="h-3 w-3" />
                                    </div>
                                  )}
                                  {status === "Absent" && (
                                    <div className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-white ring-2 ring-white dark:ring-slate-900 shadow-sm">
                                      <XCircle className="h-3 w-3" />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug truncate tracking-tight">
                                    {student.name}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
                                    <span className="inline-flex items-center gap-1 font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-lg text-[11px]">
                                      🎓 {student.studentProfile?.course || "Course"}
                                    </span>
                                    {student.groupName && (
                                      <span className="font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[11px]">
                                        📁 {student.groupName}
                                      </span>
                                    )}
                                    {student.studentProfile?.age && (
                                      <span className="text-slate-400 text-[11px] font-medium">
                                        • {student.studentProfile.age} yrs
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Live Status Chip */}
                              <div className="shrink-0">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide uppercase shadow-2xs ${
                                    status === "Present"
                                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                      : status === "Absent"
                                      ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                                  }`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${
                                    status === "Present" ? "bg-emerald-500 animate-pulse" : status === "Absent" ? "bg-rose-500" : "bg-slate-400"
                                  }`} />
                                  {status === "Present" ? t.present : status === "Absent" ? t.absent : "Not marked"}
                                </span>
                              </div>
                            </div>

                            {/* Session Cycle Progress & Test Readiness Bar */}
                            <div className="mb-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sessions:</span>
                                  <span>{student.sessionsAttended ?? 0} / {student.targetSessions || 12}</span>
                                  {(student.absencesCount ?? 0) > 0 && (
                                    <span className="text-rose-600 dark:text-rose-400 text-[10px] font-black bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded-md">
                                      🔴 {student.absencesCount} abs
                                    </span>
                                  )}
                                </div>

                                {student.sessionsAttended >= 11 ? (
                                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-emerald-500 text-white font-black px-2 py-0.5 rounded-lg text-[10px] shadow-xs animate-pulse">
                                    🎯 Test Ready
                                  </span>
                                ) : (student.sessionsAttended ?? 0) >= 8 ? (
                                  <span className="text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                                    ⏳ Test in {(student.targetSessions || 12) - (student.sessionsAttended ?? 0)}
                                  </span>
                                ) : null}
                              </div>

                              {/* Progress Track */}
                              <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    student.sessionsAttended >= 11
                                      ? "bg-gradient-to-r from-amber-400 to-emerald-500"
                                      : "bg-gradient-to-r from-brand-500 to-teal-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(100, Math.round(((student.sessionsAttended ?? 0) / (student.targetSessions || 12)) * 100))}%`
                                  }}
                                />
                              </div>
                            </div>

                            {/* Quick Action Dock */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                              <button
                                type="button"
                                onClick={() => setObservationsStudent(student)}
                                className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                                title="Notes & Attached Files"
                              >
                                <span>📝 Notes & Files</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setBulletinStudent(student)}
                                className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                                title="Bulletin Numérique"
                              >
                                <span>🎓 Bulletin</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingCourseStudent(student)}
                                className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                                title="Changer de niveau (A1, A2, etc.)"
                              >
                                <span>Level</span>
                                <Pencil className="h-2.5 w-2.5 opacity-60" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingSessionsStudent(student)}
                                className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                                title="Modifier les séances"
                              >
                                <span>Sessions</span>
                                <Pencil className="h-2.5 w-2.5 opacity-60" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(student)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs ${
                                  isStopped
                                    ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                                }`}
                                title={isStopped ? "Cliquez pour réactiver l'élève" : "Marquer comme Arrêté"}
                              >
                                {isStopped ? "⛔ Arrêté" : "Actif"}
                              </button>

                              {student.studentProfile?.parentPhone && (
                                <a
                                  href={`https://wa.me/${student.studentProfile.parentPhone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-1 rounded-xl text-xs font-bold transition-all"
                                  title="Contacter le parent sur WhatsApp"
                                >
                                  💬 Parent
                                </a>
                              )}
                            </div>

                            {/* Financial Tuition Widget */}
                            <div className="mb-3.5">
                              <StudentPaymentRowWidget
                                student={student}
                                month={selectedDate?.slice(0, 7)}
                                initialPayment={student.currentPayment}
                                onPaymentUpdated={(updatedPayment) => {
                                  setData(curr => ({
                                    ...curr,
                                    students: (curr?.students || []).map(s =>
                                      s._id === student._id ? { ...s, currentPayment: updatedPayment } : s
                                    )
                                  }));
                                }}
                              />
                            </div>
                          </div>

                          {/* Attendance Slider & Note Section at Bottom */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            {/* Collapsible Note */}
                            {noteOpen && (
                              <textarea
                                className="input text-xs resize-none w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 min-h-[50px] mb-2"
                                value={notes[student._id] ?? ""}
                                onChange={(event) =>
                                  setNotes((current) => ({ ...current, [student._id]: event.target.value }))
                                }
                                placeholder={t.noteReason}
                                rows={2}
                              />
                            )}

                            {/* Segmented Tactile Attendance Capsule */}
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1 flex rounded-2xl bg-slate-100 dark:bg-slate-800/90 p-1 select-none border border-slate-200/60 dark:border-slate-700/50">
                                <div
                                  className={`absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-out shadow-sm ${
                                    status === "Present"
                                      ? "left-1 w-[48%] bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30"
                                      : status === "Absent"
                                      ? "left-[51%] w-[48%] bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/30"
                                      : "opacity-0 pointer-events-none"
                                  }`}
                                />

                                <button
                                  type="button"
                                  disabled={savingId === student._id}
                                  onClick={() => markAttendance(student, "Present")}
                                  className={`relative z-10 flex-1 text-center py-2 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    status === "Present" ? "text-white" : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                  }`}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  {t.present}
                                </button>

                                <button
                                  type="button"
                                  disabled={savingId === student._id}
                                  onClick={() => markAttendance(student, "Absent")}
                                  className={`relative z-10 flex-1 text-center py-2 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    status === "Absent" ? "text-white" : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                  }`}
                                >
                                  <XCircle className="h-4 w-4" />
                                  {t.absent}
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => setExpandedNotes(prev => ({ ...prev, [student._id]: !prev[student._id] }))}
                                className={`h-9 w-9 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                                  noteHasContent
                                    ? "bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 shadow-xs"
                                    : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                }`}
                                title={noteHasContent ? "Modifier la note" : "Ajouter une note"}
                              >
                                <MessageSquareText className="h-4 w-4" />
                              </button>
                            </div>

                            {status === "Absent" && (
                              <p className="text-center text-[10px] text-slate-400 font-semibold pt-1">
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
      {bulletinStudent && (
        <DigitalBulletinModal
          student={bulletinStudent}
          teacherName={data?.teacher?.name}
          onClose={() => setBulletinStudent(null)}
        />
      )}
      {showMonthlyRapport && (
        <MonthlyFinancialRapportModal
          teacherId={data?.teacher?._id}
          teacherName={data?.teacher?.name}
          onClose={() => setShowMonthlyRapport(false)}
        />
      )}
      {showCreateStudentModal && (
        <TeacherCreateStudentModal
          defaultCourse={data?.teacher?.teacherProfile?.subject || "English - A1"}
          groups={groups || []}
          onClose={() => setShowCreateStudentModal(false)}
          onStudentCreated={() => {
            loadDashboard(selectedDate);
          }}
        />
      )}
    </AppLayout>
  );
}

// ── Edit Sessions & Attendance Progress Modal ────────────────────────────

export function EditSessionsModal({ student, onClose, onSaved }) {
  const [count, setCount] = useState(student.sessionsAttended ?? 0);
  const [absencesCount, setAbsencesCount] = useState(student.absencesCount ?? 0);
  const [targetSessions, setTargetSessions] = useState(student.targetSessions || 12);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const numAttended = Math.max(0, parseInt(count, 10) || 0);
  const isReady = numAttended >= 11;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/teacher/students/${student._id}/sessions`, { 
        count: numAttended,
        absencesCount: Math.max(0, parseInt(absencesCount, 10) || 0),
        targetSessions: parseInt(targetSessions, 10) || 12
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm font-bold text-base">
              🎯
            </span>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm">Course Cycle & Test Progress</h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">{student.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <ErrorAlert message={error} />

          {/* Test Readiness Status Banner */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            isReady
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : numAttended >= 8
              ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
              : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-base">{isReady ? "🎯" : numAttended >= 8 ? "⏳" : "📖"}</span>
              <div className="text-xs">
                <strong className="block font-black">
                  {isReady
                    ? "Ready for Level Test (11-16 Sessions)!"
                    : numAttended >= 8
                    ? `Approaching Level Test (${targetSessions - numAttended} sessions left)`
                    : `Cycle in Progress (${numAttended}/${targetSessions} Sessions)`}
                </strong>
                <span className="text-[11px] opacity-80">
                  {isReady
                    ? "The student has completed enough sessions to take the test and pass to the next level."
                    : "Students study 11 to 12 sessions (max 16) before taking the test."}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Attended Sessions */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Attended Sessions
              </label>
              <input
                type="number"
                min="0"
                max="99"
                required
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-3 py-2.5 text-base font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-center"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                autoFocus
              />
            </div>

            {/* Absences Count */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Absences Count
              </label>
              <input
                type="number"
                min="0"
                max="99"
                required
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-3 py-2.5 text-base font-black text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-center"
                value={absencesCount}
                onChange={(e) => setAbsencesCount(e.target.value)}
              />
            </div>
          </div>

          {/* Cycle Target (12 or 16) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Course Cycle Target (Test Level Threshold)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetSessions(12)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  targetSessions === 12
                    ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600"
                }`}
              >
                12 Sessions (Standard)
              </button>
              <button
                type="button"
                onClick={() => setTargetSessions(16)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  targetSessions === 16
                    ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600"
                }`}
              >
                16 Sessions (Max Cycle)
              </button>
            </div>
          </div>

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
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Progress"}
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
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
