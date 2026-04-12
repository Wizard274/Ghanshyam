const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");
const Invoice = require("../models/invoiceModel");
const AppointmentSlot = require("../models/appointmentSlotModel");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const { sendDeliveryScheduledEmail, sendOrderCompletedEmail } = require("../utils/emailUtils");
const { generateInvoicePDF } = require("../utils/generateInvoice");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

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

const createOrder = async (req, res) => {
  try {
    const { items, measurementType, slotId, deliveryDate, notes } = req.body;
    let parsedItems = [];
    if (items) {
      parsedItems = typeof items === "string" ? JSON.parse(items) : items;
    } else {
        if (clothType) {
            parsedItems.push({
                clothType, customClothType, fabricType, specialInstructions, price,
                measurement: measurement ? (typeof measurement === "string" ? JSON.parse(measurement) : measurement) : {}
            });
        }
    }
    
    if (!parsedItems || parsedItems.length === 0) return res.status(400).json({ success: false, message: "Cloth type/items are required" });

    let slot;
    if (measurementType === "tailor") {
        if (!slotId) return res.status(400).json({ success: false, message: "Appointment slot is required" });
        slot = await AppointmentSlot.findById(slotId);
        if (!slot || !slot.isActive || slot.booked >= slot.capacity) {
            return res.status(400).json({ success: false, message: "Selected slot is no longer available" });
        }
    }

    const designImage = req.file ? req.file.filename : null;

    const order = await Order.create({
        userId: req.user._id,
        deliveryDate: deliveryDate || null,
        measurementType: measurementType || "self",
        designImage,
        notes: notes || "",
    });

    const itemsToCreate = parsedItems.map(item => ({
        orderId: order._id,
        clothType: item.clothType,
        customClothType: item.customClothType || "",
        fabricType: item.fabricType || "",
        measurement: measurementType === "tailor" ? {} : (item.measurement || {}),
        specialInstructions: item.specialInstructions || "",
        price: parseFloat(item.price) || 0,
        status: measurementType === "tailor" ? "Measurement Scheduled" : "Pending",
        quantity: parseInt(item.quantity) || 1
    }));

    await OrderItem.insertMany(itemsToCreate);

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
    
    const createdItems = await OrderItem.find({ orderId: order._id });
    res.status(201).json({ success: true, message: "Order placed successfully", order: { ...order._doc, items: createdItems } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

const adminCreateOrder = async (req, res) => {
  try {
    const { userId, items, deliveryDate, notes } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "Customer is required" });
    if (!deliveryDate) return res.status(400).json({ success: false, message: "Delivery date is required" });

    const selDate = new Date(deliveryDate);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    minDate.setHours(0, 0, 0, 0);
    if (selDate < minDate) {
      return res.status(400).json({ success: false, message: "Delivery date must be at least 3 days after order date" });
    }

    let parsedItems = items ? (typeof items === "string" ? JSON.parse(items) : items) : null;
    if (!parsedItems || parsedItems.length === 0) {
        const { clothType, customClothType, fabricType, specialInstructions, measurement, price } = req.body;
        if (!clothType) return res.status(400).json({ success: false, message: "Cloth type is required" });
        parsedItems = [{ clothType, customClothType, fabricType, specialInstructions, measurement, price }];
    }

    const order = await Order.create({
      userId,
      deliveryDate: new Date(deliveryDate),
      notes: notes || "",
    });

    const itemsToCreate = parsedItems.map(item => ({
        orderId: order._id,
        clothType: item.clothType,
        customClothType: item.customClothType || "",
        fabricType: item.fabricType || "",
        measurement: item.measurement || {},
        specialInstructions: item.specialInstructions || "",
        price: parseFloat(item.price) || 0,
        status: "Pending",
        quantity: parseInt(item.quantity) || 1
    }));
    await OrderItem.insertMany(itemsToCreate);

    try {
        const customer = await User.findById(userId);
        if (customer) {
            await sendDeliveryScheduledEmail(order, customer, "N/A", "Pending");
            order.confirmationEmailSent = true;
            await order.save();
        }
    } catch (emailErr) {}

    const createdItems = await OrderItem.find({ orderId: order._id });
    res.status(201).json({ success: true, message: "Order created", order: { ...order._doc, items: createdItems } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 7, search = "" } = req.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // We do all fetching and sorting first to make it easier since we have to process items to get true statuses and clothTypes
    let orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    
    for (let o of orders) {
        o.items = await OrderItem.find({ orderId: o._id }).lean();
        if(o.items.length > 0) {
            const allDelivered = o.items.every(i => i.status === "Delivered");
            o.status = allDelivered ? "Delivered" : "Pending";
            o.price = o.items.reduce((sum, item) => sum + (item.price || 0), 0);
            o.clothType = o.items.map(i => i.clothType).join(", ");
        } else {
            o.status = o.status || "Pending";
            o.clothType = o.clothType || "Unknown Type";
        }
    }

    if (search) {
      const s = search.toLowerCase();
      orders = orders.filter(o => 
        (o.clothType && o.clothType.toLowerCase().includes(s)) ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(s))
      );
    }

    const totalOrders = orders.length;
    const totalPages = Math.ceil(totalOrders / parsedLimit) || 1;
    const paginatedOrders = orders.slice(skip, skip + parsedLimit);

    res.json({ success: true, orders: paginatedOrders, totalPages, currentPage: parsedPage });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderDoc = await Order.findById(req.params.id).populate("userId", "name email phone address").lean();
    if (!orderDoc) return res.status(404).json({ success: false, message: "Order not found" });
    if (req.user.role !== "admin" && orderDoc.userId._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Access denied" });
    
    orderDoc.items = await OrderItem.find({ orderId: orderDoc._id }).lean();
    if(orderDoc.items.length > 0) {
        orderDoc.status = orderDoc.items.every(i => i.status === "Delivered") ? "Delivered" : "Pending";
        orderDoc.price = orderDoc.items.reduce((sum, item) => sum + (item.price || 0), 0);
    } else {
        orderDoc.status = orderDoc.status || "Pending";
        orderDoc.clothType = orderDoc.clothType || "Unknown Type";
    }

    res.json({ success: true, order: orderDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { search, date, userId } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      query.deliveryDate = { $gte: d, $lt: next };
    }

    let orders = await Order.find(query).populate("userId", "name email phone").sort({ createdAt: -1 }).lean();
    
    for(let o of orders) {
        o.items = await OrderItem.find({ orderId: o._id }).lean();
        if(o.items.length > 0) {
            o.status = o.items.every(item => item.status === "Delivered") ? "Delivered" : "Pending";
            o.price = o.items.reduce((sum, item) => sum + (item.price || 0), 0);
            o.clothType = o.items.map(i => i.clothType).join(", "); 
        } else {
            o.status = o.status || "Pending";
            o.clothType = o.clothType || "Unknown Type";
        }
    }

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

const getAllItems = async (req, res) => {
  try {
    const { status, search, userId, page = 1, limit = 7 } = req.query;
    let query = {};
    if (status && status !== "All") query.status = status;
    
    if (userId) {
      const orders = await Order.find({ userId }, "_id");
      query.orderId = { $in: orders.map(o => o._id) };
    }

    if (search) {
      const users = await User.find({ name: { $regex: search, $options: "i" } }, "_id");
      const userIds = users.map(u => u._id);
      
      const orderDocs = await Order.find({
        $or: [
          { userId: { $in: userIds } },
          { orderNumber: { $regex: search, $options: "i" } }
        ]
      }, "_id");
      
      const orderIds = orderDocs.map(o => o._id);
      
      if (query.orderId) {
        const existingIds = query.orderId.$in.map(id => id.toString());
        query.orderId = { $in: orderIds.filter(id => existingIds.includes(id.toString())) };
      } else {
        query.orderId = { $in: orderIds };
      }
    }

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const totalItems = await OrderItem.countDocuments(query);
    const totalPages = Math.ceil(totalItems / parsedLimit) || 1;

    let items = await OrderItem.find(query)
      .populate({
        path: "orderId",
        populate: { path: "userId", select: "name email phone" }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    res.json({ success: true, items, orders: items, totalPages, currentPage: parsedPage });
  } catch(err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { notes, deliveryDate } = req.body;
    const orderId = req.params.id; 
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (notes !== undefined) order.notes = notes;
    
    let isDeliveryDateUpdated = false;
    if (deliveryDate !== undefined) {
      if (deliveryDate) {
        const minDate = new Date(order.createdAt);
        minDate.setDate(minDate.getDate() + 3);
        minDate.setHours(0, 0, 0, 0);
        const selDate = new Date(deliveryDate);
        if (selDate < minDate) {
          return res.status(400).json({ success: false, message: "Delivery date must be at least 3 days after order date" });
        }
      }
      
      order.deliveryDate = deliveryDate ? new Date(deliveryDate) : null;
      if (order.deliveryDate && !order.confirmationEmailSent) {
        isDeliveryDateUpdated = true;
      }
    }
    
    await order.save();

    if (isDeliveryDateUpdated) {
      try {
        const customer = await User.findById(order.userId);
        if (customer) {
            await sendDeliveryScheduledEmail(order, customer, "N/A", "Pending");
            order.confirmationEmailSent = true;
            await order.save();
        }
      } catch (emailErr) {}
    }

    res.json({ success: true, message: "Order updated", order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateItemStatus = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const { status, measurement, price } = req.body;
        
        const item = await OrderItem.findById(itemId);
        if(!item) return res.status(404).json({success: false, message: "Item not found"});
        
        const prevStatus = item.status;
        if(status) item.status = status;
        if(measurement) item.measurement = measurement;
        if(price !== undefined) item.price = parseFloat(price) || 0;
        
        await item.save();

        const order = await Order.findById(item.orderId);
        const allItems = await OrderItem.find({ orderId: order._id });
        const allDelivered = allItems.length > 0 && allItems.every(i => i.status === "Delivered");

        if (allDelivered && !order.invoiceGenerated) {
            let totalAmount = allItems.reduce((sum, i) => sum + (i.price || 0), 0);
            if(totalAmount === 0) totalAmount = 500; 
            
            const invoiceItems = allItems.map(i => ({
                name: i.clothType,
                description: i.fabricType || "",
                quantity: i.quantity || 1,
                price: i.price || 0
            }));

            const invoice = await Invoice.create({
                orderId: order._id,
                customerId: order.userId,
                items: invoiceItems,
                subtotal: totalAmount, discount: 0, tax: 0, totalAmount: totalAmount,
                paymentStatus: "Pending", paymentMethod: "Cash",
            });
            order.invoiceGenerated = true;
            await order.save();

            try {
                const customer = await User.findById(order.userId);
                if (customer) {
                  const pdfBuffer = await generateInvoicePDF(invoice, order, customer);
                  await sendOrderCompletedEmail(order, customer, pdfBuffer, invoice.invoiceNumber);
                }
            } catch (err) {
                console.error("Failed to send order completion email");
            }
        }

        res.json({ success: true, message: "Item updated", item });
    } catch(err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateMeasurement = async (req, res) => {
    res.status(400).json({ success: false, message: "Please update measurements at the item level." });
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    await Invoice.deleteMany({ orderId: order._id });
    await OrderItem.deleteMany({ orderId: order._id });

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

const getStats = async (req, res) => {
  try {
    const userId = req.user.role === "admin" ? null : req.user._id;
    
    let orderIds = [];
    if(userId) {
        const orders = await Order.find({userId}, "_id");
        orderIds = orders.map(o => o._id);
    }
    const itemFilter = userId ? { orderId: { $in: orderIds } } : {};
    
    const [total, pending, cutting, stitching, ready, delivered] = await Promise.all([
      Order.countDocuments(userId ? {userId} : {}),
      OrderItem.countDocuments({ ...itemFilter, status: "Pending" }),
      OrderItem.countDocuments({ ...itemFilter, status: "Cutting" }),
      OrderItem.countDocuments({ ...itemFilter, status: "Stitching" }),
      OrderItem.countDocuments({ ...itemFilter, status: "Ready" }),
      OrderItem.countDocuments({ ...itemFilter, status: "Delivered" }),
    ]);

    const invoiceFilter = userId ? { customerId: userId } : {};
    const invoices = await Invoice.countDocuments(invoiceFilter);
    let recent = await Order.find(userId ? {userId} : {}).populate("userId", "name").sort({ createdAt: -1 }).limit(5).lean();
    for (let o of recent) {
        o.items = await OrderItem.find({ orderId: o._id }).lean();
        if(o.items.length > 0) {
            o.status = o.items.every(item => item.status === "Delivered") ? "Delivered" : "Pending";
            o.clothType = o.items.map(i => i.clothType).join(", "); 
        } else {
            o.status = o.status || "Pending";
            o.clothType = o.clothType || "Unknown Type";
        }
    }

    res.json({ success: true, stats: { total, pending, cutting, stitching, ready, delivered, invoices }, recent });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createOrder, getUserOrders, getOrderById, getAllOrders, getAllItems,
  updateOrderStatus, updateItemStatus, updateMeasurement, adminCreateOrder,
  deleteOrder, getStats, upload
};
