const Order = require("../models/orderModel");
const Invoice = require("../models/invoiceModel");
const User = require("../models/userModel");
const Stripe = require("stripe");
const { generateOTP, sendOTPEmail } = require("../utils/sendOtp");

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

const createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, message: "Stripe configuration is missing on the server. Please add STRIPE_SECRET_KEY to .env" });
    }
    const { orderId, paymentType } = req.body; // paymentType: "advance" or "final"

    const order = await Order.findById(orderId).populate("userId");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    let amount = 0;
    let description = "";

    if (paymentType === "advance") {
      amount = order.advanceAmount;
      description = `Advance Payment For Order ${order.orderNumber}`;
    } else if (paymentType === "final") {
       // Check if invoice exists
       const invoice = await Invoice.findOne({ orderId: order._id });
       if (!invoice) return res.status(400).json({ success: false, message: "Invoice not found for final payment." });
       amount = invoice.remainingAmount;
       description = `Final Payment For Order ${order.orderNumber}`;
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment type" });
    }

    if (amount <= 0) return res.status(400).json({ success: false, message: "Invalid amount" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Ghanshyam Tailor - ${description}`,
            },
            unit_amount: Math.round(amount * 100), // convert to paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/payment-success?session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}&type=${paymentType}`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/payment-cancel`,
      customer_email: order.userId.email,
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

const sendPaymentOTP = async (req, res) => {
  try {
     const { orderId, type } = req.body; 
     const order = await Order.findById(orderId).populate("userId");
     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

     // Send OTP to user
     const user = await User.findById(order.userId._id);
     const otp = generateOTP();
     user.otp = otp;
     user.otpExpire = Date.now() + 5 * 60 * 1000;
     user.otpType = type === "advance" ? "advance_payment" : "final_payment";
     await user.save();

     await sendOTPEmail(user.email, otp, user.otpType);

     res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

const verifyPaymentOTP = async (req, res) => {
   try {
     const { orderId, type, otp } = req.body;
     const order = await Order.findById(orderId);
     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

     const user = await User.findById(order.userId);

     if (!user.otp || user.otp !== otp || user.otpExpire < Date.now() || user.otpType !== (type === "advance" ? "advance_payment" : "final_payment")) {
       return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
     }

     // Mark payment success
     if (type === "advance") {
        order.paymentStatus = "Partial";
        order.paymentMethod = "Online"; // Explicitly state Online
        order.orderStatus = "Pending"; 
     } else if (type === "final") {
        order.paymentStatus = "Paid";
        order.paymentMethod = "Online";
        // Final payment completed
        // Need to update the invoice if exists
        const invoice = await Invoice.findOne({ orderId: order._id });
        if (invoice) {
           invoice.paymentStatus = "Paid";
           invoice.paymentMethod = "Online";
           await invoice.save();
        }
     }

     await order.save();
     
     // Clear OTP
     user.otp = null;
     user.otpExpire = null;
     user.otpType = null;
     await user.save();

     res.json({ success: true, message: "Payment verified and order updated" });
   } catch(err) {
     res.status(500).json({ success: false, message: "Server error: " + err.message });
   }
};

const chooseCOD = async (req, res) => {
   try {
      const orderId = req.params.id;
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ success: false, message: "Order not found" });

      order.paymentMethod = "Cash";
      order.codSelected = true;
      
      const invoice = await Invoice.findOne({ orderId: order._id });
      if (invoice) {
         // Assuming final payment has an extra delivery charge for COD if we want
         // The prompt says "Cash on Delivery (extra delivery charge)"
         invoice.paymentMethod = "Cash";
         invoice.totalAmount += 50; // Flat delivery charge
         invoice.remainingAmount += 50;
         await invoice.save();

         // We may need to re-generate the PDF but for simplicity we'll just update amounts.
      }

      await order.save();
      res.json({ success: true, message: "COD selected successfully", order });
   } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
   }
};

module.exports = {
  createCheckoutSession,
  sendPaymentOTP,
  verifyPaymentOTP,
  chooseCOD
};
