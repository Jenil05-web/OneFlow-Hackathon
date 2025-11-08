// routes/adminRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

/* ------------------------------------------------------------------
   🧠 Middleware: Verify Token + Role Check
------------------------------------------------------------------ */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

// Only allow Admin role
function isAdmin(req, res, next) {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ success: false, message: "Access denied: Admins only" });
  }
  next();
}

/* ------------------------------------------------------------------
   📋 GET /api/admin/users - Get all users
------------------------------------------------------------------ */
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ role: 1, name: 1 });
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(500).json({ success: false, message: "Server error while fetching users" });
  }
});

/* ------------------------------------------------------------------
   ✏️ PUT /api/admin/users/:id/role - Update user role
------------------------------------------------------------------ */
router.put("/users/:id/role", verifyToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["Admin", "Manager", "Team"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role value" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user,
    });
  } catch (error) {
    console.error("❌ Error updating role:", error.message);
    res.status(500).json({ success: false, message: "Server error while updating role" });
  }
});

/* ------------------------------------------------------------------
   🗑️ DELETE /api/admin/users/:id - Delete user
------------------------------------------------------------------ */
router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error.message);
    res.status(500).json({ success: false, message: "Server error while deleting user" });
  }
});

module.exports = router;
