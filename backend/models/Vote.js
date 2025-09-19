const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  voterId: { type: String, required: true }, // ✅ store custom voterId
  voter_Name: { type: String, required: true },
  candidateId: { type: String, required: true }, // candidate._id can also be string
  votedFor: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vote", voteSchema);
