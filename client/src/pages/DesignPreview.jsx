import React, { useState } from "react";
import {
  Bell, BookOpen, GraduationCap, LayoutDashboard, LogOut,
  Moon, ScanLine, ShieldCheck, Star, Sun, Users, Wallet,
  TrendingUp, CheckCircle2, XCircle, Clock, UserRound,
  ChevronRight, Inbox, Megaphone, History, MapPin, Phone, Mail,
  Instagram, Facebook, Globe
} from "lucide-react";
import { schoolLogo, schoolInfo } from "../config/branding.js";
import { useTheme } from "../hooks/useTheme.js";

/* ─── mock data ─── */
const stats = [
  { label: "Total Students", value: "247", icon: Users,         color: "from-brand-500 to-brand-700",   bg: "bg-brand-50 dark:bg-brand-950/40",   text: "text-brand-700 dark:text-brand-300" },
  { label: "Total Teachers", value: "18",  icon: GraduationCap, color: "from-violet-500 to-purple-700", bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300" },
  { label: "Present Today",  value: "198", icon: CheckCircle2,  color: "from-emerald-500 to-teal-600",  bg: "bg-emerald-50 dark:bg-emerald-950/40",text: "text-emerald-700 dark:text-emerald-300" },
  { label: "Absent Today",   value: "49",  icon: XCircle,       color: "from-rose-500 to-rose-700",     bg: "bg-rose-50 dark:bg-rose-950/40",     text: "text-rose-700 dark:text-rose-300" },
];
const navItems = [
  { id: "overview", label: "Overview",      icon: LayoutDashboard },
  { id: "users",    label: "Users",          icon: Users },
  { id: "payments", label: "Payments",       icon: Wallet },
  { id: "timetable",label: "Timetable",      icon: BookOpen },
  { id: "announce", label: "Announcements",  icon: Megaphone },
  { id: "audit",    label: "Activity",       icon: History },
];

export default function DesignPreview() {
  const { dark, toggle } = useTheme();
  const [activeNav, setActiveNav] = useState("overview");
  const [activeTab, setActiveTab] = useState("students");

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">

      {/* ── Preview banner ── */}
      <div className="bg-amber-400 text-amber-900 text-center py-2 text-xs font-bold tracking-widest uppercase sticky top-0 z-[100]">
        🎨 Design Preview — Not Live Yet
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-16">

        {/* ════════════════════════════════════
            1. APP HEADER
        ════════════════════════════════════ */}
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">1 — App Header (Navbar)</h2>

          {/* NEW header design */}
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <header className="bg-gradient-to-r from-brand-700 to-brand-900 px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <img src={schoolLogo} alt="TFC" className="h-7 w-7 object-contain" />
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-tight">TFC School</p>
                  <p className="text-[10px] text-brand-200">Training Formation Center</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition">
                  <ScanLine className="h-3.5 w-3.5" /> RFID
                </button>
                <button className="flex items-center gap-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 px-3 py-1.5 text-xs font-bold text-amber-200 transition">
                  <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> Rate
                </button>
                <button onClick={toggle} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition">
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-xs font-black text-white">AD</div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-white">Admin User</p>
                    <p className="text-[10px] text-brand-200 capitalize">admin</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-200 transition">
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            </header>
          </div>
          <p className="mt-2 text-xs text-slate-400">← Header بتدرج brand-700 → brand-900 مع أزرار شفافة بيضاء</p>
        </section>

        {/* ════════════════════════════════════
            2. ADMIN SIDEBAR
        ════════════════════════════════════ */}
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">2 — Admin Sidebar + Content</h2>
          <div className="rounded-2xl overflow-hidden shadow-xl flex h-80 border border-slate-200 dark:border-slate-700">

            {/* Sidebar */}
            <aside className="w-52 shrink-0 bg-gradient-to-b from-brand-800 to-brand-950 flex flex-col">
              <div className="px-4 py-4 border-b border-brand-700/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-xs font-black text-white">AD</div>
                  <div>
                    <p className="text-xs font-black text-white">Admin User</p>
                    <span className="rounded-full bg-violet-500/30 px-2 py-0.5 text-[9px] font-bold text-violet-200">ADMIN</span>
                  </div>
                </div>
              </div>
              <nav className="flex-1 px-2 py-3 space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                        active
                          ? "bg-white text-brand-700 shadow-sm"
                          : "text-brand-200 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                      {active && <ChevronRight className="h-3 w-3 ml-auto text-brand-400" />}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Content area */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-900 overflow-auto p-5">
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {stats.slice(0, 4).map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className={`rounded-xl ${s.bg} p-3 flex items-center gap-3 border border-white/60 dark:border-white/5 shadow-sm`}>
                      <div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm`}>
                        <Icon className="h-4.5 w-4.5 text-white" style={{height:"18px",width:"18px"}} />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900 dark:text-slate-100 leading-none">{s.value}</p>
                        <p className={`text-[10px] font-semibold ${s.text}`}>{s.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-500 dark:text-slate-400 text-center shadow-sm">
                محتوى اللوحة يظهر هنا…
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            3. LANDING PAGE HERO
        ════════════════════════════════════ */}
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">3 — Landing Page Hero</h2>
          <div className="rounded-2xl overflow-hidden shadow-xl relative" style={{minHeight:"320px"}}>
            {/* Dark hero bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900">
              {/* geometric pattern */}
              <div className="absolute inset-0 opacity-10"
                style={{backgroundImage:"radial-gradient(circle at 20% 50%, #A7D2EA 1px, transparent 1px), radial-gradient(circle at 80% 20%, #A7D2EA 1px, transparent 1px)",backgroundSize:"40px 40px"}} />
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <div className="relative px-8 py-14 text-center text-white">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                <img src={schoolLogo} alt="TFC" className="h-14 w-14 object-contain" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand-300 mb-2">Welcome to</p>
              <h1 className="text-4xl font-black leading-tight">
                Training Formation <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-emerald-300">Center</span>
              </h1>
              <p className="mt-3 text-sm text-brand-200 max-w-md mx-auto">
                L'institution éducative de référence à Annaba
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button className="rounded-xl bg-white text-brand-700 px-6 py-2.5 text-sm font-black shadow-lg hover:shadow-xl transition">
                  S'inscrire maintenant
                </button>
                <button className="rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 text-white px-6 py-2.5 text-sm font-bold hover:bg-white/20 transition">
                  Admin Portal
                </button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">← Hero داكن brand-900 مع نمط هندسي خفيف + نص أبيض + زر CTA أبيض</p>
        </section>

        {/* ════════════════════════════════════
            4. CARDS & COMPONENTS
        ════════════════════════════════════ */}
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">4 — Cards & Buttons</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* Card with left accent */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-brand-500 to-brand-700" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">Student Card</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Course: English</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold">Active</span>
                  <span className="rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-2.5 py-0.5 text-xs font-bold">B1 Level</span>
                </div>
              </div>
            </div>

            {/* Stat card */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-lg shadow-brand-200 dark:shadow-brand-900 p-5 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-200 uppercase tracking-wider">Total Students</p>
                  <p className="text-4xl font-black mt-1">247</p>
                  <p className="text-xs text-brand-300 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +12 this month
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Buttons showcase */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Buttons</p>
              <button className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition">
                Primary Action
              </button>
              <button className="w-full rounded-xl border-2 border-brand-600 py-2.5 text-sm font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition">
                Secondary Action
              </button>
              <button className="w-full rounded-xl bg-rose-500 py-2.5 text-sm font-bold text-white hover:bg-rose-600 transition">
                Danger Action
              </button>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            5. USER TABLE ROW
        ════════════════════════════════════ */}
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">5 — Data Table</h2>
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <p className="text-sm font-black text-slate-900 dark:text-slate-100">Students</p>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5">
                  <span className="text-xs text-slate-400">Search…</span>
                </div>
                <button className="rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm">+ Add</button>
              </div>
            </div>
            {/* Rows */}
            {[
              { name: "Adam Bensalem",    course: "English B2", status: "active" },
              { name: "Sara Mekki",       course: "Informatique", status: "active" },
              { name: "Youcef Hamdi",     course: "English A1", status: "inactive" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-black text-white shadow-sm">
                    {row.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{row.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{row.course}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${row.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════
            6. STUDENT PROFILE HERO
        ════════════════════════════════════ */}
        <section>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">6 — Student Profile Card</h2>
          <div className="rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 relative">
            <div className="absolute inset-0 opacity-10"
              style={{backgroundImage:"radial-gradient(circle at 10% 80%, #A7D2EA 1px, transparent 1px)",backgroundSize:"30px 30px"}} />
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-brand-400/10 blur-2xl" />
            <div className="relative p-6 flex flex-wrap items-center gap-5 text-white">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/25 text-2xl font-black backdrop-blur-sm shadow-inner">
                SB
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black">Sara Bensalem</h3>
                <p className="text-sm text-brand-200 mt-0.5">sara@tfcschool.dz</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 backdrop-blur-sm px-3 py-0.5 text-xs font-bold">English B1</span>
                  <span className="rounded-full bg-emerald-400/25 px-3 py-0.5 text-xs font-bold text-emerald-200">Active</span>
                  <span className="rounded-full bg-white/15 px-3 py-0.5 text-xs font-bold">RFID: •••• 4F2A</span>
                </div>
              </div>
              <div className="flex gap-4 text-center">
                {[["94%","Attendance"],["18","Present"],["1","Absent"]].map(([val,lbl])=>(
                  <div key={lbl} className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2">
                    <p className="text-xl font-black">{val}</p>
                    <p className="text-[10px] text-brand-300 uppercase tracking-wide">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className="text-center text-xs text-slate-400 pb-8">
          هذه صفحة معاينة فقط — قل "طبّقه" لتفعيل التصميم الكامل على الموقع
        </div>
      </div>
    </div>
  );
}
