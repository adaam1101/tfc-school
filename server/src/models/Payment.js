import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    period: { type: String, required: true, trim: true }, // e.g. "January 2026" or "Term 1"
    amount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["paid", "unpaid", "partial"],
      default: "unpaid",
      index: true
    },
    method: { type: String, enum: ["cash", "transfer", "card", "other"], default: "cash" },
    note: { type: String, trim: true, maxlength: 300 },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

// Derive status from amounts whenever the doc is saved.
paymentSchema.pre("save", function deriveStatus(next) {
  if (this.paidAmount <= 0) this.status = "unpaid";
  else if (this.paidAmount >= this.amount) this.status = "paid";
  else this.status = "partial";
  next();
});

export const Payment = mongoose.model("Payment", paymentSchema);
