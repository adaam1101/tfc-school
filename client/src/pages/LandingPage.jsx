import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail, Phone, MapPin, ShieldCheck, GraduationCap, UserRound,
  Wifi, BarChart3, Bell, Star, ChevronRight, BookOpen,
  Award, Users, Clock, ArrowRight
} from "lucide-react";
import { schoolLogo, schoolInfo } from "../config/branding.js";
import { api } from "../api/http.js";
import StarRating from "../components/StarRating.jsx";
import EnrollModal from "../components/EnrollModal.jsx";

function useRatingSummary() {
  const [data, setData] = useState({ average: 0, count: 0, distribution: [] });
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    api.get("/ratings/summary").then(({ data: d }) => setData(d)).catch(() => {});
    api.get("/ratings/recent").then(({ data: d }) => setReviews(d.ratings || [])).catch(() => {});
  }, []);
  return { ...data, reviews };
}

const features = [
  {
    icon: Wifi,
    title: "RFID Smart Attendance",
    desc: "Instant attendance tracking with RFID card readers. Students tap their card — the system does the rest.",
    color: "from-sky-500 to-emerald-600"
  },
  {
    icon: BarChart3,
    title: "Real-time Reports",
    desc: "Comprehensive attendance analytics, exportable reports, and daily summaries for administrators.",
    color: "from-sky-500 to-blue-600"
  },
  {
    icon: Bell,
    title: "Parent Notifications",
    desc: "Automatic email alerts sent to parents when a student is marked absent.",
    color: "from-violet-500 to-purple-600"
  },
  {
    icon: ShieldCheck,
    title: "Role-based Security",
    desc: "Three secure portals for admins, teachers, and students — each with tailored access.",
    color: "from-rose-500 to-red-600"
  },
  {
    icon: GraduationCap,
    title: "Student Management",
    desc: "Full student profiles with courses, grades, teacher assignments, and enrollment history.",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: BookOpen,
    title: "Academic Records",
    desc: "90-day attendance history, marks, and notes — accessible to students and teachers.",
    color: "from-pink-500 to-rose-500"
  }
];

const portals = [
  {
    role: "admin",
    label: "Admin Portal",
    sub: "Manage users, reports & settings",
    icon: ShieldCheck,
    gradient: "from-violet-600 to-purple-700",
    shadow: "shadow-violet-200",
    link: "/admin/login"
  },
  {
    role: "teacher",
    label: "Teacher Portal",
    sub: "Mark attendance & manage students",
    icon: GraduationCap,
    gradient: "from-sky-600 to-blue-700",
    shadow: "shadow-sky-200",
    link: "/teacher/login"
  },
  {
    role: "student",
    label: "Student Portal",
    sub: "View your profile & attendance",
    icon: UserRound,
    gradient: "from-sky-600 to-emerald-700",
    shadow: "shadow-sky-200",
    link: "/student/login"
  }
];

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-4 text-right text-slate-500">{star}</span>
      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs text-slate-400">{count}</span>
    </div>
  );
}

