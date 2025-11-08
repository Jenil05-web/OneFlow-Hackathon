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

      // Attach user info (excluding password) - Always fetch fresh from DB
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Check if user is active
      if (req.user.isActive === false) {
        return res.status(403).json({ success: false, message: "User account is deactivated" });
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
   Supports both: ensureRole(["Admin"]) and ensureRole("Admin", "Manager")
------------------------------------------------------------------ */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Handle both patterns: ensureRole(["Admin"]) and ensureRole("Admin", "Manager")
    // If roles is a single array, flatten it; otherwise use roles as-is
    let allowedRoles = roles;
    if (roles.length === 1 && Array.isArray(roles[0])) {
      // Pattern: ensureRole(["Admin"]) -> roles = [["Admin"]] -> flatten to ["Admin"]
      allowedRoles = roles[0];
    } else {
      // Pattern: ensureRole("Admin", "Manager") -> roles = ["Admin", "Manager"]
      allowedRoles = roles;
    }

    // Normalize role comparison (trim whitespace, handle case sensitivity)
    const userRole = String(req.user.role).trim();
    const normalizedAllowedRoles = allowedRoles.map(r => String(r).trim());

    // Debug log for role checking
    console.log(`🔍 Role check: User ${req.user.email}`);
    console.log(`   User role: "${userRole}" (type: ${typeof req.user.role})`);
    console.log(`   Allowed roles: [${normalizedAllowedRoles.join(", ")}]`);
    console.log(`   req.user object:`, JSON.stringify({ 
      id: req.user._id?.toString(), 
      email: req.user.email, 
      role: req.user.role,
      isActive: req.user.isActive 
    }, null, 2));

    // Check if user's role is in the allowed roles (case-sensitive exact match)
    const hasAccess = normalizedAllowedRoles.includes(userRole);
    
    if (!hasAccess) {
      console.log(`❌ Access denied: "${userRole}" not in [${normalizedAllowedRoles.join(", ")}]`);
      return res.status(403).json({
        success: false,
        message: `Access denied: Requires one of [${normalizedAllowedRoles.join(", ")}] roles. Your role: ${userRole}`,
      });
    }

    console.log(`✅ Access granted for ${req.user.email} with role "${userRole}"`);
    next();
  };
};

// Export with aliases for compatibility
export { protect, authorize };
export const ensureAuthenticated = protect;
export const ensureRole = authorize;
