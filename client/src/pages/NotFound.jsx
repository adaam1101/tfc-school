import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { schoolLogo, schoolInfo } from "../config/branding.js";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-100 via-brand-50 to-brand-200 px-4 text-slate-900">
      <img src={schoolLogo} alt={schoolInfo.short} className="mb-6 h-20 w-20 rounded-2xl object-contain ring-1 ring-brand-100" />
      <p className="text-8xl font-black text-brand-300">404</p>
      <h1 className="mt-2 text-2xl font-black text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-brand-700">This page doesn't exist in the {schoolInfo.short} platform.</p>
      <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-300/50 transition hover:from-brand-400 hover:to-brand-600">
        <ArrowLeft className="h-4 w-4" />Back to {schoolInfo.short} Home
      </Link>
    </div>
  );
}
