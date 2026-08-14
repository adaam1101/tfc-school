import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LockKeyhole, Mail, ShieldCheck, UserRound, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { getApiError } from "../api/http.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { schoolLogo, schoolInfo } from "../config/branding.js";
import { useAuth } from "../context/AuthContext.jsx";

const genericConfig = {
  title: "Sign in",
  subtitle: "Access your dashboard",
  icon: LockKeyhole,
  cta: "Sign in",
  placeholder: "you@example.com"
};

const roleConfig = {
  admin: {
    title: "Admin Portal",
    subtitle: "Authorized personnel only",
    icon: ShieldCheck,
    placeholder: `admin@${(import.meta.env.VITE_SCHOOL_SHORT || "tfc").toLowerCase()}school.dz`
  },
  "sous-admin": {
    title: "Sous-Admin Portal",
    subtitle: "Gestion des utilisateurs",
    icon: UserRound,
    placeholder: `sousadmin@${(import.meta.env.VITE_SCHOOL_SHORT || "tfc").toLowerCase()}school.dz`
  },
  moderator: {
    title: "Moderator Portal",
    subtitle: "Gestion des inscriptions",
    icon: ShieldCheck,
    placeholder: `moderator@${(import.meta.env.VITE_SCHOOL_SHORT || "tfc").toLowerCase()}school.dz`
  },
  teacher: {
    title: "Teacher Portal",
    subtitle: "Welcome back, educator",
    icon: GraduationCap,
    placeholder: `teacher@${(import.meta.env.VITE_SCHOOL_SHORT || "tfc").toLowerCase()}school.dz`
  },
  student: {
    title: "Student Portal",
    subtitle: "Ready to learn today?",
    icon: UserRound,
    placeholder: "Enter your username (e.g. adam123)"
  }
};

export default function LoginPage({ role }) {
  const navigate = useNavigate();
  const { login, verifyTwoFactor } = useAuth();
  const cfg = role ? roleConfig[role] : genericConfig;
  const Icon = cfg.icon;
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [step, setStep] = useState("credentials"); // credentials | twofa
  const [code, setCode] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ ...form, role });
      if (result?.twoFactorRequired) {
        setStep("twofa");
      } else {
        navigate(`/${result?.user?.role || role}`, { replace: true });
      }
    } catch (loginError) {
      setError(getApiError(loginError));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const verifiedUser = await verifyTwoFactor({ email: form.email, code });
      navigate(`/${verifiedUser?.role || role}`, { replace: true });
    } catch (verifyError) {
      setError(getApiError(verifyError));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-brand-200 bg-brand-50/60 py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-200";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-100 via-brand-50 to-brand-200 px-4 py-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-300/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Return home link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-white/80 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md">
              <Icon className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{cfg.title}</h1>
            <p className="mt-1 text-xs text-slate-500">{cfg.subtitle}</p>
          </div>

          <ErrorAlert message={error} />

          {step === "credentials" && (
            <form className="grid gap-5" onSubmit={handleSubmit}>
              {/* Username / Email */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-700">
                  {role === "student" ? "Username" : "Username or Email"}
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
                  <input
                    type="text"
                    value={form.email}
                    onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                    placeholder={cfg.placeholder}
                    className={inputClass}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-700">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                    placeholder="Enter your password"
                    className={`${inputClass} pr-12`}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-700 transition"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 py-4 text-sm font-black text-white shadow-lg shadow-brand-300/50 transition-all duration-200 hover:from-brand-400 hover:to-brand-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <LockKeyhole className="h-4 w-4" />
                {loading ? "Signing in…" : cfg.cta || `Sign in to ${cfg.title}`}
              </button>

              <Link
                to="/forgot-password"
                className="-mt-1 text-center text-xs font-medium text-slate-400 transition hover:text-brand-700"
              >
                Forgot your password?
              </Link>
            </form>
            )}

            {step === "twofa" && (
            <form className="grid gap-5" onSubmit={handleVerify}>
              <p className="text-sm text-slate-600">
                We emailed a 6-digit code to <span className="font-semibold text-slate-900">{form.email}</span>.
                Enter it below to finish signing in.
              </p>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-brand-700">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full rounded-2xl border border-brand-200 bg-brand-50/60 py-3.5 text-center text-2xl font-bold tracking-[0.5em] text-slate-900 placeholder-slate-300 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-200"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 py-4 text-sm font-black text-white shadow-lg shadow-brand-300/50 transition-all duration-200 hover:from-brand-400 hover:to-brand-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="h-4 w-4" />
                {loading ? "Verifying…" : "Verify & sign in"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("credentials"); setCode(""); setError(""); }}
                className="text-center text-xs font-medium text-slate-400 transition hover:text-brand-700"
              >
                Back to login
              </button>
            </form>
            )}

            <p className="mt-6 text-center text-xs text-slate-400">
              {schoolInfo.credit} · {schoolInfo.city}
            </p>
          </div>
        </div>
      </div>
    );
  }
