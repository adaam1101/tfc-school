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
  const parentEmail = student.studentProfile?.parentEmail;
  const missingSmtp = ["SMTP_HOST", "SMTP_FROM"].filter((key) => !process.env[key]);

  if (!notificationsEnabled()) {
    return {
      sent: false,
      channel: "none",
      error: "Notifications are disabled. Set NOTIFICATIONS_ENABLED=true after SMTP is configured."
    };
  }

  if (!parentEmail) {
    return {
      sent: false,
      channel: "none",
      error: "Student does not have a parent email address."
    };
  }

  if (missingSmtp.length) {
    return {
      sent: false,
      channel: "email",
      error: `Missing SMTP settings: ${missingSmtp.join(", ")}.`
    };
  }

  const transporter = createTransport();
  const subject = `TFC School absence notification - ${student.name}`;
  const text = [
    `Hello ${student.studentProfile?.parentName || "Parent"},`,
    "",
    `${student.name} was marked absent on ${attendance.date}.`,
    teacher?.name ? `Marked by: ${teacher.name}` : "",
    attendance.note ? `Teacher note: ${attendance.note}` : "",
    "",
    "Please contact TFC School if you have any questions."
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "TFC School <no-reply@tfcschool.dz>",
    to: parentEmail,
    subject,
    text
  });

  return { sent: true, channel: "email", error: undefined };
};
