const { handleCastVote } = require("../controllers/voteController");

const router = require("express").Router();

router.post("/vote", handleCastVote);

module.exports = router;
