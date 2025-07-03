const candidateModel = require("../models/Candidate");

const handleGetAllCandidates = async (req, res) => {
  try {
    const candidates = await candidateModel.find(); // or .sort({ votes: -1 })
    res.json({candidates}); // Return array directly
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
};

const addCandidates = async (req, res) => {
  try {
    const { name, party, description, photoUrl } = req.body;
    if (!name || !party) {
      return res
        .status(400)
        .json({ message: "Candidate and party are required" });
    }
    const newCandidate = new candidateModel({
      name,
      party,
      description,
      photoUrl,
    });
    await newCandidate.save();
    res.status(201).json(newCandidate);
  } catch (error) {
    console.error("Error adding candidate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  handleGetAllCandidates,
  addCandidates,
};
