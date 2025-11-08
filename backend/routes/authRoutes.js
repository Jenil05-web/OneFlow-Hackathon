// routes/authRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
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

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "Signup successful!",
      token,
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
    console.log('Login request body:', req.body); // Debug log
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing credentials - email:', !!email, 'password:', !!password); // Debug log
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'yes' : 'no'); // Debug log
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("Attempting password comparison:");
    console.log("Password entered:", password);
    console.log("Hashed password in DB:", user.password);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
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

export default router;
