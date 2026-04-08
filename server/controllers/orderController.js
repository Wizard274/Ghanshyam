const Order = require("../models/orderModel");
const Invoice = require("../models/invoiceModel");
const AppointmentSlot = require("../models/appointmentSlotModel");
const Appointment = require("../models/appointmentModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `order_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files allowed"));
  },
});

// Create order
const createOrder = async (req, res) => {
  try {
    const { clothType, customClothType, fabricType, color, specialInstructions, deliveryDate, measurement, price, notes, measurementType, slotId } = req.body;
    const designImage = req.file ? req.file.filename : null;
    if (!clothType) return res.status(400).json({ success: false, message: "Cloth type is required" });

    let slot;
    if (measurementType === "tailor") {
        if (!slotId) return res.status(400).json({ success: false, message: "Appointment slot is required for tailor measurement" });
        slot = await AppointmentSlot.findById(slotId);
        if (!slot || !slot.isActive || slot.booked >= slot.capacity) {
            return res.status(400).json({ success: false, message: "Selected slot is no longer available" });
        }
    }

    const order = await Order.create({
        userId: req.user._id,
        clothType,
        customClothType: customClothType || "",
        fabricType: fabricType || "",
        color: color || "",
        specialInstructions: specialInstructions || "",
        deliveryDate: deliveryDate || null,
        measurementType: measurementType || "self",
        measurement: measurementType === "tailor" ? {} : (measurement ? JSON.parse(measurement) : {}),
        status: measurementType === "tailor" ? "Measurement Scheduled" : "Pending",
        designImage,
        price: parseFloat(price) || 0,
        notes: notes || "",
    });

    if (measurementType === "tailor" && slot) {
        slot.booked += 1;
        await slot.save();
        await Appointment.create({
            userId: req.user._id,
            orderId: order._id,
            slotId: slot._id,
            date: slot.date,
            time: `${slot.startTime} - ${slot.endTime}`
        });
    }

    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "name email phone address");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (req.user.role !== "admin" && order.userId._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Access denied" });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin: get all orders — supports ?status, ?search, ?userId
const getAllOrders = async (req, res) => {
  try {
    const { status, search, date, userId } = req.query;
    let query = {};
    if (status && status !== "All") query.status = status;
    if (userId) query.userId = userId;
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      query.deliveryDate = { $gte: d, $lt: next };
    }

    let orders = await Order.find(query).populate("userId", "name email phone").sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      orders = orders.filter(o =>
        o.userId?.name?.toLowerCase().includes(s) ||
        o.orderNumber?.toLowerCase().includes(s)
      );
    }
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, price, notes } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const prevStatus = order.status;
    if (status) order.status = status;
    if (price !== undefined) order.price = parseFloat(price) || 0;
    if (notes !== undefined) order.notes = notes;
    await order.save();

    if (status === "Delivered" && prevStatus !== "Delivered" && !order.invoiceGenerated) {
      const itemPrice = order.price || 500;
      await Invoice.create({
        orderId: order._id,
        customerId: order.userId,
        items: [{ name: `${order.clothType} Stitching`, description: order.fabricType || "", quantity: 1, price: itemPrice }],
        subtotal: itemPrice, discount: 0, tax: 0, totalAmount: itemPrice,
        paymentStatus: "Pending", paymentMethod: "Cash",
      });
      order.invoiceGenerated = true;
      await order.save();
    }

    res.json({ success: true, message: "Order updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update measurement — user (Pending only) OR admin (any time)
const updateMeasurement = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (req.user.role !== "admin") {
      if (order.userId.toString() !== req.user._id.toString())
        return res.status(403).json({ success: false, message: "Access denied" });
      if (order.status !== "Pending" && order.status !== "Measurement Scheduled")
        return res.status(400).json({ success: false, message: "Cannot edit measurement after initial stage" });
    }

    order.measurement = req.body.measurement || order.measurement;

    // Transition to Pending if admin is adding measurements to a scheduled order
    if (req.user.role === "admin" && order.status === "Measurement Scheduled") {
        order.status = "Pending";
        await Appointment.findOneAndUpdate(
            { orderId: order._id, status: "scheduled" },
            { status: "completed" }
        );
    }

    await order.save();
    res.json({ success: true, message: "Measurement updated", order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const adminCreateOrder = async (req, res) => {
  try {
    const { userId, clothType, customClothType, fabricType, color, specialInstructions, deliveryDate, measurement, price, notes } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "Customer is required" });
    if (!clothType) return res.status(400).json({ success: false, message: "Cloth type is required" });

    const order = await Order.create({
      userId, clothType,
      customClothType: customClothType || "",
      fabricType: fabricType || "",
      color: color || "",
      specialInstructions: specialInstructions || "",
      deliveryDate: deliveryDate || null,
      measurement: measurement || {},
      price: parseFloat(price) || 0,
      notes: notes || "",
    });
    res.status(201).json({ success: true, message: "Order created", order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// Delete order (admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    await Invoice.deleteMany({ orderId: order._id });

    if (order.designImage) {
      const imgPath = path.join(uploadsDir, order.designImage);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Stats — includes cutting
const getStats = async (req, res) => {
  try {
    const userId = req.user.role === "admin" ? null : req.user._id;
    const filter = userId ? { userId } : {};

    const [total, pending, cutting, stitching, ready, delivered] = await Promise.all([
      Order.countDocuments(filter),
      Order.countDocuments({ ...filter, status: "Pending" }),
      Order.countDocuments({ ...filter, status: "Cutting" }),
      Order.countDocuments({ ...filter, status: "Stitching" }),
      Order.countDocuments({ ...filter, status: "Ready" }),
      Order.countDocuments({ ...filter, status: "Delivered" }),
    ]);

    const invoiceFilter = userId ? { customerId: userId } : {};
    const invoices = await Invoice.countDocuments(invoiceFilter);
    const recent = await Order.find(filter).populate("userId", "name").sort({ createdAt: -1 }).limit(5);

    res.json({ success: true, stats: { total, pending, cutting, stitching, ready, delivered, invoices }, recent });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createOrder, getUserOrders, getOrderById, getAllOrders,
  updateOrderStatus, updateMeasurement, adminCreateOrder,
  deleteOrder, getStats, upload
};
