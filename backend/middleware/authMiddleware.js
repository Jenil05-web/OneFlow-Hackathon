// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/* ------------------------------------------------------------------
   🧩 1. Protect Middleware
   Verifies JWT token and attaches user to req.user
------------------------------------------------------------------ */
const protect = async (req, res, next) => {
  let token;

  // Check if token is provided in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("❌ JWT verification failed:", error.message);
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
};

/* ------------------------------------------------------------------
   👑 2. Role Authorization Middleware
   Allows access only to specific roles
------------------------------------------------------------------ */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Requires one of [${roles.join(", ")}] roles`,
      });
    }

    next();
  };
};

// Export with aliases for compatibility
export { protect, authorize };
export const ensureAuthenticated = protect;
export const ensureRole = authorize;
