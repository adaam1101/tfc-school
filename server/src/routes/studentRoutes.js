import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { Attendance } from "../models/Attendance.js";
import { User } from "../models/User.js";

export const studentRouter = express.Router();

studentRouter.use(protect, allowRoles("student"));

studentRouter.get("/profile", async (req, res, next) => {
  try {
    const [attendanceHistory, teacher] = await Promise.all([
      Attendance.find({ student: req.user._id })
        .sort({ date: -1 })
        .limit(90)
        .populate("teacher", "name teacherProfile.subject"),
      req.user.studentProfile?.teacher
        ? User.findById(req.user.studentProfile.teacher).select("name email phone teacherProfile.subject teacherProfile.contactInfo")
        : null
    ]);

    res.json({
      student: req.user,
      teacher,
      attendanceHistory
    });
  } catch (error) {
    next(error);
  }
});
