const express = require("express");
const {
  forgotPassword,
  login,
  me,
  register,
  verifyEmail,
  getUsers,
  updateProfile,
  addAddress,
  editAddress,
  deleteAddress,
  validateSession,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/verify/:token", verifyEmail);
router.get("/validate-session", validateSession);
router.get("/me", protect, me);
router.get("/users", protect, getUsers);

// Profile and Addresses CRUD
router.put("/profile", protect, updateProfile);
router.post("/addresses", protect, addAddress);
router.put("/addresses/:addressId", protect, editAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

module.exports = router;
