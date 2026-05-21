require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");
const orderRoutes = require("./routes/order");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Aquafine backend running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed", error.message);
    process.exit(1);
  });
