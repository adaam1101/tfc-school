import nodemailer from "nodemailer";

const notificationsEnabled = () => process.env.NOTIFICATIONS_ENABLED === "true";

const createTransport = () => {
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    connectionTimeout: 20000,
    greetingTimeout:   20000,
    socketTimeout:     30000,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined
  });
};

export const emailReady = () =>
  notificationsEnabled() &&
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!emailReady()) {
    throw new Error("Email not configured. Set NOTIFICATIONS_ENABLED=true, SMTP_HOST, SMTP_USER, SMTP_PASS.");
  }
  const transporter = createTransport();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "TFC School <no-reply@tfcschool.dz>",
    to, subject, text, html
  });
};

export const sendTwoFactorCode = async ({ user, code }) => {
  await sendEmail({
    to: user.email,
    subject: "Your TFC School login code",
    text: `Hello ${user.name},\n\nYour verification code is: ${code}\n\nIt expires in 10 minutes.`
  });
};

export const sendPasswordResetEmail = async ({ user, resetUrl }) => {
  await sendEmail({
    to: user.email,
    subject: "Reset your TFC School password",
    text: `Hello ${user.name},\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link expires in 30 minutes.`
  });
};

export const sendAbsenceNotification = async ({ student, teacher, attendance }) => {
  if (!notificationsEnabled()) {
    return { sent: false, channel: "none", error: "Notifications disabled." };
  }

  const parentEmail = student.studentProfile?.parentEmail;
  const parentName  = student.studentProfile?.parentName || "Parent";
  const date        = attendance.date || new Date().toLocaleDateString("fr-DZ");

  if (!parentEmail) {
    return { sent: false, channel: "none", error: "No parent email on file." };
  }

  if (!emailReady()) {
    return { sent: false, channel: "email", error: "SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS." };
  }

  try {
    const transporter = createTransport();

    const subject = `🏫 TFC — Absence de ${student.name} — ${date}`;

    const text = [
      `Bonjour ${parentName},`,
      "",
      `Nous vous informons que votre enfant ${student.name} a été marqué(e) ABSENT(E) aujourd'hui.`,
      `📅 Date : ${date}`,
      teacher?.name    ? `👨‍🏫 Responsable : ${teacher.name}` : "",
      attendance.note  ? `📝 Note : ${attendance.note}`       : "",
      "",
      "──────────────────────────",
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

    return { sent: true, channel: "email", emailSent: true, whatsappSent: false };
  } catch (err) {
    return { sent: false, channel: "none", emailSent: false, whatsappSent: false, error: err.message };
  }
};
