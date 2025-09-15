// routes/faceVerify.js
const express = require("express");
const router = express.Router();
const faceapi = require("@vladmandic/face-api");
const canvas = require("canvas");
const path = require("path");
const fs = require("fs");
const Voter = require("../models/Voter");
const tf = require("@tensorflow/tfjs-node");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

/* -------------------- MODEL LOADING -------------------- */
let modelsLoaded = false;
async function ensureModels() {
  if (!modelsLoaded) {
    const MODEL_PATH = path.resolve(__dirname, "../face-api-models");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
    modelsLoaded = true;
    console.log("✅ Face-api.js models loaded once.");
  }
}

/* -------------------- HELPERS -------------------- */
async function createLabeledDescriptors(photoPath, label) {
  const img = await canvas.loadImage(photoPath);

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

    // Registered photo path
    let registeredPhotoPath = path.resolve(__dirname, "../", voter.photo);

    // Fallback: try "candidates" folder if not found
    if (!fs.existsSync(registeredPhotoPath)) {
      registeredPhotoPath = registeredPhotoPath.replace("voters", "candidates");
      if (!fs.existsSync(registeredPhotoPath)) {
        throw new Error(
          `Registered photo not found at: ${registeredPhotoPath}`
        );
      }
    }

    // Create descriptors for stored image
    const labeledDescriptors = await createLabeledDescriptors(
      registeredPhotoPath,
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

    // Compare
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
    tf.engine().endScope(); // ✅ always free memory
  }
});

module.exports = router;
