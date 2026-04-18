const OrderItem = require("../models/orderItemModel");
const Order = require("../models/orderModel");
const Invoice = require("../models/invoiceModel");

const getAssignedItems = async (req, res) => {
  try {
    const items = await OrderItem.find({ assignedWorkerId: req.user._id })
      .populate({
        path: "orderId",
        select: "orderNumber deliveryDate orderStatus designImage",
        populate: { path: "userId", select: "name phone" }
      })
      .sort({ createdAt: -1 });
      
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateItemStatus = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Cutting", "Stitching", "Ready"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status update for worker" });
    }

    const item = await OrderItem.findOne({ _id: itemId, assignedWorkerId: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: "Assigned item not found" });

    item.status = status;
    await item.save();

    const order = await Order.findById(item.orderId);
    
    // Evaluate parent order string
    const allItems = await OrderItem.find({ orderId: order._id });
    const allReady = allItems.length > 0 && allItems.every(i => ["Ready", "Delivered"].includes(i.status));
    
    if (allReady) {
      order.orderStatus = "Ready";
    } else if (status === "Cutting") {
      order.orderStatus = "Cutting";
    } else if (status === "Stitching") {
      order.orderStatus = "Stitching";
    }
    await order.save();

    // Do NOT generate invoice here. Invoice generation logic should stick to admin when they click Ready or Delivered OR we can leave the auto-generation but user panel is read-only for money.
    // The previous updateItemStatus automatically generated an Invoice if allReady.
    // We can do it here since it's an automated background process.
    if (allReady && !order.invoiceGenerated) {
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
            advanceAmount: order.advanceAmount || 0,
            remainingAmount: totalAmount - (order.advanceAmount || 0),
            paymentStatus: order.paymentStatus, paymentMethod: "Online",
        });
        order.invoiceGenerated = true;
        await order.save();
    }

    res.json({ success: true, message: "Status updated successfully", item });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getAssignedItems, updateItemStatus };
