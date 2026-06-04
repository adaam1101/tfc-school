import { signToken } from "../utils/jwt.js";
import { dateKey, daysAgo } from "../utils/dates.js";
import { applyRfidCardToProfile, hashRfidCardId, normalizeRfidCardId } from "../utils/rfid.js";

const ids = {
  admin: "665f00000000000000000001",
  teacher: "665f00000000000000000002",
  amine: "665f00000000000000000003",
  lina: "665f00000000000000000004",
  yacine: "665f00000000000000000005"
};

const passwords = new Map([
  [ids.admin, "Admin@12345"],
  [ids.teacher, "Teacher@12345"],
  [ids.amine, "Student@12345"],
  [ids.lina, "Student@12345"],
  [ids.yacine, "Student@12345"]
]);

export const demoUsers = [
  {
    _id: ids.admin,
    role: "admin",
    name: "TFC School Manager",
    email: "admin@tfcschool.dz",
    phone: "+213555000001",
    status: "active"
  },
  {
    _id: ids.teacher,
    role: "teacher",
    name: "Ms. Nadia Benali",
    email: "teacher.english@tfcschool.dz",
    phone: "+213555000002",
    status: "active",
    teacherProfile: {
      subject: "English",
      contactInfo: "nadia.benali@tfcschool.dz",
      assignedStudents: [ids.amine, ids.lina, ids.yacine]
    }
  },
  {
    _id: ids.amine,
    role: "student",
    name: "Amine Haddad",
    email: "student.amine@tfcschool.dz",
    status: "active",
    studentProfile: {
      age: 14,
      course: "English",
      parentName: "Karim Haddad",
      parentEmail: "parent.amine@example.com",
      parentPhone: "+213555100001",
      mark: "B+",
      rfidDemoCardId: "TFC1001",
      rfidCardLast4: "1001",
      teacher: ids.teacher
    }
  },
  {
    _id: ids.lina,
    role: "student",
    name: "Lina Saidi",
    email: "student.lina@tfcschool.dz",
    status: "active",
    studentProfile: {
      age: 13,
      course: "English",
      parentName: "Samira Saidi",
      parentEmail: "parent.lina@example.com",
      parentPhone: "+213555100002",
      mark: "A",
      rfidDemoCardId: "TFC1002",
      rfidCardLast4: "1002",
      teacher: ids.teacher
    }
  },
  {
    _id: ids.yacine,
    role: "student",
    name: "Yacine Merabet",
    email: "student.yacine@tfcschool.dz",
    status: "active",
    studentProfile: {
      age: 15,
      course: "English",
      parentName: "Noureddine Merabet",
      parentEmail: "parent.yacine@example.com",
      parentPhone: "+213555100003",
      mark: "B",
      rfidDemoCardId: "TFC1003",
      rfidCardLast4: "1003",
      teacher: ids.teacher
    }
  }
];

export let demoAttendance = [
  {
    _id: "775f00000000000000000001",
    student: ids.amine,
    teacher: ids.teacher,
    date: daysAgo(2),
    status: "Present",
    note: "",
    parentNotification: { sent: false, channel: "none" }
  },
  {
    _id: "775f00000000000000000002",
    student: ids.amine,
    teacher: ids.teacher,
    date: daysAgo(1),
    status: "Absent",
    note: "Parent called later to explain transport issue.",
    parentNotification: {
      sent: false,
      channel: "none",
      error: "Demo mode: no email was sent."
    }
  },
  {
    _id: "775f00000000000000000003",
    student: ids.lina,
    teacher: ids.teacher,
    date: daysAgo(1),
    status: "Present",
    note: "",
    parentNotification: { sent: false, channel: "none" }
  }
];

export const findDemoUserById = (id) => demoUsers.find((user) => user._id === id);

export const publicDemoUser = (user) => {
  if (!user) return null;
  const safeUser = JSON.parse(JSON.stringify(user));
  if (safeUser.studentProfile) {
    delete safeUser.studentProfile.rfidCardHash;
    delete safeUser.studentProfile.rfidDemoCardId;
  }
  return safeUser;
};

export const demoLogin = ({ email, password, role }) => {
  const user = demoUsers.find((item) => item.email === email.toLowerCase());

  if (!user || passwords.get(user._id) !== password) {
    return null;
  }

  if (role && user.role !== role) {
    return { roleMismatch: true };
  }

  return {
    token: signToken({ _id: user._id, role: user.role }),
    user: publicDemoUser(user)
  };
};

