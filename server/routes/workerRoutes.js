const express = require("express");
const router = express.Router();
const { protect, workerOnly } = require("../middleware/authMiddleware");
const { getAssignedItems, updateItemStatus } = require("../controllers/workerController");

router.get("/assigned-items", protect, workerOnly, getAssignedItems);
router.put("/items/:itemId/status", protect, workerOnly, updateItemStatus);

module.exports = router;
