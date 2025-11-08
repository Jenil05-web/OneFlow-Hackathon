// routes/authRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateOTP, sendOTPEmail } from "../utils/emailService.js";
const router = express.Router();

// ===========================
// 🟢 Signup - Common for all
// ===========================
router.post(["/signup", "/register"], async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create user (default role = Team)
    const user = await User.create({
      name,
      email,
      password, // The password will be hashed by the pre-save middleware
      role: "Team",
    });

    // Don't return token - user must login after signup (professional flow)
    return res.status(201).json({
      success: true,
      message: "Account created successfully! Please sign in to continue.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    return res.status(500).json({ success: false, message: "Server error during signup" });
  }
});

// console.log("User found:", user.email);
// console.log("Password entered:", password);
// console.log("Password in DB:", user.password);

// ===========================
// 🟡 Login - Common for all
// ===========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    
    // For security, don't reveal if user exists or not - use generic message
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: "Account is deactivated. Please contact an administrator." });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// ===========================
// 🔵 Get Profile (Protected)
// ===========================
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ Profile error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
});

// ===========================
// 🛠️ DEV ONLY: Update Own Role (for development/testing)
// ===========================
router.put("/update-role", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { role } = req.body;

    if (!["Admin", "Manager", "Team"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate new token with updated role
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: `Role updated to ${role}. Please login again.`,
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Update role error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===========================
// 🔐 Forgot Password - Send OTP
// ===========================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP as string to ensure consistent comparison
    user.resetPasswordOTP = String(otp);
    user.resetPasswordOTPExpiry = otpExpiry;
    await user.save();

    console.log("📧 OTP generated and saved for:", email, "OTP:", otp);

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, "reset");

    if (!emailSent) {
      console.error("❌ Failed to send OTP email to:", email);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    console.log("✅ OTP email sent successfully to:", email);

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// ===========================
// 🔑 Reset Password with OTP
// ===========================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    console.log("📧 Reset password request:", { email, otp: otp ? "***" : "missing", hasPassword: !!newPassword });

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Find user - explicitly select the OTP fields that are marked select: false
    const user = await User.findOne({ email }).select("+resetPasswordOTP +resetPasswordOTPExpiry");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert both to strings for comparison
    const storedOTP = String(user.resetPasswordOTP || "").trim();
    const providedOTP = String(otp).trim();

    console.log("🔍 OTP Check:", {
      storedOTP: storedOTP || "missing",
      providedOTP: providedOTP || "missing",
      storedLength: storedOTP.length,
      providedLength: providedOTP.length,
      match: storedOTP === providedOTP,
      hasExpiry: !!user.resetPasswordOTPExpiry,
      expiryDate: user.resetPasswordOTPExpiry,
      currentDate: new Date(),
      isExpired: user.resetPasswordOTPExpiry ? new Date(user.resetPasswordOTPExpiry) < new Date() : true,
    });

    // Check if OTP exists
    if (!user.resetPasswordOTP) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new password reset.",
      });
    }

    // Check OTP (compare as strings)
    if (storedOTP !== providedOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check and try again.",
      });
    }

    // Check OTP expiry
    if (!user.resetPasswordOTPExpiry || new Date(user.resetPasswordOTPExpiry) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    await user.save();

    console.log("✅ Password reset successful for:", email);

    res.status(200).json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    console.error("❌ Reset password error:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
