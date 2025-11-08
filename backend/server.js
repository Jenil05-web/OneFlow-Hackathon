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

    // 3️⃣ Register Routes
    const { default: authRoutes } = await import("./routes/authRoutes.js");
    const adminRoutes = (await import("./routes/adminRoutes.js")).default || (await import("./routes/adminRoutes.js"));
    app.use("/api/auth", authRoutes);
    app.use("/api/admin", adminRoutes);

    // Project routes
    try {
      const { default: projectRoutes } = await import("./routes/projectRoutes.js");
      app.use("/api/projects", projectRoutes);
    } catch (err) {
      console.log("ℹ️  projectRoutes not found. Create ./routes/projectRoutes.js to enable Project endpoints.");
    }

    // Health check route
    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "OneFlow backend is running successfully 🚀",
        version: "1.0.0",
      });
    });

    // Example protected test route (optional)
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
      console.log("ℹ️  authMiddleware not found — dashboard route skipped.");
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
