const Order = require("../models/Order");
const Payment = require("../models/Payment");

const createOrder = async (req, res) => {
  try {
    const { cartItems, totalAmount, razorpayOrderId, razorpayPaymentId, customerDetails } = req.body;
    const userId = req.user._id;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ message: "Payment tracking identifiers are required" });
    }

    const customerName = customerDetails?.fullName || req.user.fullName || "Guest Customer";
    const email = customerDetails?.email || req.user.email || "N/A";
    const mobileNumber = customerDetails?.mobile || req.user.mobile || "N/A";

    // Format products list for storage
    const formattedProducts = cartItems.map((p) => ({
      name: p.name,
      quantity: p.quantity || 1,
      price: p.price,
    }));

    // 1. Create the Order in MongoDB
    const order = await Order.create({
      user: userId,
      customerName,
      email,
      mobileNumber,
      products: formattedProducts,
      totalAmount,
      razorpayOrderId,
      razorpayPaymentId,
      paymentStatus: "success",
      orderStatus: "Pending",
    });

    // 2. Create the associated Payment record
    await Payment.create({
      order: order._id,
      user: userId,
      razorpayOrderId,
      razorpayPaymentId,
      amount: totalAmount,
      status: "success",
    });

    console.log(`Saved live order ${order._id} for customer ${customerName} to MongoDB.`);

    res.status(201).json({
      success: true,
      message: "Order placed and payment details captured successfully in database",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Failed to save successful order:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to save order/payment state in backend database",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
};
