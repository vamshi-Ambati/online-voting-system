// routes/voter.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const {
  sendEmailVerification,
  verifyEmail,
  handleRegister,
  handleLogin,
  sendMobileOtp,
  verifyMobileOtp,
} = require("../controllers/voterController");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "voters");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
});

// ✅ Register voter with photo upload (do not delete after success!)
router.post("/register", upload.single("photo"), async (req, res, next) => {
  try {
    await handleRegister(req, res);
    // No file deletion here — controller handles cleanup on errors
  } catch (err) {
    next(err);
  }
});

// Login
router.post("/login", handleLogin);

// Email verification
router.post("/send-email-verification", sendEmailVerification);
router.post("/verify-email", verifyEmail);

// Mobile OTP
router.post("/send-mobile-otp", sendMobileOtp);
router.post("/verify-mobile-otp", verifyMobileOtp);

module.exports = router;
