const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  generateSlots,
  getAvailableSlots,
  getSlotsAdmin,
  deleteSlot,
  getAllAppointments
} = require("../controllers/appointmentController");

// Public (authenticated)
router.get("/available-slots", protect, getAvailableSlots);

// Admin
router.post("/generate-slots", protect, adminOnly, generateSlots);
router.get("/admin-slots", protect, adminOnly, getSlotsAdmin);
router.delete("/slots/:id", protect, adminOnly, deleteSlot);
router.get("/all", protect, adminOnly, getAllAppointments);

module.exports = router;
