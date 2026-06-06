import https from "node:https";

const waEnabled = () =>
  process.env.NOTIFICATIONS_ENABLED === "true" &&
  Boolean(process.env.WHATSAPP_TOKEN) &&
  Boolean(process.env.WHATSAPP_PHONE_ID);

/** Normalise an Algerian phone number to E.164 (+213XXXXXXXXX) */
const toE164 = (raw = "") => {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("213")) return "+" + digits;
  if (digits.startsWith("0"))   return "+213" + digits.slice(1);
  if (digits.length === 9)      return "+213" + digits;
  return "+" + digits;
};

/** Send a plain-text WhatsApp message via Meta Cloud API */
export const sendWhatsApp = async (to, text) => {
  if (!waEnabled()) {
    return {
      sent: false,
      error: "WhatsApp not configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID."
    };
  }

  const phone   = toE164(to);
  const payload = JSON.stringify({
    messaging_product: "whatsapp",
    to: phone,
    type: "text",
    text: { body: text }
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "graph.facebook.com",
        path: `/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Length": Buffer.byteLength(payload)
        }
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve({ sent: true });
          } else {
            let msg = `HTTP ${res.statusCode}`;
            try { msg = JSON.parse(body)?.error?.message || msg; } catch (_) {}
            resolve({ sent: false, error: msg });
          }
        });
      }
    );
    req.on("error", (err) => resolve({ sent: false, error: err.message }));
    req.write(payload);
    req.end();
  });
};

/** Build the absence WhatsApp message (Arabic + French) */
export const buildAbsenceMessage = ({ student, teacher, attendance }) => {
  const name    = student.name || "الطالب";
  const parent  = student.studentProfile?.parentName || "ولي الأمر";
  const date    = attendance.date || new Date().toLocaleDateString("fr-DZ");
  const note    = attendance.note ? `\n📝 ملاحظة: ${attendance.note}` : "";
  const teacher_name = teacher?.name ? `\n👩‍🏫 المسؤول: ${teacher.name}` : "";

  return [
    `🏫 *TFC Training Formation Center*`,
    ``,
    `السلام عليكم ${parent}،`,
    ``,
    `نُعلمكم بأن الطالب/ة *${name}* سُجِّل *غائباً* اليوم.`,
    `📅 التاريخ: ${date}`,
    teacher_name,
    note,
    ``,
    `Bonjour ${parent},`,
    `L'élève *${name}* a été marqué(e) *absent(e)* aujourd'hui.`,
    ``,
    `📞 للاستفسار / Pour toute question:`,
    `+213 561 502 098`,
  ].filter(l => l !== undefined).join("\n");
};
