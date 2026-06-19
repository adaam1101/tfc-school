import { translations } from './i18n';

const BASE_URL = '/api';

// Standalone Helper: Load/Save from LocalStorage
const STORAGE_KEYS = {
  USERS: 'school_users',
  ENROLLMENTS: 'school_enrollments',
  PAYMENTS: 'school_payments',
  TIMETABLE: 'school_timetable',
  ANNOUNCEMENTS: 'school_announcements',
  LOGS: 'school_logs',
  ATTENDANCE: 'school_attendance'
};

// Custom simple TOTP function (matching the backend algorithm)
function generateTOTP(secret, timeStep = 30) {
  // A simple deterministic 6-digit code generator based on time step and secret
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStep);
  // Simple hashing algorithm simulation
  let hash = 0;
  const str = secret + counter;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const code = Math.abs(hash) % 1000000;
  return String(code).padStart(6, '0');
}

// Activity Logging Helper
function writeMockLog(user, action, details, school) {
  const logs = getLocalStorageItem(STORAGE_KEYS.LOGS, []);
  logs.unshift({
    _id: Math.random().toString(36).substring(7),
    user,
    action,
    details,
    school,
    createdAt: new Date().toISOString()
  });
  saveLocalStorageItem(STORAGE_KEYS.LOGS, logs);
}

function getLocalStorageItem(key, defaultValue) {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
}

