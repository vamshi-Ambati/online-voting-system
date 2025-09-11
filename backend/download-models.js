const faceapi = require("@vladmandic/face-api");
const fs = require("fs");

(async () => {
  if (!fs.existsSync("./models")) fs.mkdirSync("./models");

  console.log("Downloading models...");

  await faceapi.nets.ssdMobilenetv1.loadFromUri(
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/ssd_mobilenetv1"
  );
  await faceapi.nets.faceRecognitionNet.loadFromUri(
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_recognition_model"
  );
  await faceapi.nets.faceLandmark68Net.loadFromUri(
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_landmark_68_model"
  );

  console.log("✅ Models downloaded into ./models folder");
})();
