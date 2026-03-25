const express = require("express");
const crypto = require("crypto");
const router = express.Router();

router.post("/generate-challenge", (req, res) => {
  const challenge = crypto.randomBytes(32).toString("base64");

  // Store challenge in session
  req.session.challenge = challenge;

  res.json({ challenge });
});

module.exports = router;
