import mongoose from "mongoose";

const { Schema } = mongoose;

const attendanceSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    status: { type: String, enum: ["Present", "Absent"], required: true },
    source: { type: String, enum: ["manual", "rfid"], default: "manual" },
    note: { type: String, trim: true, maxlength: 500 },
    parentNotification: {
      sent:          { type: Boolean, default: false },
      channel:       { type: String, enum: ["email", "whatsapp", "both", "none"], default: "none" },
      emailSent:     { type: Boolean, default: false },
      whatsappSent:  { type: Boolean, default: false },
      sentAt:        Date,
      error:         String
    }
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
