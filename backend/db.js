const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DB_FILE = path.join(__dirname, 'db.json');
let useMongo = false;
let localDb = {
  users: [],
  enrollments: [],
  payments: [],
  timetable: [],
  announcements: [],
  activitylogs: [],
  attendance: []
};

// Initialize Local JSON DB if file exists
if (fs.existsSync(DB_FILE)) {
  try {
    localDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    console.error("Error reading local db.json, resetting...", err);
  }
} else {
  saveLocalDb();
}

function saveLocalDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf8');
}

// Generate unique string ID for JSON fallback
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Check MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => {
      console.log("Successfully connected to MongoDB");
      useMongo = true;
    })
    .catch((err) => {
      console.warn("MongoDB connection failed, falling back to local JSON DB. Error:", err.message);
      useMongo = false;
    });
} else {
  console.log("No MONGODB_URI provided. Running in LOCAL JSON DB mode.");
  useMongo = false;
}

// Mock Query Class to mimic Mongoose
class MockQuery {
  constructor(data) {
    this.data = data;
  }
  sort(criteria) {
    // Basic sorting support (e.g. { createdAt: -1 })
    if (criteria && typeof criteria === 'object') {
      const keys = Object.keys(criteria);
      if (keys.length > 0) {
        const key = keys[0];
        const dir = criteria[key];
        this.data.sort((a, b) => {
          let valA = a[key];
          let valB = b[key];
          if (valA instanceof Date) valA = valA.getTime();
          if (valB instanceof Date) valB = valB.getTime();
          if (typeof valA === 'string') return dir === -1 ? valB.localeCompare(valA) : valA.localeCompare(valB);
          return dir === -1 ? valB - valA : valA - valB;
        });
      }
    }
    return this;
  }
  limit(n) {
    this.data = this.data.slice(0, n);
    return this;
  }
  exec() {
    return this.data;
  }
  // Make it thenable
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.data).then(onfulfilled, onrejected);
  }
}

// Helper to filter by simple query object
function matchQuery(item, query) {
  if (!query) return true;
  for (let key in query) {
    if (query[key] !== undefined) {
      // Handle simple regex or regex objects
      if (query[key] instanceof RegExp) {
        if (!query[key].test(item[key] || "")) return false;
      } else if (typeof query[key] === 'object' && query[key] !== null) {
        // Handle $regex operators or nested comparisons
        const ops = Object.keys(query[key]);
        for (let op of ops) {
          if (op === '$regex') {
            const regex = new RegExp(query[key]['$regex'], query[key]['$options'] || 'i');
            if (!regex.test(item[key] || "")) return false;
          }
        }
      } else {
        if (item[key] !== query[key]) return false;
      }
    }
  }
  return true;
}

// Local Database Driver Classes
class LocalModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  async find(query = {}) {
    const list = localDb[this.collectionName].filter(item => matchQuery(item, query));
    return new MockQuery(JSON.parse(JSON.stringify(list)));
  }

  async findOne(query = {}) {
    const item = localDb[this.collectionName].find(item => matchQuery(item, query));
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async findById(id) {
    const item = localDb[this.collectionName].find(item => item._id === id);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async create(data) {
    const newDoc = {
      _id: generateId(),
      createdAt: new Date(),
      ...data
    };
    localDb[this.collectionName].push(newDoc);
    saveLocalDb();
    return JSON.parse(JSON.stringify(newDoc));
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const index = localDb[this.collectionName].findIndex(item => item._id === id);
    if (index === -1) return null;
    
    // Apply updates
    const current = localDb[this.collectionName][index];
    
    // Check if it has a Mongoose-like $inc or direct values
    const updatedFields = {};
    if (update.$inc) {
      for (let field in update.$inc) {
        updatedFields[field] = (current[field] || 0) + update.$inc[field];
      }
    }
    
    const plainUpdate = { ...update };
    delete plainUpdate.$inc;
    delete plainUpdate.$set;
    if (update.$set) {
      Object.assign(plainUpdate, update.$set);
    }

    localDb[this.collectionName][index] = {
      ...current,
      ...plainUpdate,
      ...updatedFields
    };
    
    saveLocalDb();
    return JSON.parse(JSON.stringify(localDb[this.collectionName][index]));
  }

  async findByIdAndDelete(id) {
    const index = localDb[this.collectionName].findIndex(item => item._id === id);
    if (index === -1) return null;
    const removed = localDb[this.collectionName].splice(index, 1);
    saveLocalDb();
    return JSON.parse(JSON.stringify(removed[0]));
  }

  async deleteMany(query = {}) {
    const initialCount = localDb[this.collectionName].length;
    localDb[this.collectionName] = localDb[this.collectionName].filter(item => !matchQuery(item, query));
    saveLocalDb();
    return { deletedCount: initialCount - localDb[this.collectionName].length };
  }
}

// Define Mongoose Schemas (if running MongoDB)
const MongooseUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: String,
  school: { type: String, required: true },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutUntil: Date,
  createdAt: { type: Date, default: Date.now }
});

const MongooseEnrollmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  formation: { type: String, required: true },
  level: String,
  status: { type: String, default: 'pending' },
  isOrphan: { type: Boolean, default: false },
  isTwoFormations: { type: Boolean, default: false },
  school: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongoosePaymentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  formation: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  remainingBalance: { type: Number, required: true },
  status: { type: String, default: 'unpaid' },
  month: { type: String, required: true },
  note: String,
  school: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongooseTimetableSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
  formation: { type: String, required: true },
  day: { type: String, required: true },
  time: { type: String, required: true },
  room: { type: String, required: true },
  school: { type: String, required: true }
});

const MongooseAnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  role: { type: String, required: true },
  school: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongooseActivityLogSchema = new mongoose.Schema({
  user: { type: String, required: true },
  action: { type: String, required: true },
  details: String,
  school: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongooseAttendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true },
  groupName: { type: String, required: true },
  school: { type: String, required: true }
});

// Models mapping helper
const models = {};

function getModel(name) {
  if (useMongo) {
    if (models[name]) return models[name];
    let schema;
    if (name === 'User') schema = MongooseUserSchema;
    else if (name === 'Enrollment') schema = MongooseEnrollmentSchema;
    else if (name === 'Payment') schema = MongoosePaymentSchema;
    else if (name === 'Timetable') schema = MongooseTimetableSchema;
    else if (name === 'Announcement') schema = MongooseAnnouncementSchema;
    else if (name === 'ActivityLog') schema = MongooseActivityLogSchema;
    else if (name === 'Attendance') schema = MongooseAttendanceSchema;
    
    models[name] = mongoose.model(name, schema);
    return models[name];
  } else {
    // Map to LocalModel collections
    const collectionName = name.toLowerCase() + (name.endsWith('y') ? 'logs' : 's');
    // For ActivityLog => activitylogs, Timetable => timetables (wait, we initialized: timetable, announcements, activitylogs, attendance, users, enrollments, payments)
    let col = collectionName;
    if (name === 'ActivityLog') col = 'activitylogs';
    else if (name === 'Timetable') col = 'timetable';
    else if (name === 'Attendance') col = 'attendance';
    else if (name === 'Announcement') col = 'announcements';
    
    if (!models[name]) {
      models[name] = new LocalModel(col);
    }
    return models[name];
  }
}

module.exports = {
  User: {
    find: (q) => getModel('User').find(q),
    findOne: (q) => getModel('User').findOne(q),
    findById: (id) => getModel('User').findById(id),
    create: (d) => getModel('User').create(d),
    findByIdAndUpdate: (id, u, o) => getModel('User').findByIdAndUpdate(id, u, o),
    findByIdAndDelete: (id) => getModel('User').findByIdAndDelete(id),
    deleteMany: (q) => getModel('User').deleteMany(q)
  },
  Enrollment: {
    find: (q) => getModel('Enrollment').find(q),
    findOne: (q) => getModel('Enrollment').findOne(q),
    findById: (id) => getModel('Enrollment').findById(id),
    create: (d) => getModel('Enrollment').create(d),
    findByIdAndUpdate: (id, u, o) => getModel('Enrollment').findByIdAndUpdate(id, u, o),
    findByIdAndDelete: (id) => getModel('Enrollment').findByIdAndDelete(id),
    deleteMany: (q) => getModel('Enrollment').deleteMany(q)
  },
  Payment: {
    find: (q) => getModel('Payment').find(q),
    findOne: (q) => getModel('Payment').findOne(q),
    findById: (id) => getModel('Payment').findById(id),
    create: (d) => getModel('Payment').create(d),
    findByIdAndUpdate: (id, u, o) => getModel('Payment').findByIdAndUpdate(id, u, o),
    findByIdAndDelete: (id) => getModel('Payment').findByIdAndDelete(id),
    deleteMany: (q) => getModel('Payment').deleteMany(q)
  },
  Timetable: {
    find: (q) => getModel('Timetable').find(q),
    findOne: (q) => getModel('Timetable').findOne(q),
    findById: (id) => getModel('Timetable').findById(id),
    create: (d) => getModel('Timetable').create(d),
    findByIdAndUpdate: (id, u, o) => getModel('Timetable').findByIdAndUpdate(id, u, o),
    findByIdAndDelete: (id) => getModel('Timetable').findByIdAndDelete(id),
    deleteMany: (q) => getModel('Timetable').deleteMany(q)
  },
  Announcement: {
    find: (q) => getModel('Announcement').find(q),
    findOne: (q) => getModel('Announcement').findOne(q),
    findById: (id) => getModel('Announcement').findById(id),
    create: (d) => getModel('Announcement').create(d),
    findByIdAndUpdate: (id, u, o) => getModel('Announcement').findByIdAndUpdate(id, u, o),
    findByIdAndDelete: (id) => getModel('Announcement').findByIdAndDelete(id),
    deleteMany: (q) => getModel('Announcement').deleteMany(q)
  },
  ActivityLog: {
    find: (q) => getModel('ActivityLog').find(q),
    findOne: (q) => getModel('ActivityLog').findOne(q),
    findById: (id) => getModel('ActivityLog').findById(id),
    create: (d) => getModel('ActivityLog').create(d),
    findByIdAndUpdate: (id, u, o) => getModel('ActivityLog').findByIdAndUpdate(id, u, o),
    findByIdAndDelete: (id) => getModel('ActivityLog').findByIdAndDelete(id),
    deleteMany: (q) => getModel('ActivityLog').deleteMany(q)
  },
  Attendance: {
    find: (q) => getModel('Attendance').find(q),
    findOne: (q) => getModel('Attendance').findOne(q),
    findById: (id) => getModel('Attendance').findById(id),
    create: (d) => getModel('Attendance').create(d),
    findByIdAndUpdate: (id, u, o) => getModel('Attendance').findByIdAndUpdate(id, u, o),
    findByIdAndDelete: (id) => getModel('Attendance').findByIdAndDelete(id),
    deleteMany: (q) => getModel('Attendance').deleteMany(q)
  },
  isMongo: () => useMongo
};
