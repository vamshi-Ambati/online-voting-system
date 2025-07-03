const Dashboard = require("../models/Dashboard");
const Candidate = require("../models/Candidate");
const Voter = require("../models/Voter");
const Vote = require("../models/Vote");

exports.getDashboard = async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const totalVoters = await Voter.countDocuments();
    const totalVotes = await Vote.countDocuments();

    // Get 10 most recent voters, sorted by registration date
    const recentVoters = await Voter.find({})
      .sort({ createdAt: -1 })
      // .limit(10)
      .select("username createdAt voterid email"); // Add voterid/email if needed

    // Get all candidates for modal
    const candidates = await Candidate.find({}).select("name party"); // Add other fields if needed

    // Get all voters for modal
    const voters = await Voter.find({})
      .select("username email voteId")

    let dashboard = await Dashboard.findOne();

    if (!dashboard) {
      dashboard = new Dashboard({
        totalCandidates,
        totalVoters,
        totalVotes,
        recentActivities: [],
        lastUpdated: new Date(),
      });
    } else {
      dashboard.totalCandidates = totalCandidates;
      dashboard.totalVoters = totalVoters;
      dashboard.totalVotes = totalVotes;
      dashboard.lastUpdated = new Date();
    }

    await dashboard.save();

    res.json({
      totalCandidates: dashboard.totalCandidates,
      totalVoters: dashboard.totalVoters,
      totalVotes: dashboard.totalVotes,
      electionStatus: dashboard.electionStatus,
      electionStart: dashboard.electionStart,
      electionEnd: dashboard.electionEnd,
      recentActivities: dashboard.recentActivities,
      lastUpdated: dashboard.lastUpdated,
      recentVoters,
      candidates, // <-- For modal
      voters, // <-- For modal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
