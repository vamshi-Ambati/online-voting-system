const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 300, // This is a TTL (Time-To-Live) index. The document will expire after 5 minutes (300 seconds)
    default: Date.now,
  },
});

module.exports = mongoose.model("OTP", otpSchema);
