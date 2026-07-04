import https from "node:https";
import { sendAbsenceSMS, smsReady } from "./sms.js";
import { sendWhatsAppMessage } from "./whatsapp.js";

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
    from:    { email: process.env.SMTP_USER, name: process.env.SCHOOL_NAME || "TFC School" },
    subject,
    content: [{ type: "text/plain", value: text }]
  });
};

export const sendTwoFactorCode = async ({ user, code }) => {
  await sendEmail({
    to: user.email,
    subject: `Your ${process.env.SCHOOL_NAME || "TFC School"} login code`,
    text: `Hello ${user.name},\n\nYour verification code is: ${code}\n\nIt expires in 10 minutes.`
  });
};

export const sendPasswordResetEmail = async ({ user, resetUrl }) => {
  await sendEmail({
    to: user.email,
    subject: `Reset your ${process.env.SCHOOL_NAME || "TFC School"} password`,
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

  let emailSent = false;
  let smsSent   = false;
  let waSent    = false;
  let errors    = [];

  // ── Email ──────────────────────────────────────────────
  if (emailReady() && parentEmail) {
    try {
      const text = [
        `Bonjour ${parentName},`,
        "",
        `Nous vous informons que votre fils / votre fille ${student.name} était absent(e) aujourd'hui le ${date}.`,
        `Nous vous conseillons de nous contacter pour la justification de cette absence.`,
        "",
        `Merci pour votre confiance.`,
        `📞 ${process.env.SCHOOL_PHONE || "+213 561 502 098"}`,
        `🏫 ${process.env.SCHOOL_NAME || "TFC Training Formation Center"}`,
        "",
        "──────────────────────────",
        "",
        `السلام عليكم ${parentName}،`,
        "",
        `نُعلمكم بأن ابنكم / ابنتكم ${student.name} كان/كانت غائباً/غائبة اليوم ${date}.`,
        `ننصحكم بالتواصل معنا لتبرير هذا الغياب.`,
        "",
        `شكراً على ثقتكم.`,
        `📞 ${process.env.SCHOOL_PHONE || "+213 561 502 098"}`,
        `🏫 ${process.env.SCHOOL_NAME || "TFC — Training Formation Center"}`
      ].filter(Boolean).join("\n");

      await sendViaSendGrid({
        personalizations: [{ to: [{ email: parentEmail, name: parentName }] }],
        from:    { email: process.env.SMTP_USER, name: process.env.SCHOOL_NAME || "TFC School" },
        subject: `🏫 ${process.env.SCHOOL_SHORT || "TFC"} — Absence de ${student.name} — ${date}`,
        content: [{ type: "text/plain", value: text }]
      });
      emailSent = true;
    } catch (err) {
      errors.push(`email: ${err.message}`);
    }
  }

  // ── SMS ────────────────────────────────────────────────
  console.log("[SMS-email.js] smsReady:", smsReady(), "| NOTIFICATIONS_ENABLED:", process.env.NOTIFICATIONS_ENABLED, "| INFOBIP_API_KEY set:", Boolean(process.env.INFOBIP_API_KEY), "| INFOBIP_BASE_URL:", process.env.INFOBIP_BASE_URL);
  if (smsReady()) {
    const smsResult = await sendAbsenceSMS({ student, teacher, attendance });
    if (smsResult.sent) {
      smsSent = true;
    } else if (smsResult.error) {
      errors.push(`sms: ${smsResult.error}`);
    }
  }

  // ── WhatsApp ──────────────────────────────────────────
  const parentPhone = student.studentProfile?.parentPhone;
  const studentPhone = student.phone;
  const age = student.studentProfile?.age || student.age;
  const isAdult = age >= 15 || !parentPhone;
  const recipientPhone = isAdult ? studentPhone : parentPhone;

  if (process.env.WHATSAPP_ENABLED === "true" && recipientPhone) {
    try {
      let waText = "";
      if (isAdult) {
        // Message directly to the adult student
        waText = 
          `${process.env.SCHOOL_NAME || "TFC School"}:\n` +
          `Bonjour ${student.name},\n` +
          `Nous vous informons de votre absence aujourd'hui le ${date}. Veuillez contacter votre enseignant ou votre groupe pour la justification.\n` +
          `📞 Contact: ${process.env.SCHOOL_PHONE || "+213 561 502 098"}\n\n` +
          `${process.env.SCHOOL_NAME || "مركز TFC"}:\n` +
          `السلام عليكم ${student.name}،\n` +
          `نحيطكم علماً بتسجيل غيابكم اليوم ${date}. يرجى التواصل مع أستاذكم أو فوجكم لتبرير الغياب.\n` +
          `📞 للتواصل: ${process.env.SCHOOL_PHONE || "0561 502 098"}`;
      } else {
        // Message to the parent (for kids/teens)
        waText = 
          `${process.env.SCHOOL_NAME || "TFC School"}:\n` +
          `Bonjour ${parentName},\n` +
          `Nous vous informons que votre enfant ${student.name} était absent(e) aujourd'hui le ${date}.\n` +
          `📞 Contactez-nous: ${process.env.SCHOOL_PHONE || "+213 561 502 098"}\n\n` +
          `${process.env.SCHOOL_NAME || "مركز TFC"}:\n` +
          `السلام عليكم ${parentName}،\n` +
          `نُعلمكم بأن ابنكم / ابنتكم ${student.name} كان/كانت غائباً/غائبة اليوم ${date}.\n` +
          `📞 للتواصل: ${process.env.SCHOOL_PHONE || "0561 502 098"}`;
      }

      await sendWhatsAppMessage(recipientPhone, waText);
      waSent = true;
    } catch (err) {
      errors.push(`whatsapp: ${err.message}`);
    }
  }

  const sent    = emailSent || smsSent || waSent;
  const channels = [];
  if (emailSent) channels.push("email");
  if (smsSent)   channels.push("sms");
  if (waSent)    channels.push("whatsapp");
  const channel = channels.join("+") || "none";

  return {
    sent,
    channel,
    emailSent,
    smsSent,
    waSent,
    error: errors.length > 0 ? errors.join(" | ") : undefined
  };
};
