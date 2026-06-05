import { User } from "../models/User.js";

/**
 * Ensures at least one admin account exists so the app is usable right after
 * a fresh deploy (e.g. when no shell access is available to run the seed).
 * Runs once on startup and is a no-op if any admin already exists.
 */
export const bootstrapAdmin = async () => {
  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) return;

  const name = process.env.ADMIN_NAME || "TFC Admin";
  const email = (process.env.ADMIN_EMAIL || "admin@tfcschool.dz").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";

  await User.create({ role: "admin", name, email, password, status: "active" });

  console.log(`Bootstrap admin created: ${email}`);
};
