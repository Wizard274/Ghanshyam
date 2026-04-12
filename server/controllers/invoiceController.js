const Invoice = require("../models/invoiceModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const { generateInvoicePDF } = require("../utils/generateInvoice");

// Create invoice manually (admin)
const createInvoice = async (req, res) => {
  try {
    const { orderId, customerId, items, discount, tax, paymentStatus, paymentMethod, notes } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalAmount = subtotal - (discount || 0) + (tax || 0);

    const invoice = await Invoice.create({
      orderId, customerId, items, subtotal, discount: discount || 0,
      tax: tax || 0, totalAmount, paymentStatus: paymentStatus || "Pending",
      paymentMethod: paymentMethod || "Cash", notes,
    });

    order.invoiceGenerated = true;
    await order.save();

    res.status(201).json({ success: true, message: "Invoice created", invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("orderId")
      .populate("customerId", "name email phone address");
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    if (req.user.role !== "admin" && invoice.customerId._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Access denied" });

    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all invoices (admin)
const getAllInvoices = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 7 } = req.query;
    let query = {};
    if (status && status !== "All") query.paymentStatus = status;

    if (search) {
      const s = search.toLowerCase();
      const users = await User.find({ name: { $regex: s, $options: "i" } }, "_id");
      const userIds = users.map(u => u._id);
      
      query.$or = [
        { customerId: { $in: userIds } },
        { invoiceNumber: { $regex: s, $options: "i" } }
      ];
    }
    
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;
    
    const totalInvoices = await Invoice.countDocuments(query);
    const totalPages = Math.ceil(totalInvoices / parsedLimit) || 1;

    const invoices = await Invoice.find(query)
      .populate("orderId", "orderNumber clothType")
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    res.json({ success: true, invoices, totalPages, currentPage: parsedPage });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user invoices
const getUserInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 7, search = "" } = req.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    let query = { customerId: req.user._id };

    if (search) {
      // Find orders matching the search term to filter invoices by orderNumber
      const orders = await Order.find({ orderNumber: { $regex: search, $options: "i" } }, "_id");
      const orderIds = orders.map(o => o._id);
      
      query = {
        ...query,
        $or: [
          { invoiceNumber: { $regex: search, $options: "i" } },
          { orderId: { $in: orderIds } }
        ]
      };
    }

    const totalInvoices = await Invoice.countDocuments(query);
    const totalPages = Math.ceil(totalInvoices / parsedLimit) || 1;

    const invoices = await Invoice.find(query)
      .populate("orderId", "orderNumber clothType status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    res.json({ success: true, invoices, totalPages, currentPage: parsedPage });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Download PDF
const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("orderId")
      .populate("customerId", "name email phone address");
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    if (req.user.role !== "admin" && invoice.customerId._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Access denied" });

    const pdfBuffer = await generateInvoicePDF(invoice, invoice.orderId, invoice.customerId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update payment status (admin)
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentMethod },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, message: "Payment status updated", invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update invoice (admin)
const updateInvoice = async (req, res) => {
  try {
    const { items, discount, tax, paymentStatus, paymentMethod, notes } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });

    if (items) {
      invoice.items = items;
      invoice.subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }
    if (discount !== undefined) invoice.discount = discount;
    if (tax !== undefined) invoice.tax = tax;
    invoice.totalAmount = invoice.subtotal - invoice.discount + invoice.tax;
    if (paymentStatus) invoice.paymentStatus = paymentStatus;
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (notes) invoice.notes = notes;
    await invoice.save();

    res.json({ success: true, message: "Invoice updated", invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createInvoice, getInvoiceById, getAllInvoices, getUserInvoices, downloadInvoicePDF, updatePaymentStatus, updateInvoice };
