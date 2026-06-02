import express from "express";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { loginSchema } from "../validators/schemas.js";

export const authRouter = express.Router();

authRouter.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is not a ${role} account.` });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "This account is inactive." });
    }

    const token = signToken(user);
    const safeUser = await User.findById(user._id);
    res.json({ token, user: safeUser });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});
