const VoterModel = require("../models/Voter");
const VoteModel = require("../models/Vote");

// Cast Vote
const castVote = async (req, res) => {
  try {
    const { voterId, voter_Name, candidateId, votedFor } = req.body;
    if (!voterId || !voter_Name || !candidateId || !votedFor) {
      return res.status(400).json({ message: "Missing required vote fields." });
    }

    // Check if already voted
    const existingVote = await VoteModel.findOne({ voterId });
    if (existingVote) {
      return res.status(400).json({ message: "You have already voted." });
    }

    // Save new vote
    const newVote = new VoteModel({
      voterId,
      voter_Name,
      candidateId,
      votedFor,
    });
    await newVote.save();

    // Update voter
    await VoterModel.findOneAndUpdate(
      { voterId },
      { $set: { hasVoted: true } },
      { new: true }
    );

    return res.status(201).json({ message: "Vote cast successfully!" });
  } catch (error) {
    console.error("Error casting vote:", error);
    return res
      .status(500)
      .json({ message: "Server error while casting vote." });
  }
};



module.exports = { castVote };
