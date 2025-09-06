const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
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

// @route   POST /api/auth/register
// @desc    Register a new voter with photo upload
// @access  Public
// Use the 'upload.single' middleware to handle the photo file
router.post("/register", upload.single("photo"), handleRegister);

// @route   POST /api/auth/login
// @desc    Login voter
// @access  Public
router.post("/login", handleLogin);

module.exports = router;
