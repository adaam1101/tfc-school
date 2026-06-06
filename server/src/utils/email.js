import https from "node:https";

const notificationsEnabled = () => process.env.NOTIFICATIONS_ENABLED === "true";

/** Send via Brevo HTTP API — works on Render free tier (port 443 only) */
const sendViaBrevo = (payload) =>
  new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "Content-Length": Buffer.byteLength(body)
        }
      },
      (res) => {
        let data = "";
        res.on("data", (c) => { data += c; });
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            let msg = `Brevo API error ${res.statusCode}`;
            try { msg = JSON.parse(data)?.message || msg; } catch (_) {}
            reject(new Error(msg));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });

export const emailReady = () =>
  notificationsEnabled() && Boolean(process.env.BREVO_API_KEY);

export const sendEmail = async ({ to, subject, text }) => {
  if (!emailReady()) {
    throw new Error("Email not configured. Set NOTIFICATIONS_ENABLED=true and BREVO_API_KEY.");
  }
  const senderEmail = process.env.SMTP_USER || "no-reply@tfcschool.dz";
  await sendViaBrevo({
    sender:  { name: "TFC School", email: senderEmail },
    to:      [{ email: to }],
    subject,
    textContent: text
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
    return { sent: false, channel: "none", error: "BREVO_API_KEY not set." };
  }

  try {
    const senderEmail = process.env.SMTP_USER || "no-reply@tfcschool.dz";
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

    await sendViaBrevo({
      sender:      { name: "TFC School", email: senderEmail },
      to:          [{ email: parentEmail, name: parentName }],
      subject:     `🏫 TFC — Absence de ${student.name} — ${date}`,
      textContent: text
    });

    return { sent: true, channel: "email", emailSent: true, whatsappSent: false };
  } catch (err) {
    return { sent: false, channel: "none", emailSent: false, whatsappSent: false, error: err.message };
  }
};
