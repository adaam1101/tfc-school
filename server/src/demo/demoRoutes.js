import express from "express";
import jwt from "jsonwebtoken";
import {
  assignedStudentsForTeacher,
  createDemoUser,
  deleteDemoUser,
  demoAttendance,
  demoLogin,
  demoUsers,
  findDemoUserById,
  populateAttendance,
  publicDemoUser,
  updateDemoUser,
  upsertDemoAttendance
} from "./demoStore.js";
import { dateKey, daysAgo } from "../utils/dates.js";

export const demoRouter = express.Router();

const protectDemo = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = findDemoUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid user." });
    }

    req.user = user;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
};

const allowDemoRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission for this action." });
  }

  next();
};

const countByStatus = (records) =>
  Object.entries(
    records.reduce((total, record) => {
      total[record.status] = (total[record.status] || 0) + 1;
      return total;
    }, {})
  ).map(([_id, count]) => ({ _id, count }));

demoRouter.post("/auth/login", (req, res) => {
  const result = demoLogin(req.body);

  if (!result) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  if (result.roleMismatch) {
    return res.status(403).json({ message: `This account is not a ${req.body.role} account.` });
  }

  return res.json(result);
});

demoRouter.get("/auth/me", protectDemo, (req, res) => {
  res.json({ user: publicDemoUser(req.user) });
});

demoRouter.get("/admin/dashboard", protectDemo, allowDemoRoles("admin"), (_req, res) => {
  const today = dateKey();
  const todayRecords = demoAttendance.filter((record) => record.date === today);
  const weekRecords = demoAttendance.filter(
    (record) => record.date >= daysAgo(6) && record.date <= today
  );

  res.json({
    stats: {
      totalStudents: demoUsers.filter((user) => user.role === "student").length,
      totalTeachers: demoUsers.filter((user) => user.role === "teacher").length,
      today,
      todayAttendance: countByStatus(todayRecords),
      weekAttendance: countByStatus(weekRecords)
    },
    recentAbsences: demoAttendance
      .filter((record) => record.status === "Absent")
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
      .map(populateAttendance)
  });
});

demoRouter.get("/admin/users", protectDemo, allowDemoRoles("admin"), (_req, res) => {
  res.json({
    users: demoUsers
      .map(publicDemoUser)
      .sort((a, b) => `${a.role}-${a.name}`.localeCompare(`${b.role}-${b.name}`))
  });
});

demoRouter.post("/admin/users", protectDemo, allowDemoRoles("admin"), (req, res) => {
  res.status(201).json({ user: createDemoUser(req.body) });
});

demoRouter.put("/admin/users/:id", protectDemo, allowDemoRoles("admin"), (req, res) => {
  const user = updateDemoUser(req.params.id, req.body);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.json({ user });
});

demoRouter.delete("/admin/users/:id", protectDemo, allowDemoRoles("admin"), (req, res) => {
  if (req.user._id === req.params.id) {
    return res.status(400).json({ message: "You cannot delete your own admin account." });
  }

  if (!deleteDemoUser(req.params.id)) {
    return res.status(404).json({ message: "User not found." });
  }

  res.json({ message: "User deleted." });
});

demoRouter.get("/admin/reports/attendance", protectDemo, allowDemoRoles("admin"), (req, res) => {
  const records = demoAttendance
    .filter((record) => {
      if (req.query.from && record.date < req.query.from) return false;
      if (req.query.to && record.date > req.query.to) return false;
      if (req.query.status && record.status !== req.query.status) return false;
      if (req.query.studentId && record.student !== req.query.studentId) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(populateAttendance);

  res.json({ records });
});

demoRouter.get("/teacher/dashboard", protectDemo, allowDemoRoles("teacher"), (req, res) => {
  const today = dateKey();
  const students = assignedStudentsForTeacher(req.user._id).map((student) => {
    const todayAttendance = demoAttendance.find(
      (record) => record.student === student._id && record.date === today
    );
    return { ...publicDemoUser(student), todayAttendance: todayAttendance || null };
  });

  res.json({
    teacher: publicDemoUser(req.user),
    today,
    weekStats: countByStatus(
      demoAttendance.filter(
        (record) => record.teacher === req.user._id && record.date >= daysAgo(6) && record.date <= today
      )
    ),
    students
  });
});

demoRouter.post("/teacher/attendance", protectDemo, allowDemoRoles("teacher"), (req, res) => {
  const assigned = assignedStudentsForTeacher(req.user._id);

  if (!assigned.some((student) => student._id === req.body.studentId)) {
    return res.status(403).json({ message: "This student is not assigned to you." });
  }

  const attendance = upsertDemoAttendance({
    studentId: req.body.studentId,
    teacherId: req.user._id,
    status: req.body.status,
    note: req.body.note,
    date: req.body.date
  });

  res.json({ attendance });
});

demoRouter.get("/student/profile", protectDemo, allowDemoRoles("student"), (req, res) => {
  res.json({
    student: publicDemoUser(req.user),
    teacher: publicDemoUser(findDemoUserById(req.user.studentProfile?.teacher)),
    attendanceHistory: demoAttendance
      .filter((record) => record.student === req.user._id)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 90)
      .map(populateAttendance)
  });
});
