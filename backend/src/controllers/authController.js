const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

const formatUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  mobile: user.mobile,
  isVerified: user.isVerified,
  addresses: user.addresses || [],
});

const buildVerificationEmail = ({ fullName, verificationUrl }) => `
  <div style="margin:0;padding:0;background:#f4f7f8;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;padding:32px 18px;">
      <div style="background:linear-gradient(135deg,#083d4a,#0f766e,#c89b2c);border-radius:24px 24px 0 0;padding:28px;color:#fff;">
        <h1 style="margin:0;font-size:28px;letter-spacing:.2px;">Aquafine</h1>
        <p style="margin:8px 0 0;font-size:14px;opacity:.86;">Premium bottled water</p>
      </div>
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 24px 24px;padding:28px;">
        <h2 style="margin:0 0 12px;font-size:22px;color:#0f172a;">Verify your account</h2>
        <p style="margin:0 0 16px;line-height:1.6;color:#475569;">Hi ${fullName}, welcome to Aquafine. Please verify your email address to activate your account and continue shopping.</p>
        <a href="${verificationUrl}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:800;border-radius:14px;padding:13px 22px;margin:10px 0 18px;">Verify Email</a>
        <p style="margin:0;line-height:1.6;color:#64748b;font-size:13px;">If the button does not work, open this link in your browser:<br/><span style="color:#0f766e;">${verificationUrl}</span></p>
      </div>
    </div>
  </div>
`;

