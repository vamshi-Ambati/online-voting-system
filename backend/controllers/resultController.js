const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const VoterModel = require("../models/Voter");
const { sendResultsEmailMessage } = require("../utils/rabbitmq");

// GET /api/results
const getElectionResults = async (req, res) => {
  try {
    const totalVoters = await VoterModel.countDocuments();
    const voteCounts = await Vote.aggregate([
      {
        $group: {
          _id: "$candidateId",
          votes: { $sum: 1 },
        },
      },
    ]);
    const candidates = await Candidate.find();
    const voteMap = {};
    voteCounts.forEach((vc) => {
      voteMap[vc._id.toString()] = vc.votes;
    });
    const totalVotes = voteCounts.reduce((sum, c) => sum + c.votes, 0);
    const turnout =
      totalVoters > 0
        ? Number(((totalVotes / totalVoters) * 100).toFixed(1))
        : 0;

    const results = candidates.map((candidate) => {
      const votes = voteMap[candidate._id.toString()] || 0;
      let partyImgBase64 = null;
      if (candidate.partySymbol && candidate.partySymbol.data) {
        partyImgBase64 = `data:${
          candidate.partySymbol.contentType
        };base64,${candidate.partySymbol.data.toString("base64")}`;
      }
      return {
        id: candidate._id.toString(),
        candidate: candidate.name,
        party: candidate.party,
        partyImg: partyImgBase64,
        votes,
        percentage:
          totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0,
        status: "ELECTED",
        color: candidate.color || "#888",
      };
    });

    results.sort((a, b) => b.votes - a.votes);

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

const publishElectionResults = async (req, res) => {
  try {
    const totalVoters = await VoterModel.countDocuments();
    const voteCounts = await Vote.aggregate([
      {
        $group: {
          _id: "$candidateId",
          votes: { $sum: 1 },
        },
      },
    ]);
    const candidates = await Candidate.find();
    const totalVotes = voteCounts.reduce((sum, c) => sum + c.votes, 0);

    const voteMap = {};
    voteCounts.forEach((vc) => {
      voteMap[vc._id.toString()] = vc.votes;
    });

    const results = candidates.map((candidate) => ({
      name: candidate.name,
      party: candidate.party,
      votes: voteMap[candidate._id.toString()] || 0,
    }));
    results.sort((a, b) => b.votes - a.votes);

    const winner = results.length > 0 ? results[0] : null;

    const allVoters = await VoterModel.find({}, "email firstName lastName");

    allVoters.forEach((voter) => {
      const voterName = `${voter.firstName || ""} ${
        voter.lastName || ""
      }`.trim();
      const emailData = {
        voterEmail: voter.email,
        voter_Name: voterName,
        subject: "Final Election Results are In!",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #333; text-align: center;">Election Results</h2>
            <p style="color: #555;">Hello ${voterName},</p>
            <p style="color: #555;">The final election results are here! We would like to thank you for your participation.</p>
            <p style="color: #333;"><strong>Total Votes Cast:</strong> <span style="font-size: 1.2em; color: #007BFF;">${totalVotes}</span></p>
            <h3 style="color: #333;">Final Standings:</h3>
            <ul style="list-style-type: none; padding: 0;">
              ${results
                .map(
                  (r, index) =>
                    `<li style="background-color: ${
                      index % 2 === 0 ? "#f4f4f4" : "#fff"
                    }; padding: 10px; border-radius: 4px; margin-bottom: 5px;">
                      <strong style="color: #333;">${r.name}</strong> (${
                      r.party
                    }): <span style="font-weight: bold; color: #28a745;">${
                      r.votes
                    } votes</span>
                    </li>`
                )
                .join("")}
            </ul>
            ${
              winner
                ? `<p style="text-align: center; font-size: 1.2em; color: #007BFF; padding: 10px; border: 2px solid #007BFF; border-radius: 5px; margin-top: 20px;">
                    The winner is <strong style="color: #0056b3;">${winner.name}</strong> from the <span style="color: #0056b3;">${winner.party}</span> party!
                  </p>`
                : ""
            }
            <p style="color: #777; font-size: 0.9em; margin-top: 20px;">Best regards,</p>
            <p style="color: #777; font-size: 0.9em;">The E-Voting Team</p>
          </div>
        `,
      };
      sendResultsEmailMessage(emailData);
    });

    res.status(200).json({
      message: "Election results are published.",
    });
  } catch (err) {
    console.error("Error publishing election results:", err);
    res.status(500).json({ message: "Error publishing election results." });
  }
};

module.exports = {
  getElectionResults,
  publishElectionResults,
};
