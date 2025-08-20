const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const candidateController = require("../controllers/candidateController");

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "candidates");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.post(
  "/",
  upload.fields([
    { name: "photoUrl", maxCount: 1 },
    { name: "partySymbolUrl", maxCount: 1 },
  ]),
  candidateController.addCandidate
);

router.get("/getCandidates", candidateController.getCandidates);
router.get("/getAllVoters", candidateController.getAllVoters);

module.exports = () => router;
