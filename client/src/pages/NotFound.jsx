import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { schoolLogo } from "../config/branding.js";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0a1628] to-[#1a2f50] px-4 text-white">
      <img src={schoolLogo} alt="TFC" className="mb-6 h-20 w-20 rounded-2xl object-contain opacity-80" />
      <p className="text-8xl font-black opacity-20">404</p>
      <h1 className="mt-2 text-2xl font-black">Page not found</h1>
      <p className="mt-2 text-sm text-blue-300">This page doesn't exist in the TFC platform.</p>
      <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 text-sm font-bold ring-1 ring-white/20 transition hover:bg-white/20">
        <ArrowLeft className="h-4 w-4" />Back to TFC Home
      </Link>
    </div>
  );
}
