const UserModel = require("../models/User");
const VoteModel = require("../models/Vote");

const castVote = async (req, res) => {
  const { voterId, voter_Name, candidateId, votedFor } = req.body;

  if (!voterId || !voter_Name || !candidateId || !votedFor) {
    return res.status(400).json({ message: "Missing required vote fields." });
  }

  try {
    const existingVote = await VoteModel.findOne({ voterId });
    if (existingVote) {
      return res.status(400).json({ message: "You have already voted." });
    }

    const newVote = new VoteModel({
      voterId,
      voter_Name,
      candidateId,
      votedFor,
    });
    await newVote.save();

    // Update user's vote status
    await UserModel.findByIdAndUpdate(
      voterId,
      { hasVoted: true },
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

module.exports =  castVote ;
