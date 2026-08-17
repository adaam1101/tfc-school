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

// ── Monthly Detailed Rapport (Accessible by Admin, Sous-Admin, Moderator & Teacher) ──
paymentRouter.get("/monthly-rapport", allowRoles("admin", "sous-admin", "moderator", "teacher"), async (req, res, next) => {
  try {
    const isTeacher = req.user.role === "teacher";
    const selectedMonth = req.query.month || new Date().toISOString().slice(0, 7); // e.g. "2026-08"
    const requestedTeacherId = req.query.teacherId;

    // Resolve student filter
    let studentQuery = { role: "student" };
    if (isTeacher) {
      const assignedIds = req.user.teacherProfile?.assignedStudents || [];
      studentQuery.$or = [
        { "studentProfile.teacher": req.user._id },
        { _id: { $in: assignedIds } }
      ];
    } else if (requestedTeacherId) {
      const teacherDoc = await User.findById(requestedTeacherId);
      const assignedIds = teacherDoc?.teacherProfile?.assignedStudents || [];
      studentQuery.$or = [
        { "studentProfile.teacher": requestedTeacherId },
        { _id: { $in: assignedIds } }
      ];
    }

    const students = await User.find(studentQuery)
      .select("name email phone photo studentProfile status")
      .populate("studentProfile.teacher", "name email")
      .sort({ name: 1 });

    const studentIds = students.map((s) => s._id);

    // Fetch payments for this month
    const payments = await Payment.find({
      student: { $in: studentIds },
      month: selectedMonth
    });

    const paymentMap = new Map(payments.map((p) => [String(p.student), p]));

    // Generate month label
    const [year, monthNum] = selectedMonth.split("-");
    const monthDate = new Date(Number(year), Number(monthNum) - 1, 1);
    const monthName = monthDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    let totalExpectedTuition = 0;
    let totalCollectedTuition = 0;
    let totalRestTuition = 0;
    let totalAssuranceCollected = 0;
    let countPaid = 0;
    let countPartial = 0;
    let countUnpaid = 0;
    let countAssurancePaid = 0;

    const studentRapport = students.map((student) => {
      const p = paymentMap.get(String(student._id));
      const tuitionFee = p?.amount != null ? p.amount : 7500; // Default 7500 DA
      const paidTuition = p?.paidAmount != null ? p.paidAmount : 0;
      const rest = Math.max(0, tuitionFee - paidTuition);
      const assuranceFee = p?.assuranceAmount != null ? p.assuranceAmount : 800; // 800 DA
      const assurancePaid = Boolean(p?.assurancePaid);
      const status = p?.status || (paidTuition >= tuitionFee ? "paid" : paidTuition > 0 ? "partial" : "unpaid");

      totalExpectedTuition += tuitionFee;
      totalCollectedTuition += paidTuition;
      totalRestTuition += rest;

      if (assurancePaid) {
        totalAssuranceCollected += assuranceFee;
        countAssurancePaid += 1;
      }

      if (status === "paid") countPaid += 1;
      else if (status === "partial") countPartial += 1;
      else countUnpaid += 1;

      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        photo: student.photo,
        course: student.studentProfile?.course || "Standard",
        teacher: student.studentProfile?.teacher?.name || "Teacher",
        isStopped: student.studentProfile?.isStopped || student.status === "stopped",
        paymentId: p?._id || null,
        month: selectedMonth,
        period: monthName,
        tuitionFee,
        paidTuition,
        rest,
        assuranceFee,
        assurancePaid,
        status,
        method: p?.method || "cash",
        notes: p?.notes || "",
        updatedAt: p?.updatedAt || null
      };
    });

    const totalGrandCollected = totalCollectedTuition + totalAssuranceCollected;

    res.json({
      month: selectedMonth,
      monthName,
      summary: {
        totalStudents: students.length,
        totalExpectedTuition,
        totalCollectedTuition,
        totalRestTuition,
        totalAssuranceCollected,
        totalGrandCollected,
        countPaid,
        countPartial,
        countUnpaid,
        countAssurancePaid
      },
      students: studentRapport
    });
  } catch (error) {
    next(error);
  }
});

