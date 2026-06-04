import { z } from "zod";

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid database id.");
const role = z.enum(["admin", "teacher", "student"]);
const attendanceStatus = z.enum(["Present", "Absent"]);
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.");

const optionalText = (max = 200) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().trim().max(max).optional()
  );

const optionalEmail = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().trim().email().optional()
);

const teacherProfile = z
  .object({
    subject: optionalText(120),
    contactInfo: optionalText(200),
    assignedStudents: z.array(mongoId).optional()
  })
  .optional();

const studentProfile = z
  .object({
    age: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().int().min(3).max(80).optional()
    ),
    course: optionalText(120),
    parentName: optionalText(120),
    parentEmail: optionalEmail,
    parentPhone: optionalText(40),
    mark: optionalText(80),
    rfidCardId: optionalText(120),
    teacher: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      mongoId.optional()
    )
  })
  .optional();

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8),
    role: role.optional()
  })
});

export const createUserSchema = z.object({
  body: z.object({
    role,
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
    phone: optionalText(40),
    status: z.enum(["active", "inactive"]).optional(),
    teacherProfile,
    studentProfile
  })
});

export const updateUserSchema = z.object({
  params: z.object({ id: mongoId }),
  body: z.object({
    role: role.optional(),
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
    password: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.string().min(8).max(128).optional()
    ),
    phone: optionalText(40),
    status: z.enum(["active", "inactive"]).optional(),
    teacherProfile,
    studentProfile
  })
});

export const idParamSchema = z.object({
  params: z.object({ id: mongoId })
});

export const attendanceSchema = z.object({
  body: z.object({
    studentId: mongoId,
    status: attendanceStatus,
    note: optionalText(500),
    date: dateString.optional()
  })
});

export const attendanceReportSchema = z.object({
  query: z.object({
    from: dateString.optional(),
    to: dateString.optional(),
    status: attendanceStatus.optional(),
    studentId: mongoId.optional()
  })
});

export const rfidScanSchema = z.object({
  body: z.object({
    cardId: z.string().trim().min(2).max(120),
    date: dateString.optional()
  })
});
