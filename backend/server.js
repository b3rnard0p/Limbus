import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import authRoutes from "./src/routes/authRoutes.js";
import pinRoutes from "./src/routes/pinRoutes.js";
import { errorHandler, notFound } from "./src/middlewares/errorHandler.js";
import User from "./src/models/User.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 4000;

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'", 
          "data:", 
          "blob:", 
          "https://res.cloudinary.com", 
          "https://*.google.com", 
          "https://unpkg.com",
          "https://cdnjs.cloudflare.com"
        ],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "https://res.cloudinary.com"]
      }
    }
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/ping", (_req, res) => {
  res.sendStatus(200);
});

app.use("/api/auth", authRoutes);
app.use("/api/pins", pinRoutes);

const frontendDistPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDistPath));

app.get("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/uploads")) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    // Seed admin
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (!existingAdmin) {
        const hash = await bcrypt.hash(adminPassword, 10);
        await User.create({ email: adminEmail, password: hash, role: "admin" });
        console.log("Admin user seeded successfully.");
      }
    }

    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  });
