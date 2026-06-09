import React, { useState } from "react";
import { LogOut, Moon, ScanLine, Star, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { schoolLogo, schoolInfo } from "../config/branding.js";
import { useAuth } from "../context/AuthContext.jsx";
import RatingModal from "../components/RatingModal.jsx";
import { useTheme } from "../hooks/useTheme.js";

export default function AppLayout({ title, subtitle, children, fullHeight = false }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isRfid = location.pathname === "/rfid-attendance";
  const [showRating, setShowRating] = useState(false);
  const { dark, toggle } = useTheme();

  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "??";
  const roleGradients = { admin: "from-violet-600 to-purple-700", teacher: "from-brand-600 to-brand-700", student: "from-brand-600 to-emerald-700" };
  const gradient = roleGradients[user?.role] || roleGradients.admin;

  return (
    <div className={`flex text-slate-950 dark:text-slate-100 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 ${fullHeight ? "h-screen overflow-hidden flex-col" : "min-h-screen flex-col"}`}>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to={`/${user?.role || "admin"}`} className="group flex items-center gap-3">
            <img src={schoolLogo} alt={schoolInfo.short} className="h-10 w-auto max-w-[120px] rounded-xl object-contain ring-2 ring-slate-100 transition group-hover:ring-brand-200 dark:ring-slate-700" />
            <div className="hidden sm:block">
              <p className="text-sm font-black leading-tight tracking-tight">TFC School</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{schoolInfo.city}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {(user?.role === "admin" || user?.role === "teacher") && (
              <Link to="/rfid-attendance" className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${isRfid ? "bg-gradient-to-r from-brand-600 to-emerald-700 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"}`}>
                <ScanLine className="h-4 w-4" /><span className="hidden sm:inline">RFID</span>
              </Link>
            )}
            <button onClick={() => setShowRating(true)} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 transition-all hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" /><span className="hidden sm:inline">Rate</span>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:text-brand-400"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-xs font-black text-white shadow-sm`}>{initials}</div>
              <div className="hidden md:block">
                <p className="text-sm font-bold leading-tight">{user?.name}</p>
                <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{user?.role}</p>
              </div>
            </div>
            <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-rose-800 dark:hover:bg-rose-950 dark:hover:text-rose-400">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className={`w-full animate-fade-in ${fullHeight ? "flex-1 overflow-hidden" : `flex-1 ${title ? "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" : ""}`}`}>
        {title && (
          <div className="mb-8 animate-fade-slide-up">
            <h1 className="text-2xl font-black tracking-tight text-brand-800 dark:text-brand-300 sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
      {!fullHeight && (
        <footer className="border-t border-slate-200 bg-white/60 py-5 text-center backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} TFC — Training Formation Center · {schoolInfo.address}</p>
            <p className="mt-0.5 text-xs text-slate-300 dark:text-slate-600">{schoolInfo.credit}</p>
          </div>
        </footer>
      )}
      {showRating && <RatingModal onClose={() => setShowRating(false)} />}
    </div>
  );
}
