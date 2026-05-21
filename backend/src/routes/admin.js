const express = require("express");
const {
  adminLogin,
  getAnalytics,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getAllPayments,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/login", adminLogin);

// Protected routes (require JWT verification)
router.get("/analytics", protect, getAnalytics);
router.get("/orders", protect, getAllOrders);
router.put("/orders/:id/status", protect, updateOrderStatus);
router.get("/users", protect, getAllUsers);
router.get("/payments", protect, getAllPayments);

module.exports = router;
