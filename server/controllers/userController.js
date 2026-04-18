const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Invoice = require("../models/invoiceModel");
const bcrypt = require("bcryptjs");
const { sendWorkerWelcomeEmail } = require("../utils/sendOtp");

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
    const { search, page = 1, limit = 7 } = req.query;
    let query = { role: "user" };
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
    
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;
    
    const totalCustomers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCustomers / parsedLimit) || 1;
    
    const customers = await User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(parsedLimit);
    res.json({ success: true, customers, totalPages, currentPage: parsedPage });
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

const createCustomer = async (req, res) => {
  try {
    let { name, phone, email, address } = req.body;
    if (!name || !phone || !email) return res.status(400).json({ success: false, message: "Name, phone, and email are required" });

    // Normalize phone number (remove spaces, dashes)
    phone = phone.replace(/\D/g, "");

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ success: false, message: "A user with this phone number already exists" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ success: false, message: "Email already exists" });

    const randomPassword = require("crypto").randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const newCustomer = await User.create({
      name,
      phone,
      email,
      address: address || "",
      password: hashedPassword,
      isVerified: true,
      role: "user"
    });

    const customerData = newCustomer.toObject();
    delete customerData.password;
    
    res.status(201).json({ success: true, message: "Customer created successfully", customer: customerData });
  } catch (err) {
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ success: false, message: `A user with this ${duplicateField} already exists` });
    }
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

const getAllWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: "worker" }).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, workers });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const createWorker = async (req, res) => {
  try {
    let { name, phone, email, address, password } = req.body;
    if (!name || !phone || !email || !password) return res.status(400).json({ success: false, message: "Name, phone, email, and password are required" });

    phone = phone.replace(/\D/g, "");

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ success: false, message: "A user with this phone number already exists" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ success: false, message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newWorker = await User.create({
      name,
      phone,
      email,
      address: address || "",
      password: hashedPassword,
      isVerified: true,
      role: "worker"
    });

    const workerData = newWorker.toObject();
    delete workerData.password;
    
    // Send welcome email with credentials
    try {
      await sendWorkerWelcomeEmail(email, password);
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
    }
    
    res.status(201).json({ success: true, message: "Worker created successfully", worker: workerData });
  } catch (err) {
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ success: false, message: `A user with this ${duplicateField} already exists` });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteWorker = async (req, res) => {
  try {
    const worker = await User.findById(req.params.id);
    if (!worker || worker.role !== "worker") return res.status(404).json({ success: false, message: "Worker not found" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Worker deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getProfile, updateProfile, changePassword, getAllCustomers, getCustomerById, createCustomer, deleteCustomer, getAllWorkers, createWorker, deleteWorker };
