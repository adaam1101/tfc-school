import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { Submission } from "../models/Submission.js";
import { Coursework } from "../models/Coursework.js";
import { User } from "../models/User.js";

export const submissionRouter = express.Router();

submissionRouter.use(protect);

// ── Student: Submit work ──
submissionRouter.post("/", allowRoles("student"), async (req, res, next) => {
  try {
    const { courseworkId, assignmentTitle, comment, attachments } = req.body;

    if (!comment?.trim() && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: "Please provide your answer or attach your work files (photos/PDFs)." });
    }

    let teacherId = req.user.studentProfile?.teacher;
    let title = assignmentTitle?.trim() || "Coursework Submission";

    if (courseworkId) {
      const coursework = await Coursework.findById(courseworkId);
      if (coursework) {
        teacherId = coursework.teacher || teacherId;
        title = coursework.title || title;
      }
    }

    if (!teacherId) {
      return res.status(400).json({ message: "No teacher is assigned to your account. Contact your school admin." });
    }

    // Check if an existing submission for this coursework exists
    let submission;
    if (courseworkId) {
      submission = await Submission.findOne({
        coursework: courseworkId,
        student: req.user._id
      });
    }

    if (submission) {
      // Update existing submission
      submission.comment = comment?.trim() || "";
      submission.attachments = attachments || [];
      submission.status = "submitted";
      submission.updatedAt = new Date();
      await submission.save();
    } else {
      // Create new submission
      submission = await Submission.create({
        coursework: courseworkId || undefined,
        assignmentTitle: title,
        student: req.user._id,
        teacher: teacherId,
        comment: comment?.trim() || "",
        attachments: attachments || [],
        status: "submitted"
      });
    }

    const populated = await Submission.findById(submission._id)
      .populate("student", "name email studentProfile photo")
      .populate("coursework", "title type dueDate");

    res.status(201).json({
      submission: populated,
      message: "Your work has been submitted successfully to your teacher! 🚀"
    });
  } catch (error) {
    next(error);
  }
});

// ── Student: Get own submissions ──
submissionRouter.get("/mine", allowRoles("student"), async (req, res, next) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .populate("teacher", "name email teacherProfile.subject")
      .populate("coursework", "title type dueDate");

    res.json({ submissions });
  } catch (error) {
    next(error);
  }
});

// ── Student: Delete submission ──
submissionRouter.delete("/:id", allowRoles("student"), async (req, res, next) => {
  try {
    const submission = await Submission.findOneAndDelete({
      _id: req.params.id,
      student: req.user._id
    });
    if (!submission) return res.status(404).json({ message: "Submission not found." });
    res.json({ message: "Submission removed." });
  } catch (error) {
    next(error);
  }
});

// ── Teacher: Get all submissions from students ──
submissionRouter.get("/teacher", allowRoles("teacher"), async (req, res, next) => {
  try {
    const { courseworkId, status } = req.query;
    const filter = { teacher: req.user._id };

    if (courseworkId) filter.coursework = courseworkId;
    if (status && status !== "all") filter.status = status;

    const submissions = await Submission.find(filter)
      .sort({ createdAt: -1 })
      .populate("student", "name email phone studentProfile photo")
      .populate("coursework", "title type dueDate course");

    const pendingCount = await Submission.countDocuments({
      teacher: req.user._id,
      status: "submitted"
    });

    res.json({ submissions, pendingCount });
  } catch (error) {
    next(error);
  }
});

// ── Teacher: Review, Grade and provide Feedback ──
submissionRouter.put("/:id/review", allowRoles("teacher"), async (req, res, next) => {
  try {
    const { grade, feedback, status } = req.body;
    const submission = await Submission.findOne({
      _id: req.params.id,
      teacher: req.user._id
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found or unauthorized." });
    }

    if (grade !== undefined) submission.grade = grade.trim();
    if (feedback !== undefined) submission.feedback = feedback.trim();
    submission.status = status || "reviewed";
    submission.reviewedAt = new Date();

    await submission.save();

    const populated = await Submission.findById(submission._id)
      .populate("student", "name email phone studentProfile photo")
      .populate("coursework", "title type dueDate course");

    res.json({
      submission: populated,
      message: "Submission review saved successfully!"
    });
  } catch (error) {
    next(error);
  }
});
