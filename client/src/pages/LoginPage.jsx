import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LockKeyhole, Mail, ShieldCheck, UserRound, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { getApiError } from "../api/http.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { schoolLogo, schoolInfo } from "../config/branding.js";
import { useAuth } from "../context/AuthContext.jsx";

const roleConfig = {
  admin: {
    title: "Admin Portal",
    subtitle: "Authorized personnel only",
    icon: ShieldCheck,
    gradient: "from-[#0a1628] via-[#0f1f35] to-[#1a3a5c]",
    btnGradient: "from-violet-600 to-purple-700",
    accentBg: "bg-violet-900/30",
    accentBorder: "border-violet-500/30",
    accentText: "text-violet-300",
    ringColor: "focus:ring-violet-500/30",
    badgeBg: "bg-violet-600",
    placeholder: "admin@tfcschool.dz"
  },
  teacher: {
    title: "Teacher Portal",
    subtitle: "Welcome back, educator",
    icon: GraduationCap,
    gradient: "from-[#0a1628] via-[#0d1e38] to-[#0f2d4a]",
    btnGradient: "from-sky-600 to-blue-700",
    accentBg: "bg-sky-900/30",
    accentBorder: "border-sky-500/30",
    accentText: "text-sky-300",
    ringColor: "focus:ring-sky-500/30",
    badgeBg: "bg-sky-600",
    placeholder: "teacher@tfcschool.dz"
  },
  student: {
    title: "Student Portal",
    subtitle: "Ready to learn today?",
    icon: UserRound,
    gradient: "from-[#0a1a20] via-[#0d2530] to-[#0f2d38]",
    btnGradient: "from-teal-600 to-emerald-700",
    accentBg: "bg-teal-900/30",
    accentBorder: "border-teal-500/30",
    accentText: "text-teal-300",
    ringColor: "focus:ring-teal-500/30",
    badgeBg: "bg-teal-600",
    placeholder: "student@tfcschool.dz"
  }
};

export default function LoginPage({ role }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const cfg = roleConfig[role];
  const Icon = cfg.icon;
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

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
    <div className={`min-h-screen bg-gradient-to-br ${cfg.gradient} flex items-center justify-center px-4 py-12`}>
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-white/3 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-white/3 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-slide-up">
        {/* Back to home */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/50 transition hover:text-white/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl shadow-2xl">
          {/* Top bar */}
          <div className={`bg-gradient-to-r ${cfg.btnGradient} p-6 text-white`}>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/30">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-black">{cfg.title}</p>
                <p className="text-sm opacity-80">{cfg.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="p-8">
            {/* School identity */}
            <div className="mb-8 flex items-center gap-3">
              <img src={schoolLogo} alt="TFC" className="h-10 w-10 rounded-xl object-contain opacity-80" />
              <div>
                <p className="text-sm font-bold text-white">{schoolInfo.name}</p>
                <p className="text-xs text-white/40">{schoolInfo.city}</p>
              </div>
            </div>

            <ErrorAlert message={error} />

            <form className="grid gap-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                    placeholder={cfg.placeholder}
                    className={`w-full rounded-2xl border ${cfg.accentBorder} ${cfg.accentBg} py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/25 outline-none transition ${cfg.ringColor} focus:ring-2 focus:border-transparent`}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                    placeholder="Enter your password"
                    className={`w-full rounded-2xl border ${cfg.accentBorder} ${cfg.accentBg} py-3.5 pl-11 pr-12 text-sm text-white placeholder-white/25 outline-none transition ${cfg.ringColor} focus:ring-2 focus:border-transparent`}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${cfg.btnGradient} py-4 text-sm font-black text-white shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <LockKeyhole className="h-4 w-4" />
                {loading ? "Signing in…" : `Sign in to ${cfg.title}`}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-white/25">
              {schoolInfo.credit} · {schoolInfo.city}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
