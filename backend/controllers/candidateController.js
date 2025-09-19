// controllers/candidateController.js
const Candidate = require("../models/Candidate");
const Voter = require("../models/Voter");
const fs = require("fs");

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

    if (!req.files || !req.files.photo || !req.files.partySymbol) {
      return res
        .status(400)
        .json({ message: "Candidate photo and party symbol are required." });
    }

    // Read files into buffer
    const photo = {
      data: fs.readFileSync(req.files.photo[0].path),
      contentType: req.files.photo[0].mimetype,
    };

    const partySymbol = {
      data: fs.readFileSync(req.files.partySymbol[0].path),
      contentType: req.files.partySymbol[0].mimetype,
    };

    const candidate = new Candidate({
      name,
      party,
      email,
      mobile,
      address,
      education,
      experience,
      agenda,
      photo,
      partySymbol,
    });

    await candidate.save();

    res.status(201).json({
      message: "Candidate added successfully!",
      candidate,
    });
  } catch (err) {
    console.error("Error adding candidate:", err);
    res.status(500).json({
      message: "Failed to add candidate",
      error: err.message,
    });
  }
};

// Get all candidates (convert images to base64 for frontend)
exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    if (!candidates.length) {
      return res.status(404).json({ message: "No candidates found" });
    }

    const formatted = candidates.map((c) => ({
      ...c._doc,
      photo: c.photo?.data
        ? `data:${c.photo.contentType};base64,${c.photo.data.toString(
            "base64"
          )}`
        : null,
      partySymbol: c.partySymbol?.data
        ? `data:${
            c.partySymbol.contentType
          };base64,${c.partySymbol.data.toString("base64")}`
        : null,
    }));

    res.status(200).json({ candidates: formatted });
  } catch (err) {
    res.status(500).json({
      message: "Failed to get candidates",
      error: err.message,
    });
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
