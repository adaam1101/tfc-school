import React from "react";
import { LogOut, ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import { schoolLogo } from "../config/branding.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link to={`/${user?.role || "admin"}`} className="flex items-center gap-3">
            <img src={schoolLogo} alt="TFC School" className="h-11 w-11 rounded-md object-contain" />
            <div>
              <p className="text-lg font-semibold">TFC School</p>
              <p className="text-sm text-slate-500">Private school management</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role === "admin" || user?.role === "teacher" ? (
              <Link to="/rfid-attendance" className="btn-secondary">
                <ScanLine className="h-4 w-4" aria-hidden="true" />
                RFID
              </Link>
            ) : null}
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="capitalize text-slate-500">{user?.role}</p>
            </div>
            <button type="button" onClick={logout} className="btn-secondary">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-3xl text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}
