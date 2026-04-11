const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });
const Order = require("./models/orderModel");
const OrderItem = require("./models/orderItemModel");

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for migration");
        
        const allOrders = await Order.find().lean();
        let migratedCount = 0;
        
        for (const order of allOrders) {
            const items = await OrderItem.find({ orderId: order._id });
            if (items.length === 0) {
                // This is a legacy order! Create an OrderItem for it.
                await OrderItem.create({
                    orderId: order._id,
                    clothType: order.clothType || "Unknown Type",
                    customClothType: order.customClothType || "",
                    fabricType: order.fabricType || "",
                    color: order.color || "",
                    measurement: order.measurement || {},
                    specialInstructions: order.specialInstructions || "",
                    price: order.price || 500,
                    status: order.status || "Pending",
                    quantity: order.quantity || 1
                });
                migratedCount++;
            }
        }
        
        console.log(`Successfully migrated ${migratedCount} legacy orders!`);
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
