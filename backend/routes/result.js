const express = require("express");
const router = express.Router();
const {
  getElectionResults,
  publishElectionResults,
} = require("../controllers/resultController");

router.get("/", getElectionResults);
router.post("/publish", publishElectionResults); // New route for publishing results

module.exports = router;
