const resultModel = require('../models/Results');


const getResults = async (req, res) => {
    try {
        const results = await resultModel.find().populate('electionId').populate('candidateId');
        res.status(200).json({ results });
    } catch (error) {
        console.error("Error fetching results:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getResults
};