const voterModel = require("../models/Voter");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

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
    const newVoter = await voterModel.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    res.json({
      message: "User registered successfully",
      voter: {
        id: newVoter._id,
        username: newVoter.username,
        email: newVoter.email,
        role: newVoter.role,
      },
    });
  } catch (error) {
    console.error("Error registering voter:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login voter
const handleLogin = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Check if voter exists
    const voter = await voterModel.findOne({ email });
    if (!voter) {
      return res.status(400).json({ message: "Invalid email" });
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
      process.env.SECRET_KEY || "vamshi", // Use env variable in production!
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
