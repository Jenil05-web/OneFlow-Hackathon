// server.js
/* eslint-disable no-console */
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware: body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Middleware: security + request logging
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ============================
// 🚀 MAIN SERVER FUNCTION
// ============================
(async function startServer() {
  try {
    // 1️⃣ Connect to MongoDB
    await connectDB();
    console.log("✅ MongoDB Connected");

    // 2️⃣ Auto-create default Admin user if missing
    try {
      const User = require("./models/User");
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@gmail.com";
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin1234";

      const adminExists = await User.findOne({ email: adminEmail });

      if (!adminExists) {
        const hashed = await bcrypt.hash(adminPassword, 10);
        await User.create({
          name: "Super Admin",
          email: adminEmail,
          password: hashed,
          role: "Admin",
        });
        console.log(`👑 Default Admin Created: ${adminEmail} / ${adminPassword}`);
      } else {
        console.log("✅ Default Admin already exists, skipping creation.");
      }
    } catch (error) {
      console.error("❌ Error creating default admin:", error.message);
    }

    // 3️⃣ Routes (Load after DB ready)
    const authRoutes = require("./routes/authRoutes");
    app.use("/api/auth", authRoutes);

    // Admin routes (optional)
    try {
      const adminRoutes = require("./routes/adminRoutes");
      app.use("/api/admin", adminRoutes);
    } catch (err) {
      console.log("ℹ️  adminRoutes not found. Create ./routes/adminRoutes.js to enable Admin endpoints.");
    }

    // Health check route
    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Hackathon Auth API is running successfully 🚀",
        version: "1.0.0",
      });
    });

    // Protected example route (requires auth middleware)
    try {
      const { protect } = require("./middleware/authMiddleware");
      app.get("/api/dashboard", protect, (req, res) => {
        res.json({
          success: true,
          message: "Welcome to your dashboard!",
          user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
          },
        });
      });
    } catch {
      console.log("ℹ️  authMiddleware not found — /api/dashboard route disabled.");
    }

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    });

    // 4️⃣ Start HTTP Server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // 5️⃣ Graceful shutdown
    process.on("SIGTERM", () => {
      console.info("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
})();
