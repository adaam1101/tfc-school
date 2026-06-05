import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { recordAudit } from "../utils/audit.js";

export const paymentRouter = express.Router();

paymentRouter.use(protect);

// ── Student: view own fee history ──
paymentRouter.get("/mine", allowRoles("student"), async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

// ── Admin: manage payments ──
paymentRouter.use(allowRoles("admin"));

paymentRouter.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.studentId) filter.student = req.query.studentId;
    if (req.query.period) filter.period = req.query.period;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .limit(300)
      .populate("student", "name email studentProfile.course");

    const summary = await Payment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" }, collected: { $sum: "$paidAmount" } } }
    ]);

    res.json({ payments, summary });
  } catch (error) {
    next(error);
  }
});

paymentRouter.post("/", async (req, res, next) => {
  try {
    const { student, period, amount } = req.body;
    if (!student || !period || amount == null) {
      return res.status(400).json({ message: "Student, period, and amount are required." });
    }

    const studentDoc = await User.findOne({ _id: student, role: "student" }).select("name");
    if (!studentDoc) return res.status(400).json({ message: "Student not found." });

    const payment = await Payment.create({
      student,
      period: req.body.period,
      amount: Number(req.body.amount),
      paidAmount: Number(req.body.paidAmount || 0),
      method: req.body.method || "cash",
      note: req.body.note,
      recordedBy: req.user._id
    });

    await recordAudit({
      req,
      action: "create",
      entity: "payment",
      entityLabel: studentDoc.name,
      details: `${payment.period} · ${payment.status}`
    });

    const populated = await Payment.findById(payment._id).populate(
      "student",
      "name email studentProfile.course"
    );
    res.status(201).json({ payment: populated });
  } catch (error) {
    next(error);
  }
});

paymentRouter.put("/:id", async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found." });

    if (req.body.period != null) payment.period = req.body.period;
    if (req.body.amount != null) payment.amount = Number(req.body.amount);
    if (req.body.paidAmount != null) payment.paidAmount = Number(req.body.paidAmount);
    if (req.body.method != null) payment.method = req.body.method;
    if (req.body.note != null) payment.note = req.body.note;
    await payment.save();

    await recordAudit({
      req,
      action: "update",
      entity: "payment",
      entityLabel: payment.period,
      details: payment.status
    });

    const populated = await Payment.findById(payment._id).populate(
      "student",
      "name email studentProfile.course"
    );
    res.json({ payment: populated });
  } catch (error) {
    next(error);
  }
});

paymentRouter.delete("/:id", async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found." });

    await recordAudit({ req, action: "delete", entity: "payment", entityLabel: payment.period });
    res.json({ message: "Payment removed." });
  } catch (error) {
    next(error);
  }
});
