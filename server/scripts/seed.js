import dotenv from "dotenv";
import { connectDB } from "../src/config/db.js";
import { Attendance } from "../src/models/Attendance.js";
import { User } from "../src/models/User.js";
import { dateKey } from "../src/utils/dates.js";

dotenv.config();

const password = {
  admin: "Admin@12345",
  teacher: "Teacher@12345",
  student: "Student@12345"
};

const buildDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return dateKey(date);
};

const seed = async () => {
  await connectDB();
  await Promise.all([Attendance.deleteMany({}), User.deleteMany({})]);

  const admin = await User.create({
    role: "admin",
    name: "TFC School Manager",
    email: "admin@tfcschool.dz",
    password: password.admin,
    phone: "+213555000001"
  });

  const teacher = await User.create({
    role: "teacher",
    name: "Ms. Nadia Benali",
    email: "teacher.english@tfcschool.dz",
    password: password.teacher,
    phone: "+213555000002",
    teacherProfile: {
      subject: "English",
      contactInfo: "nadia.benali@tfcschool.dz"
    }
  });

  const students = await User.create([
    {
      role: "student",
      name: "Amine Haddad",
      email: "student.amine@tfcschool.dz",
      password: password.student,
      studentProfile: {
        age: 14,
        course: "English",
        parentName: "Karim Haddad",
        parentEmail: "parent.amine@example.com",
        parentPhone: "+213555100001",
        mark: "B+",
        teacher: teacher._id
      }
    },
    {
      role: "student",
      name: "Lina Saidi",
      email: "student.lina@tfcschool.dz",
      password: password.student,
      studentProfile: {
        age: 13,
        course: "English",
        parentName: "Samira Saidi",
        parentEmail: "parent.lina@example.com",
        parentPhone: "+213555100002",
        mark: "A",
        teacher: teacher._id
      }
    },
    {
      role: "student",
      name: "Yacine Merabet",
      email: "student.yacine@tfcschool.dz",
      password: password.student,
      studentProfile: {
        age: 15,
        course: "English",
        parentName: "Noureddine Merabet",
        parentEmail: "parent.yacine@example.com",
        parentPhone: "+213555100003",
        mark: "B",
        teacher: teacher._id
      }
    }
  ]);

  teacher.teacherProfile.assignedStudents = students.map((student) => student._id);
  await teacher.save();

  await Attendance.create([
    {
      student: students[0]._id,
      teacher: teacher._id,
      date: buildDate(2),
      status: "Present"
    },
    {
      student: students[0]._id,
      teacher: teacher._id,
      date: buildDate(1),
      status: "Absent",
      note: "Parent called later to explain transport issue.",
      parentNotification: {
        sent: false,
        channel: "none",
        error: "Seed data only; no notification was sent."
      }
    },
    {
      student: students[1]._id,
      teacher: teacher._id,
      date: buildDate(1),
      status: "Present"
    },
    {
      student: students[2]._id,
      teacher: teacher._id,
      date: buildDate(1),
      status: "Present"
    }
  ]);

  console.log("Seed complete.");
  console.table([
    { role: "Admin", email: admin.email, password: password.admin },
    { role: "Teacher", email: teacher.email, password: password.teacher },
    { role: "Student", email: students[0].email, password: password.student }
  ]);

  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
