import React, { useState } from "react";
import { LogOut, Moon, ScanLine, Sun, UserPen, MoreVertical, Star, Globe } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { schoolLogo, schoolInfo } from "../config/branding.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";
import RatingModal from "../components/RatingModal.jsx";
import ProfileEditModal from "../components/ProfileEditModal.jsx";
import { useTheme } from "../hooks/useTheme.js";

const LANGS = [{ code: "ar", label: "ع" }, { code: "fr", label: "FR" }, { code: "en", label: "EN" }];

export default function AppLayout({ title, subtitle, children, fullHeight = false }) {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const location = useLocation();
  const isRfid = location.pathname === "/rfid-attendance";
  const [showRating, setShowRating]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMore, setShowMore]       = useState(false);
  const canEditProfile = ["teacher", "moderator", "sous-admin"].includes(user?.role);
  const { dark, toggle } = useTheme();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";
  const roleGradients = {
    admin:      "from-violet-600 to-purple-700",
    teacher:    "from-brand-600 to-brand-700",
    student:    "from-brand-600 to-emerald-700",
    moderator:  "from-slate-500 to-slate-700",
    "sous-admin": "from-indigo-500 to-indigo-700"
  };
  const gradient = roleGradients[user?.role] || roleGradients.admin;

  return (
    <div className={`flex text-slate-950 dark:text-slate-100 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 ${fullHeight ? "h-screen overflow-hidden flex-col" : "min-h-screen flex-col"}`}>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link to={`/${user?.role || "admin"}`} className="flex items-center gap-2.5 shrink-0">
            <img src={schoolLogo} alt={schoolInfo.short} className="h-9 w-auto max-w-[120px] object-contain" />
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-black tracking-tight">{schoolInfo.short}</p>
              <p className="text-[10px] text-slate-400">{schoolInfo.city}</p>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-1.5">

            {/* Language switcher */}
            <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-0.5">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                    lang === l.code
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Dark mode — always visible, icon only */}
            <button
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-brand-400"
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* RFID — icon only, admin/teacher only */}
            {(user?.role === "admin" || user?.role === "teacher") && (
              <Link
                to="/rfid-attendance"
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                  isRfid
                    ? "bg-brand-600 border-brand-600 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                }`}
                title="RFID Attendance"
              >
                <ScanLine className="h-4 w-4" />
              </Link>
            )}

            {/* User avatar + name */}
            <div className="flex items-center gap-2 pl-1">
              {user?.photo ? (
                <img src={user.photo} alt={user.name} className="h-8 w-8 rounded-xl object-cover ring-2 ring-brand-200 dark:ring-brand-800" />
              ) : (
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-[11px] font-black text-white`}>{initials}</div>
              )}
              <div className="hidden lg:block leading-tight">
                <p className="text-sm font-bold">{user?.name}</p>
                <p className="text-[10px] capitalize text-slate-400">{user?.role}</p>
              </div>
            </div>

            {/* Profile — visible if allowed */}
            {canEditProfile && (
              <button
                onClick={() => setShowProfile(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                title="Edit profile"
              >
                <UserPen className="h-4 w-4" />
              </button>
            )}

            {/* More menu (Rate) — hidden in a dropdown to save space */}
            <div className="relative">
              <button
                onClick={() => setShowMore(v => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                title="More"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showMore && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMore(false)} />
                  <div className="absolute right-0 top-11 z-40 w-44 rounded-2xl border border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-xl overflow-hidden">
                    <button
                      onClick={() => { setShowRating(true); setShowMore(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Star className="h-4 w-4 text-amber-500 fill-amber-400" /> Rate the app
                    </button>
                    <button
                      onClick={() => { logout(); setShowMore(false); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>

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
        <footer className="border-t border-slate-200 bg-white/60 py-4 text-center backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/60">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} {schoolInfo.short} — {schoolInfo.name} · {schoolInfo.address}</p>
          </div>
        </footer>
      )}

      {showRating  && <RatingModal      onClose={() => setShowRating(false)}  />}
      {showProfile && <ProfileEditModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}
