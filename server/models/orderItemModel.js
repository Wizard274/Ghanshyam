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

const orderItemSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    clothType: { type: String, required: true },
    customClothType: { type: String },
    fabricType: { type: String },
    color: { type: String },
    measurement: { type: measurementSchema },
    specialInstructions: { type: String },
    designImage: { type: String },
    status: {
      type: String,
      enum: ["Measurement Scheduled", "Pending", "Cutting", "Stitching", "Ready", "Delivered"],
      default: "Pending",
    },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderItem", orderItemSchema);
