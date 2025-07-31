const express = require('express');
const router = express.Router();
const { getElectionResults } = require('../controllers/resultController');

router.get('/', getElectionResults);

module.exports = router;
