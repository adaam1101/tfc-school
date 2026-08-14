import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { Attendance } from "../models/Attendance.js";
import { User } from "../models/User.js";
import { Group } from "../models/Group.js";
import { StudentNote } from "../models/StudentNote.js";
import { dateKey, daysAgo } from "../utils/dates.js";
import { sendAbsenceNotification } from "../utils/email.js";
import { attendanceSchema } from "../validators/schemas.js";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";

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

    const [todayRecords, weekStats, sessionCounts] = await Promise.all([
      Attendance.find({ date: today, student: { $in: studentIds } }),
      Attendance.aggregate([
        {
          $match: {
            teacher: req.user._id,
            date: { $gte: daysAgo(6), $lte: today }
          }
        },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Attendance.aggregate([
        {
          $match: {
            student: { $in: studentIds },
            status: "Present"
          }
        },
        { $group: { _id: "$student", count: { $sum: 1 } } }
      ])
    ]);

    const attendanceByStudent = new Map(
      todayRecords.map((record) => [String(record.student), record])
    );
    const sessionsByStudent = new Map(
      sessionCounts.map((item) => [String(item._id), item.count])
    );

    res.json({
      teacher: req.user,
      today,
      weekStats,
      students: students.map((student) => {
        const baseSessions = student.studentProfile?.sessionsAttended || 0;
        const presentCount = sessionsByStudent.get(String(student._id)) || 0;
        return {
          ...student.toJSON(),
          todayAttendance: attendanceByStudent.get(String(student._id)) || null,
          sessionsAttended: baseSessions + presentCount
        };
      })
    });
  } catch (error) {
    next(error);
  }
});

// Update a student's total studied sessions count
teacherRouter.put("/students/:studentId/sessions", async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { count } = req.body;

    const newCount = Math.max(0, parseInt(count, 10) || 0);

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const assignedStudents = await getAssignedStudents(req.user);
    const isAssigned = assignedStudents.some((assigned) => String(assigned._id) === studentId);
    if (!isAssigned) {
      return res.status(403).json({ message: "This student is not assigned to you." });
    }

    const presentCount = await Attendance.countDocuments({ student: studentId, status: "Present" });

    if (!student.studentProfile) {
      student.studentProfile = {};
    }

    student.studentProfile.sessionsAttended = Math.max(0, newCount - presentCount);
    await student.save();

    res.json({
      studentId,
      sessionsAttended: newCount,
      message: `Sessions count for ${student.name} updated to ${newCount}.`
    });
  } catch (error) {
    next(error);
  }
});

// Update a student's active vs stopped status
teacherRouter.put("/students/:studentId/status", async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { isStopped } = req.body;

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const assignedStudents = await getAssignedStudents(req.user);
    const isAssigned = assignedStudents.some((assigned) => String(assigned._id) === studentId);
    if (!isAssigned) {
      return res.status(403).json({ message: "This student is not assigned to you." });
    }

    if (!student.studentProfile) {
      student.studentProfile = {};
    }

    student.studentProfile.isStopped = Boolean(isStopped);
    student.studentProfile.stoppedAt = isStopped ? new Date() : undefined;
    student.status = isStopped ? "stopped" : "active";

    await student.save();

    res.json({
      student,
      message: `Student status for ${student.name} updated to ${isStopped ? "Stopped" : "Active"}.`
    });
  } catch (error) {
    next(error);
  }
});

// Switch or promote a student's course/level (e.g. A1 -> A2)
teacherRouter.put("/students/:studentId/course", async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { course, resetSessions } = req.body;

    if (!course || !course.trim()) {
      return res.status(400).json({ message: "Course / Level name is required." });
    }

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const assignedStudents = await getAssignedStudents(req.user);
    const isAssigned = assignedStudents.some((assigned) => String(assigned._id) === studentId);
    if (!isAssigned) {
      return res.status(403).json({ message: "This student is not assigned to you." });
    }

    if (!student.studentProfile) {
      student.studentProfile = {};
    }

    const oldCourse = student.studentProfile.course || "Unassigned";
    const newCourse = course.trim();
    student.studentProfile.course = newCourse;

    if (resetSessions) {
      const presentCount = await Attendance.countDocuments({ student: studentId, status: "Present" });
      student.studentProfile.sessionsAttended = Math.max(0, 0 - presentCount);
    }

    await student.save();

    res.json({
      student,
      message: `${student.name} updated from ${oldCourse} to ${newCourse}! ðŸŒŸ`
    });
  } catch (error) {
    next(error);
  }
});

