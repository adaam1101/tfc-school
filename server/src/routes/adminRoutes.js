import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { Attendance } from "../models/Attendance.js";
import { Group } from "../models/Group.js";
import { User } from "../models/User.js";
import { dateKey, daysAgo } from "../utils/dates.js";
import { applyRfidCardToProfile } from "../utils/rfid.js";
import { recordAudit } from "../utils/audit.js";
import { emailReady, sendEmail } from "../utils/email.js";
import {
  attendanceReportSchema,
  createUserSchema,
  idParamSchema,
  updateUserSchema
} from "../validators/schemas.js";
import { getWhatsappStatus, initWhatsapp, logoutWhatsapp, sendWhatsAppMessage } from "../utils/whatsapp.js";

export const adminRouter = express.Router();

adminRouter.use(protect, allowRoles("admin", "sous-admin", "moderator"));

const onlyAdmin = (req, res, next) =>
  req.user.role === "admin" ? next()
  : res.status(403).json({ message: "Only the super admin can perform this action." });

const adminOrSousAdmin = (req, res, next) =>
  ["admin", "sous-admin"].includes(req.user.role) ? next()
  : res.status(403).json({ message: "You do not have permission for this action." });

const selectUserFields = "-password";

const ensureRoleProfile = (payload) => {
  if (payload.role === "teacher" && !payload.teacherProfile?.subject) {
    const error = new Error("Teacher subject is required.");
    error.statusCode = 400;
    throw error;
  }

  if (payload.role === "student") {
    const profile = payload.studentProfile || {};
    if (!profile.age || !profile.course) {
      const error = new Error("Student age and course are required.");
      error.statusCode = 400;
      throw error;
    }

  }
};

const syncStudentTeacher = async ({ studentId, previousTeacherId, nextTeacherId }) => {
  if (previousTeacherId && String(previousTeacherId) !== String(nextTeacherId || "")) {
    await User.updateOne(
      { _id: previousTeacherId, role: "teacher" },
      { $pull: { "teacherProfile.assignedStudents": studentId } }
    );
  }

  if (nextTeacherId) {
    const teacher = await User.findOne({ _id: nextTeacherId, role: "teacher" });
    if (!teacher) {
      const error = new Error("Assigned teacher was not found.");
      error.statusCode = 400;
      throw error;
    }

    await User.updateOne(
      { _id: nextTeacherId },
      { $addToSet: { "teacherProfile.assignedStudents": studentId } }
    );
  }
};

adminRouter.get("/dashboard", adminOrSousAdmin, async (_req, res, next) => {
  try {
    const today = dateKey();
    const since = daysAgo(6);

    const [totalStudents, totalTeachers, todayAttendance, weekAttendance, recentAbsences] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "teacher" }),
        Attendance.aggregate([
          { $match: { date: today } },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        Attendance.aggregate([
          { $match: { date: { $gte: since, $lte: today } } },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        Attendance.find({ status: "Absent" })
          .sort({ date: -1, updatedAt: -1 })
          .limit(8)
          .populate("student", "name studentProfile")
          .populate("teacher", "name teacherProfile.subject")
      ]);

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        today,
        todayAttendance,
        weekAttendance
      },
      recentAbsences
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/users", async (req, res, next) => {
  try {
    // Moderators can only list students and teachers
    if (req.user.role === "moderator" && !["student", "teacher"].includes(req.query.role)) {
      req.query.role = "student";
    }
    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter)
      .select(selectUserFields)
      .populate("studentProfile.teacher", "name email teacherProfile.subject")
      .populate("teacherProfile.assignedStudents", "name email studentProfile.course")
      .sort({ role: 1, name: 1 });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/users", validate(createUserSchema), async (req, res, next) => {
  try {
    // Student accounts are created by the administrator only.
    if (req.body.role === "student" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the administrator can create student accounts." });
    }
    if (req.user.role === "moderator" && req.body.role !== "student") {
      return res.status(403).json({ message: "Moderators can only add students." });
    }

    if (req.body.role === "student") {
      if (!req.body.name?.trim()) return res.status(400).json({ message: "Student full name is required." });
      if (!req.body.studentProfile?.course?.trim()) return res.status(400).json({ message: "Student course is required." });
      if (!req.body.studentProfile?.teacher) return res.status(400).json({ message: "Assign a teacher before creating a student account." });
    }

    if (req.body.studentProfile) {
      req.body.studentProfile = applyRfidCardToProfile(req.body.studentProfile);
    }

    ensureRoleProfile(req.body);

    const user = await User.create(req.body);

    if (user.role === "student") {
      await syncStudentTeacher({
        studentId: user._id,
        nextTeacherId: user.studentProfile?.teacher
      });
    }

    const savedUser = await User.findById(user._id)
      .select(selectUserFields)
      .populate("studentProfile.teacher", "name email teacherProfile.subject");

    await recordAudit({ req, action: "create", entity: "user", entityLabel: `${user.name} (${user.role})` });

    res.status(201).json({ user: savedUser });
  } catch (error) {
    next(error);
  }
});

