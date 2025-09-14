const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  voterId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "voter" },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  aadhaar: { type: String, required: true, unique: true }, // ✅ Added Aadhaar
  mobile: { type: String, required: true, unique: true },
  photo: { type: String, required: true },
  faceDescriptor: { type: [Number], required: true },
});

module.exports = mongoose.model("Voter", voterSchema);
