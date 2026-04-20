const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// General API Rate Limiter
const rateLimit = require("express-rate-limit");
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();

// --- MIDDLEWARE ---
app.use(compression());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/", apiLimiter);

// --- API ROUTES FIRST ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/measurements", require("./routes/measurementRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/worker", require("./routes/workerRoutes"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "OK", message: "Ghanshyam Tailor API Running" }));

// --- PRODUCTION: SERVE REACT STATIC FRONTEND ---
const buildPath = path.join(__dirname, "../client/build");
app.use(express.static(buildPath, { maxAge: "1y" }));

// Catch-All Route: Let React Router handle non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// --- DATABASE CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Production Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));
