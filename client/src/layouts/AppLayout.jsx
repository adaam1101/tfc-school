import React from "react";
import { LogOut, ScanLine } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { schoolLogo } from "../config/branding.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isRfid = location.pathname === "/rfid-attendance";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const roleColors = {
    admin:   "from-violet-500 to-purple-600",
    teacher: "from-sky-500 to-blue-600",
    student: "from-teal-500 to-emerald-600"
  };
  const roleGradient = roleColors[user?.role] || roleColors.admin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 text-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to={`/${user?.role || "admin"}`}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <img
                src={schoolLogo}
                alt="TFC School"
                className="h-10 w-10 rounded-xl object-contain ring-2 ring-slate-100 group-hover:ring-teal-200 transition-all duration-200"
              />
            </div>
            <div>
              <p className="text-base font-bold leading-tight tracking-tight">TFC School</p>
              <p className="text-xs text-slate-500">Private school management</p>
            </div>
          </Link>

          {/* Nav right */}
          <div className="flex items-center gap-3">
            {(user?.role === "admin" || user?.role === "teacher") && (
              <Link
                to="/rfid-attendance"
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  isRfid
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-200"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                }`}
              >
                <ScanLine className="h-4 w-4" aria-hidden="true" />
                RFID Scanner
              </Link>
            )}

            {/* User pill */}
            <div className="flex items-center gap-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${roleGradient} text-xs font-bold text-white shadow-sm`}>
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight">{user?.name}</p>
                <p className="text-xs capitalize text-slate-500">{user?.role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-slide-up">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
