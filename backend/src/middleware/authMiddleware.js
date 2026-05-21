const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "aquafine_dev_secret");
    let user = await User.findById(decoded.id).select("-password");

    if (!user) {
      user = await Admin.findById(decoded.id).select("-password");
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid session" });
    }

    req.user = user;
    next();
  } catch (_error) {
    res.status(401).json({ message: "Invalid session" });
  }
};

module.exports = { protect };
