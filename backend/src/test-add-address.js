const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const { addAddress } = require("./controllers/authController");

async function runTest() {
  console.log("Connecting to database...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  // Create a dummy user
  const uniqueId = Date.now().toString().slice(-6);
  const user = await User.create({
    fullName: `Test Address User ${uniqueId}`,
    email: `test_addr_${uniqueId}@gmail.com`,
    mobile: `98${uniqueId}22`,
    password: "hashedpassword123",
    isVerified: true
  });
  console.log(`User created: ${user._id}`);

  // Construct request body exactly like frontend CheckoutScreen.js payload
  const payload = {
    fullName: "param",
    mobile: "8287784156",
    houseFlat: "16th park view Gaur Yamuna City",
    areaStreet: "Sector 19a",
    landmark: "Tiku",
    city: "Greater Noida",
    state: "Uttar Pradesh",
    pincode: "203201",
    addressType: "Home",
    isDefault: true
  };

  // Mock req and res
  let responseCode = null;
  let responseData = null;

  const req = {
    user: user,
    body: payload
  };

  const res = {
    status(code) {
      responseCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    }
  };

  console.log("Calling addAddress controller...");
  await addAddress(req, res);

  console.log("Response Status:", responseCode);
  console.log("Response Data:", responseData);

  // Clean up
  await User.deleteOne({ _id: user._id });
  await mongoose.connection.close();
  console.log("Disconnected and cleaned up.");
}

runTest().catch(err => {
  console.error("Error running test:", err);
  mongoose.connection.close();
});
