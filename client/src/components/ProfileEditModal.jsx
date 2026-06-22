import React, { useRef, useState } from "react";
import {
  Camera,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Save,
  UserRound,
  X
} from "lucide-react";
import { api, getApiError } from "../api/http.js";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorAlert from "./ErrorAlert.jsx";

const MAX_PHOTO_BYTES = 2_000_000; // 2 MB

function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 400;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = url;
  });
}

export default function ProfileEditModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  const fileRef = useRef();

  const [photo, setPhoto]           = useState(user?.photo || "");
  const [name, setName]             = useState(user?.name || "");
  const [age, setAge]               = useState(user?.age ?? "");
  const [phone, setPhone]           = useState(user?.phone || "");
  const [dateOfBirth, setDob]       = useState(
    user?.teacherProfile?.dateOfBirth || ""
  );
  const [contactInfo, setContact]   = useState(
    user?.teacherProfile?.contactInfo || ""
  );
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  const initials = (user?.name || "?")
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    if (compressed.length > MAX_PHOTO_BYTES) {
      setError("Photo is too large. Please choose a smaller image.");
      return;
    }
    setPhoto(compressed);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPw && newPw !== confirmPw) {
      setError("New passwords do not match.");
      return;
    }
    if (newPw && newPw.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const payload = { name, age, phone, photo, dateOfBirth, contactInfo };
      if (newPw) {
        payload.currentPassword = currentPw;
        payload.newPassword     = newPw;
      }
      const msg = await updateProfile(payload);
      setSuccess(msg || "Profile updated successfully.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-800 shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-6 py-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Edit Profile</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <ErrorAlert message={error} />

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50 px-4 py-3 text-sm font-medium text-emerald-800 dark:text-emerald-300">
              {success}
            </div>
          )}

          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {photo ? (
                <img src={photo} alt="Profile" className="h-24 w-24 rounded-3xl object-cover ring-4 ring-brand-100 dark:ring-brand-900 shadow-lg" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-black text-white shadow-lg">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-md hover:bg-brand-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role} · {user?.email}</p>
            </div>
            {photo && photo !== user?.photo && (
              <button type="button" onClick={() => setPhoto(user?.photo || "")} className="text-xs text-rose-500 hover:underline">
                Remove new photo
              </button>
            )}
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Basic info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Personal info</h3>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Full name</span>
              <input
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Age</span>
              <input
                type="number"
                min="3"
                max="120"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 35"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone number</span>
              <input
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+213 …"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Date of birth</span>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={dateOfBirth}
                onChange={(e) => setDob(e.target.value)}
              />
            </label>

            {(user?.role === "teacher") && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Contact / bio</span>
                <textarea
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none min-h-[80px]"
                  value={contactInfo}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Additional contact info or short bio…"
                />
              </label>
            )}
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Password change */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Change password <span className="text-xs font-normal normal-case">(leave blank to keep current)</span>
            </h3>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Current password</span>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 pr-10 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">New password</span>
              <input
                type={showPw ? "text" : "password"}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={newPw ? 8 : undefined}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm new password</span>
              <input
                type={showPw ? "text" : "password"}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 py-2.5 text-sm font-bold text-white shadow-sm hover:from-brand-700 hover:to-brand-800 disabled:opacity-60 transition-all"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
