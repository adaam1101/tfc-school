import mongoose from "mongoose";

const { Schema } = mongoose;

const announcementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    audience: {
      type: String,
      enum: ["all", "students", "teachers"],
      default: "all",
      index: true
    },
    pinned: { type: Boolean, default: false },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, trim: true }
  },
  { timestamps: true }
);

export const Announcement = mongoose.model("Announcement", announcementSchema);
