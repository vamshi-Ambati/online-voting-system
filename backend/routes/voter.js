const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const {
  handleRegister,
  handleLogin,
  sendEmailVerification,
  verifyEmail,
  sendMobileOtp,
  verifyMobileOtp,
  deleteVoter,
} = require("../controllers/voterController");

// -------------------- CLOUDINARY CONFIG --------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// -------------------- MULTER CLOUDINARY STORAGE --------------------
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "secure-vote/voters",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage });

// -------------------- ROUTES --------------------
router.post("/register", upload.single("photo"), handleRegister);
router.post("/login", handleLogin);
router.post("/send-email-verification", sendEmailVerification);
router.post("/verify-email", verifyEmail);
router.post("/send-mobile-otp", sendMobileOtp);
router.post("/verify-mobile-otp", verifyMobileOtp);
router.delete("/delete/:voterId", deleteVoter); // DELETE voter + Cloudinary photo


module.exports = router;
