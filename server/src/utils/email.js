import https from "node:https";

const notificationsEnabled = () => process.env.NOTIFICATIONS_ENABLED === "true";

export const emailReady = () =>
  notificationsEnabled() && Boolean(process.env.SENDGRID_API_KEY && process.env.SMTP_USER);

/** Send via SendGrid HTTP API — works on Render free tier (HTTPS port 443) */
const sendViaSendGrid = (payload) =>
  new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: "api.sendgrid.com",
        path: "/v3/mail/send",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Length": Buffer.byteLength(body)
        }
      },
      (res) => {
        let data = "";
        res.on("data", (c) => { data += c; });
        res.on("end", () => {
          // SendGrid returns 202 on success (no body)
          if (res.statusCode === 202) {
            resolve();
          } else {
            let msg = `SendGrid error ${res.statusCode}`;
            try { msg = JSON.parse(data)?.errors?.[0]?.message || msg; } catch (_) {}
            reject(new Error(msg));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });

export const sendEmail = async ({ to, subject, text }) => {
  if (!emailReady()) {
    throw new Error("Email not configured. Set NOTIFICATIONS_ENABLED=true, SENDGRID_API_KEY, SMTP_USER.");
  }
  await sendViaSendGrid({
    personalizations: [{ to: [{ email: to }] }],
    from:    { email: process.env.SMTP_USER, name: "TFC School" },
    subject,
    content: [{ type: "text/plain", value: text }]
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
    return { sent: false, channel: "none", error: "SENDGRID_API_KEY not set." };
  }

  try {
    const text = [
      `Bonjour ${parentName},`,
      "",
      `Nous vous informons que votre enfant ${student.name} a été marqué(e) ABSENT(E) aujourd'hui.`,
      `📅 Date : ${date}`,
      teacher?.name   ? `👨‍🏫 Responsable : ${teacher.name}` : "",
      attendance.note ? `📝 Note : ${attendance.note}`        : "",
      "",
      "──────────────────────────",
      "",
      `السلام عليكم ${parentName}،`,
      `نُعلمكم بأن الطالب/ة ${student.name} سُجِّل غائباً اليوم — ${date}.`,
      "",
      "📞 +213 561 502 098",
      "🏫 TFC Training Formation Center — Annaba"
    ].filter(Boolean).join("\n");

    await sendViaSendGrid({
      personalizations: [{ to: [{ email: parentEmail, name: parentName }] }],
      from:    { email: process.env.SMTP_USER, name: "TFC School" },
      subject: `🏫 TFC — Absence de ${student.name} — ${date}`,
      content: [{ type: "text/plain", value: text }]
    });

    return { sent: true, channel: "email", emailSent: true, whatsappSent: false };
  } catch (err) {
    return { sent: false, channel: "none", emailSent: false, whatsappSent: false, error: err.message };
  }
};
