import express from "express";
import { allowRoles, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { Attendance } from "../models/Attendance.js";
import { User } from "../models/User.js";
import { dateKey } from "../utils/dates.js";
import { hashRfidCardId, normalizeRfidCardId } from "../utils/rfid.js";
import { rfidScanSchema } from "../validators/schemas.js";

export const rfidRouter = express.Router();

rfidRouter.use(protect, allowRoles("admin", "teacher"));

const isTeacherAssignedToStudent = async (teacher, student) => {
  if (String(student.studentProfile?.teacher || "") === String(teacher._id)) {
    return true;
  }

  const fullTeacher = await User.findById(teacher._id);
  return Boolean(
    fullTeacher?.teacherProfile?.assignedStudents?.some(
      (studentId) => String(studentId) === String(student._id)
    )
  );
};

rfidRouter.post("/scan", validate(rfidScanSchema), async (req, res, next) => {
  try {
    const normalizedCardId = normalizeRfidCardId(req.body.cardId);
    const cardHash = hashRfidCardId(normalizedCardId);

    const student = await User.findOne({
      role: "student",
      status: "active",
      "studentProfile.rfidCardHash": cardHash
    }).populate("studentProfile.teacher", "name email teacherProfile.subject");

    if (!student) {
      return res.status(404).json({
        message: "No active student is assigned to this RFID card."
      });
    }

    if (req.user.role === "teacher" && !(await isTeacherAssignedToStudent(req.user, student))) {
      return res.status(403).json({
        message: "This RFID card belongs to a student who is not assigned to you."
      });
    }

    const date = req.body.date || dateKey();
    const existing = await Attendance.findOne({ student: student._id, date });
    const alreadyMarkedPresent = existing?.status === "Present";
    const attendance =
      existing ||
      new Attendance({
        student: student._id,
        date
      });

    attendance.teacher =
      req.user.role === "teacher"
        ? req.user._id
        : student.studentProfile?.teacher?._id || student.studentProfile?.teacher || req.user._id;
    attendance.status = "Present";
    attendance.source = "rfid";
    attendance.note = alreadyMarkedPresent
      ? attendance.note || "RFID scan repeated."
      : `Marked present by RFID scan from ${req.user.name}.`;
    attendance.parentNotification = { sent: false, channel: "none", error: undefined };

    await attendance.save();

    res.json({
      student,
      attendance,
      alreadyMarkedPresent,
      message: alreadyMarkedPresent
        ? `${student.name} was already marked present today.`
        : `${student.name} marked present.`
    });
  } catch (error) {
    next(error);
  }
});
