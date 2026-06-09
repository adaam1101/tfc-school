import express from "express";
import rateLimit from "express-rate-limit";
import { protect, allowRoles } from "../middleware/auth.js";
import { Enrollment } from "../models/Enrollment.js";
import { recordAudit } from "../utils/audit.js";

export const enrollmentRouter = express.Router();

// Throttle the public form to deter spam: 5 submissions / 15 min / IP.
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many applications from this device. Please try again later." }
});

// ── Public: submit an enrollment application ──
enrollmentRouter.post("/", publicLimiter, async (req, res, next) => {
  try {
    const { name, phone, course } = req.body;
    if (!name || !phone || !course) {
      return res.status(400).json({ message: "Name, phone, and course are required." });
    }

    const enrollment = await Enrollment.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      age: req.body.age || undefined,
      course: req.body.course,
      parentName: req.body.parentName,
      parentPhone: req.body.parentPhone,
      message: (req.body.message || "").slice(0, 600)
    });

    res.status(201).json({
      message: `Application received! The ${process.env.SCHOOL_SHORT || "TFC"} team will contact you soon.`,
      enrollment: { _id: enrollment._id, status: enrollment.status }
    });
  } catch (error) {
    next(error);
  }
});

// ── Admin: review applications ──
enrollmentRouter.use(protect, allowRoles("admin", "moderator"));

enrollmentRouter.get("/", async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const enrollments = await Enrollment.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ enrollments });
  } catch (error) {
    next(error);
  }
});

enrollmentRouter.patch("/:id", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!enrollment) return res.status(404).json({ message: "Application not found." });

    await recordAudit({
      req,
      action: status,
      entity: "enrollment",
      entityLabel: enrollment.name
    });

    res.json({ enrollment });
  } catch (error) {
    next(error);
  }
});

enrollmentRouter.delete("/:id", async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) return res.status(404).json({ message: "Application not found." });

    await recordAudit({
      req,
      action: "delete",
      entity: "enrollment",
      entityLabel: enrollment.name
    });

    res.json({ message: "Application removed." });
  } catch (error) {
    next(error);
  }
});
