const mongoose = require("mongoose");

const appointmentSlotSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g., "10:00 AM"
    endTime: { type: String, required: true }, // e.g., "10:30 AM"
    capacity: { type: Number, default: 1 },
    booked: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppointmentSlot", appointmentSlotSchema);
