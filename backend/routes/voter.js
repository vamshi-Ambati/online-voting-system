const express = require("express");
const router = express.Router();
const {
  handleRegister,
  handleLogin,
} = require("../controllers/voterController");

// @route   POST /api/auth/register
// @desc    Register a new voter
// @access  Public
router.post("/register", handleRegister);

// @route   POST /api/auth/login
// @desc    Login voter
// @access  Public
router.post("/login", handleLogin);

module.exports = router;
