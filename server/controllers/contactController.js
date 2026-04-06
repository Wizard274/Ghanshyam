const Contact = require("../models/contactModel");

const sendMessage = async (req, res) => {
  try {
    const { name, phone, message } = req.body;
    const contact = await Contact.create({ name, phone, message, userId: req.user?._id });
    res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Contact.find().populate("userId", "name email").sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const markRead = async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { sendMessage, getMessages, markRead };
