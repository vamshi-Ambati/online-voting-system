const express = require("express");
const router = express.Router();
const Election = require("../models/Election");

// Middleware to protect admin routes (example)
// const requireAdmin = (req, res, next) => {
//   // Assume req.user is set after authentication middleware
//   if (req.user && req.user.role === "admin") {
//     next();
//   } else {
//     res.status(403).json({ message: "Admin access required" });
//   }
// };

// Get all elections
router.get("/", async (req, res) => {
  try {
    const elections = await Election.find().sort({ startDate: 1 });
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create new election (admin only)
router.post("/",  async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    const election = new Election({ name, startDate, endDate });
    await election.save();
    res.status(201).json(election);
  } catch (err) {
    res.status(400).json({ message: "Failed to create election" });
  }
});

module.exports = router;
