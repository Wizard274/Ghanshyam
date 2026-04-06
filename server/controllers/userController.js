const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Invoice = require("../models/invoiceModel");
const bcrypt = require("bcryptjs");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp -otpExpire");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id, { name, phone, address }, { new: true, runValidators: true }
    ).select("-password");
    res.json({ success: true, message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ success: false, message: "Current password is wrong" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: "user" };
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
    const customers = await User.find(query).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select("-password");
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete customer and all their data
const deleteCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    if (customer.role === "admin") return res.status(403).json({ success: false, message: "Cannot delete admin account" });

    // Delete their orders and invoices
    const orders = await Order.find({ userId: customer._id });
    const orderIds = orders.map(o => o._id);
    await Invoice.deleteMany({ orderId: { $in: orderIds } });
    await Order.deleteMany({ userId: customer._id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Customer and all their data deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getProfile, updateProfile, changePassword, getAllCustomers, getCustomerById, deleteCustomer };
