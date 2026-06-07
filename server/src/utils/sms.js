import https from "node:https";

export const smsReady = () =>
  process.env.NOTIFICATIONS_ENABLED === "true" &&
  Boolean(process.env.INFOBIP_API_KEY && process.env.INFOBIP_BASE_URL);

/** Normalize Algerian numbers → international E.164 format */
const normalizePhone = (raw = "") => {
  const digits = raw.replace(/[\s\-().+]/g, "");
  if (digits.startsWith("213")) return `+${digits}`;
  if (digits.startsWith("0"))   return `+213${digits.slice(1)}`;
  if (digits.startsWith("+"))   return digits;
  return `+213${digits}`;
};

const sendViaInfobip = (to, text) =>
  new Promise((resolve, reject) => {
    const body = JSON.stringify({
      messages: [{
        from: process.env.SMS_SENDER || "TFCSchool",
        destinations: [{ to }],
        text
      }]
    });

    const req = https.request(
      {
        hostname: process.env.INFOBIP_BASE_URL,
        path: "/sms/2/text/advanced",
        method: "POST",
        headers: {
          "Content-Type":   "application/json",
          "Accept":         "application/json",
          "Authorization":  `App ${process.env.INFOBIP_API_KEY}`,
          "Content-Length": Buffer.byteLength(body)
        }
      },
      (res) => {
        let data = "";
        res.on("data", (c) => { data += c; });
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            let msg = `Infobip error ${res.statusCode}`;
            try {
              const parsed = JSON.parse(data);
              msg = parsed?.requestError?.serviceException?.text || msg;
            } catch (_) {}
            reject(new Error(msg));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });

export const sendAbsenceSMS = async ({ student, teacher, attendance }) => {
  if (!smsReady()) {
    return { sent: false, error: "SMS not configured." };
  }

  const parentPhone = student.studentProfile?.parentPhone;
  if (!parentPhone) {
    return { sent: false, error: "No parent phone on file." };
  }

  const date = attendance.date || new Date().toLocaleDateString("fr-DZ");
  const to   = normalizePhone(parentPhone);

  const text =
    `TFC School - Annaba:\n` +
    `${student.name} était absent(e) le ${date}.\n` +
    `Contactez-nous: +213 561 502 098\n\n` +
    `مركز TFC عنابة:\n` +
    `${student.name} غائب/غائبة اليوم ${date}.\n` +
    `للتواصل: 098 502 561 0`;

  try {
    await sendViaInfobip(to, text);
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err.message };
  }
};
