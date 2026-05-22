const razorpayInstance = require("../config/razorpay");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount specified",
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    console.log("Creating Razorpay order with:", options);

    const order = await razorpayInstance.orders.create(options);

    console.log("Razorpay order created successfully:", order);

    res.status(201).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log("FULL RAZORPAY ERROR:");
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Payment order creation failed",
      error: error.message,
    });
  }
};

const saveOrder = async (req, res) => {
  try {
    const { products, totalAmount, razorpayOrderId, razorpayPaymentId, deliveryAddress } = req.body;
    const userId = req.user._id;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ message: "Payment tracking identifiers are required" });
    }

    const customerName = req.user.fullName || "Guest Customer";
    const mobileNumber = req.user.mobile || "N/A";
    const fallbackAddress = {
      fullName: customerName,
      mobile: mobileNumber,
      houseFlat: "N/A",
      areaStreet: "N/A",
      landmark: "N/A",
      city: "N/A",
      state: "N/A",
      pincode: "000000",
      addressType: "Home"
    };

    const finalDeliveryAddress = deliveryAddress || fallbackAddress;

    // Format products list for storage
    const formattedProducts = products.map((p) => ({
      name: p.name,
      quantity: p.quantity || 1,
      price: p.price,
    }));

    // 1. Create the Order
    const order = await Order.create({
      user: userId,
      products: formattedProducts,
      totalAmount,
      razorpayOrderId,
      razorpayPaymentId,
      paymentStatus: "Success", // since Razorpay payment already succeeded on client
      orderStatus: "Pending", // initial state
      deliveryAddress: finalDeliveryAddress,
    });

    // 2. Create the Payment
    const payment = await Payment.create({
      order: order._id,
      user: userId,
      razorpayOrderId,
      razorpayPaymentId,
      amount: totalAmount,
      status: "captured", // Captured successfully
    });

    console.log(`Saved order ${order._id} and payment for user ${userId}`);

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
  saveOrder,
};