const register = async (req, res) => {
  try {
    const { fullName, email, mobile, password, confirmPassword } = req.body;

    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({
      $or: [{ mobile }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`[SIGNUP] Creating database record for email: ${email}, mobile: ${mobile}`);
    const user = await User.create({
      fullName,
      email,
      mobile,
      password: hashedPassword,
      isVerified: false,
    });
    console.log(`[SIGNUP SUCCESS] User created in database with ID: ${user._id}, isVerified: ${user.isVerified}`);

    console.log(`[SIGNUP] Generating verification token for user ID: ${user._id}`);
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "aquafine_dev_secret",
      { expiresIn: "1d" }
    );

    const verificationUrl = `${req.protocol}://${req.get("host")}/api/auth/verify/${verificationToken}`;
    console.log(`[SIGNUP] Generated verification URL: ${verificationUrl}`);

    try {
      console.log(`[SIGNUP] Triggering email delivery to: ${user.email}`);
      console.log(`[SIGNUP] Verification token passed to email service: ${verificationToken}`);
      await sendEmail({
        to: user.email,
        subject: "Verify your Aquafine account",
        html: buildVerificationEmail({ fullName: user.fullName, verificationUrl }),
        verificationToken,
      });
      console.log(`[SIGNUP] Verification email successfully sent to ${user.email}`);
    } catch (emailError) {
      console.error(`[SIGNUP ERROR] Email sending failed: ${emailError.message}`);
      console.log(`[DEV/TEST ONLY] Copy & paste this URL into browser to verify: ${verificationUrl}`);
    }

    res.status(201).json({
      success: true,
      message: "Verification email sent. Please verify your email before login.",
    });
  } catch (error) {
    console.error("Registration failed:", error.message);

    res.status(500).json({
      message: "Registration failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Started login check for mobile: ${mobile}`);

    // Admin shortcut: check env vars for admin login
    const adminId = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (adminId && adminPass && mobile === adminId) {
      console.log(`[LOGIN] Checking admin login attempt for ID: ${mobile}`);
      if (password !== adminPass) {
        console.warn(`[LOGIN REJECTED] Admin password mismatch for ID: ${mobile}`);
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      console.log(`[LOGIN SUCCESS] Admin logged in successfully.`);
      const token = generateToken("admin");
      return res.json({
        token,
        user: { id: "admin", fullName: "Administrator", email: "", mobile: adminId, isVerified: true },
      });
    }

    if (!mobile || !password) {
      console.warn("[LOGIN REJECTED] Missing mobile or password parameter");
      return res
        .status(400)
        .json({ message: "Mobile number and password required" });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      console.warn(`[LOGIN REJECTED] Mobile number not found in database: ${mobile}`);
      return res
        .status(404)
        .json({ message: "Mobile number is not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[LOGIN REJECTED] Password mismatch for mobile: ${mobile}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log(`[LOGIN] User found: ${user._id}. Email: ${user.email}, isVerified: ${user.isVerified}`);
    if (!user.isVerified) {
      console.warn(`[LOGIN REJECTED] Blocked unverified user from logging in. UserID: ${user._id}`);
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in." });
    }

    console.log(`[LOGIN SUCCESS] Token issued for user ID: ${user._id}, Mobile: ${mobile}`);
    res.json({
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (error) {
    console.error(`[LOGIN ERROR] Login function error: ${error.message}`);
    res.status(500).json({ message: "Login failed" });
  }
};

const verifyEmail = async (req, res) => {
  console.log(`[VERIFICATION ATTEMPT] Received email verification request with token: ${req.params.token}`);
  try {
    const decoded = jwt.verify(
      req.params.token,
      process.env.JWT_SECRET || "aquafine_dev_secret",
    );
    console.log(`[VERIFICATION] Decoded token payload user ID: ${decoded.id}`);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      console.warn(`[VERIFICATION REJECTED] No user associated with ID: ${decoded.id}`);
      return res.status(404).send("Invalid verification link");
    }

    console.log(`[VERIFICATION] Previous status isVerified for User ${user._id} was: ${user.isVerified}`);
    user.isVerified = true;
    await user.save();
    console.log(`[VERIFICATION SUCCESS] User verified successfully in database: ${user._id}, email: ${user.email}`);

    res.send(`
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f7f8;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:420px;background:#fff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;text-align:center;">
          <h1 style="color:#0f766e;margin:0 0 10px;">Aquafine</h1>
          <h2 style="color:#0f172a;margin:0 0 12px;">Email verified</h2>
          <p style="color:#64748b;line-height:1.6;margin:0;">Your account is active. You can now login in the Aquafine app.</p>
        </div>
      </div>
    `);
  } catch (_error) {
    res.status(400).send("Invalid or expired verification link");
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  res.json({ message: "Password reset request accepted" });
};

const me = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, email, mobile } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      user.email = email;
    }

    if (mobile && mobile !== user.mobile) {
      const mobileExists = await User.findOne({ mobile });
      if (mobileExists) {
        return res.status(400).json({ message: "Mobile number is already in use" });
      }
      user.mobile = mobile;
    }

    if (fullName) user.fullName = fullName;

    await user.save();
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const { fullName, addressLine, city, state, pincode, phone, latitude, longitude, isDefault } = req.body;

    if (!fullName || !addressLine || !city || !state || !pincode || !phone) {
      return res.status(400).json({ message: "All required address fields must be filled" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({
      fullName,
      addressLine,
      city,
      state,
      pincode,
      phone,
      latitude,
      longitude,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();
    res.status(201).json({
      success: true,
      message: "Address added successfully",
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add address", error: error.message });
  }
};

const editAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { fullName, addressLine, city, state, pincode, phone, latitude, longitude, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (fullName) address.fullName = fullName;
    if (addressLine) address.addressLine = addressLine;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (phone) address.phone = phone;
    if (latitude !== undefined) address.latitude = latitude;
    if (longitude !== undefined) address.longitude = longitude;

    if (isDefault !== undefined) {
      address.isDefault = isDefault;
      if (isDefault) {
        user.addresses.forEach(addr => {
          if (addr._id.toString() !== addressId) {
            addr.isDefault = false;
          }
        });
      }
    }

    await user.save();
    res.json({
      success: true,
      message: "Address updated successfully",
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to edit address", error: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({
      success: true,
      message: "Address deleted successfully",
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete address", error: error.message });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyEmail,
  me,
  getUsers,
  updateProfile,
  addAddress,
  editAddress,
  deleteAddress,
};

