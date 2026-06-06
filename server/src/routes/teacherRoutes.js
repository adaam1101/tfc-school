import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { Attendance } from "../models/Attendance.js";
import { User } from "../models/User.js";
import { dateKey, daysAgo } from "../utils/dates.js";
import { sendAbsenceNotification } from "../utils/email.js";
import { attendanceSchema } from "../validators/schemas.js";

export const teacherRouter = express.Router();

teacherRouter.use(protect, allowRoles("teacher"));

const getAssignedStudents = async (teacher) => {
  const assignedIds = teacher.teacherProfile?.assignedStudents || [];

  return User.find({
    role: "student",
    $or: [{ "studentProfile.teacher": teacher._id }, { _id: { $in: assignedIds } }]
  }).sort({ name: 1 });
};

teacherRouter.get("/dashboard", async (req, res, next) => {
  try {
    const today = dateKey();
    const students = await getAssignedStudents(req.user);
    const studentIds = students.map((student) => student._id);

    const [todayRecords, weekStats] = await Promise.all([
      Attendance.find({ date: today, student: { $in: studentIds } }),
      Attendance.aggregate([
        {
          $match: {
            teacher: req.user._id,
            date: { $gte: daysAgo(6), $lte: today }
          }
        },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ])
    ]);

    const attendanceByStudent = new Map(
      todayRecords.map((record) => [String(record.student), record])
    );

    res.json({
      teacher: req.user,
      today,
      weekStats,
      students: students.map((student) => ({
        ...student.toJSON(),
        todayAttendance: attendanceByStudent.get(String(student._id)) || null
      }))
    });
  } catch (error) {
    next(error);
  }
});

teacherRouter.post("/attendance", validate(attendanceSchema), async (req, res, next) => {
  try {
    const { studentId, status, note, date = dateKey() } = req.body;
    const student = await User.findOne({ _id: studentId, role: "student" });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const assignedStudents = await getAssignedStudents(req.user);
    const isAssigned = assignedStudents.some((assigned) => String(assigned._id) === studentId);

    if (!isAssigned) {
      return res.status(403).json({ message: "This student is not assigned to you." });
    }

    const existing = await Attendance.findOne({ student: studentId, date });
    const shouldNotifyParent =
      status === "Absent" &&
      (!existing || existing.status !== "Absent" || !existing.parentNotification?.sent);

    const attendance =
      existing ||
      new Attendance({
        student: studentId,
        teacher: req.user._id,
        date
      });

    attendance.status = status;
    attendance.note = note;
    attendance.teacher = req.user._id;
    attendance.source = "manual";

    if (status === "Present") {
      attendance.parentNotification = { sent: false, channel: "none", error: undefined };
    }

    await attendance.save();

    if (shouldNotifyParent) {
      try {
        const notification = await sendAbsenceNotification({
          student,
          teacher: req.user,
          attendance
        });

        attendance.parentNotification = {
          sent:         notification.sent,
          channel:      notification.channel,
          emailSent:    notification.emailSent    || false,
          whatsappSent: notification.whatsappSent || false,
          sentAt:       notification.sent ? new Date() : undefined,
          error:        notification.error
        };
      } catch (error) {
        attendance.parentNotification = {
          sent: false, channel: "none",
          emailSent: false, whatsappSent: false,
          error: error.message
        };
      }

      await attendance.save();
    }

    res.json({ attendance });
  } catch (error) {
    next(error);
  }
});
