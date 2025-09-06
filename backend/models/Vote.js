const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voter",
    required: true,
    unique: true,
  },
  voter_Name: { type: String, required: true },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate",
    required: true,
  },
  votedFor: { type: String, required: true },
  votedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vote", voteSchema);
