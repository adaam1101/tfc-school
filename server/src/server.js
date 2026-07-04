import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { bootstrapAdmin } from "./config/bootstrapAdmin.js";
import { initWhatsapp } from "./utils/whatsapp.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { rfidRouter } from "./routes/rfidRoutes.js";
import { studentRouter } from "./routes/studentRoutes.js";
import { teacherRouter } from "./routes/teacherRoutes.js";
import { ratingRouter } from "./routes/ratingRoutes.js";
import { enrollmentRouter } from "./routes/enrollmentRoutes.js";
import { paymentRouter } from "./routes/paymentRoutes.js";
import { announcementRouter } from "./routes/announcementRoutes.js";
import { auditRouter } from "./routes/auditRoutes.js";
import { scheduleRouter } from "./routes/scheduleRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Render (and most hosts) put the app behind a reverse proxy. Trusting the first
// proxy hop lets express-rate-limit read the real client IP from X-Forwarded-For.
app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || "").split(","),
  "http://localhost:5173"
].map((origin) => origin?.trim()).filter(Boolean);

app.use(helmet({
  hsts: { maxAge: 31536000, includeSubDomains: true },
  contentSecurityPolicy: false // React SPA manages its own CSP via meta tags
}));
app.use(mongoSanitize());
app.use(cors({ origin: (origin, callback) => { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error("Origin is not allowed by CORS.")); }, credentials: true }));
app.use(express.json({ limit: "5mb" })); // allow base64 ID-card photos
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
// Tightened from 300 → 100 to reduce enumeration surface
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false, validate: { xForwardedForHeader: false } }));

app.get("/api/health", (_req, res) => { res.json({ status: "ok", app: "TFC School API" }); });

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/rfid", rfidRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/student", studentRouter);
app.use("/api/ratings", ratingRouter);
app.use("/api/enrollments", enrollmentRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/audit", auditRouter);
app.use("/api/schedules", scheduleRouter);

const clientDistCandidates = [
  path.resolve(__dirname, "../../client/dist"),
  path.resolve(process.cwd(), "client/dist"),
  path.resolve(process.cwd(), "../client/dist")
];
const clientDist = clientDistCandidates.find((candidate) => existsSync(candidate));

if (clientDist) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => { if (req.path.startsWith("/api")) return next(); res.sendFile(path.join(clientDist, "index.html")); });
}

app.use(notFound);
app.use(errorHandler);

connectDB().then(async () => {
  await bootstrapAdmin();
  if (process.env.WHATSAPP_ENABLED === "true") {
    await initWhatsapp();
  }
  app.listen(port, () => {
    console.log(`TFC School API running on http://localhost:${port}`);
  });
}).catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
