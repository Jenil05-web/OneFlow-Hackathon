// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// ---------------------
// 🧩 Middleware
// ---------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup (multiple frontend ports for dev)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Security headers + request logging
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ---------------------
// 🚀 Main Server Logic
// ---------------------
(async function startServer() {
  try {
    // 1️⃣ Connect MongoDB
    await connectDB();
    console.log("✅ MongoDB Connected");

    // 2️⃣ Create Default Admin (only if not exists)
    try {
      const { default: User } = await import("./models/User.js");
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@gmail.com";
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin1234";

      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        // Don't hash here - let the User model's pre-save hook handle it
        // This prevents double-hashing
        await User.create({
          name: "Super Admin",
          email: adminEmail,
          password: adminPassword, // Plain password - will be hashed by pre-save hook
          role: "Admin",
        });
        console.log(`👑 Default Admin Created: ${adminEmail} / ${adminPassword}`);
      } else {
        // Check if admin password needs to be reset (in case it was double-hashed)
        // Test if the current password works
        const testMatch = await bcrypt.compare(adminPassword, adminExists.password);
        if (!testMatch) {
          // Password doesn't match - might be double-hashed or wrong
          // Reset it to the default password
          adminExists.password = adminPassword; // Will be hashed by pre-save hook
          await adminExists.save();
          console.log(`🔧 Admin password reset to default: ${adminEmail} / ${adminPassword}`);
        } else {
          console.log("✅ Default Admin already exists with correct password.");
        }
      }
    } catch (error) {
      console.error("❌ Error creating default admin:", error.message);
    }

    // 3️⃣ Register Routes
    console.log("📦 Registering routes...");
    
    // Auth routes
    try {
      const { default: authRoutes } = await import("./routes/authRoutes.js");
      app.use("/api/auth", authRoutes);
      console.log("✅ Auth routes registered");
    } catch (err) {
      console.error("❌ Error loading auth routes:", err.message);
    }

    // Admin routes
    try {
      const adminRoutes = (await import("./routes/adminRoutes.js")).default || (await import("./routes/adminRoutes.js"));
      app.use("/api/admin", adminRoutes);
      console.log("✅ Admin routes registered");
    } catch (err) {
      console.error("❌ Error loading admin routes:", err.message);
    }

    // Dashboard routes
    try {
      const { default: dashboardRoutes } = await import("./routes/dashboardRoutes.js");
      app.use("/api/dashboard", dashboardRoutes);
      console.log("✅ Dashboard routes registered");
    } catch (err) {
      console.error("❌ Error loading dashboard routes:", err.message);
    }

    // Project routes
    try {
      const { default: projectRoutes } = await import("./routes/projectRoutes.js");
      app.use("/api/projects", projectRoutes);
      console.log("✅ Project routes registered");
    } catch (err) {
      console.error("❌ Error loading project routes:", err.message);
    }

    // Task routes
    try {
      const { default: taskRoutes } = await import("./routes/taskRoutes.js");
      app.use("/api/tasks", taskRoutes);
      console.log("✅ Task routes registered");
    } catch (err) {
      console.error("❌ Error loading task routes:", err.message);
    }

    // Timesheet routes
    try {
      const { default: timesheetRoutes } = await import("./routes/timesheetRoutes.js");
      app.use("/api/timesheets", timesheetRoutes);
      console.log("✅ Timesheet routes registered");
    } catch (err) {
      console.error("❌ Error loading timesheet routes:", err.message);
    }

    // Billing routes
    try {
      const { default: billingRoutes } = await import("./routes/billingRoutes.js");
      app.use("/api/billing", billingRoutes);
      console.log("✅ Billing routes registered");
    } catch (err) {
      console.error("❌ Error loading billing routes:", err.message);
    }

    // Analytics routes
    try {
      const { default: analyticsRoutes } = await import("./routes/analyticsRoutes.js");
      app.use("/api/analytics", analyticsRoutes);
      console.log("✅ Analytics routes registered");
    } catch (err) {
      console.error("❌ Error loading analytics routes:", err.message);
    }

    // Health check route
    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "OneFlow backend is running successfully 🚀",
        version: "1.0.0",
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error("❌ Global error:", err.stack);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    });

    // 4️⃣ Start Server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // 5️⃣ Graceful shutdown
    process.on("SIGTERM", () => {
      console.info("SIGTERM received. Closing server...");
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
