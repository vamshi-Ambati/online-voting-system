const Voter = require("../models/Voter");
const OTP = require("../models/EmailCode");
const mobileOTP = require("../models/MobileOTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Face descriptor logic
const faceapi = require("@vladmandic/face-api");
const canvas = require("canvas");
const { log } = require("console");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

dotenv.config();

// Mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Load models once
let modelsLoaded = false;
async function ensureModels() {
  if (!modelsLoaded) {
    console.log("Loading face-api.js models...");
    const MODEL_PATH = path.resolve(__dirname, "../face-api-models");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
    modelsLoaded = true;
    console.log("Face-api.js models loaded successfully.");
  }
}
ensureModels();

/* -------------------- MOBILE OTP -------------------- */
const sendMobileOtp = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !/^\d{10}$/.test(mobile))
    return res
      .status(400)
      .json({ message: "Valid 10-digit mobile number required" });

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWOFCTOR_IN_API_KEY}/SMS/${mobile}/AUTOGEN`
    );

    if (response.data.Status === "Success") {
      const sessionId = response.data.Details;
      await mobileOTP.findOneAndReplace(
        { mobile },
        { mobile, sessionId },
        { upsert: true }
      );
      res.status(200).json({ success: true, message: "OTP sent to mobile" });
    } else {
      throw new Error("Failed to send OTP");
    }
  } catch (error) {
    console.error("Error sending mobile OTP:", error.message || error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

const verifyMobileOtp = async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp)
    return res.status(400).json({ message: "Mobile and OTP are required" });

  try {
    const record = await mobileOTP.findOne({ mobile });
    if (!record || !record.sessionId)
      return res
        .status(400)
        .json({ message: "No OTP session found. Please request OTP again." });

    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWOFCTOR_IN_API_KEY}/SMS/VERIFY/${record.sessionId}/${otp}`
    );

    if (
      response.data.Status === "Success" &&
      response.data.Details === "OTP Matched"
    ) {
      await mobileOTP.deleteOne({ _id: record._id });
      res.status(200).json({
        success: true,
        message: "Mobile number verified successfully",
      });
    } else {
      res.status(400).json({ message: "Invalid or expired OTP" });
    }
  } catch (error) {
    console.error("Error verifying mobile OTP:", error.message || error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* -------------------- EMAIL VERIFICATION -------------------- */
const sendEmailVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const existingUser = await Voter.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await OTP.findOneAndReplace({ email }, { email, otp }, { upsert: true });

    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Voting Portal: Your Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #007bff;">Email Verification</h2>
          <p>Hello,</p>
          <p>Please use the following code to verify your email address:</p>
          <h3 style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; letter-spacing: 5px;">
            ${otp}
          </h3>
          <p>This code is valid for 5 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Verification email sent successfully" });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ message: "Failed to send verification email" });
  }
};

const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ message: "Email and code are required" });

  try {
    const otpRecord = await OTP.findOne({ email, otp: code });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    await OTP.deleteOne({ _id: otpRecord._id });
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

/* -------------------- REGISTRATION -------------------- */
const handleRegister = async (req, res) => {
  const {
    firstName,
    lastName,
    voterId,
    email,
    password,
    role,
    gender,
    dob,
    aadhaar,
    mobile,
  } = req.body;

  const photoPath = req.file ? req.file.path : null;

  try {
    if (
      !firstName ||
      !lastName ||
      !voterId ||
      !email ||
      !password ||
      !role ||
      !gender ||
      !dob ||
      !aadhaar ||
      !mobile ||
      !photoPath
    ) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Duplicate checks
    if (await Voter.findOne({ email })) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    if (await Voter.findOne({ mobile })) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res
        .status(400)
        .json({ success: false, message: "Mobile number already registered" });
    }

    if (await Voter.findOne({ voterId })) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res
        .status(400)
        .json({ success: false, message: "Voter ID already registered" });
    }

    if (await Voter.findOne({ aadhaar })) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res
        .status(400)
        .json({ success: false, message: "Aadhaar already registered" });
    }

    // Face detection
    const photoBuffer = fs.readFileSync(photoPath);
    const img = await canvas.loadImage(photoBuffer);

    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      fs.unlinkSync(photoPath);
      return res
        .status(400)
        .json({ success: false, message: "No face detected in the photo" });
    }

    const faceDescriptor = Array.from(detection.descriptor);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Voter.create({
      firstName,
      lastName,
      voterId,
      email,
      password: hashedPassword,
      role,
      gender,
      dob,
      aadhaar,
      mobile,
      photo: photoPath,
      faceDescriptor,
    });
    console.log("New user registered:", newUser);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      role: newUser.role,
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (photoPath) fs.unlinkSync(photoPath);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

/* -------------------- LOGIN -------------------- */
const handleLogin = async (req, res) => {
  try {
    const { email, voterId, password, role } = req.body;

    if (!password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Password and role are required" });
    }

    let user;
    if (role === "admin") {
      if (!email) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Email is required for admin login",
          });
      }
      user = await Voter.findOne({ email, role: "admin" });
    } else {
      if (!voterId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Voter ID is required for voter login",
          });
      }
      user = await Voter.findOne({ voterId, role: "voter" });
    }

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        voterId: user.voterId,
      },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
        aadhaar: user.aadhaar,
        mobile: user.mobile,
        role: user.role,
        voterId: user.voterId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  sendEmailVerification,
  verifyEmail,
  sendMobileOtp,
  verifyMobileOtp,
  handleRegister,
  handleLogin,
};
