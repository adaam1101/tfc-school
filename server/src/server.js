import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { rfidRouter } from "./routes/rfidRoutes.js";
import { studentRouter } from "./routes/studentRoutes.js";
import { teacherRouter } from "./routes/teacherRoutes.js";
import { demoRouter } from "./demo/demoRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const demoMode = process.env.DEMO_MODE === "true";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || "").split(","),
  "http://localhost:5173"
]
  .map((origin) => origin?.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "TFC School API", demoMode });
});

if (demoMode) {
  app.use("/api", demoRouter);
} else {
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/rfid", rfidRouter);
  app.use("/api/teacher", teacherRouter);
  app.use("/api/student", studentRouter);
}

const clientDistCandidates = [
  path.resolve(__dirname, "../../client/dist"),
  path.resolve(process.cwd(), "client/dist"),
  path.resolve(process.cwd(), "../client/dist")
];
const clientDist = clientDistCandidates.find((candidate) => existsSync(candidate));

if (clientDist) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

if (demoMode) {
  app.listen(port, () => {
    console.log(`TFC School API running in demo mode on http://localhost:${port}`);
  });
} else {
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`TFC School API running on http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server:", error.message);
      process.exit(1);
    });
}
