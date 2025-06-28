const router = require("express").Router();
const { handleGetAllCandidates,addCandidates } = require("../controllers/candidateController");

router.post("/candidates", addCandidates);
router.get("/candidates", handleGetAllCandidates);

module.exports = router;