import { makeWASocket, initAuthCreds, BufferJSON, useMultiFileAuthState } from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";
import { WhatsappSession } from "../models/WhatsappSession.js";

let sock = null;
let connectionStatus = "DISCONNECTED"; // "CONNECTING", "CONNECTED", "DISCONNECTED"
let currentQr = null;

// Custom WhatsApp authentication state using MongoDB
async function useMongoAuthState() {
  const writeData = async (data, key) => {
    const serialized = JSON.parse(JSON.stringify(data, BufferJSON.replacer));
    await WhatsappSession.findOneAndUpdate({ key }, { value: serialized }, { upsert: true });
  };

  const readData = async (key) => {
    const doc = await WhatsappSession.findOne({ key });
    if (!doc) return null;
    return JSON.parse(JSON.stringify(doc.value), BufferJSON.reviver);
  };

  const removeData = async (key) => {
    await WhatsappSession.deleteOne({ key });
  };

  const creds = (await readData("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          for (const id of ids) {
            let value = await readData(`${type}-${id}`);
            if (type === "app-state-sync-key" && value) {
              // Parse app state sync key
            }
            data[id] = value;
          }
          return data;
        },
        set: async (data) => {
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              if (value) {
                await writeData(value, key);
              } else {
                await removeData(key);
              }
            }
          }
        }
      }
    },
    saveCreds: async () => {
      await writeData(creds, "creds");
    }
  };
}

export async function initWhatsapp() {
  if (sock) return;

  console.log("[WhatsApp] Initializing socket connection...");
  connectionStatus = "CONNECTING";

  try {
    const { state, saveCreds } = await useMongoAuthState();

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // Generate base64 QR code image
        try {
          currentQr = await QRCode.toDataURL(qr);
          console.log("[WhatsApp] New QR code generated. Scan in dashboard.");
        } catch (err) {
          console.error("[WhatsApp] QR generation failed:", err);
        }
      }

      if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
        console.log(`[WhatsApp] Connection closed. Reconnecting? ${shouldReconnect}`);
        connectionStatus = "DISCONNECTED";
        sock = null;
        currentQr = null;
        if (shouldReconnect) {
          setTimeout(initWhatsapp, 5000);
        } else {
          console.log("[WhatsApp] Logged out. Clearing session...");
          await WhatsappSession.deleteMany({});
        }
      } else if (connection === "open") {
        console.log("[WhatsApp] Connected successfully!");
        connectionStatus = "CONNECTED";
        currentQr = null;
      }
    });
  } catch (err) {
    console.error("[WhatsApp] Initialization error:", err);
    connectionStatus = "DISCONNECTED";
    sock = null;
  }
}

export function getWhatsappStatus() {
  return {
    status: connectionStatus,
    qr: currentQr
  };
}

export async function logoutWhatsapp() {
  if (sock) {
    try {
      await sock.logout();
    } catch (_) {}
    sock = null;
  }
  await WhatsappSession.deleteMany({});
  connectionStatus = "DISCONNECTED";
  currentQr = null;
  console.log("[WhatsApp] Logged out and session cleared.");
}

/** Normalize and format phone number for WhatsApp JID (e.g. +213561... -> 213561...@s.whatsapp.net) */
const formatWhatsappJid = (phone = "") => {
  let clean = phone.replace(/[\s\-().+]/g, "");
  if (clean.startsWith("0")) {
    clean = `213${clean.slice(1)}`;
  }
  if (!clean.startsWith("213")) {
    clean = `213${clean}`;
  }
  return `${clean}@s.whatsapp.net`;
};

export async function sendWhatsAppMessage(phone, text) {
  if (connectionStatus !== "CONNECTED" || !sock) {
    throw new Error("WhatsApp client not connected.");
  }

  const jid = formatWhatsappJid(phone);
  console.log(`[WhatsApp] Sending message to ${jid}...`);
  await sock.sendMessage(jid, { text });
  return { sent: true };
}
