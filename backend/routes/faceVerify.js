// routes/faceVerify.js
const express = require("express");
const router = express.Router();
const faceapi = require("@vladmandic/face-api");
const canvas = require("canvas");
const path = require("path");
const Voter = require("../models/Voter");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;
async function ensureModels() {
  if (!modelsLoaded) {
    const MODEL_PATH = path.resolve(__dirname, "../face-api-models");
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
      modelsLoaded = true;
      console.log("Face-api.js models loaded successfully.");
    } catch (err) {
      console.error("Error loading face-api models:", err);
      throw err;
    }
  }
}

// Helper: Create labeled face descriptors from registration photo
async function createLabeledDescriptors(photoPath, label) {
  const img = await canvas.loadImage(photoPath);
  const detections = await faceapi
    .detectAllFaces(img)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!detections.length)
    throw new Error("No face detected in registered photo.");

  // Could have multiple descriptors for multiple detected faces, store all with label
  const descriptors = detections.map((det) => det.descriptor);
  return new faceapi.LabeledFaceDescriptors(label, descriptors);
}

router.post("/", async (req, res) => {
  try {
    await ensureModels();

    const { voterId, image } = req.body;
    if (!voterId || !image)
      return res
        .status(400)
        .json({ match: false, message: "Missing voterId or image" });

    const voter = await Voter.findById(voterId);
    if (!voter || !voter.photo)
      return res
        .status(404)
        .json({ match: false, message: "Voter or photo not found" });

    // Resolve absolute path for registered photo
    const registeredPhotoPath = path.resolve(__dirname, "../", voter.photo);

    // Create labeled descriptors for this voter from their registered photo
    const labeledDescriptors = await createLabeledDescriptors(
      registeredPhotoPath,
      voterId.toString()
    );

    // Initialize FaceMatcher with labeled descriptors and threshold 0.6
    const faceMatcher = new faceapi.FaceMatcher([labeledDescriptors], 0.6);

    // Decode and load live captured image from frontend
    const base64Data = image.split(",")[1];
    const liveImg = await canvas.loadImage(Buffer.from(base64Data, "base64"));

    // Detect face(s) in live image with descriptors
    const liveDetections = await faceapi
      .detectAllFaces(liveImg)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!liveDetections.length)
      return res
        .status(400)
        .json({ match: false, message: "No face detected in live image." });

    // Check if any detected live face matches this voter's labeled descriptors
    let isMatch = false;
    for (const detection of liveDetections) {
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
      if (bestMatch.label === voterId.toString() && bestMatch.distance < 0.6) {
        isMatch = true;
        break;
      }
    }

    res.json({ match: isMatch });
  } catch (err) {
    console.error("Face verification error:", err);
    res
      .status(500)
      .json({
        match: false,
        message: "Internal server error during face verification.",
      });
  }
});

module.exports = router;
