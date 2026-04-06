const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { sendMessage, getMessages, markRead } = require("../controllers/contactController");

router.post("/send", sendMessage);
router.get("/all", protect, adminOnly, getMessages);
router.put("/:id/read", protect, adminOnly, markRead);

module.exports = router;
