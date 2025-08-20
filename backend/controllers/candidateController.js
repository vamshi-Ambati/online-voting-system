const Candidate = require("../models/Candidate");
const Voter = require("../models/Voter");

// const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Add candidate
exports.addCandidate = async (req, res) => {
  try {
    const {
      name,
      party,
      email,
      mobile,
      address,
      education,
      experience,
      agenda,
    } = req.body;

    if (!req.files || !req.files.photoUrl || !req.files.partySymbolUrl) {
      return res
        .status(400)
        .json({ message: "Photo and Party Symbol are required." });
    }

    const photoPath = `/uploads/candidates/${req.files.photoUrl[0].filename}`;
    const symbolPath = `/uploads/candidates/${req.files.partySymbolUrl.filename}`;

    const candidate = new Candidate({
      name,
      party,
      photoUrl: photoPath,
      partySymbolUrl: symbolPath,
      email,
      mobile,
      address,
      education,
      experience,
      agenda,
    });

    await candidate.save();
    res
      .status(201)
      .json({ message: "Candidate added successfully!", candidate });
  } catch (err) {
    console.error("Error adding candidate:", err);
    res
      .status(500)
      .json({ message: "Failed to add candidate", error: err.message });
  }
};

// Get all candidates
exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    if (!candidates.length) {
      return res.status(404).json({ message: "No candidates found" });
    }
    res.status(200).json({ candidates });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get candidates", error: err.message });
  }
};

// Get all voters
exports.getAllVoters = async (req, res) => {
  try {
    const voters = await Voter.find({
      role: "voter",
      voterId: { $exists: true, $ne: "" },
    }).select("-__v -password");

    if (!voters.length) {
      return res.status(404).json({ message: "No registered voters found" });
    }

    res.status(200).json({ voters });
  } catch (err) {
    console.error("Error fetching voters:", err);
    res.status(500).json({ message: "Failed to fetch registered voters" });
  }
};