export default function LandingPage() {
  const rating = useRatingSummary();
  const [navOpen, setNavOpen] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0f1f35]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={schoolLogo} alt="TFC" className="h-10 w-10 rounded-xl object-contain" />
            <div>
              <p className="text-base font-bold text-white leading-tight">TFC School</p>
              <p className="text-xs text-blue-300">Training Formation Center</p>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 text-sm font-medium text-blue-200 md:flex">
            {[["about", "About"], ["features", "Features"], ["ratings", "Reviews"], ["contact", "Contact"]].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="transition hover:text-white"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => setShowEnroll(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Enroll
            </button>
            {portals.map((p) => (
              <Link
                key={p.role}
                to={p.link}
                className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${p.gradient} px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md`}
              >
                <p.icon className="h-3.5 w-3.5" />
                {p.label.split(" ")[0]}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f1f35] to-[#1a2f50] py-24 text-white">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-violet-600/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 text-center">
          {/* Logo */}
          <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-white/10 ring-4 ring-white/20 backdrop-blur-sm shadow-2xl animate-fade-slide-up">
            <img src={schoolLogo} alt="TFC School" className="h-24 w-24 rounded-2xl object-contain" />
          </div>

          <div className="animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-300">Welcome to</p>
            <h1 className="mt-3 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Training Formation
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">
                Center
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-200/80 leading-relaxed">
              {schoolInfo.tagline} — Annaba's premier educational institution dedicated to academic excellence and professional growth.
            </p>
            <button
              onClick={() => setShowEnroll(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-600 px-8 py-4 text-base font-black text-white shadow-lg shadow-sky-900/40 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <GraduationCap className="h-5 w-5" />
              Apply / Enroll Now
            </button>
          </div>

          {/* Stats */}
          <div
            className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-4 animate-fade-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            {[
              { icon: Users, label: "Students", value: "200+" },
              { icon: Award, label: "Programs",  value: "12+"  },
              { icon: Clock, label: "Years",     value: "10+"  }
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur-sm ring-1 ring-white/10">
                <Icon className="mx-auto h-5 w-5 text-blue-300" />
                <p className="mt-2 text-2xl font-black">{value}</p>
                <p className="text-xs text-blue-300">{label}</p>
              </div>
            ))}
          </div>

          {/* Portal buttons */}
          <div
            className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            {portals.map((p) => (
              <Link
                key={p.role}
                to={p.link}
                className={`group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r ${p.gradient} px-7 py-4 font-bold text-white shadow-lg ${p.shadow} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                <p.icon className="h-5 w-5" />
                <span>
                  <span className="block text-base">{p.label}</span>
                  <span className="block text-xs font-normal opacity-80">{p.sub}</span>
                </span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>

          {/* Rating teaser */}
          {rating.count > 0 && (
            <div
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-white/10 px-6 py-3 backdrop-blur-sm ring-1 ring-white/20 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <StarRating value={Math.round(rating.average)} readOnly size="sm" />
              <span className="text-sm font-semibold text-white">
                {rating.average}/5
              </span>
              <span className="text-sm text-blue-300">({rating.count} reviews)</span>
            </div>
          )}
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-sky-600">About TFC</p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-slate-900">
                Building Futures in
                <span className="text-sky-600"> Annaba</span>
              </h2>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                {schoolInfo.description}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { label: "Excellence", desc: "Highest academic standards in every course" },
                  { label: "Innovation",  desc: "Modern tools and teaching methodologies" },
                  { label: "Community",  desc: "A warm, inclusive learning environment" },
                  { label: "Results",    desc: "Track record of successful graduates" }
                ].map(({ label, desc }) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="font-bold text-slate-900">{label}</p>
                    <p className="mt-1 text-xs text-slate-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users,        label: "Active students",   value: "200+",  color: "from-sky-500 to-emerald-600" },
                { icon: GraduationCap,label: "Expert teachers",   value: "15+",   color: "from-sky-500 to-blue-600"     },
                { icon: BookOpen,     label: "Courses offered",   value: "12+",   color: "from-violet-500 to-purple-600" },
                { icon: Award,        label: "Years of excellence",value: "10+",  color: "from-amber-500 to-orange-500" }
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="card-hover border border-slate-200 p-6 text-center">
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-sm`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-3xl font-black text-slate-900">{value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">Platform Features</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900">
              Everything your school needs
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-500">
              A complete school management system built for the modern classroom.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card-hover group border border-slate-100 p-6">
                <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${f.color} p-3 shadow-sm transition-transform group-hover:scale-110`}>
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portals ── */}
      <section className="bg-gradient-to-br from-[#0f1f35] to-[#1a2f50] py-24 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-300">Secure Access</p>
          <h2 className="mt-3 text-4xl font-black">Choose your portal</h2>
          <p className="mt-4 text-blue-200/80">Each role has a dedicated, secure login portal.</p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {portals.map((p) => (
              <Link
                key={p.role}
                to={p.link}
                className="group relative overflow-hidden rounded-3xl bg-white/5 p-8 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:ring-white/20 hover:shadow-2xl text-left"
              >
                <div className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${p.gradient} p-4 shadow-lg`}>
                  <p.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-black">{p.label}</h3>
                <p className="mt-2 text-sm text-blue-200/70">{p.sub}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-blue-300 group-hover:text-white transition-colors">
                  Login now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ratings ── */}
      <section id="ratings" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-600">Community Reviews</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900">What our community says</h2>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[320px_1fr]">
            {/* Summary */}
            <div className="card border border-slate-200 p-8 text-center">
              <p className="text-7xl font-black text-slate-900">
                {rating.count > 0 ? rating.average : "–"}
              </p>
              <div className="mt-3 flex justify-center">
                <StarRating value={Math.round(rating.average)} readOnly size="lg" />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {rating.count > 0 ? `Based on ${rating.count} review${rating.count > 1 ? "s" : ""}` : "No reviews yet"}
              </p>

              <div className="mt-6 grid gap-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const found = rating.distribution?.find((d) => d.star === star);
                  return (
                    <RatingBar
                      key={star}
                      star={star}
                      count={found?.count || 0}
                      total={rating.count}
                    />
                  );
                })}
              </div>

              <div className="mt-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-4">
                <p className="text-sm font-semibold text-amber-800">Want to rate us?</p>
                <p className="mt-1 text-xs text-amber-600">Log in to your portal and submit your rating.</p>
                <Link to="/student/login" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-600">
                  <Star className="h-3.5 w-3.5 fill-white" />
                  Rate TFC
                </Link>
              </div>
            </div>

            {/* Reviews */}
            <div className="grid gap-4 content-start">
              {rating.reviews.length > 0 ? (
                rating.reviews.map((r) => (
                  <div key={r._id} className="card border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 text-sm font-bold text-white">
                          {r.user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{r.user?.name || "Anonymous"}</p>
                          <p className="text-xs capitalize text-slate-500">{r.user?.role}</p>
                        </div>
                      </div>
                      <StarRating value={r.stars} readOnly size="sm" />
                    </div>
                    {r.comment && (
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed">"{r.comment}"</p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
                  <Star className="h-10 w-10 text-slate-300" />
                  <p className="mt-3 font-medium text-slate-500">No reviews yet</p>
                  <p className="mt-1 text-sm text-slate-400">Be the first to rate TFC School!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-sky-600">Get in touch</p>
            <h2 className="mt-3 text-4xl font-black text-slate-900">Contact Us</h2>
            <p className="mt-4 text-slate-500">We're here to answer your questions.</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Mail,
                label: "Email",
                value: schoolInfo.email,
                sub: "Send us a message",
                color: "from-sky-500 to-blue-600",
                href: `mailto:${schoolInfo.email}`
              },
              {
                icon: Phone,
                label: "Phone 1",
                value: schoolInfo.phones[0],
                sub: "Call us anytime",
                color: "from-sky-500 to-emerald-600",
                href: `tel:${schoolInfo.phones[0].replace(/\s/g, "")}`
              },
              {
                icon: Phone,
                label: "Phone 2",
                value: schoolInfo.phones[1],
                sub: "Alternative line",
                color: "from-sky-500 to-emerald-600",
                href: `tel:${schoolInfo.phones[1].replace(/\s/g, "")}`
              },
              {
                icon: MapPin,
                label: "Address",
                value: schoolInfo.address,
                sub: schoolInfo.city,
                color: "from-rose-500 to-red-600",
                href: null
              }
            ].map(({ icon: Icon, label, value, sub, color, href }) => (
              <div key={label} className="card-hover group border border-slate-100 p-6 text-center">
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-md transition-transform group-hover:scale-110`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                {href ? (
                  <a href={href} className="mt-2 block text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors break-all">
                    {value}
                  </a>
                ) : (
                  <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0a1628] py-12 text-center text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center gap-4">
            <img src={schoolLogo} alt="TFC" className="h-16 w-16 rounded-2xl object-contain opacity-90" />
            <p className="text-xl font-black">Training Formation Center</p>
            <p className="text-blue-300 text-sm">{schoolInfo.tagline}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-blue-300">
              <a href={`mailto:${schoolInfo.email}`} className="hover:text-white transition">{schoolInfo.email}</a>
              {schoolInfo.phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-white transition">{p}</a>
              ))}
              <span>{schoolInfo.address}</span>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6 w-full">
              <p className="text-xs text-blue-400/70">
                © {new Date().getFullYear()} TFC — Training Formation Center. All rights reserved.
              </p>
              <p className="mt-1 text-xs text-blue-400/50">{schoolInfo.credit}</p>
            </div>
          </div>
        </div>
      </footer>

      {showEnroll && <EnrollModal onClose={() => setShowEnroll(false)} />}
    </div>
  );
}
