import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MailCheck, Send } from "lucide-react";
import { getApiError } from "../api/http.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { schoolLogo, schoolInfo } from "../config/branding.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const msg = await forgotPassword(email);
      setMessage(msg);
      setDone(true);
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
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/30">
                <Mail className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-black">Reset password</p>
                <p className="text-sm opacity-80">We'll email you a reset link</p>
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
                  <MailCheck className="h-7 w-7 text-emerald-300" />
                </div>
                <p className="text-sm text-white/70">{message}</p>
                <p className="text-xs text-white/40">
                  Check your inbox (and spam folder). The link expires in 30 minutes.
                </p>
                <Link to="/admin/login" className="mt-2 text-sm font-semibold text-sky-300 hover:text-sky-200">
                  Return to login
                </Link>
              </div>
            ) : (
              <>
                <ErrorAlert message={error} />
                <form className="grid gap-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/60">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@tfcschool.dz"
                        className="w-full rounded-2xl border border-sky-500/30 bg-sky-900/30 py-3.5 pl-11 pr-4 text-sm text-white placeholder-white/25 outline-none transition focus:ring-2 focus:ring-sky-500/30 focus:border-transparent"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 py-4 text-sm font-black text-white shadow-lg transition-all duration-200 hover:opacity-90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? "Sending…" : "Send reset link"}
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
