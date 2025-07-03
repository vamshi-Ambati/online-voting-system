const mongoose = require("mongoose");

function todayAt(hour, minute = 0) {
  const now = new Date();
  now.setHours(hour, minute, 0, 0);
  return now;
}

const dashboardSchema = new mongoose.Schema({
  totalCandidates: { type: Number, default: 0 },
  totalVoters: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  electionStatus: { type: String, default: "Started" },
  electionStart: { type: String, default: () => todayAt(9, 0) }, // 9:00 AM today
  electionEnd: { type: String, default: () => todayAt(17, 0) }, // 5:00 PM today
  recentActivities: [
    {
      time: String,
      text: String,
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Dashboard", dashboardSchema);
