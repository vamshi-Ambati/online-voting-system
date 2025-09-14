const mongoose = require("mongoose");

const mobileOtpSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // expires after 5 mins
});

// Model registration with same pattern to avoid overwrite errors
module.exports = mongoose.model("MobileOTP", mobileOtpSchema);
