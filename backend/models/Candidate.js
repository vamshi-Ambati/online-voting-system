const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true,
  },
  party:{
    type: String,
    required: true, 
  },
  description: {
    type: String,
    default: "",
  },
  photoUrl: {
    type: String,
    default: "",
  },
});

const candidateModel = mongoose.model("Candidate", candidateSchema);

module.exports = candidateModel;