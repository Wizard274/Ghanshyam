
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: __dirname + "/.env" });

const userSchema = new mongoose.Schema({
  name: String, phone: String, email: { type: String, unique: true },
  password: String, address: String, role: { type: String, default: "user" },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ email: "ghanshyamladiestailor21@gmail.com" });
    if (existing) {
      console.log("ℹ️  Admin already exists:", existing.email);
      process.exit(0);
    }

    const hashed = await bcrypt.hash("@Ghanshyam21", 10);
    await User.create({
      name: "Ghanshyam Admin",
      phone: "8160942724",
      email: "ghanshyamladiestailor21@gmail.com",
      password: hashed,
      address: "Shop no:-21, Gigev Park, Opposite Uttamnagar, Ratanpark Road, Bapunagar, Ahmedabad.",
      role: "admin",
      isVerified: true,
    });

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seedAdmin();
