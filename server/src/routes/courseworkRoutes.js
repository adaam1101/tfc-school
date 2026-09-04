import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { Coursework } from "../models/Coursework.js";

export const courseworkRouter = express.Router();

courseworkRouter.use(protect);

courseworkRouter.get("/mine", allowRoles("student"), async (req, res, next) => {
  try {
    const teacherId = req.user.studentProfile?.teacher;
    if (!teacherId) return res.json({ items: [] });

    const course = req.user.studentProfile?.course;
    const filter = {
      teacher: teacherId,
      $or: [{ course: { $exists: false } }, { course: "" }, { course }]
    };
    const items = await Coursework.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ items });
  } catch (error) { next(error); }
});

courseworkRouter.get("/", allowRoles("teacher"), async (req, res, next) => {
  try {
    const items = await Coursework.find({ teacher: req.user._id }).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ items });
  } catch (error) { next(error); }
});

courseworkRouter.post("/", allowRoles("teacher"), async (req, res, next) => {
  try {
    const { type, title, body, dueDate, course, attachments } = req.body;
    if (!["lesson", "assignment"].includes(type)) return res.status(400).json({ message: "Choose a lesson or assignment." });
    if (!title?.trim() || !body?.trim()) return res.status(400).json({ message: "A title and details are required." });

    const item = await Coursework.create({
      teacher: req.user._id,
      type,
      title: title.trim(),
      body: body.trim(),
      dueDate: dueDate?.trim(),
      course: course?.trim(),
      attachments: attachments || []
    });
    res.status(201).json({ item });
  } catch (error) { next(error); }
});

courseworkRouter.delete("/:id", allowRoles("teacher"), async (req, res, next) => {
  try {
    const item = await Coursework.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    if (!item) return res.status(404).json({ message: "Published item not found." });
    res.json({ message: "Published item removed." });
  } catch (error) { next(error); }
});
