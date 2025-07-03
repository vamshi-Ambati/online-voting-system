const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "candidate"], required: true },
  voteId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const voterModel = mongoose.model("Voter", voterSchema);

module.exports = voterModel;
