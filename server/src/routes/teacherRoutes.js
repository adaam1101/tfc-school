import crypto from "node:crypto";
import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { Attendance } from "../models/Attendance.js";
import { User } from "../models/User.js";
import { Group } from "../models/Group.js";
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
          sent:      notification.sent,
          channel:   notification.channel,
          emailSent: notification.emailSent || false,
          smsSent:   notification.smsSent   || false,
          sentAt:    notification.sent ? new Date() : undefined,
          error:     notification.error
        };
      } catch (error) {
        attendance.parentNotification = {
          sent: false, channel: "none",
          emailSent: false, smsSent: false,
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

// ── Register a new student (teacher self-service) ─────────────────────────────

teacherRouter.post("/students/register", async (req, res, next) => {
  try {
    const { name, age, course, phone, parentName, parentPhone, parentEmail, dateOfBirth } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: "Full name is required." });
    if (!age)          return res.status(400).json({ message: "Age is required." });
    if (!course?.trim()) return res.status(400).json({ message: "Course is required." });

    // Auto-generate email + temporary password
    const slug = name.trim().toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    let email = `${slug}@tfcschool.dz`;

    // Ensure email uniqueness
    const exists = await User.findOne({ email });
    if (exists) email = `${slug}.${rand}@tfcschool.dz`;

    const tempPassword = `Tfc@${crypto.randomBytes(8).toString("base64url").slice(0, 10)}`;

    const student = await User.create({
      role: "student",
      name: name.trim(),
      email,
      password: tempPassword,
      phone: phone || "",
      status: "active",
      studentProfile: {
        age: Number(age),
        dateOfBirth: dateOfBirth || "",
        course: course.trim(),
        parentName: parentName || "",
        parentPhone: parentPhone || "",
        parentEmail: parentEmail || "",
        teacher: req.user._id
      }
    });

    // Link student to this teacher
    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { "teacherProfile.assignedStudents": student._id } }
    );

    res.status(201).json({
      message: `${student.name} registered successfully.`,
      student: {
        _id:   student._id,
        name:  student.name,
        email: student.email,
        studentProfile: student.studentProfile
      },
      credentials: { email, tempPassword }
    });
  } catch (err) {
    next(err);
  }
});

// ── Student management ────────────────────────────────────────────────────────

// List all students available to assign (unassigned or already mine)
teacherRouter.get("/available-students", async (req, res, next) => {
  try {
    // Exclude email — teachers only need name/profile to assign students
    const students = await User.find({ role: "student" })
      .select("name studentProfile photo")
      .sort({ name: 1 });
    res.json({ students });
  } catch (err) { next(err); }
});

// Add a student to this teacher's class
teacherRouter.post("/students/add", async (req, res, next) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: "studentId is required." });

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found." });

    // Update student's assigned teacher
    student.studentProfile.teacher = req.user._id;
    await student.save();

    // Add to teacher's assignedStudents list
    await User.updateOne(
      { _id: req.user._id },
      { $addToSet: { "teacherProfile.assignedStudents": studentId } }
    );

    res.json({ message: `${student.name} added to your class.`, student });
  } catch (err) { next(err); }
});

// Remove a student from this teacher's class
teacherRouter.delete("/students/:studentId", async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.studentId, role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found." });

    // Only remove if they're actually assigned to this teacher
    if (String(student.studentProfile?.teacher) !== String(req.user._id)) {
      return res.status(403).json({ message: "This student is not in your class." });
    }

    student.studentProfile.teacher = undefined;
    await student.save();

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { "teacherProfile.assignedStudents": student._id } }
    );

    // Also remove from any groups
    await Group.updateMany(
      { teacher: req.user._id },
      { $pull: { students: student._id } }
    );

    res.json({ message: `${student.name} removed from your class.` });
  } catch (err) { next(err); }
});

// ── Group management ──────────────────────────────────────────────────────────

// List this teacher's groups
teacherRouter.get("/groups", async (req, res, next) => {
  try {
    const groups = await Group.find({ teacher: req.user._id })
      .populate("students", "name email studentProfile photo")
      .sort({ createdAt: 1 });
    res.json({ groups });
  } catch (err) { next(err); }
});

// Create a group
teacherRouter.post("/groups", async (req, res, next) => {
  try {
    const { name, description, color, students = [], days = [] } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Group name is required." });

    const count = await Group.countDocuments({ teacher: req.user._id });
    if (count >= 20) return res.status(400).json({ message: "Maximum 20 groups per teacher." });

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim(),
      color: color || "#3B82F6",
      teacher: req.user._id,
      students,
      days
    });

    const populated = await group.populate("students", "name email studentProfile photo");
    res.status(201).json({ group: populated });
  } catch (err) { next(err); }
});

// Update a group (name, description, color, students, days)
teacherRouter.put("/groups/:id", async (req, res, next) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!group) return res.status(404).json({ message: "Group not found." });

    const { name, description, color, students, days } = req.body;
    if (name  !== undefined) group.name        = name.trim();
    if (description !== undefined) group.description = description?.trim();
    if (color !== undefined) group.color       = color;
    if (students !== undefined) group.students = students;
    if (days !== undefined) group.days         = days;

    await group.save();
    const populated = await group.populate("students", "name email studentProfile photo");
    res.json({ group: populated });
  } catch (err) { next(err); }
});

// Delete a group
teacherRouter.delete("/groups/:id", async (req, res, next) => {
  try {
    const group = await Group.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    if (!group) return res.status(404).json({ message: "Group not found." });
    res.json({ message: "Group deleted." });
  } catch (err) { next(err); }
});

// Get attendance history for a specific student (for teacher)
teacherRouter.get("/students/:studentId/attendance", async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const assignedStudents = await getAssignedStudents(req.user);
    const isAssigned = assignedStudents.some((assigned) => String(assigned._id) === studentId);
    if (!isAssigned) {
      return res.status(403).json({ message: "This student is not assigned to you." });
    }

    const attendanceHistory = await Attendance.find({ student: studentId })
      .sort({ date: -1 })
      .limit(90);

    res.json({
      student,
      attendanceHistory
    });
  } catch (error) {
    next(error);
  }
});
