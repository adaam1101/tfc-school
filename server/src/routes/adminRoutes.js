import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { Attendance } from "../models/Attendance.js";
import { User } from "../models/User.js";
import { dateKey, daysAgo } from "../utils/dates.js";
import {
  attendanceReportSchema,
  createUserSchema,
  idParamSchema,
  updateUserSchema
} from "../validators/schemas.js";

export const adminRouter = express.Router();

adminRouter.use(protect, allowRoles("admin"));

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

    if (!profile.parentEmail && !profile.parentPhone) {
      const error = new Error("At least one parent contact is required for each student.");
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

adminRouter.get("/dashboard", async (_req, res, next) => {
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

    res.status(201).json({ user: savedUser });
  } catch (error) {
    next(error);
  }
});

adminRouter.put("/users/:id", validate(updateUserSchema), async (req, res, next) => {
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

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete("/users/:id", validate(idParamSchema), async (req, res, next) => {
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
    res.json({ message: "User deleted." });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/reports/attendance", validate(attendanceReportSchema), async (req, res, next) => {
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
