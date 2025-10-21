// routes/faceVerify.js
const express = require("express");
const router = express.Router();
const faceapi = require("@vladmandic/face-api");
const canvas = require("canvas");
const tf = require("@tensorflow/tfjs-node");
const axios = require("axios");
const Voter = require("../models/Voter");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

/* -------------------- MODEL LOADING -------------------- */
let modelsLoaded = false;
async function ensureModels() {
  if (!modelsLoaded) {
    const path = require("path");
    const MODEL_PATH = path.resolve(__dirname, "../face-api-models");

    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH),
      faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH),
      faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH),
    ]);

    modelsLoaded = true;
    console.log("✅ Face-api.js models loaded successfully.");
  }
}

/* -------------------- ROUTE: VERIFY FACE -------------------- */
// POST /api/faceVerify
router.post("/", async (req, res) => {
  await ensureModels();

  const { voterId, image } = req.body;

  if (!voterId || !image) {
    return res
      .status(400)
      .json({ match: false, message: "Missing voterId or image." });
  }

  try {
    tf.engine().startScope();

    // 1️⃣ Find the voter in DB (with saved face descriptor or Cloudinary image)
    const voter = await Voter.findById(voterId).select(
      "faceDescriptors photoUrl"
    );

    if (!voter) {
      return res
        .status(404)
        .json({ match: false, message: "Voter not found in database." });
    }

    let storedDescriptor;

    // 2️⃣ If descriptor already exists in DB, use it directly
    if (voter.faceDescriptors && voter.faceDescriptors.length) {
      storedDescriptor = Float32Array.from(voter.faceDescriptors);
    } else if (voter.photoUrl) {
      // 3️⃣ If descriptor not stored, compute it from Cloudinary image (once)
      const response = await axios.get(voter.photoUrl, {
        responseType: "arraybuffer",
      });
      const img = await canvas.loadImage(Buffer.from(response.data, "binary"));
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        return res.status(400).json({
          match: false,
          message: "No face detected in voter's registered photo.",
        });
      }

      storedDescriptor = detection.descriptor;
      // Optional: store computed descriptor for faster next verifications
      voter.faceDescriptors = Array.from(storedDescriptor);
      await voter.save();
    } else {
      return res.status(400).json({
        match: false,
        message:
          "Voter does not have a registered face descriptor or photo URL.",
      });
    }

    // 4️⃣ Create face matcher for this voter
    const labeledDescriptor = new faceapi.LabeledFaceDescriptors(voterId, [
      storedDescriptor,
    ]);
    const faceMatcher = new faceapi.FaceMatcher([labeledDescriptor], 0.5);

    // 5️⃣ Decode the live image from frontend (base64)
    const base64Data = image.split(",")[1];
    const liveImg = await canvas.loadImage(Buffer.from(base64Data, "base64"));

    // 6️⃣ Detect face in live image
    const detections = await faceapi
      .detectAllFaces(liveImg)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections.length) {
      return res
        .status(400)
        .json({ match: false, message: "No face detected in live image." });
    }

    // 7️⃣ Compare live descriptor with stored descriptor
    let isMatch = false;
    for (const det of detections) {
      const bestMatch = faceMatcher.findBestMatch(det.descriptor);
      if (bestMatch.label === voterId && bestMatch.distance < 0.5) {
        isMatch = true;
        break;
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        match: false,
        message: "Face does not match the registered voter. Access denied.",
      });
    }

    // 8️⃣ Success — face matches
    return res.json({
      match: true,
      message: "✅ Face verified successfully. You can vote now.",
    });
  } catch (err) {
    console.error("❌ Face verification error:", err);
    return res.status(500).json({
      match: false,
      message: err.message || "Internal server error during face verification.",
    });
  } finally {
    tf.engine().endScope();
  }
});

module.exports = router;
