const express = require("express");
const router = express.Router();
const { castVote } = require("../controllers/voteController");

router.post("/cast-vote", castVote);

module.exports = router;
