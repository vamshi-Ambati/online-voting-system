const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const VoterModel = require("../models/Voter");

// GET /api/results
const getElectionResults = async (req, res) => {
  try {
    // 1. Total registered voters
    const totalVoters = await VoterModel.countDocuments();

    // 2. Aggregate votes per candidate
    const voteCounts = await Vote.aggregate([
      {
        $group: {
          _id: "$candidateId",
          votes: { $sum: 1 },
        },
      },
    ]);

    // 3. Fetch all candidates
    const candidates = await Candidate.find();

    // 4. Map candidateId to vote count
    const voteMap = {};
    voteCounts.forEach((vc) => {
      voteMap[vc._id.toString()] = vc.votes;
    });

    // 5. Total votes & turnout
    const totalVotes = voteCounts.reduce((sum, c) => sum + c.votes, 0);
    const turnout =
      totalVoters > 0
        ? Number(((totalVotes / totalVoters) * 100).toFixed(1))
        : 0;

    // 6. Prepare results array
    const results = candidates.map((candidate) => {
      const votes = voteMap[candidate._id.toString()] || 0;

      // Convert partySymbol binary to Base64 if exists
      let partyImgBase64 = null;
      if (candidate.partySymbol && candidate.partySymbol.data) {
        partyImgBase64 = `data:${
          candidate.partySymbol.contentType
        };base64,${candidate.partySymbol.data.toString("base64")}`;
      }

      return {
        id: candidate._id.toString(),
        candidate: candidate.candidate,
        party: candidate.party,
        partyImg: partyImgBase64,
        votes,
        percentage:
          totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0,
        status: "ELECTED", // you can adjust according to your logic
        color: candidate.color || "#888", // optional for chart colors
      };
    });

    // 7. Sort descending by votes
    results.sort((a, b) => b.votes - a.votes);

    // 8. Send response
    res.json({
      results,
      totalVoters,
      totalVotes,
      turnout,
    });
  } catch (err) {
    console.error("Error generating election results:", err);
    res.status(500).json({ message: "Error generating election results." });
  }
};

module.exports = {
  getElectionResults,
};
