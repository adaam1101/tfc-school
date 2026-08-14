import mongoose from "mongoose";

const { Schema } = mongoose;

const attachmentSchema = new Schema(
  {
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ["image", "pdf", "file"], default: "file" },
    fileData: { type: String, required: true }, // Base64 data URL
    fileSize: { type: Number }
  },
  { _id: true }
);

const studentNoteSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: {
      type: String,
      enum: ["observation", "homework", "resource", "general"],
      default: "observation"
    },
    title: { type: String, trim: true },
    content: { type: String, trim: true },
    attachments: [attachmentSchema]
  },
  { timestamps: true }
);

export const StudentNote = mongoose.model("StudentNote", studentNoteSchema);