// Clear past attendance data to start fresh counting from Next Monday
teacherRouter.post("/attendance/clear-past", async (req, res, next) => {
  try {
    const students = await getAssignedStudents(req.user);
    const studentIds = students.map((s) => s._id);

    const result = await Attendance.deleteMany({
      student: { $in: studentIds }
    });

    res.json({
      message: `Cleared ${result.deletedCount} past attendance records. You can now start counting fresh from Next Monday!`,
      deletedCount: result.deletedCount
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
          sent:          notification.sent,
          channel:       notification.channel,
          emailSent:     notification.emailSent || false,
          smsSent:       notification.smsSent   || false,
          whatsappSent:  notification.waSent    || false,
          sentAt:        notification.sent ? new Date() : undefined,
          error:         notification.error
        };
      } catch (error) {
        attendance.parentNotification = {
          sent: false, channel: "none",
          emailSent: false, smsSent: false, whatsappSent: false,
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

teacherRouter.post("/attendance/bulk", async (req, res, next) => {
  try {
    const { studentIds, status, date = dateKey() } = req.body;
    if (!Array.isArray(studentIds) || !["Present", "Absent"].includes(status)) {
      return res.status(400).json({ message: "studentIds array and valid status are required." });
    }

    const assignedStudents = await getAssignedStudents(req.user);
    const assignedIds = new Set(assignedStudents.map((s) => String(s._id)));
    const validStudentIds = studentIds.filter((id) => assignedIds.has(String(id)));

    for (const studentId of validStudentIds) {
      let existing = await Attendance.findOne({ student: studentId, date });
      if (!existing) {
        existing = new Attendance({ student: studentId, teacher: req.user._id, date });
      }
      existing.status = status;
      existing.teacher = req.user._id;
      existing.source = "manual";
      await existing.save();

      if (status === "Absent" && !existing.parentNotification?.sent) {
        const student = assignedStudents.find((s) => String(s._id) === String(studentId));
        if (student) {
          try {
            const notification = await sendAbsenceNotification({
              student,
              teacher: req.user,
              attendance: existing
            });
            existing.parentNotification = {
              sent: notification.sent,
              channel: notification.channel,
              emailSent: notification.emailSent || false,
              smsSent: notification.smsSent || false,
              whatsappSent: notification.waSent || false,
              sentAt: notification.sent ? new Date() : undefined,
              error: notification.error
            };
            await existing.save();
          } catch (_) {}
        }
      }
    }

    res.json({ message: `Marked ${validStudentIds.length} student(s) as ${status}.` });
  } catch (error) {
    next(error);
  }
});

// â”€â”€ Register a new student (teacher self-service) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Student accounts are created by administrators only.

// â”€â”€ Student management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// List all students available to assign (unassigned or already mine)
teacherRouter.get("/available-students", async (req, res, next) => {
  try {
    // Exclude email â€” teachers only need name/profile to assign students
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

// â”€â”€ Group management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// Remove a student from one group without deleting their account, attendance, or class assignment.
teacherRouter.delete("/groups/:id/students/:studentId", async (req, res, next) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!group) return res.status(404).json({ message: "Group not found." });

    const studentId = String(req.params.studentId);
    if (!group.students.some((id) => String(id) === studentId)) {
      return res.status(404).json({ message: "Student is not in this group." });
    }

    group.students.pull(req.params.studentId);
    await group.save();

    res.json({ message: "Student removed from this group." });
  } catch (err) { next(err); }
});

// Move a student between this teacher's groups while preserving the student record and attendance.
teacherRouter.post("/groups/:id/students/:studentId/move", async (req, res, next) => {
  try {
    const sourceGroup = await Group.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!sourceGroup) return res.status(404).json({ message: "Source group not found." });

    const { targetGroupId } = req.body;
    if (!targetGroupId) return res.status(400).json({ message: "A destination group is required." });
    if (String(sourceGroup._id) === String(targetGroupId)) {
      return res.status(400).json({ message: "Choose a different destination group." });
    }

    const targetGroup = await Group.findOne({ _id: targetGroupId, teacher: req.user._id });
    if (!targetGroup) return res.status(404).json({ message: "Destination group not found." });

    const studentId = String(req.params.studentId);
    if (!sourceGroup.students.some((id) => String(id) === studentId)) {
      return res.status(404).json({ message: "Student is not in the source group." });
    }

    sourceGroup.students.pull(req.params.studentId);
    targetGroup.students.addToSet(req.params.studentId);
    await Promise.all([sourceGroup.save(), targetGroup.save()]);

    res.json({ message: "Student moved to the new group." });
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

// Broadcast a WhatsApp message to all students in a group
teacherRouter.post("/groups/:id/broadcast", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message content is required." });
    }

    const group = await Group.findOne({ _id: id, teacher: req.user._id })
      .populate("students", "name phone studentProfile age");

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    if (process.env.WHATSAPP_ENABLED !== "true") {
      return res.status(450).json({ message: "WhatsApp notifications are currently disabled on the server." });
    }

    const targets = [];
    const logs = [];

    for (const student of group.students) {
      const parentPhone = student.studentProfile?.parentPhone;
      const studentPhone = student.phone;
      const age = student.studentProfile?.age || student.age;
      // Standard age routing rule: 15+ is adult (receives directly), otherwise goes to parent
      const isAdult = age >= 15 || !parentPhone;
      const recipientPhone = isAdult ? studentPhone : parentPhone;

      if (recipientPhone) {
        targets.push({
          studentName: student.name,
          phone: recipientPhone
        });
      } else {
        logs.push({ studentName: student.name, status: "Skipped", error: "No phone number available" });
      }
    }

    let successCount = 0;
    let failedCount = 0;

    for (const target of targets) {
      try {
        await sendWhatsAppMessage(target.phone, message);
        successCount++;
        logs.push({ studentName: target.studentName, phone: target.phone, status: "Sent" });
      } catch (err) {
        failedCount++;
        logs.push({ studentName: target.studentName, phone: target.phone, status: "Failed", error: err.message });
      }
    }

    res.json({
      message: `Broadcast finished. Sent: ${successCount}, Failed: ${failedCount}`,
      summary: { successCount, failedCount },
      logs
    });
  } catch (error) {
    next(error);
  }
});

// Get all observations, notes, and file attachments for a student
teacherRouter.get("/students/:studentId/notes", async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const notes = await StudentNote.find({ student: studentId })
      .sort({ createdAt: -1 })
      .populate("teacher", "name email");

    res.json({ notes });
  } catch (error) {
    next(error);
  }
});

// Create a new observation, note, or upload files (pictures / PDFs) for a student
teacherRouter.post("/students/:studentId/notes", async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { title, content, category, attachments } = req.body;

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const assignedStudents = await getAssignedStudents(req.user);
    const isAssigned = assignedStudents.some((assigned) => String(assigned._id) === studentId);
    if (!isAssigned) {
      return res.status(403).json({ message: "This student is not assigned to you." });
    }

    const newNote = new StudentNote({
      student: studentId,
      teacher: req.user._id,
      category: category || "observation",
      title: title?.trim(),
      content: content?.trim(),
      attachments: attachments || []
    });

    await newNote.save();
    const populated = await StudentNote.findById(newNote._id).populate("teacher", "name email");

    res.json({
      note: populated,
      message: `Observation / Files uploaded for ${student.name} successfully!`
    });
  } catch (error) {
    next(error);
  }
});

// Delete a note / observation
teacherRouter.delete("/notes/:noteId", async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await StudentNote.findOneAndDelete({ _id: noteId, teacher: req.user._id });
    if (!note) {
      return res.status(404).json({ message: "Note not found or permission denied." });
    }

    res.json({ message: "Observation deleted." });
  } catch (error) {
    next(error);
  }
});