adminRouter.put("/users/:id", adminOrSousAdmin, validate(updateUserSchema), async (req, res, next) => {
  try {
    const existing = await User.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "User not found." });
    }

    const payload = { ...req.body };
    const nextRole = payload.role || existing.role;

    if (payload.teacherProfile) {
      payload.teacherProfile = {
        ...(existing.teacherProfile?.toObject?.() || {}),
        ...payload.teacherProfile
      };
    }

    if (payload.studentProfile) {
      payload.studentProfile = applyRfidCardToProfile(payload.studentProfile);
      payload.studentProfile = {
        ...(existing.studentProfile?.toObject?.() || {}),
        ...payload.studentProfile
      };
    }

    ensureRoleProfile({
      role: nextRole,
      teacherProfile: payload.teacherProfile || existing.teacherProfile,
      studentProfile: payload.studentProfile || existing.studentProfile
    });

    if (payload.role && payload.role !== existing.role) {
      const error = new Error("Changing a user's role is not supported. Create a new user instead.");
      error.statusCode = 400;
      throw error;
    }

    const previousTeacherId = existing.studentProfile?.teacher;
    Object.assign(existing, payload);
    await existing.save();

    if (existing.role === "student") {
      await syncStudentTeacher({
        studentId: existing._id,
        previousTeacherId,
        nextTeacherId: existing.studentProfile?.teacher
      });
    }

    const user = await User.findById(existing._id)
      .select(selectUserFields)
      .populate("studentProfile.teacher", "name email teacherProfile.subject")
      .populate("teacherProfile.assignedStudents", "name email studentProfile.course");

    await recordAudit({ req, action: "update", entity: "user", entityLabel: `${user.name} (${user.role})` });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/users/:id/reset-password", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("+passwordResetToken +passwordResetExpires");
    if (!user) return res.status(404).json({ message: "User not found." });

    const rawToken = user.createPasswordResetToken();
    await user.save();

    const base = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${base}/reset-password?token=${rawToken}`;

    await recordAudit({ req, action: "reset-password", entity: "user", entityLabel: user.name });

    res.json({ resetUrl, expiresIn: "30 minutes" });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/users/bulk-delete", onlyAdmin, async (req, res, next) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "userIds array is required." });
    }

    const idsToDelete = userIds.filter((id) => String(id) !== String(req.user._id));

    await Attendance.deleteMany({ student: { $in: idsToDelete } });
    await Group.updateMany({}, { $pull: { students: { $in: idsToDelete } } });
    await User.updateMany(
      { role: "teacher" },
      { $pull: { "teacherProfile.assignedStudents": { $in: idsToDelete } } }
    );

    const result = await User.deleteMany({ _id: { $in: idsToDelete }, role: { $ne: "admin" } });

    await recordAudit({
      req,
      action: "delete-bulk",
      entity: "user",
      entityLabel: `Deleted ${result.deletedCount} users`
    });

    res.json({ message: `Successfully deleted ${result.deletedCount} user(s).`, deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete("/users/:id", onlyAdmin, validate(idParamSchema), async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.id) {
      return res.status(400).json({ message: "You cannot delete your own admin account." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "student") {
      await Attendance.deleteMany({ student: user._id });
      await Group.updateMany({}, { $pull: { students: user._id } });
      await User.updateMany(
        { role: "teacher" },
        { $pull: { "teacherProfile.assignedStudents": user._id } }
      );
    }

    if (user.role === "teacher") {
      await User.updateMany(
        { "studentProfile.teacher": user._id },
        { $unset: { "studentProfile.teacher": "" } }
      );
    }

    await user.deleteOne();

    await recordAudit({ req, action: "delete", entity: "user", entityLabel: `${user.name} (${user.role})` });

    res.json({ message: "User deleted." });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/reports/attendance", onlyAdmin, validate(attendanceReportSchema), async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = req.query.from;
      if (req.query.to) filter.date.$lte = req.query.to;
    }

    if (req.query.status) filter.status = req.query.status;
    if (req.query.studentId) filter.student = req.query.studentId;

    const records = await Attendance.find(filter)
      .sort({ date: -1, updatedAt: -1 })
      .limit(200)
      .populate("student", "name email studentProfile")
      .populate("teacher", "name email teacherProfile.subject");

    res.json({ records });
  } catch (error) {
    next(error);
  }
});

// ── Email diagnostics ──────────────────────────────────────────────────────
adminRouter.post("/test-email", onlyAdmin, async (req, res, next) => {
  const status = {
    NOTIFICATIONS_ENABLED: process.env.NOTIFICATIONS_ENABLED,
    SENDGRID_API_KEY:       process.env.SENDGRID_API_KEY ? "set ✓" : "MISSING ✗",
    SMTP_USER:              process.env.SMTP_USER        ? "set ✓" : "MISSING ✗",
    emailReady:             emailReady()
  };

  if (!emailReady()) {
    return res.status(400).json({
      message: "Email is not configured. See config status below.",
      status
    });
  }

  const to = req.body.to || req.user.email;
  try {
    await sendEmail({
      to,
      subject: `${process.env.SCHOOL_SHORT || "TFC"} — Email test`,
      text: `This is a test email from ${process.env.SCHOOL_NAME || "TFC School"}.\n\nIf you received this, email notifications are working correctly.\n\nSent at: ${new Date().toISOString()}`
    });
    res.json({ message: `Test email sent to ${to}.`, status });
  } catch (err) {
    next(err);
  }
});

// ── WhatsApp configuration ──────────────────────────────────────────────────
adminRouter.get("/whatsapp/status", onlyAdmin, (req, res) => {
  res.json(getWhatsappStatus());
});

adminRouter.post("/whatsapp/init", onlyAdmin, async (req, res, next) => {
  try {
    await initWhatsapp();
    res.json({ message: "WhatsApp client initializing..." });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/whatsapp/logout", onlyAdmin, async (req, res, next) => {
  try {
    await logoutWhatsapp();
    res.json({ message: "Logged out of WhatsApp." });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/whatsapp/test", onlyAdmin, async (req, res, next) => {
  const { phone, message } = req.body;
  try {
    await sendWhatsAppMessage(phone, message);
    res.json({ message: "Test message sent successfully!" });
  } catch (err) {
    console.error("[WhatsApp Test Error]:", err);
    res.status(400).json({ message: err.message || "Failed to send message." });
  }
});
