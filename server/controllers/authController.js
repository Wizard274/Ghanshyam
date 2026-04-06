const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP, sendOTPEmail } = require("../utils/sendOtp");

// Register - Step 1
const register = async (req, res) => {
  try {
    const { name, phone, email, password, address } = req.body;
    if (!name || !phone || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

    if (existing) {
      existing.name = name; existing.phone = phone; existing.password = hashed;
      existing.address = address; existing.otp = otp; existing.otpExpire = otpExpire;
      existing.otpType = "register";
      await existing.save();
    } else {
      await User.create({ name, phone, email, password: hashed, address, otp, otpExpire, otpType: "register" });
    }

    await sendOTPEmail(email, otp, "register");
    res.json({ success: true, message: "OTP sent to your email", email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (new Date() > user.otpExpire) return res.status(400).json({ success: false, message: "OTP expired" });

    user.isVerified = true;
    user.otp = undefined; user.otpExpire = undefined; user.otpType = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, message: "Account verified successfully", token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.isVerified) return res.status(401).json({ success: false, message: "Please verify your email first" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "Email not found" });

    const otp = generateOTP();
    user.otp = otp; user.otpExpire = new Date(Date.now() + 5 * 60 * 1000); user.otpType = "reset";
    await user.save();
    await sendOTPEmail(email, otp, "reset");
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify reset OTP
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otpType: "reset" });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (new Date() > user.otpExpire) return res.status(400).json({ success: false, message: "OTP expired" });

    res.json({ success: true, message: "OTP verified", email });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, otpType: "reset" });
    if (!user || user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid request" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined; user.otpExpire = undefined; user.otpType = undefined;
    await user.save();
    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Resend OTP
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = generateOTP();
    user.otp = otp; user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    await sendOTPEmail(email, otp, user.otpType || "register");
    res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { register, verifyOtp, login, forgotPassword, verifyResetOtp, resetPassword, resendOtp };
