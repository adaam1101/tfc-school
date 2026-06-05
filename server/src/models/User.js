import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import mongoose from "mongoose";

const { Schema } = mongoose;

const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

const teacherProfileSchema = new Schema(
  {
    subject: { type: String, trim: true },
    contactInfo: { type: String, trim: true },
    assignedStudents: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  { _id: false }
);

const studentProfileSchema = new Schema(
  {
    age: { type: Number, min: 3, max: 80 },
    course: { type: String, trim: true },
    parentName: { type: String, trim: true },
    parentEmail: { type: String, trim: true, lowercase: true },
    parentPhone: { type: String, trim: true },
    mark: { type: String, trim: true },
    rfidCardHash: { type: String, index: true, select: false },
    rfidCardLast4: { type: String, trim: true },
    teacher: { type: Schema.Types.ObjectId, ref: "User" },
    enrollmentDate: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      required: true,
      index: true
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    twoFactorEnabled: { type: Boolean, default: true },
    twoFactorCode: { type: String, select: false },
    twoFactorExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    teacherProfile: teacherProfileSchema,
    studentProfile: studentProfileSchema
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function matchPassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// --- Two-factor email code (6 digits, valid 10 minutes) ---
userSchema.methods.createTwoFactorCode = function createTwoFactorCode() {
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  this.twoFactorCode = sha256(code);
  this.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000);
  return code;
};

userSchema.methods.verifyTwoFactorCode = function verifyTwoFactorCode(code) {
  if (!this.twoFactorCode || !this.twoFactorExpires) return false;
  if (this.twoFactorExpires.getTime() < Date.now()) return false;
  return this.twoFactorCode === sha256(code);
};

userSchema.methods.clearTwoFactorCode = function clearTwoFactorCode() {
  this.twoFactorCode = undefined;
  this.twoFactorExpires = undefined;
};

// --- Password reset token (valid 30 minutes) ---
userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = sha256(rawToken);
  this.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  return rawToken;
};

userSchema.statics.hashResetToken = (rawToken) => sha256(rawToken);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.twoFactorCode;
    delete ret.twoFactorExpires;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    if (ret.studentProfile) {
      delete ret.studentProfile.rfidCardHash;
    }
    return ret;
  }
});

export const User = mongoose.model("User", userSchema);
