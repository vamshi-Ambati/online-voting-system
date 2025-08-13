const Voter = require("../models/Voter");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");
dotenv.config();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Generates a unique voter ID
 * @param {string} firstName - First name to base ID on
 * @returns {string} Generated voter ID
 */
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

/**
 * Sends welcome email with enhanced styling
 * @param {string} email - Recipient email
 * @param {string} username - Recipient name
 * @param {string} voterId - Generated voter ID
 */
const sendWelcomeEmail = async (email, username, voterId) => {
  const currentYear = new Date().getFullYear();
  const supportEmail = process.env.SUPPORT_EMAIL || "support@voting-system.com";
  const senderName = process.env.EMAIL_SENDER_NAME || "Voting System Team";

  const msg = {
    to: email,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL,
      name: senderName,
    },
    subject: `Your Voting Account is Ready - Voter ID: ${voterId}`,
    text: `Hello ${username},\n\nWelcome to our voting platform. Your registration is complete.\n\nYour Voter ID: ${voterId}\n\nPlease keep this ID secure as you'll need it to access the voting system.\n\nFor any questions, contact: ${supportEmail}\n\nBest regards,\n${senderName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Voter Registration Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          }
          .header {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-bottom: 4px solid #1d4ed8;
          }
          .content {
            padding: 30px;
          }
          .voter-id-box {
            background-color: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 20px;
            margin: 20px 0;
            font-size: 18px;
            text-align: center;
            border-radius: 0 4px 4px 0;
          }
          .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            background-color: #f1f5f9;
            border-top: 1px solid #e2e8f0;
          }
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100%;
            }
            .header, .content {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Welcome to Voting System</h1>
          </div>
          
          <div class="content">
            <p>Hello ${username},</p>
            
            <p>Thank you for registering with our secure voting platform. Your account has been successfully created.</p>
            
            <div class="voter-id-box">
              <strong>Your Voter ID:</strong><br>
              <span style="font-size: 22px; letter-spacing: 1px;">${voterId}</span>
            </div>
            
            <p>Please keep this ID confidential as it will be required for all voting activities.</p>
            
            <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:${supportEmail}" style="color: #2563eb; text-decoration: none;">${supportEmail}</a>.</p>
            
            <p>Best regards,<br>
            <strong>${senderName}</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; ${currentYear} ${senderName}. All rights reserved.</p>
            <p>
              <a href="#" style="color: #2563eb; text-decoration: none;">Privacy Policy</a> | 
              <a href="#" style="color: #2563eb; text-decoration: none;">Terms of Service</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    mailSettings: {
      bypassListManagement: { enable: false },
      sandboxMode: { enable: false },
    },
  };

  try {
    await sgMail.send(msg);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

/**
 * Handles voter registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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

  try {
    // Check if email already exists
    const existingUser = await Voter.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Validate input
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !role ||
      !gender ||
      !dob ||
      !mobile
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Validate role
    if (!["voter", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
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
    };

    // Generate voterId for voters
    if (role === "voter") {
      try {
        userData.voterId = await generateUniqueVoterId(firstName);
      } catch (error) {
        console.error("Voter ID generation failed:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to generate unique Voter ID. Please try again.",
        });
      }
    }

    // Create new user
    const newUser = await Voter.create(userData);

    // Send welcome email to voters
    if (role === "voter") {
      await sendWelcomeEmail(email, firstName, userData.voterId);
    }

    // Prepare response
    const response = {
      success: true,
      message: "Registration successful",
      role: newUser.role,
    };

    // Include voterId for voters
    if (role === "voter") {
      response.voterId = newUser.voterId;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);

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

/**
 * Handles user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleLogin = async (req, res) => {
  try {
    const { email, voterId, password, role } = req.body;

    // Validate required fields
    if (!password || !role) {
      return res.status(400).json({
        success: false,
        message: "Password and role are required",
      });
    }

    // Find user based on role
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

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token using your secret key
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

module.exports = { handleRegister, handleLogin };
