import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { getApiError } from "../api/http.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { schoolLogo, schoolInfo } from "../config/branding.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, password });
      setDone(true);
      setTimeout(() => navigate("/admin/login", { replace: true }), 2500);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1f35] to-[#1a3a5c] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md animate-fade-slide-up">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/50 transition hover:text-white/80">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl shadow-2xl">
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/30">
                <LockKeyhole className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-black">New password</p>
                <p className="text-sm opacity-80">Choose a strong password</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8 flex items-center gap-3">
              <img src={schoolLogo} alt="TFC" className="h-10 w-10 rounded-xl object-contain opacity-80" />
              <div>
                <p className="text-sm font-bold text-white">{schoolInfo.name}</p>
                <p className="text-xs text-white/40">{schoolInfo.city}</p>
              </div>
            </div>

            {done ? (
              <div className="grid gap-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 ring-2 ring-emerald-400/30">
                  <CheckCircle2 className="h-7 w-7 text-emerald-300" />
                </div>
                <p className="text-sm text-white/70">Password updated! Redirecting you to login…</p>
              </div>
            ) : !token ? (
              <div className="grid gap-4 text-center">
                <p className="text-sm text-rose-300">This reset link is missing or invalid.</p>
                <Link to="/forgot-password" className="text-sm font-semibold text-violet-300 hover:text-violet-200">
                  Request a new link
                </Link>
              </div>
            ) : (
              <>
                <ErrorAlert message={error} />
                <form className="grid gap-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60">
                      New password
                    </label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full rounded-2xl border border-violet-500/30 bg-violet-900/30 py-3.5 pl-11 pr-12 text-sm text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-violet-500/30 focus:border-transparent"
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
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60">
                      Confirm password
                    </label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <input
                        type={showPwd ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full rounded-2xl border border-violet-500/30 bg-violet-900/30 py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-violet-500/30 focus:border-transparent"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 py-4 text-sm font-black text-white shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <LockKeyhole className="h-4 w-4" />
                    {loading ? "Updating…" : "Update password"}
                  </button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-xs text-white/25">
              {schoolInfo.credit} · {schoolInfo.city}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
