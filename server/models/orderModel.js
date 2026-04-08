const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema({
  lambai: String,
  shoulder: String,
  bai: String,
  moli: String,
  chhati: String,
  kamar: String,
  sit: String,
  gher: String,
  kapo: String,
  galu: String,
  pachal_galu: String,
  jangh: String,
  jolo: String,
  ghutan: String,
  mori: String,
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, unique: true },
    clothType: { type: String, required: true },
    customClothType: { type: String },
    fabricType: { type: String },
    color: { type: String },
    measurement: { type: measurementSchema },
    specialInstructions: { type: String },
    deliveryDate: { type: Date },
    designImage: { type: String },
    measurementType: { type: String, enum: ["self", "tailor"], default: "self" },
    status: {
      type: String,
      enum: ["Measurement Scheduled", "Pending", "Cutting", "Stitching", "Ready", "Delivered"],
      default: "Pending",
    },
    invoiceGenerated: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    notes: { type: String },
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
