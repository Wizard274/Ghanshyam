const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Order = require("../models/orderModel");

// Get measurements for a user (admin)
router.get("/:userId", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId, measurement: { $exists: true } })
      .select("orderNumber clothType measurement createdAt status");
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get my measurements
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .select("orderNumber clothType measurement createdAt status");
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
