import mongoose from "mongoose";

const { Schema } = mongoose;

const enrollmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, min: 3, max: 80 },
    course: { type: String, required: true, trim: true },
    parentName: { type: String, trim: true },
    parentPhone: { type: String, trim: true },
    message: { type: String, trim: true, maxlength: 600 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    }
  },
  { timestamps: true }
);

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
