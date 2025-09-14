const Voter = require("../models/Voter");
const EmailCode = require("../models/EmailCode"); // correct import and capitalization
const MobileOTP = require("../models/MobileOTP");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const faceapi = require("@vladmandic/face-api");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});

let modelsLoaded = false;
async function ensureModels() {
  if (!modelsLoaded) {
    const MODEL_PATH = path.resolve(__dirname, "../face-api-models");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
    modelsLoaded = true;
  }
}
ensureModels();

const sendWelcomeEmail = async (email, username) => {
  const currentYear = new Date().getFullYear();
  const supportEmail = process.env.SUPPORT_EMAIL || "support@voting-system.com";
  const senderName = process.env.EMAIL_SENDER_NAME || "Voting System Team";

  const mailOptions = {
    from: `"${senderName}" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Your Voting Account is Ready`,
    html: `
      <div style="font-family: Arial, sans-serif; padding:20px;">
        <h2>Welcome to Voting System</h2>
        <p>Hello ${username},</p>
        <p>Your account has been successfully created on our secure voting platform.</p>
        <p>Please keep your login credentials safe.</p>
        <p>For help, contact: <a href="mailto:${supportEmail}">${supportEmail}</a></p>
        <hr>
        <small>&copy; ${currentYear} ${senderName}. All rights reserved.</small>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

const sendEmailVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    if (await Voter.findOne({ email })) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    await EmailCode.findOneAndReplace(
      { email },
      { email, otp },
      { upsert: true }
    );

    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Voting Portal: Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1d4ed8;">Email Verification</h2>
          <p>Hello,</p>
          <p>Please use the following 6-digit code to verify your email address:</p>
          <h3 style="background: #f4f4f4; padding: 15px; text-align: center; letter-spacing: 5px;">
            ${otp}
          </h3>
          <p>This code is valid for 5 minutes.</p>
        </div>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ message: "Failed to send verification email" });
  }
};

const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ message: "Email and code required" });

  try {
    const otpRecord = await EmailCode.findOne({ email, otp: code });
    if (!otpRecord)
      return res.status(400).json({ message: "Invalid or expired code" });
    await EmailCode.deleteOne({ _id: otpRecord._id });
    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

const handleRegister = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    gender,
    dob,
    aadhaar,
    mobile,
    voterId,
  } = req.body;
  const photoPath = req.file ? req.file.path : null;

  try {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !role ||
      !gender ||
      !dob ||
      !aadhaar ||
      !mobile ||
      !voterId ||
      !photoPath
    ) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res.status(400).json({
        success: false,
        message: "All required fields including photo must be provided",
      });
    }
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
        .json({ success: false, message: "Mobile already registered" });
    }
    if (await Voter.findOne({ aadhaar })) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res
        .status(400)
        .json({ success: false, message: "Aadhaar already registered" });
    }
    if (!["voter", "admin"].includes(role)) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    if (await Voter.findOne({ voterId })) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res
        .status(400)
        .json({ success: false, message: "Voter ID already registered" });
    }

    await ensureModels();

    const photoBuffer = fs.readFileSync(photoPath);
    const img = await canvas.loadImage(photoBuffer);

    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!detection) {
      fs.unlinkSync(photoPath);
      return res.status(400).json({
        success: false,
        message: "No face detected in provided photo",
      });
    }

    const faceDescriptor = Array.from(detection.descriptor);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Voter.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      gender,
      dob,
      aadhaar,
      mobile,
      voterId,
      photo: photoPath,
      faceDescriptor,
    });

    await sendWelcomeEmail(email, firstName);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      role: newUser.role,
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (photoPath) fs.unlinkSync(photoPath);
    res
      .status(500)
      .json({ success: false, message: "Registration failed. Try again." });
  }
};

const sendMobileOTP = async (req, res) => {
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
      await MobileOTP.findOneAndReplace(
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

const verifyMobileOTP = async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp)
    return res.status(400).json({ message: "Mobile and OTP are required" });

  try {
    const record = await MobileOTP.findOne({ mobile });
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
      await MobileOTP.deleteOne({ _id: record._id });
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

const handleLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role)
      return res
        .status(400)
        .json({ message: "Email, password and role are required" });

    const user = await Voter.findOne({ email, role });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
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
        mobile: user.mobile,
        aadhaar: user.aadhaar,
        role: user.role,
        photo: user.photo,
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
  handleRegister,
  handleLogin,
  sendMobileOTP,
  verifyMobileOTP,
};
