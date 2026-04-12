const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    address: { type: String, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpire: { type: Date },
    otpType: { type: String, enum: ["register", "reset"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
