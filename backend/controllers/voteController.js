const voteModel = require("../models/Vote");

const handleCastVote = async (req, res) => {
  const { voterId, voter_Name, candidateId, votedFor } = req.body;
  console.log("Received vote request:", req.body);

  if (!voterId || !candidateId || !voter_Name || !votedFor) {
    return res
      .status(400)
      .json({ message: "Voter ID, name, and Candidate ID are required." });
  }

  try {
    // Check if voter has already voted
    const existingVote = await voteModel.findOne({ voterId });
    if (existingVote) {
      return res.status(400).json({ message: "You have already voted." });
    }

    // Save the vote
    const newVote = new voteModel({
      voterId,
      voter_Name,
      candidateId,
      votedFor,
    });
    await newVote.save();

    res.status(201).json({ message: "Vote cast successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error while casting vote." });
  }
};

module.exports = {
  handleCastVote,
};
