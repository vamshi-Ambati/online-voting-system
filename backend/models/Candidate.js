// models/Candidate.js
const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema(
  {
    name: String,
    party: String,
    email: String,
    mobile: String,
    address: String,
    education: String,
    experience: String,
    agenda: String,
    photo: {
      data: Buffer,
      contentType: String,
    },
    partySymbol: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", CandidateSchema);
