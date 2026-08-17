import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ["image", "pdf", "file"], default: "file" },
    fileData: { type: String, required: true },
    fileSize: { type: Number }
  },
  { _id: true }
);

const submissionSchema = new mongoose.Schema(
  {
    coursework: { type: mongoose.Schema.Types.ObjectId, ref: "Coursework", index: true },
    assignmentTitle: { type: String, trim: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    comment: { type: String, trim: true, maxlength: 4000 },
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: ["submitted", "reviewed", "returned"],
      default: "submitted"
    },
    grade: { type: String, trim: true, maxlength: 50 },
    feedback: { type: String, trim: true, maxlength: 4000 },
    reviewedAt: { type: Date }
  },
  { timestamps: true }
);

export const Submission = mongoose.model("Submission", submissionSchema);
