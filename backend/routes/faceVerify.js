// routes/faceVerify.js
const express = require("express");
const router = express.Router();
const faceapi = require("@vladmandic/face-api");
const canvas = require("canvas");
const tf = require("@tensorflow/tfjs-node");
const Voter = require("../models/Voter");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

/* -------------------- MODEL LOADING -------------------- */
let modelsLoaded = false;
async function ensureModels() {
  if (!modelsLoaded) {
    const MODEL_PATH = require("path").resolve(__dirname, "../face-api-models");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
    modelsLoaded = true;
    console.log("✅ Face-api.js models loaded.");
  }
}

/* -------------------- HELPERS -------------------- */
async function createLabeledDescriptorsFromBinary(photoBinary, label) {
  const imgBuffer = photoBinary.data; // Binary data from MongoDB
  const img = await canvas.loadImage(imgBuffer);

  const detections = await faceapi
    .detectAllFaces(img)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (!detections.length) {
    throw new Error("No face detected in registered photo.");
  }

  return new faceapi.LabeledFaceDescriptors(
    label,
    detections.map((det) => det.descriptor)
  );
}

/* -------------------- ROUTE: VERIFY FACE -------------------- */
router.post("/", async (req, res) => {
  await ensureModels();

  const { voterId, image } = req.body;
  if (!voterId || !image) {
    return res
      .status(400)
      .json({ match: false, message: "Missing voterId or image" });
  }

  try {
    tf.engine().startScope(); // start memory scope

    const voter = await Voter.findById(voterId);
    if (!voter || !voter.photo) {
      return res
        .status(404)
        .json({ match: false, message: "Voter or photo not found" });
    }

    // Create descriptors for stored image from binary
    const labeledDescriptors = await createLabeledDescriptorsFromBinary(
      voter.photo,
      voterId.toString()
    );

    const faceMatcher = new faceapi.FaceMatcher([labeledDescriptors], 0.6);

    // Decode live image (base64 from frontend)
    const base64Data = image.split(",")[1];
    const liveImg = await canvas.loadImage(Buffer.from(base64Data, "base64"));

    const liveDetections = await faceapi
      .detectAllFaces(liveImg)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!liveDetections.length) {
      return res
        .status(400)
        .json({ match: false, message: "No face detected in live image." });
    }

    // Compare live image with registered descriptors
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
    res.status(500).json({
      match: false,
      message: err.message || "Internal server error during face verification.",
    });
  } finally {
    tf.engine().endScope(); // always free memory
  }
});

module.exports = router;
