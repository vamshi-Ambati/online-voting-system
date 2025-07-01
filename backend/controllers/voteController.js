const voteModel = require("../models/Vote");

const handleCastVote = async (req, res) => {
  const { voterId, voterEmail, candidateId, votedFor } = req.body;
  console.log("Received vote request:", req.body);

  if (!voterId || !candidateId || !voterEmail || !votedFor) {
    return res
      .status(400)
      .json({ message: "Voter ID, email, and Candidate ID are required." });
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
      voterEmail,
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
