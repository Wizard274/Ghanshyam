const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP, sendOTPEmail } = require("../utils/sendOtp");

const generateTokens = (id, role) => {
  const accessToken = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

const sendRefreshToken = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const checkOtpLock = (user) => {
  return user.otpLockUntil && user.otpLockUntil > Date.now();
};

const handleOtpFail = async (user) => {
  user.otpAttempts += 1;
  if (user.otpAttempts >= 3) {
    user.otpLockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // lock for 24 hours
  }
  await user.save();
};

const register = async (req, res) => {
  try {
    const { name, phone, email, password, address } = req.body;
    if (!name || !phone || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified)
      return res.status(400).json({ success: false, message: "Email already registered" });
      
    if (existing && checkOtpLock(existing))
      return res.status(403).json({ success: false, message: "Too many failed attempts. Try again after 24 hours." });

    const hashed = await bcrypt.hash(password, 10);
    const rawOtp = generateOTP();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

    if (existing) {
      existing.name = name; existing.phone = phone; existing.password = hashed;
      existing.address = address; existing.otp = hashedOtp; existing.otpExpire = otpExpire;
      existing.otpType = "register"; existing.lastOtpSentAt = new Date();
      await existing.save();
    } else {
      await User.create({ name, phone, email, password: hashed, address, otp: hashedOtp, otpExpire, otpType: "register", lastOtpSentAt: new Date() });
    }

    await sendOTPEmail(email, rawOtp, "register");
    res.json({ success: true, message: "OTP sent to your email", email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    if (checkOtpLock(user)) return res.status(403).json({ success: false, message: "Too many failed attempts. Try again after 24 hours." });
    
    if (new Date() > user.otpExpire) return res.status(400).json({ success: false, message: "OTP expired" });
    
    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) {
      await handleOtpFail(user);
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = undefined; user.otpExpire = undefined; user.otpType = undefined; user.otpAttempts = 0; user.otpLockUntil = undefined;
    
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();
    
    sendRefreshToken(res, refreshToken);
    res.json({ success: true, message: "Account verified successfully", token: accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.isVerified) return res.status(401).json({ success: false, message: "Please verify your email first" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    sendRefreshToken(res, refreshToken);
    res.json({ success: true, message: "Login successful", token: accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "Email not found" });
    
    if (checkOtpLock(user)) return res.status(403).json({ success: false, message: "Locked out. Try again after 24 hours." });

    const rawOtp = generateOTP();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    user.otp = hashedOtp; user.otpExpire = new Date(Date.now() + 5 * 60 * 1000); user.otpType = "reset"; user.lastOtpSentAt = new Date();
    await user.save();
    
    await sendOTPEmail(email, rawOtp, "reset");
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otpType: "reset" });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    if (checkOtpLock(user)) return res.status(403).json({ success: false, message: "Locked out. Try again after 24 hours." });
    if (new Date() > user.otpExpire) return res.status(400).json({ success: false, message: "OTP expired" });

    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) {
      await handleOtpFail(user);
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.otpAttempts = 0; user.otpLockUntil = undefined;
    await user.save();
    res.json({ success: true, message: "OTP verified", email });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, otpType: "reset" });
    
    if (!user) return res.status(400).json({ success: false, message: "Invalid request" });
    const isValid = await bcrypt.compare(otp, user.otp);
    if (!isValid) return res.status(400).json({ success: false, message: "Invalid request" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined; user.otpExpire = undefined; user.otpType = undefined;
    await user.save();
    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    if (checkOtpLock(user)) return res.status(403).json({ success: false, message: "Locked out. Try again after 24 hours." });
    
    const timeDiff = new Date() - new Date(user.lastOtpSentAt);
    if (timeDiff < 2 * 60 * 1000) return res.status(429).json({ success: false, message: "Please wait 2 minutes before resending OTP" });

    const rawOtp = generateOTP();
    const hashedOtp = await bcrypt.hash(rawOtp, 10);
    user.otp = hashedOtp; user.otpExpire = new Date(Date.now() + 5 * 60 * 1000); user.lastOtpSentAt = new Date();
    await user.save();
    
    await sendOTPEmail(email, rawOtp, user.otpType || "register");
    res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, message: "Refresh token missing" });
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || (!user.refreshToken && !user.isVerified)) return res.status(401).json({ success: false, message: "Invalid session" });
    
    // Deployed fallback check: allow old users to still function if they don't have refreshToken stored but token signature is valid
    if (user.refreshToken) {
      const isValidRefresh = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValidRefresh) return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const tokens = generateTokens(user._id, user.role);
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await user.save();
    
    sendRefreshToken(res, tokens.refreshToken);
    res.json({ success: true, token: tokens.accessToken });
  } catch (err) {
    res.status(401).json({ success: false, message: "Token expired or invalid" });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      // Optionally remove from DB but since token requires signature, it's fairly secure. Still good practice.
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshToken = undefined;
          await user.save();
        }
      } catch (e) {
         // ignore expiration error on logout
      }
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { register, verifyOtp, login, forgotPassword, verifyResetOtp, resetPassword, resendOtp, refresh, logout };
