const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    party: { type: String, required: true },
    photoUrl: { type: String, required: true }, // Will store file path or URL
    partySymbolUrl: { type: String, required: true }, // Will store file path or URL

    email: { type: String },
    mobile: { type: String },
    address: { type: String },
    education: { type: String },
    experience: { type: String },
    agenda: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);
