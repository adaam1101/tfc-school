import nodemailer from "nodemailer";

const notificationsEnabled = () => process.env.NOTIFICATIONS_ENABLED === "true";

const createTransport = () => {
  if (!notificationsEnabled()) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // Port 465 = implicit SSL; anything else (587) = STARTTLS. Derive automatically
    // unless explicitly overridden, so a mismatched SMTP_SECURE can't cause hangs.
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        : undefined
  });
};

/** True when SMTP is configured well enough to actually send mail. */
export const emailReady = () =>
  notificationsEnabled() && Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);

/** Generic sender. Throws if email is not configured. */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!emailReady()) {
    throw new Error("Email is not configured. Set NOTIFICATIONS_ENABLED=true and SMTP_HOST/SMTP_FROM.");
  }
  const transporter = createTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "TFC School <no-reply@tfcschool.dz>",
    to,
    subject,
    text,
    html
  });
};

export const sendTwoFactorCode = async ({ user, code }) => {
  const subject = "Your TFC School login code";
  const text = [
    `Hello ${user.name},`,
    "",
    `Your verification code is: ${code}`,
    "",
    "It expires in 10 minutes. If you did not try to sign in, you can ignore this email."
  ].join("\n");
  await sendEmail({ to: user.email, subject, text });
};

export const sendPasswordResetEmail = async ({ user, resetUrl }) => {
  const subject = "Reset your TFC School password";
  const text = [
    `Hello ${user.name},`,
    "",
    "We received a request to reset your password. Open the link below to choose a new one:",
    resetUrl,
    "",
    "This link expires in 30 minutes. If you did not request this, you can ignore this email."
  ].join("\n");
  await sendEmail({ to: user.email, subject, text });
};

export const sendAbsenceNotification = async ({ student, teacher, attendance }) => {
  const { sendWhatsApp, buildAbsenceMessage } = await import("./whatsapp.js");

  if (!notificationsEnabled()) {
    return {
      sent: false, channel: "none", emailSent: false, whatsappSent: false,
      error: "Notifications are disabled. Set NOTIFICATIONS_ENABLED=true."
    };
  }

  const parentEmail = student.studentProfile?.parentEmail;
  const parentPhone = student.studentProfile?.parentPhone;
  const parentName  = student.studentProfile?.parentName || "Parent";
  const date        = attendance.date || new Date().toLocaleDateString("fr-DZ");

  let emailSent = false, emailError = "";
  let waSent    = false, waError    = "";

  // ── Email ──────────────────────────────────────────────────────────────
  if (parentEmail && process.env.SMTP_HOST && process.env.SMTP_FROM) {
    try {
      const transporter = createTransport();
      const subject = `🏫 TFC — Absence de ${student.name} — ${date}`;
      const text = [
        `Bonjour ${parentName},`,
        "",
        `Nous vous informons que votre enfant ${student.name} a été marqué(e) ABSENT(E) aujourd'hui.`,
        `📅 Date : ${date}`,
        teacher?.name  ? `👩‍🏫 Responsable : ${teacher.name}` : "",
        attendance.note ? `📝 Note : ${attendance.note}` : "",
        "",
        `السلام عليكم ${parentName}،`,
        `نُعلمكم بأن الطالب/ة ${student.name} سُجِّل غائباً اليوم — ${date}.`,
        "",
        "📞 Pour toute question / للاستفسار : +213 561 502 098",
        "🏫 TFC Training Formation Center — Annaba"
      ].filter(Boolean).join("\n");

      await transporter.sendMail({
        from: process.env.SMTP_FROM || "TFC School <no-reply@tfcschool.dz>",
        to: parentEmail,
        subject,
        text
      });
      emailSent = true;
    } catch (err) {
      emailError = err.message;
    }
  } else if (!parentEmail) {
    emailError = "No parent email on file.";
  } else {
    emailError = "SMTP not configured.";
  }

  // ── WhatsApp ───────────────────────────────────────────────────────────
  if (parentPhone) {
    const msg = buildAbsenceMessage({ student, teacher, attendance });
    const result = await sendWhatsApp(parentPhone, msg);
    waSent   = result.sent;
    waError  = result.error || "";
  } else {
    waError = "No parent phone on file.";
  }

  const anySent = emailSent || waSent;
  const channel = emailSent && waSent ? "both"
                : emailSent           ? "email"
                : waSent              ? "whatsapp"
                : "none";

  const errors = [
    !emailSent && emailError ? `Email: ${emailError}` : "",
    !waSent    && waError    ? `WhatsApp: ${waError}`  : ""
  ].filter(Boolean).join(" | ");

  return {
    sent: anySent,
    channel,
    emailSent,
    whatsappSent: waSent,
    error: errors || undefined
  };
};
