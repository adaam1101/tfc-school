import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const { Schema } = mongoose;

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

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  }
});

export const User = mongoose.model("User", userSchema);
