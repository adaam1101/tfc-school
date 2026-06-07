import mongoose from "mongoose";

const { Schema } = mongoose;

const scheduleSchema = new Schema(
  {
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
      index: true
    },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User" },
    course: { type: String, trim: true },
    room: { type: String, trim: true },
    color: { type: String, default: "#04436E", trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Schedule = mongoose.model("Schedule", scheduleSchema);
