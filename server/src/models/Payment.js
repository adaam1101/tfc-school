import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    period: { type: String, trim: true }, // e.g. "January 2026" or "Term 1" (legacy field)
    month: { type: String, trim: true }, // YYYY-MM format e.g. "2026-06"
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date },
    paidDate: { type: Date },
    status: {
      type: String,
      enum: ["paid", "unpaid", "partial", "pending", "overdue"],
      default: "unpaid",
      index: true
    },
    method: { type: String, enum: ["cash", "transfer", "card", "bank", "other"], default: "cash" },
    note: { type: String, trim: true, maxlength: 500 },
    notes: { type: String, trim: true, maxlength: 500 },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

// Derive status from amounts and dates whenever the doc is saved.
paymentSchema.pre("save", function deriveStatus(next) {
  // If fully paid
  if (this.paidAmount >= this.amount && this.amount > 0) {
    this.status = "paid";
    if (!this.paidDate) this.paidDate = new Date();
  } else if (this.paidAmount > 0) {
    this.status = "partial";
  } else if (this.dueDate && this.dueDate < new Date() && this.status !== "paid") {
    // Past due and not paid => overdue
    this.status = "overdue";
  } else if (this.status !== "overdue") {
    this.status = "unpaid";
  }
  next();
});

// Static helper to compute overdue on existing docs
paymentSchema.statics.computeStatus = function (payment) {
  if (payment.paidAmount >= payment.amount && payment.amount > 0) return "paid";
  if (payment.paidAmount > 0) return "partial";
  if (payment.dueDate && new Date(payment.dueDate) < new Date()) return "overdue";
  return "unpaid";
};

export const Payment = mongoose.model("Payment", paymentSchema);
