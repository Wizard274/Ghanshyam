const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, unique: true },
    deliveryDate: { type: Date },
    measurementType: { type: String, enum: ["self", "tailor"], default: "self" },
    invoiceGenerated: { type: Boolean, default: false },
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
