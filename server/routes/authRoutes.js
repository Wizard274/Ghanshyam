const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { register, verifyOtp, login, forgotPassword, verifyResetOtp, resetPassword, resendOtp, refresh, logout } = require("../controllers/authController");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // strict limit for auth attempts
  message: { success: false, message: "Too many attempts, please try again after 15 minutes" }
});

router.post("/register", authLimiter, register);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/verify-reset-otp", authLimiter, verifyResetOtp);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/resend-otp", authLimiter, resendOtp);

router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
