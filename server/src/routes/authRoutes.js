import crypto from "node:crypto";
import express from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import {
  emailReady,
  sendPasswordResetEmail,
  sendTwoFactorCode
} from "../utils/email.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  verifyTwoFactorSchema
} from "../validators/schemas.js";

export const authRouter = express.Router();

// Tighter limiter for sensitive auth actions (brute-force protection).
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { message: "Too many attempts. Please wait a few minutes and try again." }
});

// Two-factor is only enforced when the master switch is on AND email can be sent
// (prevents lock-outs if SMTP is misconfigured).
const twoFactorActive = () => process.env.TWO_FACTOR_ENABLED === "true" && emailReady();

const issueSession = async (res, user) => {
  const token = signToken(user);
  const safeUser = await User.findById(user._id);
  return res.json({ token, user: safeUser });
};

authRouter.post("/login", sensitiveLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email }).select("+password +loginAttempts +lockUntil");

    // Account lockout check
    if (user?.isLocked()) {
      return res.status(429).json({
        message: `Account locked. Try again in ${user.lockMinutesLeft()} minute(s).`
      });
    }

    const passwordMatch = user && await user.matchPassword(password);

    if (!user || !passwordMatch) {
      if (user) await user.incrementLoginAttempts();
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Use timing-safe comparison to avoid leaking whether the email exists under a different role.
    if (role && user.role !== role) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "This account is inactive." });
    }

    await user.resetLoginAttempts();

    // Step 2: email a one-time code instead of logging straight in.
    if (twoFactorActive() && user.twoFactorEnabled) {
      const code = user.createTwoFactorCode();
      await user.save();
      try {
        await sendTwoFactorCode({ user, code });
      } catch (mailError) {
        user.clearTwoFactorCode();
        await user.save();
        return res.status(502).json({ message: "Could not send your login code. Please try again later." });
      }
      return res.json({ twoFactorRequired: true, email: user.email });
    }

    return issueSession(res, user);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/verify-2fa", sensitiveLimiter, validate(verifyTwoFactorSchema), async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email }).select("+twoFactorCode +twoFactorExpires");

    if (!user || !user.verifyTwoFactorCode(code)) {
      return res.status(401).json({ message: "Invalid or expired code." });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "This account is inactive." });
    }

    user.clearTwoFactorCode();
    await user.save();
    return issueSession(res, user);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/forgot-password", sensitiveLimiter, validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond the same way so we never reveal which emails exist.
    if (!user) {
      console.log(`[forgot-password] No account found for ${email}`);
    } else if (!emailReady()) {
      console.log("[forgot-password] Email is NOT configured (NOTIFICATIONS_ENABLED / SMTP_* missing).");
    } else {
      const rawToken = user.createPasswordResetToken();
      await user.save();
      // Never use the request Origin header — an attacker can forge it.
      const base = process.env.CLIENT_URL || "http://localhost:5173";
      const resetUrl = `${base}/reset-password?token=${rawToken}`;
      try {
        await sendPasswordResetEmail({ user, resetUrl });
        console.log(`[forgot-password] Reset email sent to ${user.email}`);
      } catch (mailError) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        console.error(`[forgot-password] Email send FAILED: ${mailError.message}`);
      }
    }

    return res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/reset-password", sensitiveLimiter, validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      passwordResetToken: User.hashResetToken(token),
      passwordResetExpires: { $gt: new Date() }
    }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired." });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.json({ message: "Password updated. You can now sign in." });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

// Self-service profile update — teachers, moderators (and any logged-in user)
authRouter.patch("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const { currentPassword, newPassword, phone, photo, dateOfBirth, contactInfo } = req.body;

    // Password change: require current password verification
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to set a new one." });
      }
      const match = await user.matchPassword(currentPassword);
      if (!match) {
        return res.status(400).json({ message: "Current password is incorrect." });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters." });
      }
      user.password = newPassword;
    }

    if (phone !== undefined)  user.phone = phone;
    if (photo !== undefined)  user.photo = photo;

    // Role-specific profile fields
    if (user.role === "teacher" || user.role === "moderator" || user.role === "sous-admin") {
      if (!user.teacherProfile) user.teacherProfile = {};
      if (dateOfBirth !== undefined) user.teacherProfile.dateOfBirth  = dateOfBirth;
      if (contactInfo  !== undefined) user.teacherProfile.contactInfo  = contactInfo;
    }

    await user.save();

    const updated = await User.findById(user._id).select("-password");
    res.json({ user: updated, message: "Profile updated successfully." });
  } catch (err) {
    next(err);
  }
});
