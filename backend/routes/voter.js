const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  handleRegister,
  handleLogin,
  sendEmailVerification,
  verifyEmail,
  sendMobileOtp,
  verifyMobileOtp,
  // getVoterPhoto,
} = require("../controllers/voterController");

// Configure Multer for temporary file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "tmp/"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// Ensure tmp folder exists
const fs = require("fs");
if (!fs.existsSync("tmp")) fs.mkdirSync("tmp", { recursive: true });

// -------------------- ROUTES -------------------- //
// Register voter with photo upload
router.post("/register", upload.single("photo"), handleRegister);

// Login
router.post("/login", handleLogin);

// Email verification
router.post("/send-email-verification", sendEmailVerification);
router.post("/verify-email", verifyEmail);

// Mobile OTP
router.post("/send-mobile-otp", sendMobileOtp);
router.post("/verify-mobile-otp", verifyMobileOtp);

// Get voter photo
// router.get("/voter-photo/:id", getVoterPhoto);

module.exports = router;
