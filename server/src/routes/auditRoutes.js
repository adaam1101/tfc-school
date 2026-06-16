import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { AuditLog } from "../models/AuditLog.js";

export const auditRouter = express.Router();

auditRouter.use(protect, allowRoles("admin"));

auditRouter.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.entity) filter.entity = req.query.entity;
    if (req.query.action) filter.action = req.query.action;

    const limit = Math.min(Number(req.query.limit) || 100, 300);
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit);
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});

auditRouter.delete("/", async (req, res, next) => {
  try {
    await AuditLog.deleteMany({});
    res.json({ message: "Activity history cleared." });
  } catch (error) {
    next(error);
  }
});
