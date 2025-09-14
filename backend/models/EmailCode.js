const mongoose = require("mongoose");

const emailCodeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // expires after 5 mins
});

// Model registration - avoids overwrite error in dev mode / hot reloads
module.exports = mongoose.model("EmailCode", emailCodeSchema);
