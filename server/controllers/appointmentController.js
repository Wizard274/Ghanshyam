const AppointmentSlot = require("../models/appointmentSlotModel");
const Appointment = require("../models/appointmentModel");

// Admin: Generate slots for a specific date
const generateSlots = async (req, res) => {
  try {
    const { date, startTime, endTime, intervalMinutes, capacity } = req.body;
    
    if (!date || !startTime || !endTime || !intervalMinutes) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    // Convert time to minutes from start of day to calculate intervals
    const parseTimeStr = (tStr) => {
        const [time, modifier] = tStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours, 10);
        if (hours === 12) hours = 0;
        if (modifier.toLowerCase() === 'pm') hours += 12;
        return hours * 60 + parseInt(minutes, 10);
    };

    const formatTimeObj = (mins) => {
        let h = Math.floor(mins / 60);
        let m = mins % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // the hour '0' should be '12'
        m = m < 10 ? '0' + m : m;
        return `${h}:${m} ${ampm}`;
    };

    let startMins = parseTimeStr(startTime);
    const endMins = parseTimeStr(endTime);
    
    const slotsToCreate = [];

    while (startMins + parseInt(intervalMinutes) <= endMins) {
        const sTime = formatTimeObj(startMins);
        const eTime = formatTimeObj(startMins + parseInt(intervalMinutes));
        
        slotsToCreate.push({
            date: slotDate,
            startTime: sTime,
            endTime: eTime,
            capacity: parseInt(capacity) || 1,
            booked: 0,
            isActive: true
        });
        
        startMins += parseInt(intervalMinutes);
    }

    // Check if slots already exist for this date
    const existing = await AppointmentSlot.find({ date: slotDate });
    if (existing.length > 0) {
        // Optionally delete existing, or return error. Let's return error to avoid replacing booked slots.
        return res.status(400).json({ success: false, message: "Slots already generated for this date. Manage them individually." });
    }

    const createdSlots = await AppointmentSlot.insertMany(slotsToCreate);

    res.status(201).json({ success: true, message: `${createdSlots.length} slots generated successfully`, slots: createdSlots });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// Public/User: Get available slots for a future date (up to 1 month)
const getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.query;
        let query = { isActive: true, $expr: { $lt: ["$booked", "$capacity"] } };
        
        const now = new Date();
        now.setUTCHours(now.getUTCHours() + 5);
        now.setUTCMinutes(now.getUTCMinutes() + 30);
        const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        // Auto-delete past slots
        await AppointmentSlot.deleteMany({ date: { $lt: todayMidnight } });

        if (date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            query.date = d;
        } else {
            // Get from today to 1 month ahead
            const nextMonth = new Date(todayMidnight);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            query.date = { $gte: todayMidnight, $lte: nextMonth };
        }

        const slots = await AppointmentSlot.find(query).sort({ date: 1, startTime: 1 });
        res.json({ success: true, slots });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Admin: Get all slots for a date
const getSlotsAdmin = async (req, res) => {
    try {
        const { date } = req.query;
        const now = new Date();
        now.setUTCHours(now.getUTCHours() + 5);
        now.setUTCMinutes(now.getUTCMinutes() + 30);
        const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        // Auto-delete past slots
        await AppointmentSlot.deleteMany({ date: { $lt: todayMidnight } });

        let query = {};
        if (date) {
            const d = new Date(date);
             d.setHours(0, 0, 0, 0);
             query.date = d;
        } else {
             query.date = { $gte: todayMidnight };
        }

        const slots = await AppointmentSlot.find(query).sort({ date: 1, startTime: 1 });
        res.json({ success: true, slots });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Admin: Delete a slot
const deleteSlot = async (req, res) => {
    try {
        const slot = await AppointmentSlot.findById(req.params.id);
        if (!slot) return res.status(404).json({ success: false, message: "Slot not found" });
        if (slot.booked > 0) return res.status(400).json({ success: false, message: "Cannot delete a slot that is already booked" });
        
        await AppointmentSlot.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Slot deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Admin: Get all appointments
const getAllAppointments = async (req, res) => {
    try {
        const { search, page = 1, limit = 7 } = req.query;
        let query = {};
        
        if (search) {
            const s = search.toLowerCase();
            const User = require("../models/userModel");
            const users = await User.find({ name: { $regex: s, $options: "i" } }, "_id");
            const userIds = users.map(u => u._id);
            query.userId = { $in: userIds };
        }

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        const skip = (parsedPage - 1) * parsedLimit;

        const totalAppointments = await Appointment.countDocuments(query);
        const totalPages = Math.ceil(totalAppointments / parsedLimit) || 1;

        const appointments = await Appointment.find(query)
            .populate("userId", "name email phone")
            .populate({ path: "orderId", select: "orderNumber status clothType" })
            .populate("slotId")
            .sort({ date: -1, time: -1 })
            .skip(skip)
            .limit(parsedLimit);
            
        res.json({ success: true, appointments, totalPages, currentPage: parsedPage });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
  generateSlots,
  getAvailableSlots,
  getSlotsAdmin,
  deleteSlot,
  getAllAppointments
};
