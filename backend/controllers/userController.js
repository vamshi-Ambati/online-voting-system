// controllers/userController.js
const User = require("../models/User");
const mongoose = require("mongoose");

exports.updateProfile = async (req, res) => {
  try {
    // Validate user ID
    const { userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields
    const updates = {
      firstName: req.body.firstName || user.firstName,
      middleName:
        req.body.middleName !== undefined
          ? req.body.middleName
          : user.middleName,
      lastName: req.body.lastName || user.lastName,
      email: req.body.email || user.email,
      dob: req.body.dob || user.dob,
      gender: req.body.gender || user.gender,
      mobile: req.body.mobile || user.mobile,
    };

    // Save changes
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password -__v");

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    // Handle different error types
    let statusCode = 500;
    let message = "Server error";

    if (error.name === "ValidationError") {
      statusCode = 400;
      message = error.message;
    } else if (error.name === "CastError") {
      statusCode = 400;
      message = "Invalid data format";
    }

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
