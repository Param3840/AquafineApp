const express = require("express");
const { createOrder, saveOrder } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/save-order", protect, saveOrder);

module.exports = router;
