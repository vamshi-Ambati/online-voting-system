const { getResults } = require('../controllers/resultController');

const router = require('express').Router();

router.get("/results" , getResults)

module.exports = router;