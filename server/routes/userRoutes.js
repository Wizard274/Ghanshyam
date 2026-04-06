const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getProfile, updateProfile, changePassword, getAllCustomers, getCustomerById, deleteCustomer } = require("../controllers/userController");

router.get("/profile", protect, getProfile);
router.put("/update", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.get("/customers", protect, adminOnly, getAllCustomers);
router.get("/customers/:id", protect, adminOnly, getCustomerById);
router.delete("/customers/:id", protect, adminOnly, deleteCustomer);

module.exports = router;