// ── Quick Payment & Assurance Record / Update (Admin, Teacher, Moderator) ──
paymentRouter.post("/quick", allowRoles("admin", "sous-admin", "moderator", "teacher"), async (req, res, next) => {
  try {
    const { studentId, month, amount, paidAmount, assurancePaid, method, notes } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required." });
    }

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // If teacher, verify that student is assigned
    if (req.user.role === "teacher") {
      const assignedIds = (req.user.teacherProfile?.assignedStudents || []).map(String);
      const isAssigned = String(student.studentProfile?.teacher) === String(req.user._id) || assignedIds.includes(String(studentId));
      if (!isAssigned) {
        return res.status(403).json({ message: "You are not authorized to manage payments for this student." });
      }
    }

    const selectedMonth = month || new Date().toISOString().slice(0, 7); // e.g. "2026-08"
    const [year, monthNum] = selectedMonth.split("-");
    const monthDate = new Date(Number(year), Number(monthNum) - 1, 1);
    const periodName = monthDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    const tuitionFee = amount != null && !isNaN(Number(amount)) ? Number(amount) : 7500;
    const paid = paidAmount != null && !isNaN(Number(paidAmount)) ? Number(paidAmount) : 0;
    const isAssurancePaid = Boolean(assurancePaid);

    let payment = await Payment.findOne({ student: studentId, month: selectedMonth });

    if (payment) {
      payment.amount = tuitionFee;
      payment.paidAmount = paid;
      payment.assurancePaid = isAssurancePaid;
      payment.assurancePaidAmount = isAssurancePaid ? 800 : 0;
      if (method) payment.method = method;
      if (notes !== undefined) payment.notes = notes;
      payment.period = periodName;
      payment.recordedBy = req.user._id;
      if (!payment.teacher) payment.teacher = student.studentProfile?.teacher || req.user._id;
      await payment.save();
    } else {
      payment = await Payment.create({
        student: studentId,
        teacher: student.studentProfile?.teacher || (req.user.role === "teacher" ? req.user._id : undefined),
        month: selectedMonth,
        period: periodName,
        amount: tuitionFee,
        paidAmount: paid,
        assuranceAmount: 800,
        assurancePaid: isAssurancePaid,
        assurancePaidAmount: isAssurancePaid ? 800 : 0,
        method: method || "cash",
        notes: notes || "",
        recordedBy: req.user._id
      });
    }

    await recordAudit({
      req,
      action: "quick_payment_update",
      entity: "payment",
      entityLabel: student.name,
      details: `${selectedMonth} · Paid: ${paid} DA / Rest: ${payment.restAmount} DA · Assurance: ${isAssurancePaid ? "Paid" : "Unpaid"}`
    });

    const populated = await Payment.findById(payment._id)
      .populate("student", "name email studentProfile.course")
      .populate("teacher", "name email");

    res.json({
      payment: populated,
      message: `Payment for ${student.name} updated: Paid ${paid.toLocaleString()} DA, Rest ${payment.restAmount.toLocaleString()} DA. 💳`
    });
  } catch (error) {
    next(error);
  }
});

// ── Monthly report — legacy aggregation ──
paymentRouter.get("/report/monthly", allowRoles("admin", "sous-admin", "moderator"), async (req, res, next) => {
  try {
    const report = await Payment.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$month", { $substr: ["$period", 0, 7] }] },
          totalBilled: { $sum: "$amount" },
          totalCollected: { $sum: "$paidAmount" },
          totalRest: { $sum: "$restAmount" },
          totalAssurance: { $sum: "$assurancePaidAmount" },
          countPaid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } },
          countPending: { $sum: { $cond: [{ $in: ["$status", ["unpaid", "pending"]] }, 1, 0] } },
          countOverdue: { $sum: { $cond: [{ $eq: ["$status", "overdue"] }, 1, 0] } },
          countPartial: { $sum: { $cond: [{ $eq: ["$status", "partial"] }, 1, 0] } }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 24 }
    ]);
    res.json({ report });
  } catch (error) {
    next(error);
  }
});

