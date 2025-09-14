const mongoose = require("mongoose");
const Admin = require("../../models/user/Admin");
const { AppError } = require("../../middleware/errorHandler");
const { uploadFile } = require("../helpers/file/uploadFile");
const bcrypt = require("bcrypt");
const emailService = require("../../services/email/emailService");

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.sendStatus(400);
    }

    const admin = await Admin.findById(req.params.id)
      .select("-refreshToken -password -OTP")
      .exec();

    if (!admin) {
      return res.status(404).json({ 
        message: `No admin matches ID ${req.params.id}.` 
      });
    }

    return res.status(200).json({
      data: admin,
    });
  } catch (err) {
    console.error(`Get admin profile error: ${err.message}`);
    return res.sendStatus(400);
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.sendStatus(400);
    }

    console.log("🚀 ~ updateAdminProfile ~ req.body:", req.body);

    const updateFields = {};
    const allowedFields = [
      "fullname",
      "email",
      "phoneNumber",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field]) {
        updateFields[field] = req.body[field];
      }
    });

    const admin = await Admin.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        select: "-refreshToken -password -OTP",
      }
    ).exec();

    if (!admin) {
      return res
        .status(204)
        .json({ message: `No admin matches ID ${req.params.id}.` });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: admin,
    });
  } catch (err) {
    console.error(`Profile update error: ${err.message}`);
    return res.status(500).json({ 
      message: "Failed to update profile. Please try again." 
    });
  }
};

// Update admin photo
const updateAdminPhoto = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No photo file provided" });
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    // Validate file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "File size must be less than 5MB" });
    }

    // Upload photo to cloud storage
    console.log("📁 File received:", req.file);
    const uploadResult = await uploadFile(req.file);
    const photoUrl = uploadResult.secure_url;
    console.log("☁️ Photo uploaded to cloud storage:", photoUrl);
    
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { photo: photoUrl },
      {
        new: true,
        runValidators: true,
        select: "-refreshToken -password -OTP",
      }
    ).exec();

    if (!admin) {
      return res.status(404).json({ 
        message: `No admin matches ID ${req.params.id}.` 
      });
    }

    const response = {
      success: true,
      message: "Photo updated successfully",
      data: { photo: admin.photo },
    };
    
    console.log("📤 Sending response:", response);
    return res.status(200).json(response);
  } catch (err) {
    console.error(`Photo update error: ${err.message}`);
    return res.status(500).json({ 
      message: "Failed to update photo. Please try again." 
    });
  }
};

// Request password change OTP
const requestPasswordChangeOTP = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.sendStatus(400);
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long",
      });
    }

    // Get admin and verify current password
    const admin = await Admin.findById(req.params.id).select("+password");
    if (!admin) {
      return res.status(404).json({ 
        message: `No admin matches ID ${req.params.id}.` 
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to admin
    admin.OTP = otp;
    admin.OTPExpiry = otpExpiry;
    await admin.save();

    // Send OTP via email
    try {
      await emailService.sendOTPEmail(admin.email, otp, admin.fullname);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(500).json({
        message: "Failed to send OTP. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email address",
      data: {
        email: admin.email,
      },
    });
  } catch (err) {
    console.error(`Request OTP error: ${err.message}`);
    return res.status(500).json({ 
      message: "Failed to process request. Please try again." 
    });
  }
};

// Change password with OTP
const changeAdminPassword = async (req, res) => {
  try {
    if (!req?.params?.id || !req?.params?.otp) {
      return res.sendStatus(400);
    }

    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long",
      });
    }

    // Get admin and verify OTP
    const admin = await Admin.findById(req.params.id).select("+password");
    if (!admin) {
      return res.status(404).json({ 
        message: `No admin matches ID ${req.params.id}.` 
      });
    }

    if (!admin.OTP || admin.OTP !== req.params.otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (admin.OTPExpiry && new Date() > admin.OTPExpiry) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear OTP
    admin.password = hashedPassword;
    admin.OTP = undefined;
    admin.OTPExpiry = undefined;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error(`Change password error: ${err.message}`);
    return res.status(500).json({ 
      message: "Failed to change password. Please try again." 
    });
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  updateAdminPhoto,
  requestPasswordChangeOTP,
  changeAdminPassword,
};
