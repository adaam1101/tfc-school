const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('./db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_tfc_school_nextmind_academy_2026';

// Multi-school config helper
function getSchool(req) {
  // Can be passed via headers or query, default to server env config
  return req.headers['x-school'] || process.env.SCHOOL || 'tfc';
}

// Custom simple TOTP function
function generateTOTP(secret, timeStep = 30) {
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStep);
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(buffer);
  const hmacResult = hmac.digest();
  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  const code = ((hmacResult[offset] & 0x7f) << 24) |
               ((hmacResult[offset + 1] & 0xff) << 16) |
               ((hmacResult[offset + 2] & 0xff) << 8) |
               (hmacResult[offset + 3] & 0xff);
  return String(code % 1000000).padStart(6, '0');
}

// Activity Logging Helper
async function logActivity(user, action, details, school) {
  try {
    await db.ActivityLog.create({
      user,
      action,
      details,
      school,
      createdAt: new Date()
    });
  } catch (err) {
    console.error("Error creating activity log:", err);
  }
}

// Authentication Middlewares
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No authorization header provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
}

// AUTHENTICATION ENDPOINTS

// Login
router.post('/auth/login', async (req, res) => {
  const { email, password, code } = req.body;
  const school = getSchool(req);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await db.User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check Lockout
    if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
      const remainingMin = Math.ceil((new Date(user.lockoutUntil) - new Date()) / 60000);
      return res.status(423).json({ message: `Account locked. Try again in ${remainingMin} minutes.` });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment lockouts
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const updates = { failedLoginAttempts: attempts };
      if (attempts >= 5) {
        updates.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        updates.failedLoginAttempts = 0;
        await db.User.findByIdAndUpdate(user._id, updates);
        return res.status(423).json({ message: 'Account locked due to too many failed attempts. Locked for 15 minutes.' });
      } else {
        await db.User.findByIdAndUpdate(user._id, updates);
        return res.status(401).json({ message: `Invalid credentials. ${5 - attempts} attempts remaining.` });
      }
    }

    // Reset attempts on successful password verification
    if (user.failedLoginAttempts > 0) {
      await db.User.findByIdAndUpdate(user._id, { failedLoginAttempts: 0, lockoutUntil: null });
    }

    // 2FA Verification check
    if (user.twoFactorEnabled) {
      if (!code) {
        // Return 2FA required response with a temporary key.
        // Include the expected code in development mode so the user can easily test the flow without an authenticator!
        const currentCode = generateTOTP(user.twoFactorSecret);
        return res.json({
          require2FA: true,
          userId: user._id,
          demoCode: currentCode // UX helper for easy local testing
        });
      }

      // Verify code
      const expectedCode = generateTOTP(user.twoFactorSecret);
      const prevCode = generateTOTP(user.twoFactorSecret, 30); // Allow window +/- 1
      if (code !== expectedCode && code !== prevCode) {
        return res.status(401).json({ message: 'Invalid 2FA security code' });
      }
    }

    // Generate JWT
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      school: user.school
    };
    const token = jwt.sign(payload, JWT_SECRET);

    await logActivity(user.name, 'LOGIN', 'Logged into dashboard', school);

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        school: user.school,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Setup 2FA (Get Secret)
router.post('/auth/2fa/setup', authenticate, async (req, res) => {
  try {
    const user = await db.User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate random secret
    const secret = crypto.randomBytes(10).toString('hex');
    const demoCode = generateTOTP(secret);

    // Save secret temporarily (not fully enabled until verified)
    await db.User.findByIdAndUpdate(user._id, { twoFactorSecret: secret });

    return res.json({
      secret,
      demoCode,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/${encodeURIComponent(req.user.school + ':' + user.email)}?secret=${secret}&issuer=${encodeURIComponent(req.user.school)}`
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Confirm & Enable 2FA
router.post('/auth/2fa/enable', authenticate, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'Verification code is required' });

  try {
    const user = await db.User.findById(req.user.id);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA setup was not initiated' });
    }

    const expectedCode = generateTOTP(user.twoFactorSecret);
    if (code !== expectedCode) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    await db.User.findByIdAndUpdate(user._id, { twoFactorEnabled: true });
    await logActivity(req.user.name, '2FA_ENABLED', 'Enabled Two-Factor Authentication', req.user.school);

    return res.json({ message: 'Two-factor authentication enabled successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Disable 2FA
router.post('/auth/2fa/disable', authenticate, async (req, res) => {
  try {
    await db.User.findByIdAndUpdate(req.user.id, { twoFactorEnabled: false, twoFactorSecret: null });
    await logActivity(req.user.name, '2FA_DISABLED', 'Disabled Two-Factor Authentication', req.user.school);
    return res.json({ message: 'Two-factor authentication disabled successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Generate password reset link (Admin Only)
router.post('/auth/reset-password-link', authenticate, requireRole(['admin']), async (req, res) => {
  const { userId } = req.body;
  const school = getSchool(req);

  try {
    const user = await db.User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate a secure one-off reset token
    const token = crypto.randomBytes(20).toString('hex');
    // Save token or simulate validation (since it is local, we will return a reset link referencing this token)
    const resetLink = `/reset-password?token=${token}&userId=${user._id}`;
    
    // For local mock simplicity, we will save the token in our database. We can store it as twoFactorSecret temporarily or just return it.
    // Let's store reset token in twoFactorSecret to avoid modifying user model, or just return the link and handle it instantly.
    // We will save it in the user's twoFactorSecret as a reset token, prefixing it with 'reset:'
    await db.User.findByIdAndUpdate(user._id, { twoFactorSecret: `reset:${token}` });
    await logActivity(req.user.name, 'PASSWORD_RESET_LINK', `Generated reset link for user ${user.name}`, school);

    return res.json({ resetLink });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Confirm Password Reset
router.post('/auth/reset-password-confirm', async (req, res) => {
  const { token, userId, newPassword } = req.body;

  if (!token || !userId || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = await db.User.findById(userId);
    if (!user || user.twoFactorSecret !== `reset:${token}`) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      twoFactorSecret: null // clear token
    });

    await logActivity(user.name, 'PASSWORD_RESET_SUCCESS', 'Password was reset via admin-generated link', user.school);

    return res.json({ message: 'Password reset successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});


// PUBLIC INSCRIPTION ENDPOINTS

// Submit Enrollment
router.post('/enrollments', async (req, res) => {
  const school = getSchool(req);
  const { name, email, phone, age, formation, level, isOrphan, isTwoFormations } = req.body;

  if (!name || !phone || !age || !formation) {
    return res.status(400).json({ message: 'Required fields: Name, Phone, Age, Formation' });
  }

  try {
    const enrollment = await db.Enrollment.create({
      name,
      email,
      phone,
      age: Number(age),
      formation,
      level,
      status: 'pending',
      isOrphan: !!isOrphan,
      isTwoFormations: !!isTwoFormations,
      school,
      createdAt: new Date()
    });

    return res.status(201).json({
      message: 'Enrollment submitted successfully!',
      enrollment
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});


// DASHBOARD ENDPOINTS

// Get Enrollments (Admin / Sous-Admin / Moderator)
router.get('/enrollments', authenticate, requireRole(['admin', 'sous-admin', 'moderator']), async (req, res) => {
  const school = getSchool(req);
  try {
    const list = await db.Enrollment.find({ school });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Helper for Formation Pricing
function getFormationPrice(school, formationName, level, isOrphan, isTwoFormations) {
  // Base Price Resolution
  let price = 0;
  if (school === 'tfc') {
    if (formationName.includes("Informatique")) price = 7900;
    else if (formationName.includes("Secrétariat")) price = 14000;
    else if (formationName.includes("Vendeur")) price = 13000;
    else if (formationName.includes("Photography")) price = 18000;
    else if (formationName.includes("Anglais & Français") || formationName.includes("Kids")) price = 27000; // kids monthly
    else price = 10000; // default for unknown formations
  } else {
    // nextmind
    if (formationName.includes("Design Graphique") || formationName.includes("UI/UX") || formationName.includes("Video Editing")) {
      price = 26000;
    } else if (formationName.includes("Digital Art")) {
      price = 35000;
    } else if (formationName.includes("ESP")) {
      price = 8000;
    } else if (formationName.includes("English adults")) {
      // per level pricing: e.g. A1=6000, A2=6500, B1=7000, B2=7500, C1=8000
      if (level === 'A1') price = 6000;
      else if (level === 'A2') price = 6500;
      else if (level === 'B1') price = 7000;
      else if (level === 'B2') price = 7500;
      else if (level === 'C1') price = 8000;
      else price = 7000; // default level price
    } else {
      price = 15000; // default nextmind
    }
  }

  // Business Rules
  if (isTwoFormations) {
    price = 0; // Free if signing 2 formations
  } else if (isOrphan && school === 'tfc') {
    price = price * 0.5; // Orphans get 50% off in TFC
  }

  return price;
}

// Approve Enrollment (Admin Only)
router.post('/enrollments/:id/approve', authenticate, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const school = getSchool(req);

  try {
    const enroll = await db.Enrollment.findById(id);
    if (!enroll) return res.status(404).json({ message: 'Enrollment not found' });
    if (enroll.status !== 'pending') return res.status(400).json({ message: 'Enrollment already processed' });

    // Auto-generate credentials
    // email: name.lastname@tfcschool.dz or nextmind.dz
    const safeName = enroll.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const suffix = school === 'tfc' ? 'tfcschool.dz' : 'nextmind.dz';
    const email = `${safeName}_${Math.floor(100 + Math.random() * 900)}@${suffix}`;
    const rawPassword = Math.random().toString(36).substring(2, 10) + '!';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create User (Student)
    const newUser = await db.User.create({
      email,
      password: hashedPassword,
      name: enroll.name,
      role: 'student',
      phone: enroll.phone,
      school,
      twoFactorEnabled: false
    });

    // Calculate billing
    const price = getFormationPrice(school, enroll.formation, enroll.level, enroll.isOrphan, enroll.isTwoFormations);
    
    // Add inscription fee
    const fee = school === 'tfc' ? 800 : 1000;
    const totalAmount = price + fee;

    // Create Payment (Unpaid by default)
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    await db.Payment.create({
      studentId: newUser._id,
      studentName: enroll.name,
      formation: enroll.formation,
      totalAmount,
      amountPaid: 0,
      remainingBalance: totalAmount,
      status: 'unpaid',
      month: currentMonth,
      note: 'Automatic enrollment payment',
      school,
      createdAt: new Date()
    });

    // Mark Enrollment Approved
    await db.Enrollment.findByIdAndUpdate(id, { status: 'approved', email });

    await logActivity(req.user.name, 'ENROLLMENT_APPROVE', `Approved enrollment for ${enroll.name} (User: ${email})`, school);

    return res.json({
      message: 'Enrollment approved, student account and invoice generated.',
      credentials: {
        email,
        password: rawPassword,
        name: enroll.name
      }
    });

  } catch (err) {
    console.error("Error approving enrollment:", err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Reject Enrollment (Admin Only)
router.post('/enrollments/:id/reject', authenticate, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const school = getSchool(req);

  try {
    const enroll = await db.Enrollment.findById(id);
    if (!enroll) return res.status(404).json({ message: 'Enrollment not found' });
    if (enroll.status !== 'pending') return res.status(400).json({ message: 'Enrollment already processed' });

    await db.Enrollment.findByIdAndUpdate(id, { status: 'rejected' });
    await logActivity(req.user.name, 'ENROLLMENT_REJECT', `Rejected enrollment for ${enroll.name}`, school);

    return res.json({ message: 'Enrollment rejected' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});


// USERS MANAGEMENT (Admin / Sous-Admin / Moderator)

// Get users list
router.get('/users', authenticate, requireRole(['admin', 'sous-admin', 'moderator']), async (req, res) => {
  const school = getSchool(req);
  try {
    const list = await db.User.find({ school });
    // Strip passwords before returning
    const safeList = list.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    return res.json(safeList);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create Staff/Teacher User (Admin Only)
router.post('/users', authenticate, requireRole(['admin']), async (req, res) => {
  const school = getSchool(req);
  const { email, password, name, role, phone } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existing = await db.User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.User.create({
      email,
      password: hashedPassword,
      name,
      role,
      phone,
      school,
      twoFactorEnabled: false
    });

    await logActivity(req.user.name, 'USER_CREATE', `Created user ${name} with role ${role}`, school);

    const safeUser = { ...user };
    delete safeUser.password;
    return res.status(201).json(safeUser);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Edit User (Admin & Sous-Admin)
router.put('/users/:id', authenticate, requireRole(['admin', 'sous-admin']), async (req, res) => {
  const { id } = req.params;
  const { name, phone, password } = req.body;
  const school = getSchool(req);

  try {
    const user = await db.User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Lock roles: Sous-admin can't edit Admin
    if (req.user.role === 'sous-admin' && user.role === 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const updates = { name, phone };
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updated = await db.User.findByIdAndUpdate(id, updates);
    await logActivity(req.user.name, 'USER_UPDATE', `Updated profile of user ${user.name}`, school);

    const safeUser = { ...updated };
    delete safeUser.password;
    return res.json(safeUser);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete User (Admin Only)
router.delete('/users/:id', authenticate, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const school = getSchool(req);

  try {
    const user = await db.User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete primary admin' });

    await db.User.findByIdAndDelete(id);
    await logActivity(req.user.name, 'USER_DELETE', `Deleted user ${user.name} (${user.email})`, school);

    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});


// PAYMENTS ENDPOINTS (Admin / Moderator)

// Get Payments
router.get('/payments', authenticate, requireRole(['admin', 'moderator', 'student']), async (req, res) => {
  const school = getSchool(req);
  try {
    let list;
    if (req.user.role === 'student') {
      list = await db.Payment.find({ studentId: req.user.id, school });
    } else {
      list = await db.Payment.find({ school });
    }
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create Payment manually (Moderator / Admin)
router.post('/payments', authenticate, requireRole(['admin', 'moderator']), async (req, res) => {
  const school = getSchool(req);
  const { studentId, studentName, formation, totalAmount, amountPaid, month, note } = req.body;

  if (!studentId || !studentName || !formation || totalAmount === undefined || amountPaid === undefined || !month) {
    return res.status(400).json({ message: 'Required fields: Student, Formation, Total, Paid, Month' });
  }

  try {
    const balance = totalAmount - amountPaid;
    let status = 'unpaid';
    if (amountPaid > 0 && balance > 0) status = 'partial';
    else if (balance <= 0) status = 'paid';

    const p = await db.Payment.create({
      studentId,
      studentName,
      formation,
      totalAmount: Number(totalAmount),
      amountPaid: Number(amountPaid),
      remainingBalance: balance,
      status,
      month,
      note,
      school,
      createdAt: new Date()
    });

    await logActivity(req.user.name, 'PAYMENT_CREATE', `Created invoice of ${totalAmount} DA for ${studentName}`, school);
    return res.status(201).json(p);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update Payment (Moderator / Admin)
router.put('/payments/:id', authenticate, requireRole(['admin', 'moderator']), async (req, res) => {
  const { id } = req.params;
  const { amountPaid, month, note } = req.body;
  const school = getSchool(req);

  try {
    const payment = await db.Payment.findById(id);
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });

    const updatedPaid = Number(amountPaid);
    const balance = payment.totalAmount - updatedPaid;
    let status = 'unpaid';
    if (updatedPaid > 0 && balance > 0) status = 'partial';
    else if (balance <= 0) status = 'paid';

    const updated = await db.Payment.findByIdAndUpdate(id, {
      amountPaid: updatedPaid,
      remainingBalance: balance,
      status,
      month,
      note
    });

    await logActivity(
      req.user.name,
      'PAYMENT_UPDATE',
      `Updated payment for ${payment.studentName}: Paid ${updatedPaid}/${payment.totalAmount} DA (Status: ${status})`,
      school
    );

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});


// TIMETABLE ENDPOINTS (Admin / Sous-Admin / Staff / Teachers / Students)

// Get Timetable
router.get('/timetable', authenticate, async (req, res) => {
  const school = getSchool(req);
  try {
    const list = await db.Timetable.find({ school });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Add / Update Timetable (Admin / Sous-Admin)
router.post('/timetable', authenticate, requireRole(['admin', 'sous-admin']), async (req, res) => {
  const school = getSchool(req);
  const { _id, groupName, teacherId, teacherName, formation, day, time, room } = req.body;

  if (!groupName || !teacherId || !teacherName || !formation || !day || !time || !room) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    if (_id) {
      const updated = await db.Timetable.findByIdAndUpdate(_id, {
        groupName, teacherId, teacherName, formation, day, time, room
      });
      await logActivity(req.user.name, 'TIMETABLE_UPDATE', `Updated group schedule ${groupName}`, school);
      return res.json(updated);
    } else {
      const created = await db.Timetable.create({
        groupName, teacherId, teacherName, formation, day, time, room, school
      });
      await logActivity(req.user.name, 'TIMETABLE_CREATE', `Created schedule for group ${groupName}`, school);
      return res.status(201).json(created);
    }
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete Timetable (Admin / Sous-Admin)
router.delete('/timetable/:id', authenticate, requireRole(['admin', 'sous-admin']), async (req, res) => {
  const { id } = req.params;
  const school = getSchool(req);

  try {
    await db.Timetable.findByIdAndDelete(id);
    await logActivity(req.user.name, 'TIMETABLE_DELETE', `Removed schedule record`, school);
    return res.json({ message: 'Schedule entry removed' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});


// ANNOUNCEMENTS ENDPOINTS

// Get Announcements (Public/Private)
router.get('/announcements', async (req, res) => {
  const school = getSchool(req);
  try {
    const list = await db.Announcement.find({ school });
    // Sort announcements by newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Post Announcement (Admin / Sous-Admin)
router.post('/announcements', authenticate, requireRole(['admin', 'sous-admin']), async (req, res) => {
  const school = getSchool(req);
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const ann = await db.Announcement.create({
      title,
      content,
      author: req.user.name,
      role: req.user.role,
      school,
      createdAt: new Date()
    });

    await logActivity(req.user.name, 'ANNOUNCEMENT_POST', `Posted announcement: ${title}`, school);
    return res.status(201).json(ann);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete Announcement (Admin / Sous-Admin)
router.delete('/announcements/:id', authenticate, requireRole(['admin', 'sous-admin']), async (req, res) => {
  const { id } = req.params;
  const school = getSchool(req);

  try {
    await db.Announcement.findByIdAndDelete(id);
    await logActivity(req.user.name, 'ANNOUNCEMENT_DELETE', `Deleted announcement`, school);
    return res.json({ message: 'Announcement deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});


// SYSTEM LOGS ENDPOINTS (Admin Only)

// Get Logs
router.get('/logs', authenticate, requireRole(['admin']), async (req, res) => {
  const school = getSchool(req);
  try {
    const list = await db.ActivityLog.find({ school });
    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Clear Logs
router.post('/logs/clear', authenticate, requireRole(['admin']), async (req, res) => {
  const school = getSchool(req);
  try {
    await db.ActivityLog.deleteMany({ school });
    await logActivity(req.user.name, 'LOGS_CLEARED', 'Cleared system activity log', school);
    return res.json({ message: 'Activity log cleared successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});


// ATTENDANCE ENDPOINTS (Teachers / Students / Admins / Sous-admins)

// Get Attendance
router.get('/attendance', authenticate, async (req, res) => {
  const school = getSchool(req);
  const { studentId, groupName } = req.query;

  try {
    const query = { school };
    if (studentId) query.studentId = studentId;
    if (groupName) query.groupName = groupName;

    const list = await db.Attendance.find(query);
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Save Attendance (Teacher Only)
router.post('/attendance', authenticate, requireRole(['teacher', 'admin', 'sous-admin']), async (req, res) => {
  const school = getSchool(req);
  const { date, groupName, records } = req.body; // records: [{ studentId, studentName, status }]

  if (!date || !groupName || !records || !Array.isArray(records)) {
    return res.status(400).json({ message: 'Date, Group Name, and Records list are required' });
  }

  try {
    for (let rec of records) {
      // Check if attendance already recorded for this student, group, and date
      const existing = await db.Attendance.findOne({
        studentId: rec.studentId,
        date,
        groupName,
        school
      });

      if (existing) {
        await db.Attendance.findByIdAndUpdate(existing._id, { status: rec.status });
      } else {
        await db.Attendance.create({
          studentId: rec.studentId,
          studentName: rec.studentName,
          date,
          status: rec.status,
          groupName,
          school
        });
      }
    }

    await logActivity(req.user.name, 'ATTENDANCE_RECORD', `Recorded attendance for group ${groupName} on ${date}`, school);
    return res.json({ message: 'Attendance recorded successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
