const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  voterId: {
    type: String, // Use String if your IDs are not MongoDB ObjectIds
    required: true,
    unique: true, // Each voter can only vote once
  },
  voterEmail: {
    type: String,
    required: true,
  },
  candidateId: {
    type: String, // Use String if your IDs are not MongoDB ObjectIds
    required: true,
  },
  votedFor: {
    type: String,
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
});

const Vote = mongoose.model("Vote", voteSchema);
module.exports = Vote;