export const populateAttendance = (record) => ({
  ...record,
  student: publicDemoUser(findDemoUserById(record.student)),
  teacher: publicDemoUser(findDemoUserById(record.teacher))
});

export const assignedStudentsForTeacher = (teacherId) =>
  demoUsers
    .filter(
      (user) =>
        user.role === "student" &&
        (user.studentProfile?.teacher === teacherId ||
          findDemoUserById(teacherId)?.teacherProfile?.assignedStudents?.includes(user._id))
    )
    .sort((a, b) => a.name.localeCompare(b.name));

export const upsertDemoAttendance = ({ studentId, teacherId, status, note, date = dateKey() }) => {
  let record = demoAttendance.find((item) => item.student === studentId && item.date === date);

  if (!record) {
    record = {
      _id: `${Date.now()}`,
      student: studentId,
      teacher: teacherId,
      date,
      status,
      source: "manual",
      note: note || "",
      parentNotification: { sent: false, channel: "none" }
    };
    demoAttendance.push(record);
  }

  record.teacher = teacherId;
  record.status = status;
  record.source = "manual";
  record.note = note || "";
  record.parentNotification =
    status === "Absent"
      ? {
          sent: false,
          channel: "none",
          error: "Demo mode: parent email is simulated. Configure SMTP and disable DEMO_MODE for real email."
        }
      : { sent: false, channel: "none" };

  return record;
};

export const createDemoUser = (payload) => {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  if (payload.studentProfile) {
    payload.studentProfile = applyRfidCardToProfile(payload.studentProfile);
  }
  const user = { _id: id, status: "active", ...payload };
  demoUsers.push(user);

  if (payload.password) {
    passwords.set(id, payload.password);
    delete user.password;
  }

  if (user.role === "student" && user.studentProfile?.teacher) {
    const teacher = findDemoUserById(user.studentProfile.teacher);
    teacher?.teacherProfile?.assignedStudents?.push(id);
  }

  return publicDemoUser(user);
};

export const updateDemoUser = (id, payload) => {
  const user = findDemoUserById(id);
  if (!user) return null;

  if (payload.studentProfile) {
    payload.studentProfile = {
      ...(user.studentProfile || {}),
      ...applyRfidCardToProfile(payload.studentProfile)
    };
  }

  if (payload.password) {
    passwords.set(id, payload.password);
    delete payload.password;
  }

  Object.assign(user, payload);
  return publicDemoUser(user);
};

export const findDemoStudentByRfidCardId = (cardId) => {
  const normalized = normalizeRfidCardId(cardId);
  const cardHash = hashRfidCardId(normalizeRfidCardId(cardId));
  return demoUsers.find(
    (user) =>
      user.role === "student" &&
      user.status === "active" &&
      (user.studentProfile?.rfidCardHash === cardHash ||
        normalizeRfidCardId(user.studentProfile?.rfidDemoCardId) === normalized)
  );
};

export const upsertDemoRfidAttendance = ({ studentId, markedById, date = dateKey() }) => {
  const student = findDemoUserById(studentId);
  let record = demoAttendance.find((item) => item.student === studentId && item.date === date);
  const alreadyMarkedPresent = record?.status === "Present";

  if (!record) {
    record = {
      _id: `${Date.now()}`,
      student: studentId,
      teacher: student?.studentProfile?.teacher || markedById,
      date,
      status: "Present",
      source: "rfid",
      note: `Marked present by RFID scan from ${findDemoUserById(markedById)?.name || "kiosk"}.`,
      parentNotification: { sent: false, channel: "none" }
    };
    demoAttendance.push(record);
  }

  record.teacher = student?.studentProfile?.teacher || markedById;
  record.status = "Present";
  record.source = "rfid";
  record.parentNotification = { sent: false, channel: "none" };
  if (!record.note || !alreadyMarkedPresent) {
    record.note = `Marked present by RFID scan from ${findDemoUserById(markedById)?.name || "kiosk"}.`;
  }

  return { record, alreadyMarkedPresent };
};

export const deleteDemoUser = (id) => {
  const index = demoUsers.findIndex((user) => user._id === id);
  if (index === -1) return false;

  demoUsers.splice(index, 1);
  passwords.delete(id);
  demoAttendance = demoAttendance.filter((record) => record.student !== id && record.teacher !== id);
  demoUsers.forEach((user) => {
    if (user.teacherProfile?.assignedStudents) {
      user.teacherProfile.assignedStudents = user.teacherProfile.assignedStudents.filter(
        (studentId) => studentId !== id
      );
    }
  });
  return true;
};
