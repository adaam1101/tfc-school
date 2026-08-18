import React, { useState } from "react";
import {
  X,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Phone,
  BookOpen,
  User,
  CheckCircle2,
  Copy,
  Share2,
  Camera,
  Loader2,
  Calendar,
  Layers,
  AlertCircle
} from "lucide-react";
import { api, getApiError } from "../api/http.js";

const fileToCompressedDataUrl = (file, maxSize = 400) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const DEFAULT_LEVELS = [
  "English - A1",
  "English - A2",
  "English - B1",
  "English - B2",
  "Français - A1",
  "Français - A2",
  "Français - B1",
  "Deutsch - A1",
  "Deutsch - A2",
  "Kids English",
  "Standard"
];

export default function TeacherCreateStudentModal({
  defaultCourse = "English - A1",
  groups = [],
  onClose,
  onStudentCreated
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [course, setCourse] = useState(defaultCourse || "English - A1");
  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [age, setAge] = useState("");
  const [groupId, setGroupId] = useState("");
  const [photo, setPhoto] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdStudentData, setCreatedStudentData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Auto-generate username when typing name
  const handleNameChange = (val) => {
    setName(val);
    if (!createdStudentData && !username) {
      const clean = val
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (clean) {
        setUsername(`${clean}${Math.floor(10 + Math.random() * 90)}`);
      }
    }
  };

  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789#@!";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setPhoto(dataUrl);
    } catch {
      setError("Failed to process photo.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter the student full name.");
      return;
    }
    if (!username.trim()) {
      setError("Please enter a username or login ID.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password,
        course: course.trim(),
        phone: phone.trim(),
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        age: age ? Number(age) : undefined,
        groupId: groupId || undefined,
        photo
      };

      const { data } = await api.post("/teacher/students", payload);
      setCreatedStudentData({
        student: data.student,
        rawPassword: password,
        loginId: username.trim().toLowerCase()
      });

      if (onStudentCreated) {
        onStudentCreated(data.student);
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdStudentData) return;
    const text = `👤 Student Login Details:\n• Name: ${createdStudentData.student?.name}\n• Username: ${createdStudentData.loginId}\n• Password: ${createdStudentData.rawPassword}\n• Level: ${createdStudentData.student?.studentProfile?.course}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const buildParentWhatsAppUrl = () => {
    if (!createdStudentData) return null;
    const pPhone = createdStudentData.student?.studentProfile?.parentPhone || phone;
    if (!pPhone) return null;
    const clean = pPhone.replace(/[^0-9]/g, "");
    const msg =
      `*🎓 BIENVENUE À TFC SCHOOL*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Bonjour,\nLe compte élève pour *${createdStudentData.student?.name}* a été créé avec succès.\n\n` +
      `🔑 *IDENTIFIANTS DE CONNEXION :*\n` +
      `👤 *Identifiant / Username:* ${createdStudentData.loginId}\n` +
      `🔒 *Mot de passe:* ${createdStudentData.rawPassword}\n` +
      `📚 *Niveau:* ${createdStudentData.student?.studentProfile?.course || course}\n\n` +
      `📱 Vous pouvez vous connecter à la plateforme pour suivre les cours, devoirs et présences.\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `_TFC School Team_`;

    return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
  };

  const resetFormForNextStudent = () => {
    setName("");
    setUsername("");
    setPassword("");
    setPhone("");
    setParentName("");
    setParentPhone("");
    setAge("");
    setPhoto("");
    setCreatedStudentData(null);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 sm:my-8 shrink-0">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-sm font-bold">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg tracking-tight">
                {createdStudentData ? "Compte Élève Créé !" : "Créer un Compte Élève"}
              </h3>
              <p className="text-xs text-white/80 font-medium">
                {createdStudentData
                  ? "Les identifiants sont prêts à être partagés"
                  : "Ajouter un nouvel élève à votre liste et classe"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3.5 text-xs font-bold text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {createdStudentData ? (
            /* ── SUCCESS CREDENTIALS CARD ── */
            <div className="space-y-6">
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md mb-3">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  {createdStudentData.student?.name}
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                  Compte activé avec succès · {createdStudentData.student?.studentProfile?.course}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 text-white p-5 space-y-3 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-sans font-bold">Identifiant (Username):</span>
                  <span className="font-bold text-brand-300 select-all">{createdStudentData.loginId}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-sans font-bold">Mot de Passe:</span>
                  <span className="font-bold text-amber-300 select-all">{createdStudentData.rawPassword}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans font-bold">Niveau / Formation:</span>
                  <span className="font-bold text-slate-200">{createdStudentData.student?.studentProfile?.course}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-3 text-xs font-black shadow-xs transition-all active:scale-95"
                >
                  <Copy className="h-4 w-4" />
                  <span>{copied ? "Copié ✓" : "Copier les Identifiants"}</span>
                </button>

                {buildParentWhatsAppUrl() && (
                  <a
                    href={buildParentWhatsAppUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-black shadow-md transition-all active:scale-95"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Envoyer sur WhatsApp</span>
                  </a>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={resetFormForNextStudent}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  + Ajouter un autre élève
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white px-5 py-2 text-xs font-black shadow-sm"
                >
                  Terminer
                </button>
              </div>
            </div>
          ) : (
            /* ── STUDENT CREATION FORM ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo & Basic Info */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                <div className="relative group">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Student"
                      className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-500 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-400">
                      <Camera className="h-6 w-6" />
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-[10px] font-bold">
                    <span>Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Photo d'identité (Optionnel)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Sera utilisée sur la carte d'élève et le bulletin numérique.
                  </p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nom et Prénom de l'élève <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Adam Ameyoud"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Username & Password */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Identifiant de Connexion <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: adam123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Utilisé pour se connecter au portail.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Mot de Passe <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Générer</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Min 6 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-9 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Level & Group */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Niveau / Cours <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      list="level-presets"
                      required
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="Ex: English - A1"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <datalist id="level-presets">
                      {DEFAULT_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Groupe / Classe (Optionnel)
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <select
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="">Aucun groupe (Indépendant)</option>
                      {groups.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name} ({g.course || "General"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Parent Phone & Student Phone */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Téléphone du Parent (WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500" />
                    <input
                      type="tel"
                      placeholder="Ex: 0698765432"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pour l'envoi des reçus et alertes d'absence.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Téléphone de l'Élève (Optionnel)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="Ex: 0555123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Age & Parent Name */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Nom du Parent (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: M. Ahmed"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Âge de l'Élève (Optionnel)
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="90"
                    placeholder="Ex: 14"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 py-2.5 text-xs font-black text-white shadow-md hover:from-brand-700 hover:to-purple-700 transition-all disabled:opacity-50 active:scale-95"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  <span>{saving ? "Création en cours..." : "Créer le Compte Élève"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
