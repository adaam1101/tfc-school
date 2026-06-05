import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { Announcement } from "../models/Announcement.js";
import { recordAudit } from "../utils/audit.js";

export const announcementRouter = express.Router();

announcementRouter.use(protect);

// ── Any authenticated user: see announcements for their role ──
announcementRouter.get("/", async (req, res, next) => {
  try {
    const audiences = ["all"];
    if (req.user.role === "student") audiences.push("students");
    if (req.user.role === "teacher") audiences.push("teachers");
    // Admins see everything.
    const filter = req.user.role === "admin" ? {} : { audience: { $in: audiences } };

    const announcements = await Announcement.find(filter)
      .sort({ pinned: -1, createdAt: -1 })
      .limit(50);

    res.json({ announcements });
  } catch (error) {
    next(error);
  }
});

// ── Admin: manage announcements ──
announcementRouter.use(allowRoles("admin"));

announcementRouter.post("/", async (req, res, next) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required." });
    }

    const announcement = await Announcement.create({
      title: req.body.title,
      body: req.body.body,
      audience: ["all", "students", "teachers"].includes(req.body.audience)
        ? req.body.audience
        : "all",
      pinned: Boolean(req.body.pinned),
      author: req.user._id,
      authorName: req.user.name
    });

    await recordAudit({ req, action: "create", entity: "announcement", entityLabel: announcement.title });
    res.status(201).json({ announcement });
  } catch (error) {
    next(error);
  }
});

announcementRouter.put("/:id", async (req, res, next) => {
  try {
    const update = {};
    ["title", "body", "audience", "pinned"].forEach((key) => {
      if (req.body[key] != null) update[key] = req.body[key];
    });

    const announcement = await Announcement.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });

    await recordAudit({ req, action: "update", entity: "announcement", entityLabel: announcement.title });
    res.json({ announcement });
  } catch (error) {
    next(error);
  }
});

announcementRouter.delete("/:id", async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });

    await recordAudit({ req, action: "delete", entity: "announcement", entityLabel: announcement.title });
    res.json({ message: "Announcement removed." });
  } catch (error) {
    next(error);
  }
});
