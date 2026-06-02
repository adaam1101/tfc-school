import nodemailer from "nodemailer";

const notificationsEnabled = () => process.env.NOTIFICATIONS_ENABLED === "true";

const createTransport = () => {
  if (!notificationsEnabled()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        : undefined
  });
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
