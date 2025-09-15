// routes/candidate.js
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
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
});

// Add candidate and delete files after processing
router.post(
  "/",
  upload.fields([
    { name: "photoUrl", maxCount: 1 },
    { name: "partySymbolUrl", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      await candidateController.addCandidate(req, res);

      // ✅ Delete uploaded files after saving details
      if (req.files) {
        Object.values(req.files).forEach((fileArr) => {
          fileArr.forEach((file) => {
            fs.unlink(file.path, (err) => {
              if (err) console.error("Failed to delete candidate file:", err);
            });
          });
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

router.get("/getCandidates", candidateController.getCandidates);
router.get("/getAllVoters", candidateController.getAllVoters);

module.exports = () => router;
