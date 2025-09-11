const UserModel = require("../models/User");
const VoteModel = require("../models/Vote");
const castVote = async (req, res) => {
  try {
    const { voterId, voter_Name, candidateId, votedFor } = req.body;
    if (!voterId || !voter_Name || !candidateId || !votedFor) {
      return res.status(400).json({ message: "Missing required vote fields." });
    }

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

    await UserModel.findByIdAndUpdate(
      voterId,
      { hasVoted: true },
      { new: true }
    );

    return res.status(201).json({ message: "Vote cast successfully!" });
  } catch (error) {
    console.error("Error casting vote:", error); // log detailed error
    return res
      .status(500)
      .json({ message: "Server error while casting vote." });
  }
};

module.exports =  castVote ;
