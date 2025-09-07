const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  sendEmailVerification,
  verifyEmail,
  handleRegister,
  handleLogin,
} = require("../controllers/voterController");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files will be saved in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage: storage });

// @route   POST /voter/register
// @desc    Register a new voter with photo upload
// @access  Public
router.post("/register", upload.single("photo"), handleRegister);

// @route   POST /voter/login
// @desc    Login voter
// @access  Public
router.post("/login", handleLogin);

// @route   POST /voter/send-email-verification
// @desc    Send an OTP to the user's email
// @access  Public
router.post("/send-email-verification", sendEmailVerification);

// @route   POST /voter/verify-email
// @desc    Verify the OTP from the user's email
// @access  Public
router.post("/verify-email", verifyEmail);

module.exports = router;
