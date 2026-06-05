import React, { useState } from "react";
import { LogOut, ScanLine, Star } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { schoolLogo, schoolInfo } from "../config/branding.js";
import { useAuth } from "../context/AuthContext.jsx";
import RatingModal from "../components/RatingModal.jsx";

export default function AppLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isRfid = location.pathname === "/rfid-attendance";
  const [showRating, setShowRating] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const roleGradients = {
    admin:   "from-violet-600 to-purple-700",
    teacher: "from-sky-600 to-blue-700",
    student: "from-teal-600 to-emerald-700"
  };
  const gradient = roleGradients[user?.role] || roleGradients.admin;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 text-slate-950">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to={`/${user?.role || "admin"}`} className="group flex items-center gap-3">
            <img
              src={schoolLogo}
              alt="TFC School"
              className="h-10 w-10 rounded-xl object-contain ring-2 ring-slate-100 transition group-hover:ring-teal-200"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-black leading-tight tracking-tight">TFC School</p>
              <p className="text-xs text-slate-500">{schoolInfo.city}</p>
            </div>
          </Link>

          {/* Nav right */}
          <div className="flex items-center gap-2">
            {(user?.role === "admin" || user?.role === "teacher") && (
              <Link
                to="/rfid-attendance"
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  isRfid
                    ? "bg-gradient-to-r from-teal-600 to-emerald-700 text-white shadow-sm shadow-teal-200"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                }`}
              >
                <ScanLine className="h-4 w-4" />
                <span className="hidden sm:inline">RFID</span>
              </Link>
            )}

            {/* Rate button */}
            <button
              onClick={() => setShowRating(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 transition-all hover:bg-amber-100 hover:shadow-sm"
              title="Rate TFC School"
            >
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="hidden sm:inline">Rate</span>
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-xs font-black text-white shadow-sm`}>
                {initials}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold leading-tight">{user?.name}</p>
                <p className="text-xs capitalize text-slate-500">{user?.role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-slide-up">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="animate-fade-in">{children}</div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white/60 py-5 text-center backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} TFC — Training Formation Center · {schoolInfo.address}
          </p>
          <p className="mt-0.5 text-xs text-slate-300">{schoolInfo.credit}</p>
        </div>
      </footer>

      {/* Rating modal */}
      {showRating && <RatingModal onClose={() => setShowRating(false)} />}
    </div>
  );
}
