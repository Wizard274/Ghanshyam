const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, unique: true },
    deliveryDate: { type: Date },
    measurementType: { type: String, enum: ["self", "tailor"], default: "self" },
    orderStatus: { 
      type: String, 
      enum: ["Placed", "Price Pending", "Challan Generated", "Advance Paid", "Pending", "Cutting", "Stitching", "Ready", "Final Payment", "Delivered"], 
      default: "Price Pending" 
    },
    totalAmount: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ["Pending", "Partial", "Paid"], default: "Pending" },
    paymentMethod: { type: String, enum: ["Online", "Cash"], default: "Cash" },
    codSelected: { type: Boolean, default: false },
    invoiceGenerated: { type: Boolean, default: false },
    challanGenerated: { type: Boolean, default: false },
    confirmationEmailSent: { type: Boolean, default: false },
    notes: { type: String },
    designImage: { type: String },
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    const year = new Date().getFullYear();
    this.orderNumber = `ORD-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
