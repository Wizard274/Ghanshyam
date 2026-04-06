const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Partial"], default: "Pending" },
    paymentMethod: { type: String, enum: ["Cash", "Online", "UPI", "Card"], default: "Cash" },
    notes: { type: String },
  },
  { timestamps: true }
);

// Auto-generate invoice number
invoiceSchema.pre("save", async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model("Invoice").countDocuments();
    const year = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