function saveLocalStorageItem(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed mock database inside browser local storage
function seedLocalStorage(school) {
  // Check if already seeded
  const users = getLocalStorageItem(STORAGE_KEYS.USERS, []);
  if (users.length > 0) return;

  console.log("Seeding browser LocalStorage Database...");

  // Seed Users
  const seededUsers = [
    { _id: 'u_1', name: "TFC Admin", email: "admin@tfcschool.dz", role: "admin", phone: "+213 555 12 34 56", school: "tfc", twoFactorEnabled: false, password: "Admin123!", failedLoginAttempts: 0 },
    { _id: 'u_2', name: "TFC Sous-Admin", email: "sousadmin@tfcschool.dz", role: "sous-admin", phone: "+213 666 45 67 89", school: "tfc", twoFactorEnabled: false, password: "Staff123!", failedLoginAttempts: 0 },
    { _id: 'u_3', name: "TFC Moderator", email: "moderator@tfcschool.dz", role: "moderator", phone: "+213 777 89 01 23", school: "tfc", twoFactorEnabled: false, password: "Staff123!", failedLoginAttempts: 0 },
    { _id: 'u_4', name: "Prof. Amine Merah", email: "teacher@tfcschool.dz", role: "teacher", phone: "+213 550 11 22 33", school: "tfc", twoFactorEnabled: false, password: "Teacher123!", failedLoginAttempts: 0 },
    { _id: 'u_5', name: "Yacine Belkacem", email: "yacine@tfcschool.dz", role: "student", phone: "+213 561 77 88 99", school: "tfc", twoFactorEnabled: false, password: "Student123!", failedLoginAttempts: 0 },
    { _id: 'u_6', name: "Sarah Boudiaf", email: "sarah@tfcschool.dz", role: "student", phone: "+213 552 44 55 66", school: "tfc", twoFactorEnabled: false, password: "Student123!", failedLoginAttempts: 0 },
    
    { _id: 'u_7', name: "NextMind Admin", email: "admin@nextmind.dz", role: "admin", phone: "+213 550 99 88 77", school: "nextmind", twoFactorEnabled: false, password: "Admin123!", failedLoginAttempts: 0 },
    { _id: 'u_8', name: "NextMind Moderator", email: "moderator@nextmind.dz", role: "moderator", phone: "+213 770 12 34 56", school: "nextmind", twoFactorEnabled: false, password: "Staff123!", failedLoginAttempts: 0 },
    { _id: 'u_9', name: "Prof. Leila Meziane", email: "teacher@nextmind.dz", role: "teacher", phone: "+213 540 66 77 88", school: "nextmind", twoFactorEnabled: false, password: "Teacher123!", failedLoginAttempts: 0 },
    { _id: 'u_10', name: "Farid Hamidi", email: "farid@nextmind.dz", role: "student", phone: "+213 772 33 44 55", school: "nextmind", twoFactorEnabled: false, password: "Student123!", failedLoginAttempts: 0 }
  ];
  saveLocalStorageItem(STORAGE_KEYS.USERS, seededUsers);

  // Seed Enrollments
  const seededEnrollments = [
    { _id: "e_1", name: "Meriem Bensaad", phone: "+213 655 43 21 09", age: 22, formation: "Couture & Stylisme", status: "pending", isOrphan: false, isTwoFormations: false, school: "tfc", createdAt: new Date().toISOString() },
    { _id: "e_2", name: "Riad Mahrez", phone: "+213 560 99 00 11", age: 12, formation: "Kids: Robotique", status: "pending", isOrphan: true, isTwoFormations: false, school: "tfc", createdAt: new Date().toISOString() },
    { _id: "e_3", name: "Imane Khelif", phone: "+213 775 88 99 00", age: 25, formation: "Design Graphique", status: "pending", isOrphan: false, isTwoFormations: false, school: "nextmind", createdAt: new Date().toISOString() }
  ];
  saveLocalStorageItem(STORAGE_KEYS.ENROLLMENTS, seededEnrollments);

  // Seed Payments
  const currentMonth = new Date().toISOString().substring(0, 7);
  const seededPayments = [
    { _id: "p_1", studentId: "u_5", studentName: "Yacine Belkacem", formation: "Informatique (Word/Excel)", totalAmount: 8700, amountPaid: 8700, remainingBalance: 0, status: "paid", month: currentMonth, note: "Seeded payment", school: "tfc", createdAt: new Date().toISOString() },
    { _id: "p_2", studentId: "u_6", studentName: "Sarah Boudiaf", formation: "Secrétariat-GRH", totalAmount: 14800, amountPaid: 5000, remainingBalance: 9800, status: "partial", month: currentMonth, note: "Paid deposit", school: "tfc", createdAt: new Date().toISOString() },
    { _id: "p_3", studentId: "u_10", studentName: "Farid Hamidi", formation: "UI/UX Figma", totalAmount: 27000, amountPaid: 0, remainingBalance: 27000, status: "unpaid", month: currentMonth, note: "Invoice generated", school: "nextmind", createdAt: new Date().toISOString() }
  ];
  saveLocalStorageItem(STORAGE_KEYS.PAYMENTS, seededPayments);

  // Seed Timetables
  const seededTimetable = [
    { _id: "t_1", groupName: "Informatique-G1", teacherId: "u_4", teacherName: "Prof. Amine Merah", formation: "Informatique", day: "Saturday", time: "09:00 - 12:00", room: "Lab 1", school: "tfc" },
    { _id: "t_2", groupName: "Couture-G2", teacherId: "u_4", teacherName: "Prof. Amine Merah", formation: "Couture & Stylisme", day: "Tuesday", time: "14:00 - 17:00", room: "Atelier A", school: "tfc" },
    { _id: "t_3", groupName: "Figma-G1", teacherId: "u_9", teacherName: "Prof. Leila Meziane", formation: "UI/UX Figma", day: "Monday", time: "18:00 - 20:30", room: "Room 101", school: "nextmind" }
  ];
  saveLocalStorageItem(STORAGE_KEYS.TIMETABLE, seededTimetable);

  // Seed Announcements
  const seededAnnouncements = [
    { _id: "a_1", title: "Welcome to TFC School Portal!", content: "We are pleased to introduce our new school management portal. All features are active.", author: "TFC Admin", role: "admin", school: "tfc", createdAt: new Date().toISOString() },
    { _id: "a_2", title: "NextMind Portfolio Deadline", content: "UI/UX Figma and Design students are reminded that portfolio submission is next Saturday.", author: "NextMind Admin", role: "admin", school: "nextmind", createdAt: new Date().toISOString() }
  ];
  saveLocalStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, seededAnnouncements);

  // Seed Logs
  writeMockLog("System", "SEED", "Seeded LocalStorage database", "tfc");
  writeMockLog("System", "SEED", "Seeded LocalStorage database", "nextmind");
}

