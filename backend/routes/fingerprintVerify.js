const express = require("express");
const router = express.Router();
const { verifyAuthenticationResponse } = require("@simplewebauthn/server");
const base64url = require("base64url");
const Voter = require("../models/Voter");

router.post("/", async (req, res) => {
  try {
    const { voterId, assertion } = req.body;

    if (!voterId || !assertion) {
      return res.status(400).json({
        verified: false,
        message: "Missing voterId or assertion",
      });
    }

    const voter = await Voter.findById(voterId);
    if (!voter) {
      return res.status(404).json({
        verified: false,
        message: "Voter not found",
      });
    }

    // 🔐 Challenge from session
    const expectedChallenge = req.session.challenge;
    if (!expectedChallenge) {
      return res.status(400).json({
        verified: false,
        message: "Challenge expired. Please retry.",
      });
    }

    // 🔍 Extract credentialId from assertion
    const usedCredentialId = base64url.encode(
      Buffer.from(assertion.rawId, "base64"),
    );

    const index = voter.fingerprints.indexOf(usedCredentialId);
    if (index === -1) {
      return res.status(401).json({
        verified: false,
        message: "Fingerprint not registered for this voter",
      });
    }

    // ✅ Verify fingerprint
    const verification = await verifyAuthenticationResponse({
      response: {
        ...assertion,
        rawId: base64url.toBuffer(assertion.rawId),
        response: {
          authenticatorData: base64url.toBuffer(
            assertion.response.authenticatorData,
          ),
          clientDataJSON: base64url.toBuffer(assertion.response.clientDataJSON),
          signature: base64url.toBuffer(assertion.response.signature),
          userHandle:
            assertion.response.userHandle ?
              base64url.toBuffer(assertion.response.userHandle)
            : null,
        },
      },
      expectedChallenge,
      expectedOrigin: "http://localhost:3000",
      expectedRPID: "localhost",
      authenticator: {
        credentialID: base64url.toBuffer(voter.fingerprints[index]),
        credentialPublicKey: base64url.toBuffer(voter.publicKeys[index]),
        counter: voter.counter,
      },
    });

    if (!verification.verified) {
      return res.status(401).json({
        verified: false,
        message: "Fingerprint verification failed",
      });
    }

    // 🔄 Update counter (replay protection)
    voter.counter = verification.authenticationInfo.newCounter;
    await voter.save();

    // 🧹 Clear challenge
    req.session.challenge = null;

    return res.json({
      verified: true,
      message: "✅ Fingerprint verified successfully",
    });
  } catch (err) {
    console.error("Fingerprint verification error:", err);
    return res.status(500).json({
      verified: false,
      message: "Internal fingerprint verification error",
    });
  }
});

module.exports = router;
