import mongoose from "mongoose";

const courseworkSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["lesson", "assignment"], required: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    dueDate: { type: String, trim: true, maxlength: 20 },
    course: { type: String, trim: true, maxlength: 120 }
  },
  { timestamps: true }
);

export const Coursework = mongoose.model("Coursework", courseworkSchema);
