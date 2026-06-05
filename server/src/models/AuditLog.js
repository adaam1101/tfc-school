import mongoose from "mongoose";

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    actorName: { type: String, trim: true },
    actorRole: { type: String, trim: true },
    action: { type: String, required: true, trim: true }, // e.g. "create", "update", "delete", "approve"
    entity: { type: String, required: true, trim: true }, // e.g. "user", "payment", "announcement"
    entityLabel: { type: String, trim: true }, // human-friendly target, e.g. student name
    details: { type: String, trim: true, maxlength: 300 }
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
