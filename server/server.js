const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
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

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Serve React production build
if (process.env.NODE_ENV === "production" || process.env.RENDER) {
  const buildPath = path.join(__dirname, "../client/build");
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
       return res.status(404).json({ success: false, message: "API route not found" });
    }
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// touch for nodemon restart