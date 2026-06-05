import React from "react";
import { GraduationCap, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiError } from "../api/http.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { schoolLogo } from "../config/branding.js";
import { useAuth } from "../context/AuthContext.jsx";

const roleConfig = {
  admin: {
    title: "Admin Portal",
    icon: ShieldCheck,
    email: "admin@tfcschool.dz",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-800",
    ring: "focus:ring-violet-100"
  },
  teacher: {
    title: "Teacher Portal",
    icon: GraduationCap,
    email: "teacher.english@tfcschool.dz",
    gradient: "from-sky-500 to-blue-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-800",
    ring: "focus:ring-sky-100"
  },
  student: {
    title: "Student Portal",
    icon: UserRound,
    email: "student.amine@tfcschool.dz",
    gradient: "from-teal-500 to-emerald-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-800",
    ring: "focus:ring-teal-100"
  }
};

export default function LoginPage({ role }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const config = roleConfig[role];
  const Icon = config.icon;
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ ...form, role });
      navigate(`/${role}`, { replace: true });
    } catch (loginError) {
      setError(getApiError(loginError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 text-slate-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.85fr_1.15fr]">

          {/* Left — Branding + role selector */}
          <div className="animate-fade-slide-up space-y-6">
            {/* School card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <img
                  src={schoolLogo}
                  alt="TFC School"
                  className="h-14 w-14 rounded-xl object-contain ring-2 ring-white/20"
                />
                <div>
                  <p className="text-2xl font-bold text-white">TFC School</p>
                  <p className="text-sm text-slate-400">Algeria private school platform</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                Secure access to the school management system for admins, teachers, and students.
              </p>
            </div>

            {/* Role selector */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Select your role
              </p>
              <div className="grid gap-2">
                {Object.entries(roleConfig).map(([key, item]) => {
                  const RoleIcon = item.icon;
                  const isActive = key === role;
                  return (
                    <Link
                      key={key}
                      to={`/${key}/login`}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-md`
                          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <RoleIcon className="h-4 w-4" aria-hidden="true" />
                        {item.title}
                      </span>
                      <span className="text-xs capitalize opacity-70">{key}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — Login form */}
          <div
            className="animate-fade-slide-up rounded-2xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-md"
            style={{ animationDelay: "0.1s" }}
          >
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
              <div className={`rounded-2xl bg-gradient-to-br ${config.gradient} p-3 shadow-lg`}>
                <Icon className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
                <p className="text-sm text-slate-500">Secure login for {role} accounts</p>
              </div>
            </div>

            <ErrorAlert message={error} />

            <form className="mt-2 grid gap-5" onSubmit={handleSubmit}>
              <label className="field">
                Email address
                <span className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((c) => ({ ...c, email: event.target.value }))}
                    placeholder={config.email}
                    className="input pl-10"
                    required
                  />
                </span>
              </label>

              <label className="field">
                Password
                <span className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((c) => ({ ...c, password: event.target.value }))}
                    placeholder="Enter your password"
                    className="input pl-10"
                    required
                    minLength={8}
                  />
                </span>
              </label>

              <button
                type="submit"
                className={`mt-1 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${config.gradient} text-sm font-bold text-white shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg focus:outline-none focus:ring-2 ${config.ring} disabled:cursor-not-allowed disabled:opacity-60`}
                disabled={loading}
              >
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              TFC School &mdash; Private School Management Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
