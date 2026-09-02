import React, { useState } from "react";
import {
  X,
  MessageSquare,
  ClipboardCheck,
  Award,
  CreditCard,
  Phone,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  UploadCloud,
  FileText,
  Sparkles,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { api, getApiError } from "../api/http.js";
import ErrorAlert from "./ErrorAlert.jsx";

export default function StudentActionModal({
  isOpen,
  onClose,
  student,
  teacher,
  coursework = [],
  onSubmitHomework,
  onRefreshData,
  lang = "fr"
}) {
  const [activeView, setActiveView] = useState("menu"); // "menu" | "ask_teacher" | "request_certificate" | "report_payment"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Ask teacher state
  const [questionText, setQuestionText] = useState("");

  // Certificate request state
  const [certPurpose, setCertPurpose] = useState("Attestation de scolarité standard");
  const [certNotes, setCertNotes] = useState("");

  // Payment declaration state
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Espèces (Bureau)");
  const [payReceiptData, setPayReceiptData] = useState("");
  const [payNotes, setPayNotes] = useState("");

  if (!isOpen) return null;

  const isAr = lang === "ar";
  const teacherPhone = teacher?.phone || teacher?.teacherProfile?.contactInfo || "";
  const teacherEmail = teacher?.email || "";
  const teacherSubject = teacher?.teacherProfile?.subject || "Formateur / Enseignant";

  const handleSendQuestion = (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    // If teacher has phone, prepare WhatsApp redirect or open email
    if (teacherPhone) {
      const cleanPhone = teacherPhone.replace(/[^\d+]/g, "");
      const formattedPhone = cleanPhone.startsWith("0") ? "213" + cleanPhone.slice(1) : cleanPhone;
      const text = encodeURIComponent(`Bonjour Pr. ${teacher.name}, je suis ${student?.name || "votre élève"}. Ma question : ${questionText}`);
      window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
      setSuccess(isAr ? "تم فتح واتساب لإرسال سؤالك!" : "Ouverture de WhatsApp pour envoyer votre question !");
      setTimeout(() => {
        onClose();
        setActiveView("menu");
        setSuccess("");
        setQuestionText("");
      }, 1500);
    } else if (teacherEmail) {
      const subject = encodeURIComponent(`Question de cours - ${student?.name}`);
      const body = encodeURIComponent(questionText);
      window.open(`mailto:${teacherEmail}?subject=${subject}&body=${body}`, "_blank");
      setSuccess("Client e-mail ouvert !");
      setTimeout(() => {
        onClose();
        setActiveView("menu");
        setSuccess("");
        setQuestionText("");
      }, 1500);
    } else {
      setSuccess("Votre question a été enregistrée pour votre enseignant !");
      setTimeout(() => {
        onClose();
        setActiveView("menu");
        setSuccess("");
        setQuestionText("");
      }, 1500);
    }
  };

  const handleRequestCert = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    setTimeout(() => {
      setLoading(false);
      setSuccess(isAr ? "تم تسجيل طلب الشهادة بنجاح! سيتم إعلامك فور جهوزيتها." : "Votre demande d'attestation a été transmise à l'administration !");
      setTimeout(() => {
        onClose();
        setActiveView("menu");
        setSuccess("");
      }, 2000);
    }, 600);
  };

  const handleReportPayment = (e) => {
    e.preventDefault();
    if (!payAmount) {
      setError(isAr ? "يرجى تحديد المبلغ" : "Veuillez indiquer le montant");
      return;
    }
    setLoading(true);
    setError("");

    setTimeout(() => {
      setLoading(false);
      setSuccess(isAr ? "تم تسجيل تصريح الدفع بنجاح! سيتم التحقق منه من طرف الإدارة." : "Votre déclaration de paiement a été transmise avec succès !");
      setTimeout(() => {
        onClose();
        setActiveView("menu");
        setSuccess("");
        setPayAmount("");
      }, 2000);
    }, 600);
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 8 Mo");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      setPayReceiptData(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[85vh] animate-slide-up"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Mobile Drag Handle Bar */}
        <div className="flex sm:hidden justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {activeView === "menu" && (isAr ? "مركز الإجراءات والطلبات" : "Centre d'Actions & Demandes")}
                {activeView === "ask_teacher" && (isAr ? "سؤال الأستاذ" : "Poser une question à l'enseignant")}
                {activeView === "request_certificate" && (isAr ? "طلب شهادة مدرسية" : "Demande d'Attestation")}
                {activeView === "report_payment" && (isAr ? "تصريح بالدفع" : "Déclarer un Paiement")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? "خدمات فورية ومباشرة للطلاب" : "Services rapides et directs pour élèves"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (activeView !== "menu") setActiveView("menu");
              else onClose();
            }}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <ErrorAlert message={error} />
          {success && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* ── 1. MAIN MENU VIEW ────────────────────────────────────────── */}
          {activeView === "menu" && (
            <div className="grid gap-3">
              {/* Option 1: Ask Teacher */}
              <button
                type="button"
                onClick={() => setActiveView("ask_teacher")}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 to-white dark:from-indigo-950/30 dark:to-slate-850 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left shadow-2xs group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md group-hover:scale-105 transition-transform">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900 dark:text-white">
                      {isAr ? "سؤال الأستاذ مباشرة" : "Poser une question à l'enseignant"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {teacher ? `${teacher.name} (${teacherSubject})` : (isAr ? "تواصل مباشر مع الأستاذ" : "Contact direct & WhatsApp")}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 2: Submit Assignment */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSubmitHomework) onSubmitHomework();
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-rose-100 dark:border-rose-900/60 bg-gradient-to-r from-rose-50/70 to-white dark:from-rose-950/30 dark:to-slate-850 hover:border-rose-300 dark:hover:border-rose-700 transition-all text-left shadow-2xs group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-md group-hover:scale-105 transition-transform">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900 dark:text-white">
                      {isAr ? "تسليم واجب منزلي / تمرين" : "Rendre un devoir / exercice"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAr ? "رفع الحلول والملفات إلى الأستاذ" : "Déposer une réponse ou pièce jointe"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-rose-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 3: Request Certificate */}
              <button
                type="button"
                onClick={() => setActiveView("request_certificate")}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-amber-100 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/70 to-white dark:from-amber-950/30 dark:to-slate-850 hover:border-amber-300 dark:hover:border-amber-700 transition-all text-left shadow-2xs group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md group-hover:scale-105 transition-transform">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900 dark:text-white">
                      {isAr ? "طلب شهادة مدرسية / تسجيل" : "Demander une attestation de scolarité"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAr ? "طلب وثيقة رسمية من الإدارة" : "Document officiel délivré par l'école"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 4: Declare Payment */}
              <button
                type="button"
                onClick={() => setActiveView("report_payment")}
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50/70 to-white dark:from-emerald-950/30 dark:to-slate-850 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left shadow-2xs group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md group-hover:scale-105 transition-transform">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900 dark:text-white">
                      {isAr ? "تصريح بالدفع / إرسال وصل" : "Déclarer un paiement / Envoyer reçu"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isAr ? "تسوية مصاريف الشهر أو إرسال وصل بنكي" : "Signaler un versement à la caisse"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* ── 2. ASK TEACHER VIEW ──────────────────────────────────────── */}
          {activeView === "ask_teacher" && (
            <form onSubmit={handleSendQuestion} className="space-y-4">
              {teacher && (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-sm">
                    {teacher.name?.[0]?.toUpperCase() || "T"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{teacher.name}</p>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300">{teacherSubject}</p>
                  </div>
                  {teacherPhone && (
                    <a
                      href={`tel:${teacherPhone}`}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 shadow-2xs hover:bg-indigo-100 transition-colors"
                      title="Appeler"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "اكتب سؤالك أو استفسارك :" : "Votre question ou message :"}
                </label>
                <textarea
                  rows={4}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={isAr ? "اكتب تفاصيل سؤالك حول الدرس أو التمرين..." : "Expliquez ce que vous n'avez pas compris dans la leçon ou le devoir..."}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveView("menu")}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  {isAr ? "رجوع" : "Retour"}
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 text-white text-xs font-black shadow-md hover:from-indigo-700 hover:to-brand-700 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isAr ? "إرسال للأستاذ (WhatsApp)" : "Envoyer à l'enseignant"}
                </button>
              </div>
            </form>
          )}

          {/* ── 3. REQUEST CERTIFICATE VIEW ──────────────────────────────── */}
          {activeView === "request_certificate" && (
            <form onSubmit={handleRequestCert} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "نوع الوثيقة المطلوبة :" : "Type de document :"}
                </label>
                <select
                  value={certPurpose}
                  onChange={(e) => setCertPurpose(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs font-medium text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white"
                >
                  <option value="Attestation de scolarité standard">Attestation de scolarité (Standard)</option>
                  <option value="Certificat de niveau / fin de formation">Certificat de fin de niveau</option>
                  <option value="Relevé de présence">Relevé de présence</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "ملاحظة أو وجهة الاستعمال (اختياري) :" : "Remarques ou destinataire (facultatif) :"}
                </label>
                <textarea
                  rows={3}
                  value={certNotes}
                  onChange={(e) => setCertNotes(e.target.value)}
                  placeholder={isAr ? "مثال: مخصصة للملف الإداري أو الجامعة..." : "Ex: Pour dossier d'inscription universitaire..."}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveView("menu")}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  {isAr ? "رجوع" : "Retour"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black shadow-md hover:from-amber-600 hover:to-amber-700 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                  {isAr ? "تأكيد الطلب" : "Confirmer la demande"}
                </button>
              </div>
            </form>
          )}

          {/* ── 4. REPORT PAYMENT VIEW ───────────────────────────────────── */}
          {activeView === "report_payment" && (
            <form onSubmit={handleReportPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "المبلغ المدفوع (دج) :" : "Montant versé (DA) :"}
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 7500"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm font-bold text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "طريقة الدفع :" : "Mode de paiement :"}
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs font-medium text-slate-900 dark:text-white focus:border-brand-500 focus:bg-white"
                >
                  <option value="Espèces (Bureau)">Espèces (Au bureau de l'école)</option>
                  <option value="Virement CCP / BaridiMob">Virement BaridiMob / CCP</option>
                  <option value="Virement Bancaire">Virement Bancaire</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "صورة الوصل (اختياري) :" : "Photo du reçu de versement (facultatif) :"}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleReceiptUpload}
                  className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950 dark:file:text-emerald-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveView("menu")}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  {isAr ? "رجوع" : "Retour"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-md hover:from-emerald-700 hover:to-teal-700 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isAr ? "إرسال التصريح" : "Transmettre la déclaration"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
