const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/aquafine";
  await mongoose.connect(uri);
  console.log("MongoDB connected");

  // Auto-seed administrator "Shivam Singh"
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log("No administrators found. Seeding default administrator Shivam Singh...");
      const email = process.env.ADMIN_EMAIL || "shivam@aquafine.com";
      const password = process.env.ADMIN_PASSWORD || "raja";
      const hashedPassword = await bcrypt.hash(password, 10);

      await Admin.create({
        fullName: "Shivam Singh",
        email: email,
        password: hashedPassword,
      });
      console.log(`Administrator seeded successfully! Email: ${email}`);
    }
  } catch (error) {
    console.error("Failed to seed default administrator:", error.message);
  }
};

module.exports = connectDB;
