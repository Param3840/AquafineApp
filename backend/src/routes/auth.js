const express = require("express");
const {
  forgotPassword,
  login,
  me,
  register,
  verifyEmail,
  getUsers,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/verify/:token", verifyEmail);
router.get("/me", protect, me);
router.get("/users", protect, getUsers);

module.exports = router;
