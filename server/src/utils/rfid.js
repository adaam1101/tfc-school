import crypto from "node:crypto";

export const normalizeRfidCardId = (cardId) =>
  String(cardId || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();

export const hashRfidCardId = (cardId) => {
  const normalized = normalizeRfidCardId(cardId);
  const secret = process.env.RFID_HASH_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET or RFID_HASH_SECRET is required for RFID card hashing.");
  }

  return crypto.createHmac("sha256", secret).update(normalized).digest("hex");
};

export const rfidCardLast4 = (cardId) => {
  const normalized = normalizeRfidCardId(cardId);
  return normalized.slice(-4);
};

export const applyRfidCardToProfile = (studentProfile = {}) => {
  const profile = { ...studentProfile };
  const rawCardId = profile.rfidCardId;
  delete profile.rfidCardId;

  if (rawCardId) {
    const normalized = normalizeRfidCardId(rawCardId);
    if (normalized.length < 2) {
      const error = new Error("RFID card code is too short.");
      error.statusCode = 400;
      throw error;
    }

    profile.rfidCardHash = hashRfidCardId(normalized);
    profile.rfidCardLast4 = rfidCardLast4(normalized);
  }

  return profile;
};
