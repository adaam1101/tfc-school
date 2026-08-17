import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", index: true },
    period: { type: String, trim: true }, // e.g. "August 2026"
    month: { type: String, trim: true, index: true }, // YYYY-MM format e.g. "2026-08"
    amount: { type: Number, default: 7500, min: 0 }, // Default monthly tuition: 7500 DA
    paidAmount: { type: Number, default: 0, min: 0 }, // Paid amount e.g. 4000 DA
    restAmount: { type: Number, default: 7500, min: 0 }, // Rest to pay e.g. 3500 DA
    assuranceAmount: { type: Number, default: 800, min: 0 }, // Assurance: 800 DA
    assurancePaid: { type: Boolean, default: false }, // Whether assurance is paid
    assurancePaidAmount: { type: Number, default: 0, min: 0 },
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

// Derive status and restAmount whenever the doc is saved
paymentSchema.pre("save", function derivePaymentFields(next) {
  const tuitionFee = typeof this.amount === "number" && !isNaN(this.amount) ? this.amount : 7500;
  const paid = typeof this.paidAmount === "number" && !isNaN(this.paidAmount) ? this.paidAmount : 0;
  this.amount = tuitionFee;
  this.paidAmount = paid;
  this.restAmount = Math.max(0, tuitionFee - paid);

  if (this.assuranceAmount == null || isNaN(this.assuranceAmount)) {
    this.assuranceAmount = 800;
  }

  if (this.assurancePaid && (!this.assurancePaidAmount || this.assurancePaidAmount === 0)) {
    this.assurancePaidAmount = this.assuranceAmount;
  } else if (!this.assurancePaid && this.assurancePaidAmount >= this.assuranceAmount && this.assuranceAmount > 0) {
    this.assurancePaid = true;
  }

  // If fully paid
  if (this.paidAmount >= this.amount && this.amount > 0) {
    this.status = "paid";
    if (!this.paidDate) this.paidDate = new Date();
  } else if (this.paidAmount > 0) {
    this.status = "partial";
  } else if (this.dueDate && this.dueDate < new Date() && this.status !== "paid") {
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