// ── Admin / sous-admin / moderator: read payments ──
paymentRouter.get("/", allowRoles("admin", "sous-admin", "moderator"), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.studentId) filter.student = req.query.studentId;
    if (req.query.teacherId) filter.teacher = req.query.teacherId;
    if (req.query.period) filter.period = req.query.period;
    if (req.query.month) filter.month = req.query.month;

    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .limit(300)
      .populate("student", "name email studentProfile.course")
      .populate("teacher", "name email");

    const summary = await Payment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" }, collected: { $sum: "$paidAmount" } } }
    ]);

    res.json({ payments, summary });
  } catch (error) {
    next(error);
  }
});

// ── Admin / sous-admin / moderator: write operations (no delete) ──
paymentRouter.use(allowRoles("admin", "sous-admin", "moderator"));

paymentRouter.post("/", async (req, res, next) => {
  try {
    const { student, period, month, amount } = req.body;
    if (!student || (!period && !month) || amount == null) {
      return res.status(400).json({ message: "Student, period (or month), and amount are required." });
    }

    const studentDoc = await User.findOne({ _id: student, role: "student" }).select("name studentProfile");
    if (!studentDoc) return res.status(400).json({ message: "Student not found." });

    const payment = await Payment.create({
      student,
      teacher: studentDoc.studentProfile?.teacher,
      period: req.body.period,
      month: req.body.month,
      amount: Number(req.body.amount || 7500),
      paidAmount: Number(req.body.paidAmount || 0),
      assuranceAmount: Number(req.body.assuranceAmount || 800),
      assurancePaid: Boolean(req.body.assurancePaid),
      assurancePaidAmount: req.body.assurancePaid ? Number(req.body.assuranceAmount || 800) : 0,
      dueDate: req.body.dueDate || undefined,
      paidDate: req.body.paidDate || undefined,
      method: req.body.method || "cash",
      note: req.body.note,
      notes: req.body.notes,
      recordedBy: req.user._id
    });

    await recordAudit({
      req,
      action: "create",
      entity: "payment",
      entityLabel: studentDoc.name,
      details: `${payment.period || payment.month} · ${payment.status}`
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
    if (req.body.month != null) payment.month = req.body.month;
    if (req.body.amount != null) payment.amount = Number(req.body.amount);
    if (req.body.paidAmount != null) payment.paidAmount = Number(req.body.paidAmount);
    if (req.body.assuranceAmount != null) payment.assuranceAmount = Number(req.body.assuranceAmount);
    if (req.body.assurancePaid != null) {
      payment.assurancePaid = Boolean(req.body.assurancePaid);
      payment.assurancePaidAmount = payment.assurancePaid ? (payment.assuranceAmount || 800) : 0;
    }
    if (req.body.dueDate != null) payment.dueDate = req.body.dueDate;
    if (req.body.paidDate != null) payment.paidDate = req.body.paidDate;
    if (req.body.method != null) payment.method = req.body.method;
    if (req.body.note != null) payment.note = req.body.note;
    if (req.body.notes != null) payment.notes = req.body.notes;
    await payment.save();

    await recordAudit({
      req,
      action: "update",
      entity: "payment",
      entityLabel: payment.period || payment.month,
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

paymentRouter.delete("/:id", allowRoles("admin"), async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found." });

    await recordAudit({ req, action: "delete", entity: "payment", entityLabel: payment.period || payment.month });
    res.json({ message: "Payment removed." });
  } catch (error) {
    next(error);
  }
});
