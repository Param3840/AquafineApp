const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Order = require("../models/Order");
const User = require("../models/User");
const Payment = require("../models/Payment");
const generateToken = require("../utils/generateToken");

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid administrator credentials" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid administrator credentials" });
    }

    const token = generateToken(admin._id);

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login failed:", error.message);
    res.status(500).json({ message: "Administrator authentication failed" });
  }
};

// Dashboard Analytics
const getAnalytics = async (req, res) => {
  try {
    // 1. Live statistics from collections
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: "Pending" });
    const deliveredOrders = await Order.countDocuments({ orderStatus: "Delivered" });
    const successfulPaymentsCount = await Order.countDocuments({ paymentStatus: { $in: ["Success", "success"] } });

    // Calculate real revenue from successful payments
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: { $in: ["Success", "success"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Calculate dynamic product configuration ratios for funnel share
    // We will aggregate order products to count standard vs customized packages
    const ordersWithProducts = await Order.find({}, "products");
    let customizedCount = 0;
    let eventCount = 0;
    let retailCount = 0;
    let totalItems = 0;

    ordersWithProducts.forEach((o) => {
      o.products.forEach((p) => {
        const name = p.name.toLowerCase();
        const qty = p.quantity || 1;
        totalItems += qty;
        if (name.includes("custom") || name.includes("branding")) {
          customizedCount += qty;
        } else if (name.includes("event") || name.includes("celebration")) {
          eventCount += qty;
        } else {
          retailCount += qty;
        }
      });
    });

    const customShare = totalItems > 0 ? Math.round((customizedCount / totalItems) * 100) : 60;
    const eventShare = totalItems > 0 ? Math.round((eventCount / totalItems) * 100) : 25;
    const retailShare = totalItems > 0 ? 100 - customShare - eventShare : 15;

    // 2. Compile Recent Operations Feed (combining latest orders/payments)
    const latestOrders = await Order.find()
      .populate("user", "fullName email mobile")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = latestOrders.map((o) => {
      // Products string summary
      const itemsSummary = o.products
        .map((p) => `${p.quantity} x ${p.name}`)
        .join(", ");

      const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return "Just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(date).toLocaleDateString();
      };

      return {
        id: o._id,
        customer: o.customerName || o.user?.fullName || "Guest Customer",
        type: "Order Placed",
        detail: itemsSummary || `${o.totalAmount} pack purchase`,
        time: timeAgo(o.createdAt),
        status: o.orderStatus.toLowerCase() === "delivered" ? "completed" : "pending",
      };
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        successfulPaymentsCount,
        totalRevenue,
        productShares: {
          customShare,
          eventShare,
          retailShare,
        },
      },
      recentActivities,
    });
  } catch (error) {
    console.error("Failed to compile dashboard metrics:", error.message);
    res.status(500).json({ message: "Dashboard calculations failed" });
  }
};

// Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullName email mobile")
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((o) => ({
      id: o._id,
      customer: o.customerName || o.user?.fullName || "Guest Customer",
      mobile: o.mobileNumber || o.user?.mobile || "N/A",
      email: o.email || o.user?.email || "N/A",
      date: new Date(o.createdDate || o.createdAt).toISOString().split("T")[0],
      items: o.products.map((p) => `${p.name} (x${p.quantity})`).join(", "),
      total: o.totalAmount,
      payment: o.razorpayPaymentId || "N/A",
      status: o.orderStatus,
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Retrieve orders failed:", error.message);
    res.status(500).json({ message: "Failed to query orders database" });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status state" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order record not found" });
    }

    res.json({ success: true, message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Order status update failed:", error.message);
    res.status(500).json({ message: "Failed to persist status change" });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });

    // Aggregate orders count for each user
    const usersWithOrdersCount = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({ user: u._id });
        return {
          id: u._id,
          fullName: u.fullName,
          email: u.email,
          mobile: u.mobile,
          isVerified: u.isVerified,
          totalOrders: orderCount,
        };
      })
    );

    res.json(usersWithOrdersCount);
  } catch (error) {
    console.error("Failed to query users database:", error.message);
    res.status(500).json({ message: "Failed to retrieve user database records" });
  }
};

// Get All Payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "fullName email mobile")
      .populate("order", "_id")
      .sort({ createdAt: -1 });

    const formattedPayments = payments.map((p) => ({
      id: p.razorpayPaymentId,
      orderId: p.order?._id || "N/A",
      customer: p.user?.fullName || "Guest Customer",
      amount: p.amount,
      method: "Razorpay Gateway",
      date: new Date(p.createdAt).toISOString().replace("T", " ").substring(0, 16),
      status: p.status === "captured" || p.status === "captured" || p.status.toLowerCase() === "success" || p.status.toLowerCase() === "captured" ? "Captured" : "Failed",
    }));

    res.json(formattedPayments);
  } catch (error) {
    console.error("Retrieve payments failed:", error.message);
    res.status(500).json({ message: "Failed to query payments database" });
  }
};

module.exports = {
  adminLogin,
  getAnalytics,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getAllPayments,
};
