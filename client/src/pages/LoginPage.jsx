import { GraduationCap, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiError } from "../api/http.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import { schoolLogo } from "../config/branding.js";
import { useAuth } from "../context/AuthContext.jsx";

const roleConfig = {
  admin: {
    title: "Admin access",
    icon: ShieldCheck,
    email: "admin@tfcschool.dz"
  },
  teacher: {
    title: "Teacher access",
    icon: GraduationCap,
    email: "teacher.english@tfcschool.dz"
  },
  student: {
    title: "Student access",
    icon: UserRound,
    email: "student.amine@tfcschool.dz"
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
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <img src={schoolLogo} alt="TFC School" className="h-14 w-14 rounded-md object-contain" />
              <div>
                <p className="text-2xl font-semibold">TFC School</p>
                <p className="text-sm text-slate-500">Algeria private school platform</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3">
              {Object.entries(roleConfig).map(([key, item]) => {
                const RoleIcon = item.icon;
                return (
                  <Link
                    key={key}
                    to={`/${key}/login`}
                    className={`flex items-center justify-between rounded-md border px-4 py-3 text-sm font-medium transition ${
                      key === role
                        ? "border-teal-700 bg-teal-50 text-teal-900"
                        : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <RoleIcon className="h-4 w-4" aria-hidden="true" />
                      {item.title}
                    </span>
                    <span className="capitalize">{key}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-soft">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-md bg-teal-50 p-3 text-teal-800">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{config.title}</h1>
                <p className="text-sm text-slate-500">Secure login for {role} users</p>
              </div>
            </div>

            <ErrorAlert message={error} />

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Email
                <span className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder={config.email}
                    className="input pl-10"
                    required
                  />
                </span>
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Password
                <span className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder="Enter password"
                    className="input pl-10"
                    required
                    minLength={8}
                  />
                </span>
              </label>

              <button type="submit" className="btn-primary mt-2" disabled={loading}>
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                {loading ? "Signing in" : "Sign in"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
