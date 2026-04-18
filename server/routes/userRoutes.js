const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getProfile, updateProfile, changePassword, getAllCustomers, getCustomerById, createCustomer, deleteCustomer, getAllWorkers, createWorker, deleteWorker } = require("../controllers/userController");

router.get("/profile", protect, getProfile);
router.put("/update", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.get("/customers", protect, adminOnly, getAllCustomers);
router.get("/customers/:id", protect, adminOnly, getCustomerById);
router.post("/customers", protect, adminOnly, createCustomer);
router.delete("/customers/:id", protect, adminOnly, deleteCustomer);

router.get("/workers", protect, adminOnly, getAllWorkers);
router.post("/workers", protect, adminOnly, createWorker);
router.delete("/workers/:id", protect, adminOnly, deleteWorker);

module.exports = router;
