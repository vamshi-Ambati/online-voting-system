const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");

const getElectionResults = async (req, res) => {
  try {
    // Aggregate votes per candidate
    const voteCounts = await Vote.aggregate([
      {
        $group: {
          _id: "$candidateId",
          votes: { $sum: 1 }
        }
      }
    ]);

    // Fetch all candidates
    const candidates = await Candidate.find();
    // console.log(candidates);
    

    // Calculate total votes
    const totalVotes = voteCounts.reduce((sum, c) => sum + c.votes, 0);

    // Map candidateId to vote count
    const voteMap = {};
    voteCounts.forEach(vc => {
      voteMap[vc._id.toString()] = vc.votes;
    });

    // Prepare results array
    const results = candidates.map(candidate => {
      const votes = voteMap[candidate._id.toString()] || 0;
      return {
        id: candidate._id,
        candidate: candidate.candidate,
        party: candidate.party,
        partyImg: candidate.partySymbolUrl,
        // color: candidate.color,
        votes,
        percentage: totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0,
        status: candidate.status || "", // Optional: you can set status logic here
      };
    });

    // Sort by votes descending
    results.sort((a, b) => b.votes - a.votes);

    // Optionally, set status for winner/others
    if (results.length > 0) {
      results[0].status = "ELECTED";
      for (let i = 1; i < results.length; i++) {
        if (!results[i].status || results[i].status === "ELECTED") {
          results[i].status = "CONCEDED";
        }
      }
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating results." });
  }
};

module.exports = {
  getElectionResults,
};
