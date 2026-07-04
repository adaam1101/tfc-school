import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 300 },
    teacher:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    students:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    color:       { type: String, default: "#3B82F6" },
    days:        [{ type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] }]
  },
  { timestamps: true }
);

export const Group = mongoose.model("Group", groupSchema);
