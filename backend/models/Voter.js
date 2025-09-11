const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["voter", "admin"],
      required: true,
      default: "voter",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    dob: { type: Date },
    mobile: { type: String },
    voterId: { type: String, unique: true, sparse: true },
    photo: { type: String, required: true },
    hasVoted: {
      type: Boolean,
      default: false,
    },
    // The new field to store the face descriptor
    faceDescriptor: {
      type: [Number], // Stored as an array of numbers
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voter", voterSchema);
