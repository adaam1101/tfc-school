require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Main API Router mount
app.use('/api', routes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'TFC School / NextMind Academy School Management API is running.' });
});

// Seed Initial Mock Data if Database is empty
async function seedDatabase() {
  try {
    const userCount = await db.User.find({});
    if (userCount.length > 0) {
      console.log("Database already initialized. Skipping seeding.");
      return;
    }

    console.log("Database is empty. Seeding sample school data...");

    // 1. Passwords encryption
    const adminPass = await bcrypt.hash("Admin123!", 10);
    const staffPass = await bcrypt.hash("Staff123!", 10);
    const teacherPass = await bcrypt.hash("Teacher123!", 10);
    const studentPass = await bcrypt.hash("Student123!", 10);

    // 2. Create Users
    // TFC Users
    const tfcAdmin = await db.User.create({
      name: "TFC Admin",
      email: "admin@tfcschool.dz",
      password: adminPass,
      role: "admin",
      phone: "+213 555 12 34 56",
      school: "tfc",
      twoFactorEnabled: false
    });

    const tfcSousAdmin = await db.User.create({
      name: "TFC Sous-Admin",
      email: "sousadmin@tfcschool.dz",
      password: staffPass,
      role: "sous-admin",
      phone: "+213 666 45 67 89",
      school: "tfc",
      twoFactorEnabled: false
    });

    const tfcMod = await db.User.create({
      name: "TFC Moderator",
      email: "moderator@tfcschool.dz",
      password: staffPass,
      role: "moderator",
      phone: "+213 777 89 01 23",
      school: "tfc",
      twoFactorEnabled: false
    });

    const tfcTeacher = await db.User.create({
      name: "Prof. Amine Merah",
      email: "teacher@tfcschool.dz",
      password: teacherPass,
      role: "teacher",
      phone: "+213 550 11 22 33",
      school: "tfc",
      twoFactorEnabled: false
    });

    const tfcStudent1 = await db.User.create({
      name: "Yacine Belkacem",
      email: "yacine@tfcschool.dz",
      password: studentPass,
      role: "student",
      phone: "+213 561 77 88 99",
      school: "tfc",
      twoFactorEnabled: false
    });

    const tfcStudent2 = await db.User.create({
      name: "Sarah Boudiaf",
      email: "sarah@tfcschool.dz",
      password: studentPass,
      role: "student",
      phone: "+213 552 44 55 66",
      school: "tfc",
      twoFactorEnabled: false
    });

    // NextMind Users
    const nmAdmin = await db.User.create({
      name: "NextMind Admin",
      email: "admin@nextmind.dz",
      password: adminPass,
      role: "admin",
      phone: "+213 550 99 88 77",
      school: "nextmind",
      twoFactorEnabled: false
    });

    const nmMod = await db.User.create({
      name: "NextMind Moderator",
      email: "moderator@nextmind.dz",
      password: staffPass,
      role: "moderator",
      phone: "+213 770 12 34 56",
      school: "nextmind",
      twoFactorEnabled: false
    });

    const nmTeacher = await db.User.create({
      name: "Prof. Leila Meziane",
      email: "teacher@nextmind.dz",
      password: teacherPass,
      role: "teacher",
      phone: "+213 540 66 77 88",
      school: "nextmind",
      twoFactorEnabled: false
    });

    const nmStudent = await db.User.create({
      name: "Farid Hamidi",
      email: "farid@nextmind.dz",
      password: studentPass,
      role: "student",
      phone: "+213 772 33 44 55",
      school: "nextmind",
      twoFactorEnabled: false
    });

    // 3. Create Enrollments (Pending)
    await db.Enrollment.create({
      name: "Meriem Bensaad",
      phone: "+213 655 43 21 09",
      age: 22,
      formation: "Couture & Stylisme",
      status: "pending",
      isOrphan: false,
      isTwoFormations: false,
      school: "tfc"
    });

    await db.Enrollment.create({
      name: "Riad Mahrez",
      phone: "+213 560 99 00 11",
      age: 12,
      formation: "Robotique",
      status: "pending",
      isOrphan: true,
      isTwoFormations: false,
      school: "tfc"
    });

    await db.Enrollment.create({
      name: "Imane Khelif",
      phone: "+213 775 88 99 00",
      age: 25,
      formation: "Design Graphique",
      status: "pending",
      isOrphan: false,
      isTwoFormations: false,
      school: "nextmind"
    });

    // 4. Create Payments
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    // TFC Payments
    await db.Payment.create({
      studentId: tfcStudent1._id,
      studentName: tfcStudent1.name,
      formation: "Informatique (Word/Excel)",
      totalAmount: 8700, // 7900 + 800 fee
      amountPaid: 8700,
      remainingBalance: 0,
      status: "paid",
      month: currentMonth,
      note: "Fully paid on enrollment",
      school: "tfc"
    });

    await db.Payment.create({
      studentId: tfcStudent2._id,
      studentName: tfcStudent2.name,
      formation: "Secrétariat-GRH",
      totalAmount: 14800, // 14000 + 800 fee
      amountPaid: 5000,
      remainingBalance: 9800,
      status: "partial",
      month: currentMonth,
      note: "Paid deposit",
      school: "tfc"
    });

    // NextMind Payments
    await db.Payment.create({
      studentId: nmStudent._id,
      studentName: nmStudent.name,
      formation: "UI/UX Figma",
      totalAmount: 27000, // 26000 + 1000 fee
      amountPaid: 0,
      remainingBalance: 27000,
      status: "unpaid",
      month: currentMonth,
      note: "First month invoice generated",
      school: "nextmind"
    });

    // 5. Create Timetables
    await db.Timetable.create({
      groupName: "Informatique-G1",
      teacherId: tfcTeacher._id,
      teacherName: tfcTeacher.name,
      formation: "Informatique",
      day: "Saturday",
      time: "09:00 - 12:00",
      room: "Lab 1",
      school: "tfc"
    });

    await db.Timetable.create({
      groupName: "Couture-G2",
      teacherId: "teacher_ext_1",
      teacherName: "Prof. Yasmina",
      formation: "Couture & Stylisme",
      day: "Tuesday",
      time: "14:00 - 17:00",
      room: "Atelier A",
      school: "tfc"
    });

    await db.Timetable.create({
      groupName: "Figma-G1",
      teacherId: nmTeacher._id,
      teacherName: nmTeacher.name,
      formation: "UI/UX Figma",
      day: "Monday",
      time: "18:00 - 20:30",
      room: "Room 101",
      school: "nextmind"
    });

    // 6. Create Announcements
    await db.Announcement.create({
      title: "Welcome to our New Platform!",
      content: "We are excited to launch our new school management system. Teachers and students can now check schedules and attendance online.",
      author: "TFC Admin",
      role: "admin",
      school: "tfc"
    });

    await db.Announcement.create({
      title: "NextMind Academy Portfolio Review",
      content: "All Design Graphique and UI/UX Figma students are reminded that the monthly portfolio review will take place this Thursday at 16:00.",
      author: "NextMind Admin",
      role: "admin",
      school: "nextmind"
    });

    // 7. Seed Activity Logs
    await db.ActivityLog.create({
      user: "System",
      action: "SEED",
      details: "Database seeded with default mock records",
      school: "tfc"
    });

    await db.ActivityLog.create({
      user: "System",
      action: "SEED",
      details: "Database seeded with default mock records",
      school: "nextmind"
    });

    console.log("Seeding completed successfully.");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

// Start Server & Run Seeding
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Wait a short delay to let database connection attempt complete (in case of Mongo check)
  setTimeout(seedDatabase, 1500);
});
