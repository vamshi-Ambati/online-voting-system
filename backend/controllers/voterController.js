const Voter = require("../models/Voter");
const OTP = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const fs = require("fs");
const path = require("path");

// These imports are required for the face descriptor logic in handleRegister
const faceapi = require("@vladmandic/face-api");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// This function loads the models once at startup and is essential for faceapi to work
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

const generateUniqueVoterId = async (firstName) => {
  const MAX_ATTEMPTS = 3;
  let attempts = 0;
  let voterId;
  let isUnique = false;

  while (attempts < MAX_ATTEMPTS && !isUnique) {
    const base = firstName.replace(/\s+/g, "").toUpperCase().slice(0, 4);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    voterId = `${base}${randomNum}`;

    const existingVoter = await Voter.findOne({ voterId });
    if (!existingVoter) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error(
      "Failed to generate unique Voter ID after multiple attempts"
    );
  }

  return voterId;
};

const sendWelcomeEmail = async (email, username, voterId) => {
  const currentYear = new Date().getFullYear();
  const supportEmail = process.env.SUPPORT_EMAIL || "support@voting-system.com";
  const senderName = process.env.EMAIL_SENDER_NAME || "Voting System Team";

  const mailOptions = {
    from: `"${senderName}" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Your Voting Account is Ready - Voter ID: ${voterId}`,
    text: `Hello ${username},\n\nWelcome to our voting platform. Your registration is complete.\n\nYour Voter ID: ${voterId}\n\nPlease keep this ID secure as you'll need it to access the voting system.\n\nFor any questions, contact: ${supportEmail}\n\nBest regards,\n${senderName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Voter Registration Confirmation</title>
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background: #f7f7f7; margin: 0; padding: 0;}
          .email-container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);}
          .header {background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: #fff; padding: 30px; text-align: center; border-bottom: 4px solid #1d4ed8;}
          .content {padding: 30px;}
          .voter-id-box {background: #f8f9fa; border-left: 4px solid #3498db; padding: 20px; margin: 20px 0; font-size: 18px; text-align: center; border-radius: 0 4px 4px 0;}
          .footer {padding: 20px; text-align: center; font-size: 12px; color: #64748b; background: #f1f5f9; border-top: 1px solid #e2e8f0;}
          @media only screen and (max-width:600px){ .email-container {width: 100%;} .header, .content {padding: 20px;} }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header"><h1>Welcome to Voting System</h1></div>
          <div class="content">
            <p>Hello ${username},</p>
            <p>Thank you for registering with our secure voting platform. Your account has been successfully created.</p>
            <div class="voter-id-box">
              <strong>Your Voter ID:</strong><br />
              <span style="font-size: 22px; letter-spacing: 1px;">${voterId}</span>
            </div>
            <p>Please keep this ID confidential as it will be required for all voting activities.</p>
            <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:${supportEmail}" style="color: #2563eb; text-decoration: none;">${supportEmail}</a>.</p>
            <p>Best regards,<br /><strong>${senderName}</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${currentYear} ${senderName}. All rights reserved.</p>
            <p><a href="#" style="color: #2563eb; text-decoration: none;">Privacy Policy</a> | <a href="#" style="color: #2563eb; text-decoration: none;">Terms of Service</a></p>
          </div>
        </div>
      </body>
      </html>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

const sendEmailVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

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
          <p>Thank you for registering. Please use the following code to verify your email address:</p>
          <h3 style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; letter-spacing: 5px;">
            ${otp}
          </h3>
          <p>This code is valid for 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
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
  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

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

const handleRegister = async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    email,
    password,
    role,
    gender,
    dob,
    mobile,
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
      !mobile ||
      !photoPath
    ) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res.status(400).json({
        success: false,
        message: "Required fields are missing, including the photo",
      });
    }

    const existingUser = await Voter.findOne({ email });
    if (existingUser) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const existingMobile = await Voter.findOne({ mobile });
    if (existingMobile) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res.status(400).json({
        success: false,
        message: "Mobile number already registered",
      });
    }

    if (!["voter", "admin"].includes(role)) {
      if (photoPath) fs.unlinkSync(photoPath);
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

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
        message: "No face detected in the photo. Please use a clear photo.",
      });
    }

    const faceDescriptor = Array.from(detection.descriptor);

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      firstName,
      middleName: middleName || "",
      lastName,
      email,
      password: hashedPassword,
      role,
      gender,
      dob,
      mobile,
      photo: photoPath,
      faceDescriptor,
    };

    if (role === "voter") {
      try {
        userData.voterId = await generateUniqueVoterId(firstName);
      } catch (error) {
        console.error("Voter ID generation failed:", error);
        if (photoPath) fs.unlinkSync(photoPath);
        return res.status(500).json({
          success: false,
          message: "Failed to generate unique Voter ID. Please try again.",
        });
      }
    }

    const newUser = await Voter.create(userData);

    if (role === "voter") {
      await sendWelcomeEmail(email, firstName, userData.voterId);
    }

    const response = {
      success: true,
      message: "Registration successful",
      role: newUser.role,
    };

    if (role === "voter") {
      response.voterId = newUser.voterId;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);

    if (photoPath) fs.unlinkSync(photoPath);
    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Registration failed - duplicate data",
      });
    }
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, voterId, password, role } = req.body;

    if (!password || !role) {
      return res.status(400).json({
        success: false,
        message: "Password and role are required",
      });
    }

    let user;
    if (role === "admin") {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required for admin login",
        });
      }
      user = await Voter.findOne({ email, role: "admin" });
    } else {
      if (!voterId) {
        return res.status(400).json({
          success: false,
          message: "Voter ID is required for voter login",
        });
      }
      user = await Voter.findOne({ voterId, role: "voter" });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
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
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
        mobile: user.mobile,
        role: user.role,
        voterId: user.voterId,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  sendEmailVerification,
  verifyEmail,
  handleRegister,
  handleLogin,
};
