const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createCheckoutSession,
  sendPaymentOTP,
  verifyPaymentOTP,
  chooseCOD
} = require("../controllers/paymentController");

router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/send-otp", protect, sendPaymentOTP);
router.post("/verify-otp", protect, verifyPaymentOTP);
router.post("/:id/cod", protect, chooseCOD);

module.exports = router;
