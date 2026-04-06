const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createOrder, getUserOrders, getOrderById, getAllOrders,
  updateOrderStatus, updateMeasurement, adminCreateOrder,
  deleteOrder, getStats, upload
} = require("../controllers/orderController");

router.get("/stats", protect, getStats);
router.post("/create", protect, upload.single("designImage"), createOrder);
router.get("/my-orders", protect, getUserOrders);
router.get("/all", protect, adminOnly, getAllOrders);
router.post("/admin-create", protect, adminOnly, adminCreateOrder);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.put("/:id/measurement", protect, updateMeasurement);
router.delete("/:id", protect, adminOnly, deleteOrder);

module.exports = router;
