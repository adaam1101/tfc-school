import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { Schedule } from "../models/Schedule.js";
import { recordAudit } from "../utils/audit.js";

export const scheduleRouter = express.Router();

scheduleRouter.use(protect);

// GET /api/schedules — all authenticated users
// Teachers see only their own schedules; students see schedules for their course; admins/sous-admins see all
scheduleRouter.get("/", async (req, res, next) => {
  try {
    const filter = { isActive: true };
    const { role } = req.user;

    if (role === "teacher") {
      filter.teacher = req.user._id;
    } else if (role === "student") {
      const course = req.user.studentProfile?.course;
      if (course) {
        filter.course = course;
      } else {
        return res.json({ schedules: [] });
      }
    }
    // admin, sous-admin, moderator: no extra filter — see all

    const schedules = await Schedule.find(filter)
      .populate("teacher", "name teacherProfile.subject")
      .sort({ day: 1, startTime: 1 });

    res.json({ schedules });
  } catch (error) {
    next(error);
  }
});

// POST /api/schedules — admin, sous-admin only
scheduleRouter.post("/", allowRoles("admin", "sous-admin"), async (req, res, next) => {
  try {
    const { day, startTime, endTime, subject, teacher, course, room, color } = req.body;
    if (!day || !startTime || !endTime || !subject) {
      return res.status(400).json({ message: "day, startTime, endTime, and subject are required." });
    }

    const schedule = await Schedule.create({ day, startTime, endTime, subject, teacher, course, room, color });

    const populated = await Schedule.findById(schedule._id).populate("teacher", "name teacherProfile.subject");

    await recordAudit({
      req,
      action: "create",
      entity: "schedule",
      entityLabel: `${subject} (${day} ${startTime}-${endTime})`
    });

    res.status(201).json({ schedule: populated });
  } catch (error) {
    next(error);
  }
});

// PUT /api/schedules/:id — admin, sous-admin only
scheduleRouter.put("/:id", allowRoles("admin", "sous-admin"), async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found." });

    const fields = ["day", "startTime", "endTime", "subject", "teacher", "course", "room", "color", "isActive"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) schedule[f] = req.body[f];
    });
    await schedule.save();

    const populated = await Schedule.findById(schedule._id).populate("teacher", "name teacherProfile.subject");

    await recordAudit({
      req,
      action: "update",
      entity: "schedule",
      entityLabel: schedule.subject
    });

    res.json({ schedule: populated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/schedules/:id — admin, sous-admin only
scheduleRouter.delete("/:id", allowRoles("admin", "sous-admin"), async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found." });

    await recordAudit({
      req,
      action: "delete",
      entity: "schedule",
      entityLabel: schedule.subject
    });

    res.json({ message: "Schedule deleted." });
  } catch (error) {
    next(error);
  }
});
