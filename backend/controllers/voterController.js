const voterModel = require("../models/Voter");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate vote ID: username + 4-digit random number
// Generate vote ID: first 4 chars of username (no spaces, uppercase) + 4-digit random number
const generateVoteId = (username) => {
  const base = username.replace(/\s+/g, '').toUpperCase().slice(0, 4);
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `${base}${randomNum}`;
};


// Helper: Send welcome email with voteId using SendGrid
const sendWelcomeEmail = async (toEmail, username, voteId) => {
  const msg = {
    to: toEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "Welcome to the Voting System!",
    text: `Hello ${username},\n\nThank you for registering for our online voting system.\n\nYour unique vote ID is: ${voteId}\n\nBest regards,\n\nVoting Team`,
    // You can add html: '<strong>...</strong>' if you want HTML emails
  };
  await sgMail.send(msg);
};

// Registering new voter
const handleRegister = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    // Check if voter already exists
    const existingUser = await voterModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate role
    const allowedRoles = ["admin", "candidate"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate voteId
    const voteId = generateVoteId(username);

    // Create new voter with voteId
    const newVoter = await voterModel.create({
      username,
      email,
      password: hashedPassword,
      role,
      voteId,
    });

    // Send welcome email (ignore errors, but log them)
    try {
      await sendWelcomeEmail(email, username, voteId);
    } catch (mailErr) {
      console.error("Failed to send welcome email:", mailErr);
    }

    res.json({
      message: "User registered successfully",
      voter: {
        id: newVoter._id,
        username: newVoter.username,
        email: newVoter.email,
        role: newVoter.role,
        voteId: newVoter.voteId,
      },
    });
    console.log("New voter registered:", newVoter);
  } catch (error) {
    console.error("Error registering voter:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login voter (no changes)
// Login voter using voteId and password
const handleLogin = async (req, res) => {
  const { voteId, password, role } = req.body;
  try {
    // Check if voter exists by voteId
    const voter = await voterModel.findOne({ voteId });
    if (!voter) {
      return res.status(400).json({ message: "Invalid vote ID" });
    }
    // Check password
    const isPasswordValid = await bcrypt.compare(password, voter.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    // Check role
    if (!role || voter.role !== role) {
      return res.status(400).json({ message: "Invalid role" });
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        id: voter._id,
        username: voter.username,
        email: voter.email,
        role: voter.role,
      },
      process.env.SECRET_KEY || "vamshi",
      { expiresIn: "7d" }
    );
    res.json({
      message: "Login successful",
      token,
      voter: {
        id: voter._id,
        username: voter.username,
        email: voter.email,
        role: voter.role,
        voteId: voter.voteId,
      },
    });
  } catch (error) {
    console.error("Error logging in voter:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  handleRegister,
  handleLogin,
};



