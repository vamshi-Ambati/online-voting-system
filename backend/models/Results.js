const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    voterId: {
      type: String,
      required: true,
    },
    electionId: {
      type: String,
      required: true,
    },
    candidateId: {
      type: String,
      required: true,
    },
    voteTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


const resultModel = mongoose.model("Result", resultSchema);

module.exports = resultModel;