// State to track if backend server is available
let serverAvailable = false;
let checkAttempted = false;

// Attempt to detect Express backend ping
async function checkServerConnection(school) {
  if (checkAttempted) return serverAvailable;
  try {
    const res = await fetch('/', { method: 'GET' });
    serverAvailable = res.ok;
  } catch (err) {
    serverAvailable = false;
  }
  checkAttempted = true;
  
  if (!serverAvailable) {
    seedLocalStorage(school);
  }
  return serverAvailable;
}

// Unified Request Client
async function request(path, options = {}, school) {
  const isOnline = await checkServerConnection(school);
  
  if (isOnline) {
    // 1. ONLINE SERVER MODE (Vite Proxy redirects to Express server)
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'x-school': school,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
  } else {
    // 2. STANDALONE LOCALSTORAGE MOCK MODE (Fully runs in browser for Netlify)
    return await executeLocalMock(path, options, school);
  }
}

// LOCAL BROWSER ENGINE (Simulates all backend operations inside LocalStorage)
async function executeLocalMock(path, options, school) {
  await new Promise(r => setTimeout(r, 200)); // Mimic networking delay

  const method = options.method || 'GET';
  const body = options.body || {};

  // Auth: Login
  if (path === '/auth/login' && method === 'POST') {
    const users = getLocalStorageItem(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email === body.email);
    if (!user) throw new Error("Invalid credentials");

    // Lockout check
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const remainingMin = Math.ceil((new Date(user.lockoutUntil) - new Date()) / 60000);
      throw new Error(`Account locked. Try again in ${remainingMin} minutes.`);
    }

    // Password Match check
    if (user.password !== body.password) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      user.failedLoginAttempts = attempts;
      if (attempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        user.failedLoginAttempts = 0;
        saveLocalStorageItem(STORAGE_KEYS.USERS, users);
        throw new Error('Account locked due to too many failed attempts. Locked for 15 minutes.');
      } else {
        saveLocalStorageItem(STORAGE_KEYS.USERS, users);
        throw new Error(`Invalid credentials. ${5 - attempts} attempts remaining.`);
      }
    }

    // Reset attempts
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    saveLocalStorageItem(STORAGE_KEYS.USERS, users);

    // 2FA Verification checking
    if (user.twoFactorEnabled) {
      if (!body.code) {
        const currentCode = generateTOTP(user.twoFactorSecret);
        return {
          require2FA: true,
          userId: user._id,
          demoCode: currentCode
        };
      }

      const expectedCode = generateTOTP(user.twoFactorSecret);
      if (body.code !== expectedCode) {
        throw new Error('Invalid 2FA security code');
      }
    }

    writeMockLog(user.name, 'LOGIN', 'Logged into standalone dashboard', school);
    
    // Return dummy token containing user profile
    const token = `mock-token-${user._id}-${user.role}`;
    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        school: user.school,
        twoFactorEnabled: user.twoFactorEnabled
      }
    };
  }

  // Auth: Setup 2FA
  if (path === '/auth/2fa/setup' && method === 'POST') {
    const users = getLocalStorageItem(STORAGE_KEYS.USERS, []);
    const userId = getMockUserIdFromToken();
    const index = users.findIndex(u => u._id === userId);
    if (index === -1) throw new Error("User not found");

    const secret = Math.random().toString(36).substring(2, 12).toUpperCase();
    users[index].twoFactorSecret = secret;
    saveLocalStorageItem(STORAGE_KEYS.USERS, users);

    const demoCode = generateTOTP(secret);

    return {
      secret,
      demoCode,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/${school}:${users[index].email}?secret=${secret}&issuer=${school}`
    };
  }

  // Auth: Enable 2FA
  if (path === '/auth/2fa/enable' && method === 'POST') {
    const users = getLocalStorageItem(STORAGE_KEYS.USERS, []);
    const userId = getMockUserIdFromToken();
    const index = users.findIndex(u => u._id === userId);
    if (index === -1) throw new Error("User not found");

    const expectedCode = generateTOTP(users[index].twoFactorSecret);
    if (body.code !== expectedCode) throw new Error("Invalid verification code");

    users[index].twoFactorEnabled = true;
    saveLocalStorageItem(STORAGE_KEYS.USERS, users);

    writeMockLog(users[index].name, '2FA_ENABLED', 'Enabled Two-Factor Authentication', school);
    return { message: 'Two-factor enabled' };
  }

  // Auth: Disable 2FA
  if (path === '/auth/2fa/disable' && method === 'POST') {
    const users = getLocalStorageItem(STORAGE_KEYS.USERS, []);
    const userId = getMockUserIdFromToken();
    const index = users.findIndex(u => u._id === userId);
    if (index === -1) throw new Error("User not found");

    users[index].twoFactorEnabled = false;
    users[index].twoFactorSecret = null;
    saveLocalStorageItem(STORAGE_KEYS.USERS, users);

    writeMockLog(users[index].name, '2FA_DISABLED', 'Disabled Two-Factor Authentication', school);
    return { message: 'Two-factor disabled' };
  }

  // Auth: Generate password reset link
  if (path === '/auth/reset-password-link' && method === 'POST') {
    const users = getLocalStorageItem(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u._id === body.userId);
    if (!user) throw new Error("User not found");

    const token = Math.random().toString(36).substring(2, 18);
    user.twoFactorSecret = `reset:${token}`; // temporarily store token here
    saveLocalStorageItem(STORAGE_KEYS.USERS, users);

    const sender = getMockUserNameFromToken();
    writeMockLog(sender, 'PASSWORD_RESET_LINK', `Generated reset link for user ${user.name}`, school);

    return { resetLink: `/reset-password?token=${token}&userId=${user._id}` };
  }

  // Auth: Confirm Password Reset
  if (path === '/auth/reset-password-confirm' && method === 'POST') {
    const users = getLocalStorageItem(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u._id === body.userId);
    if (index === -1 || users[index].twoFactorSecret !== `reset:${body.token}`) {
      throw new Error("Invalid or expired reset token");
    }

    users[index].password = body.newPassword;
    users[index].twoFactorSecret = null; // clear token
    saveLocalStorageItem(STORAGE_KEYS.USERS, users);

    writeMockLog(users[index].name, 'PASSWORD_RESET_SUCCESS', 'Password reset via link', school);
    return { message: 'Password reset successful' };
  }

  // Enrollments: Get
  if (path === '/enrollments' && method === 'GET') {
    const list = getLocalStorageItem(STORAGE_KEYS.ENROLLMENTS, []);
    return list.filter(e => e.school === school);
  }

  // Enrollments: Create
  if (path === '/enrollments' && method === 'POST') {
    const list = getLocalStorageItem(STORAGE_KEYS.ENROLLMENTS, []);
    const newEnroll = {
      _id: 'e_' + Math.random().toString(36).substring(5),
      createdAt: new Date().toISOString(),
      status: 'pending',
      school,
      ...body
    };
    list.push(newEnroll);
    saveLocalStorageItem(STORAGE_KEYS.ENROLLMENTS, list);
    return { enrollment: newEnroll };
  }

  // Enrollments: Approve
  if (path.startsWith('/enrollments/') && path.endsWith('/approve') && method === 'POST') {
    const id = path.split('/')[2];
    const list = getLocalStorageItem(STORAGE_KEYS.ENROLLMENTS, []);
    const index = list.findIndex(e => e._id === id);
    if (index === -1) throw new Error("Enrollment not found");

    const enroll = list[index];
    enroll.status = 'approved';

    // Auto-generate credentials
    const safeName = enroll.name.toLowerCase().replace(/[^a-z]/g, '');
    const suffix = school === 'tfc' ? 'tfcschool.dz' : 'nextmind.dz';
    const email = `${safeName}_${Math.floor(100 + Math.random() * 900)}@${suffix}`;
    const rawPassword = Math.random().toString(36).substring(2, 10) + '!';

    // Create User Student
    const users = getLocalStorageItem(STORAGE_KEYS.USERS, []);
    const newStudent = {
      _id: 'u_' + Math.random().toString(36).substring(5),
      name: enroll.name,
      email,
      password: rawPassword, // plain text in standalone mock
      role: 'student',
      phone: enroll.phone,
      school,
      twoFactorEnabled: false,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString()
    };
    users.push(newStudent);
    saveLocalStorageItem(STORAGE_KEYS.USERS, users);

    // Calculate invoice total amount
    let basePrice = 0;
    if (school === 'tfc') {
      if (enroll.formation.includes("Informatique")) basePrice = 7900;
      else if (enroll.formation.includes("Secrétariat")) basePrice = 14000;
      else if (enroll.formation.includes("Vendeur")) basePrice = 13000;
      else if (enroll.formation.includes("Photography")) basePrice = 18000;
      else if (enroll.formation.includes("Anglais") || enroll.formation.includes("Kids")) basePrice = 2700;
      else basePrice = 10000;
    } else {
      if (enroll.formation.includes("Design") || enroll.formation.includes("Figma") || enroll.formation.includes("Video")) basePrice = 26000;
      else if (enroll.formation.includes("Digital Art")) basePrice = 35000;
      else if (enroll.formation.includes("ESP")) basePrice = 8000;
      else if (enroll.formation.includes("English adults")) {
        if (enroll.level === 'A1') basePrice = 6000;
        else if (enroll.level === 'A2') basePrice = 6500;
        else if (enroll.level === 'B1') basePrice = 7000;
        else if (enroll.level === 'B2') basePrice = 7500;
        else if (enroll.level === 'C1') basePrice = 8000;
        else basePrice = 7000;
      } else basePrice = 15000;
    }

    if (enroll.isTwoFormations) basePrice = 0;
    else if (enroll.isOrphan && school === 'tfc') basePrice *= 0.5;

    const fee = school === 'tfc' ? 800 : 1000;
    const totalAmount = basePrice + fee;

    // Create Payment record
    const payments = getLocalStorageItem(STORAGE_KEYS.PAYMENTS, []);
    const currentMonth = new Date().toISOString().substring(0, 7);
    payments.push({
      _id: 'p_' + Math.random().toString(36).substring(5),
      studentId: newStudent._id,
      studentName: newStudent.name,
      formation: enroll.formation,
      totalAmount,
      amountPaid: 0,
      remainingBalance: totalAmount,
      status: 'unpaid',
      month: currentMonth,
      note: 'Auto generated invoice',
      school,
      createdAt: new Date().toISOString()
    });
    saveLocalStorageItem(STORAGE_KEYS.PAYMENTS, payments);

    enroll.email = email;
    saveLocalStorageItem(STORAGE_KEYS.ENROLLMENTS, list);

    const adminName = getMockUserNameFromToken();
    writeMockLog(adminName, 'ENROLLMENT_APPROVE', `Approved registration for ${enroll.name}`, school);

    return {
      message: 'Approved',
      credentials: { email, password: rawPassword, name: enroll.name }
    };
  }

  // Enrollments: Reject
  if (path.startsWith('/enrollments/') && path.endsWith('/reject') && method === 'POST') {
    const id = path.split('/')[2];
    const list = getLocalStorageItem(STORAGE_KEYS.ENROLLMENTS, []);
    const index = list.findIndex(e => e._id === id);
    if (index === -1) throw new Error("Enrollment not found");

    list[index].status = 'rejected';
    saveLocalStorageItem(STORAGE_KEYS.ENROLLMENTS, list);

    const adminName = getMockUserNameFromToken();
    writeMockLog(adminName, 'ENROLLMENT_REJECT', `Rejected registration for ${list[index].name}`, school);
    return { message: 'Rejected' };
  }

  // Payments: Get
  if (path === '/payments' && method === 'GET') {
    const list = getLocalStorageItem(STORAGE_KEYS.PAYMENTS, []);
    const role = getMockUserRoleFromToken();
    const userId = getMockUserIdFromToken();
    
    const schoolFiltered = list.filter(p => p.school === school);
    if (role === 'student') {
      return schoolFiltered.filter(p => p.studentId === userId);
    }
    return schoolFiltered;
  }

  // Payments: Update
  if (path.startsWith('/payments/') && method === 'PUT') {
    const id = path.split('/')[2];
    const list = getLocalStorageItem(STORAGE_KEYS.PAYMENTS, []);
    const index = list.findIndex(p => p._id === id);
    if (index === -1) throw new Error("Invoice not found");

    const payment = list[index];
    const paid = Number(body.amountPaid);
    const balance = payment.totalAmount - paid;
    let status = 'unpaid';
    if (paid > 0 && balance > 0) status = 'partial';
    else if (balance <= 0) status = 'paid';

    payment.amountPaid = paid;
    payment.remainingBalance = balance;
    payment.status = status;
    payment.month = body.month;
    payment.note = body.note;

    saveLocalStorageItem(STORAGE_KEYS.PAYMENTS, list);

    const sender = getMockUserNameFromToken();
    writeMockLog(sender, 'PAYMENT_UPDATE', `Recorded payment for ${payment.studentName} (${paid}/${payment.totalAmount} DA)`, school);
    return payment;
  }

  // Users: Get
  if (path === '/users' && method === 'GET') {
    const list = getLocalStorageItem(STORAGE_KEYS.USERS, []);
    // strip passwords for safety
    return list.filter(u => u.school === school).map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
  }

  // Users: Create
  if (path === '/users' && method === 'POST') {
    const list = getLocalStorageItem(STORAGE_KEYS.USERS, []);
    const newUser = {
      _id: 'u_' + Math.random().toString(36).substring(5),
      createdAt: new Date().toISOString(),
      school,
      ...body
    };
    list.push(newUser);
    saveLocalStorageItem(STORAGE_KEYS.USERS, list);

    const sender = getMockUserNameFromToken();
    writeMockLog(sender, 'USER_CREATE', `Created staff account ${body.name} (${body.role})`, school);
    return newUser;
  }

  // Users: Update
  if (path.startsWith('/users/') && method === 'PUT') {
    const id = path.split('/')[2];
    const list = getLocalStorageItem(STORAGE_KEYS.USERS, []);
    const index = list.findIndex(u => u._id === id);
    if (index === -1) throw new Error("User not found");

    list[index].name = body.name;
    list[index].phone = body.phone;
    if (body.password) {
      list[index].password = body.password;
    }
    saveLocalStorageItem(STORAGE_KEYS.USERS, list);

    const sender = getMockUserNameFromToken();
    writeMockLog(sender, 'USER_UPDATE', `Updated user details for ${list[index].name}`, school);
    return list[index];
  }

  // Users: Delete
  if (path.startsWith('/users/') && method === 'DELETE') {
    const id = path.split('/')[2];
    const list = getLocalStorageItem(STORAGE_KEYS.USERS, []);
    const index = list.findIndex(u => u._id === id);
    if (index === -1) throw new Error("User not found");

    const removed = list.splice(index, 1);
    saveLocalStorageItem(STORAGE_KEYS.USERS, list);

    const sender = getMockUserNameFromToken();
    writeMockLog(sender, 'USER_DELETE', `Deleted account ${removed[0].name}`, school);
    return { message: 'Deleted' };
  }

  // Timetable: Get
  if (path === '/timetable' && method === 'GET') {
    const list = getLocalStorageItem(STORAGE_KEYS.TIMETABLE, []);
    return list.filter(t => t.school === school);
  }

  // Timetable: Create/Update
  if (path === '/timetable' && method === 'POST') {
    const list = getLocalStorageItem(STORAGE_KEYS.TIMETABLE, []);
    
    if (body._id) {
      const index = list.findIndex(t => t._id === body._id);
      if (index === -1) throw new Error("Schedule not found");
      list[index] = { ...list[index], ...body };
      saveLocalStorageItem(STORAGE_KEYS.TIMETABLE, list);
      const sender = getMockUserNameFromToken();
      writeMockLog(sender, 'TIMETABLE_UPDATE', `Updated group schedule ${body.groupName}`, school);
      return list[index];
    } else {
      const newT = {
        _id: 't_' + Math.random().toString(36).substring(5),
        school,
        ...body
      };
      list.push(newT);
      saveLocalStorageItem(STORAGE_KEYS.TIMETABLE, list);
      const sender = getMockUserNameFromToken();
      writeMockLog(sender, 'TIMETABLE_CREATE', `Created schedule for ${body.groupName}`, school);
      return newT;
    }
  }

  // Timetable: Delete
  if (path.startsWith('/timetable/') && method === 'DELETE') {
    const id = path.split('/')[2];
    const list = getLocalStorageItem(STORAGE_KEYS.TIMETABLE, []);
    const index = list.findIndex(t => t._id === id);
    if (index === -1) throw new Error("Schedule not found");

    const removed = list.splice(index, 1);
    saveLocalStorageItem(STORAGE_KEYS.TIMETABLE, list);

    const sender = getMockUserNameFromToken();
    writeMockLog(sender, 'TIMETABLE_DELETE', `Deleted schedule entry`, school);
    return { message: 'Deleted' };
  }

  // Announcements: Get
  if (path === '/announcements' && method === 'GET') {
    const list = getLocalStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, []);
    return list.filter(a => a.school === school);
  }

  // Announcements: Create
  if (path === '/announcements' && method === 'POST') {
    const list = getLocalStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, []);
    const newAnn = {
      _id: 'a_' + Math.random().toString(36).substring(5),
      createdAt: new Date().toISOString(),
      author: getMockUserNameFromToken(),
      role: getMockUserRoleFromToken(),
      school,
      ...body
    };
    list.push(newAnn);
    saveLocalStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, list);

    writeMockLog(newAnn.author, 'ANNOUNCEMENT_POST', `Posted announcement: ${body.title}`, school);
    return newAnn;
  }

  // Announcements: Delete
  if (path.startsWith('/announcements/') && method === 'DELETE') {
    const id = path.split('/')[2];
    const list = getLocalStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, []);
    const index = list.findIndex(a => a._id === id);
    if (index === -1) throw new Error("Announcement not found");

    list.splice(index, 1);
    saveLocalStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, list);

    const sender = getMockUserNameFromToken();
    writeMockLog(sender, 'ANNOUNCEMENT_DELETE', `Deleted announcement`, school);
    return { message: 'Deleted' };
  }

  // Logs: Get
  if (path === '/logs' && method === 'GET') {
    const list = getLocalStorageItem(STORAGE_KEYS.LOGS, []);
    return list.filter(l => l.school === school);
  }

  // Logs: Clear
  if (path === '/logs/clear' && method === 'POST') {
    const list = getLocalStorageItem(STORAGE_KEYS.LOGS, []);
    const kept = list.filter(l => l.school !== school);
    saveLocalStorageItem(STORAGE_KEYS.LOGS, kept);

    const sender = getMockUserNameFromToken();
    writeMockLog(sender, 'LOGS_CLEARED', `Cleared activity logs`, school);
    return { message: 'Cleared' };
  }

  // Attendance: Get
  if (path.startsWith('/attendance') && method === 'GET') {
    const list = getLocalStorageItem(STORAGE_KEYS.ATTENDANCE, []);
    const schoolFiltered = list.filter(a => a.school === school);
    
    // Parse query params manually
    const url = new URL(path, 'http://localhost');
    const studentId = url.searchParams.get('studentId');
    const groupName = url.searchParams.get('groupName');

    let result = schoolFiltered;
    if (studentId) result = result.filter(a => a.studentId === studentId);
    if (groupName) result = result.filter(a => a.groupName === groupName);
    return result;
  }

  // Attendance: Save
  if (path === '/attendance' && method === 'POST') {
    const list = getLocalStorageItem(STORAGE_KEYS.ATTENDANCE, []);
    const { date, groupName, records } = body;

    for (let rec of records) {
      const index = list.findIndex(a => a.studentId === rec.studentId && a.date === date && a.groupName === groupName && a.school === school);
      if (index !== -1) {
        list[index].status = rec.status;
      } else {
        list.push({
          _id: 'att_' + Math.random().toString(36).substring(5),
          studentId: rec.studentId,
          studentName: rec.studentName,
          date,
          status: rec.status,
          groupName,
          school
        });
      }
    }
    saveLocalStorageItem(STORAGE_KEYS.ATTENDANCE, list);

    const sender = getMockUserNameFromToken();
    writeMockLog(sender, 'ATTENDANCE_RECORD', `Recorded attendance for group ${groupName} on ${date}`, school);
    return { message: 'Saved' };
  }

  throw new Error(`Mock endpoint ${path} not implemented.`);
}

// Extract mock information from temporary token
function getMockUserIdFromToken() {
  const token = localStorage.getItem('token') || '';
  return token.split('-')[2] || 'u_1'; // fallback admin
}

function getMockUserRoleFromToken() {
  const token = localStorage.getItem('token') || '';
  return token.split('-')[3] || 'admin';
}

function getMockUserNameFromToken() {
  const saved = localStorage.getItem('user');
  if (saved) {
    const u = JSON.parse(saved);
    return u.name;
  }
  return 'Admin User';
}

// Export API service functions
export const api = {
  login: (email, password, code, school) => 
    request('/auth/login', { method: 'POST', body: { email, password, code } }, school),
    
  setup2FA: (school) => 
    request('/auth/2fa/setup', { method: 'POST' }, school),
    
  enable2FA: (code, school) => 
    request('/auth/2fa/enable', { method: 'POST', body: { code } }, school),
    
  disable2FA: (school) => 
    request('/auth/2fa/disable', { method: 'POST' }, school),
    
  generateResetLink: (userId, school) => 
    request('/auth/reset-password-link', { method: 'POST', body: { userId } }, school),
    
  confirmResetPassword: (token, userId, newPassword, school) => 
    request('/auth/reset-password-confirm', { method: 'POST', body: { token, userId, newPassword } }, school),
    
  submitEnrollment: (data, school) => 
    request('/enrollments', { method: 'POST', body: data }, school),
    
  getEnrollments: (school) => 
    request('/enrollments', {}, school),
    
  approveEnrollment: (id, school) => 
    request(`/enrollments/${id}/approve`, { method: 'POST' }, school),
    
  rejectEnrollment: (id, school) => 
    request(`/enrollments/${id}/reject`, { method: 'POST' }, school),
    
  getPayments: (school) => 
    request('/payments', {}, school),
    
  updatePayment: (id, amountPaid, month, note, school) => 
    request(`/payments/${id}`, { method: 'PUT', body: { amountPaid, month, note } }, school),
    
  getUsers: (school) => 
    request('/users', {}, school),
    
  createUser: (data, school) => 
    request('/users', { method: 'POST', body: data }, school),
    
  updateUser: (id, data, school) => 
    request(`/users/${id}`, { method: 'PUT', body: data }, school),
    
  deleteUser: (id, school) => 
    request(`/users/${id}`, { method: 'DELETE' }, school),
    
  getTimetable: (school) => 
    request('/timetable', {}, school),
    
  saveTimetable: (data, school) => 
    request('/timetable', { method: 'POST', body: data }, school),
    
  deleteTimetable: (id, school) => 
    request(`/timetable/${id}`, { method: 'DELETE' }, school),
    
  getAnnouncements: (school) => 
    request('/announcements', {}, school),
    
  postAnnouncement: (title, content, school) => 
    request('/announcements', { method: 'POST', body: { title, content } }, school),
    
  deleteAnnouncement: (id, school) => 
    request(`/announcements/${id}`, { method: 'DELETE' }, school),
    
  getLogs: (school) => 
    request('/logs', {}, school),
    
  clearLogs: (school) => 
    request('/logs/clear', { method: 'POST' }, school),
    
  getAttendance: (studentId, groupName, school) => {
    let q = '';
    if (studentId) q += `studentId=${studentId}`;
    if (groupName) q += `${q ? '&' : ''}groupName=${groupName}`;
    return request(`/attendance${q ? '?' + q : ''}`, {}, school);
  },
  
  saveAttendance: (date, groupName, records, school) => 
    request('/attendance', { method: 'POST', body: { date, groupName, records } }, school)
};
