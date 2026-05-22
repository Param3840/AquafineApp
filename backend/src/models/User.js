const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    addresses: [
      {
        fullName: { type: String, required: true },
        mobile: { type: String, required: true },
        houseFlat: { type: String, required: true },
        areaStreet: { type: String, required: true },
        landmark: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        addressType: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
        latitude: { type: Number },
        longitude: { type: Number },
        isDefault: { type: Boolean, default: false },
      }
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
