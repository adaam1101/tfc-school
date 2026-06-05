import { AuditLog } from "../models/AuditLog.js";

/**
 * Fire-and-forget audit logging. Never throws into the request flow —
 * a failed audit write must not break the action it is recording.
 */
export const recordAudit = async ({ req, action, entity, entityLabel, details }) => {
  try {
    await AuditLog.create({
      actor: req?.user?._id,
      actorName: req?.user?.name,
      actorRole: req?.user?.role,
      action,
      entity,
      entityLabel,
      details
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};
