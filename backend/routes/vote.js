const express = require("express");
const router = express.Router();
const castVote = require("../controllers/voteController"); // Adjust path

router.post("/vote", castVote);

module.exports = router;
