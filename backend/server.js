// server.js
/* eslint-disable no-console */
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Initialize Express app

// Initialize Express app
const app = express();

// Middleware: body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: CORS
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
      const { default: User } = await import("./models/User.js");
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
    const { default: authRoutes } = await import("./routes/authRoutes.js");
    app.use("/api/auth", authRoutes);

    // Admin routes (optional)
    try {
      const { default: adminRoutes } = await import("./routes/adminRoutes.js");
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
      const { protect } = await import("./middleware/authMiddleware.js");
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
