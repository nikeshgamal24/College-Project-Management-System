const mongoose = require("mongoose");
const Supervisor = require("../../models/user/Supervisor");
const Project = require("../../models/academic/Project");
const ProgressLog = require("../../models/system/ProgressLog");
const { AppError } = require("../../middleware/errorHandler");
const { uploadFile } = require("../helpers/file/uploadFile");
const emailService = require("../../services/email/emailService");
const eventStatusList = require("../../config/constants/eventStatusList");
const Student = require("../../models/user/Student");
const Event = require("../../models/academic/Event");
const transactionService = require("../../services/database/transactionService");
const progressStatusEligibilityCode = require("../../config/constants/progressStatusEligibilityCode");
const {
  updateMinorProgressStatus,
} = require("../helpers/project/updateMinorProgressStatus");
const {
  updateMajorProgressStatus,
} = require("../helpers/project/updateMajorProgressStatus");

// Get supervisor profile
const getSupervisorProfile = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.sendStatus(400);
    }

    const supervisor = await Supervisor.findById(req.params.id)
      .select("-refreshToken -password -OTP")
      .exec();

    if (!supervisor) {
      return res.status(404).json({ 
        message: `No supervisor matches ID ${req.params.id}.` 
      });
    }

    return res.status(200).json({
      data: supervisor,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

// Update supervisor profile
const updateSupervisorProfile = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.sendStatus(400);
    }

    const updateFields = {};
    const allowedFields = [
      "fullname",
      "email",
      "phoneNumber",
      "designation",
      "institution",
      "skillSet",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field]) {
        if (Array.isArray(req.body[field])) {
          updateFields[field] = req.body[field].map((fieldValue) => {
            return fieldValue;
          });
        }
        updateFields[field] = req.body[field];
      }
    });

    const supervisor = await Supervisor.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        select: "-refreshToken -password -OTP",
      } // Exclude fields
    ).exec();

    if (!supervisor) {
      return res
        .status(204)
        .json({ message: `No supervisor matches ID ${req.params.id}.` });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: supervisor,
    });
  } catch (err) {
    console.error(`Profile update error: ${err.message}`);
    return res.status(500).json({ 
      message: "Failed to update profile. Please try again." 
    });
  }
};

// Update supervisor photo
const updateSupervisorPhoto = async (req, res) => {
  try {
    if (!req?.params?.id) {
      return res.status(400).json({ message: "Supervisor ID is required" });
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

    // const photoUrl = req.file.path; // Multer provides the file path
    // Upload photo to cloud storage
    console.log("📁 File received:", req.file);
    const uploadResult = await uploadFile(req.file);
    const photoUrl = uploadResult.secure_url;
    console.log("☁️ Photo uploaded to cloud storage:", photoUrl);
    
    const supervisor = await Supervisor.findByIdAndUpdate(
      req.params.id,
      { photo: photoUrl },
      {
        new: true,
        runValidators: true,
        select: "-refreshToken -password -OTP",
      }
    ).exec();

    if (!supervisor) {
      return res.status(404).json({ 
        message: `No supervisor matches ID ${req.params.id}.` 
      });
    }

    const response = {
      success: true,
      message: "Photo updated successfully",
      data: { photo: supervisor.photo },
    };
    
    console.log("📤 Sending response:", response);
    return res.status(200).json(response);
  } catch (err) {
    console.error(`Photo update error: ${err.message}`);
    return res.status(500).json({ message: "Failed to update photo. Please try again." });
  }
};

const getAllActiveProjects = async (req, res) => {
  try {
    //get all projects where the supervisor id inside supervirsor object is equal to current logged in supervisor id where the project status is active
    const projects = await Project.find({
      "supervisor.supervisorId": req.userId,
      status: eventStatusList.active,
    });

    //when there is no content for the supervisor
    if (!projects.length) return res.sendStatus(204);

    return res.status(200).json({
      data: projects,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const getAllArchiveProjects = async (req, res) => {
  try {
    //get all projects where the supervisor id inside supervirsor object is equal to current logged in supervisor id and is either complete or archive
    const projects = await Project.find({
      "supervisor.supervisorId": req.userId,
      status: {
        $in: [eventStatusList.complete, eventStatusList.archive],
      },
    }).populate({
      path: "supervisor.supervisorId",
      select: "-OTP -refreshToken -password",
    });

    //when there is no content for the supervisor
    if (!projects.length) return res.sendStatus(204);

    return res.status(200).json({
      data: projects,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const getProjectById = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Defense ID required." });
  }
  try {
    // Find project by ID (handle both active and archive projects)
    const project = await Project.findById(req.params.id)
      .populate({
        path: "teamMembers",
        select: "-password -OTP -refreshToken" // Exclude sensitive fields but include all others
      })
      .populate("event")
      .populate({
        path: "progressLogs",
        populate: [
          {
            path: "author",
            select: "-OTP -refreshToken -password",
          },
          {
            path: "supervisorComments.commentedBy",
            select: "-OTP -refreshToken -password",
          }
        ],
      })
      .populate([
        { path: "proposal.evaluations", populate: { path: "evaluator" } },
        { path: "mid.evaluations", populate: { path: "evaluator" } },
        { path: "final.evaluations", populate: { path: "evaluator" } },
      ]);

    // Check if project exists
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Verify supervisor is assigned to this project
    if (project.supervisor?.supervisorId?.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to view this project" });
    }

    // Send response
    return res.status(200).json({
      data: project,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};
const getAllActiveEvents = async (req, res) => {
  try {
    const events = await Event.find({
      eventStatus: eventStatusList.active,
    });

    if (!events.length) return res.sendStatus(204);

    return res.status(200).json({
      data: events,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const toogleAvailabilityOfSupervisor = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    console.log(
      "🚀 ~ toogleAvailabilityOfSupervisor ~ isAvailable:",
      isAvailable
    );

    //get the current sueprviso
    const updatedSupervisor = await Supervisor.findOneAndUpdate(
      { _id: req.userId },
      { $set: { isAvailable: isAvailable } },
      { new: true }
    );
    console.log(
      "🚀 ~ toogleAvailabilityOfSupervisor ~ updatedSupervisor:",
      updatedSupervisor
    );

    return res.status(200).json({
      data: updatedSupervisor,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const progressLogVerify = async (req, res) => {
  // Check if ID is provided
  if (!req?.params?.id) {
    // id of the progresslog
    return res.sendStatus(400);
  }
  try {
    const { approvedDate } = req.body;
    console.log("🚀 ~ progressLogVerify ~ approvedDate:", approvedDate);
    // Find event by ID and populate the author field
    const progressLog = await ProgressLog.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          approved: true,
          approvedDate: approvedDate,
        },
      },
      { new: true } // This option returns the updated document
    );

    // Check if event exists
    if (!progressLog) {
      return res.sendStatus(204);
    }
    console.log("🚀 ~ progressLogVerify ~ progressLog:", progressLog);
    // Send response
    return res.status(200).json({
      data: progressLog,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

const progressLogApprovalGrant = async (req, res, next) => {
  try {
    if (!req?.params?.id) {
      return next(new AppError('Project ID is required', 400));
    }

    const projectId = req.params.id;
    const { defenseType, approvedDate } = req.body;

    if (!defenseType || !approvedDate) {
      return next(new AppError('Defense type and approved date are required', 400));
    }

    const result = await transactionService.executeTransaction(async (session) => {

      // Find project with populated data
      const project = await Project.findById(projectId)
        .populate([
          { path: "teamMembers", select: "-OTP -password -refreshToken" },
          { path: "progressLogs", model: "ProgressLog" },
        ])
        .session(session);


      if (!project) {
        throw new AppError('Project not found', 404);
      }

      // Verify supervisor is assigned to this project
      if (project.supervisor?.supervisorId?.toString() !== req.userId.toString()) {
        throw new AppError('You are not the supervisor of this project', 403);
      }


      // Check if all progress logs are verified
      const isProgressLogHasBeenVerified = project.progressLogs && project.progressLogs.length > 0 ?
        project.progressLogs.every(progressLog => progressLog.approved === true) : true;

      console.log("🚀 ~progressLogApprovalGrant ~ isProgressLogHasBeenVerified:", isProgressLogHasBeenVerified);

      if (!isProgressLogHasBeenVerified) {
        throw new AppError('All progress logs must be verified before approval', 409);
      }

      // Update supervisor approval
      if (!project.supervisor[defenseType]) {
        project.supervisor[defenseType] = {};
      }
      project.supervisor[defenseType].approved = true;
      project.supervisor[defenseType].approvedDate = approvedDate;

      // Update team members' progress status using bulkWrite
      const bulkOperations = project.teamMembers.map(student => {
        const evaluationType = defenseType;
        let newProgressStatus;

        switch (project.projectType) {
          case "1":
            newProgressStatus = updateMinorProgressStatus(
              progressStatusEligibilityCode[evaluationType].approvalFromSupervisor
            );
            break;
          case "2":
            newProgressStatus = updateMajorProgressStatus(
              progressStatusEligibilityCode[evaluationType].approvalFromSupervisor
            );
            break;
          default:
            throw new AppError('Invalid project type', 400);
        }

        return {
          updateOne: {
            filter: { _id: student._id },
            update: { progressStatus: newProgressStatus }
          }
        };
      });

      // Execute bulk update with session
      if (bulkOperations.length > 0) {
        await Project.findById(project._id).session(session);
        await Student.bulkWrite(bulkOperations, { session });
      }

      // Save project changes
      await project.save({ session });
      return project;
    });

    res.status(200).json({
      status: 'success',
      message: 'Progress approval granted successfully',
      data: {
        project: result
      }
    });

  } catch (error) {
    next(error);
  }
};

// Bulk verify progress logs
const bulkVerifyProgressLogs = async (req, res, next) => {
  try {
    const { progressLogIds, approvedDate } = req.body;

    if (!progressLogIds || !Array.isArray(progressLogIds) || progressLogIds.length === 0) {
      return next(new AppError('Progress log IDs are required', 400));
    }

    if (!approvedDate) {
      return next(new AppError('Approved date is required', 400));
    }

    const result = await transactionService.executeTransaction(async (session) => {
      // Verify all progress logs in bulk
      const updateResult = await ProgressLog.updateMany(
        { 
          _id: { $in: progressLogIds },
          approved: false // Only update unverified logs
        },
        {
          $set: {
            approved: true,
            approvedDate: approvedDate,
            approvedBy: req.userId
          }
        },
        { session }
      );

      // Get updated progress logs with populated data
      const updatedLogs = await ProgressLog.find({ _id: { $in: progressLogIds } })
        .populate('author', 'fullname email')
        .populate('approvedBy', 'fullname email')
        .session(session);

      return {
        modifiedCount: updateResult.modifiedCount,
        progressLogs: updatedLogs
      };
    });

    res.status(200).json({
      status: 'success',
      message: `${result.modifiedCount} progress logs verified successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        progressLogs: result.progressLogs
      }
    });

  } catch (error) {
    next(error);
  }
};

// Add comment to progress log
const addProgressLogComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return next(new AppError('Comment is required', 400));
    }

    const result = await transactionService.executeTransaction(async (session) => {
      // Add comment to progress log
      const updatedLog = await ProgressLog.findByIdAndUpdate(
        id,
        {
          $push: {
            supervisorComments: {
              comment: comment.trim(),
              commentedBy: req.userId,
              commentedAt: new Date()
            }
          }
        },
        { 
          new: true,
          session 
        }
      ).populate([
        { path: 'author', select: 'fullname email' },
        { path: 'supervisorComments.commentedBy', select: 'fullname email' }
      ]);

      if (!updatedLog) {
        throw new AppError('Progress log not found', 404);
      }

      return updatedLog;
    });

    res.status(200).json({
      status: 'success',
      message: 'Comment added successfully',
      data: {
        progressLog: result
      }
    });

  } catch (error) {
    next(error);
  }
};

// Request password change OTP
const requestPasswordChangeOTP = async (req, res) => {
  try {
    console.log('Supervisor Request password change otp')
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    console.log('id:', id);
    console.log('currentPassword:', currentPassword);
    console.log('newPassword:', newPassword);
    console.log('confirmPassword:', confirmPassword);
    
    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Current password, new password, and confirm password are required" 
      });
    }

    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "New password and confirm password do not match" 
      });
    }

    // Find supervisor by ID (include password for verification)
    const supervisor = await Supervisor.findById(id).select('+password');
    if (!supervisor) {
      return res.status(404).json({ 
        success: false,
        message: "Supervisor not found" 
      });
    }

    // Verify current password
    const isPasswordValid = await supervisor.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    // Generate OTP (6-digit random number)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP and expiry in supervisor document
    supervisor.OTP = otp;
    supervisor.OTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await supervisor.save();

    // Send OTP via email
    await emailService.sendOTPEmail(
      supervisor.email,
      otp,
      supervisor.fullname
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent to your registered email for password change verification. Please check your email and enter the OTP to change your password within 10 minutes.",
      data: { 
        otpSent: true,
        email: supervisor.email
      }
    });
  } catch (error) {
    console.error("OTP request error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to send OTP. Please try again." 
    });
  }
};

// Change supervisor password
const changeSupervisorPassword = async (req, res) => {
  try {
    const { id, otp } = req.params;
    const { newPassword } = req.body;
    
    console.log("🚀 ~ changeSupervisorPassword block");
    console.log("🚀 ~ req.params:", req.params);
    console.log("🚀 ~ req.body:", req.body);
    
    // Validate required fields
    if (!newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "New password is required" 
      });
    }

    // Find supervisor by ID (include OTP fields for verification)
    const supervisor = await Supervisor.findById(id).select('+OTP +OTPExpiry');
    if (!supervisor) {
      return res.status(404).json({ 
        success: false,
        message: "Supervisor not found" 
      });
    }

    console.log("🚀 ~ supervisor.OTP:", supervisor);
    console.log("🚀 ~ otp:", otp);
    // Verify OTP
    if (!supervisor.OTP || supervisor.OTP !== otp) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid OTP" 
      });
    }
    
    // Check OTP expiry
    if (supervisor.OTPExpiry && new Date() > supervisor.OTPExpiry) {
      return res.status(400).json({ 
        success: false,
        message: "OTP has expired. Please request a new one." 
      });
    }

    // Validate new password strength (basic validation)
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters long" 
      });
    }

    // Update password
    supervisor.password = newPassword;
    
    // Clear OTP after successful password change
    supervisor.OTP = undefined;
    supervisor.OTPExpiry = undefined;
    
    await supervisor.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Password change error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to change password. Please try again." 
    });
  }
};

module.exports = {
  getAllActiveProjects,
  getAllArchiveProjects,
  getProjectById,
  getAllActiveEvents,
  toogleAvailabilityOfSupervisor,
  progressLogVerify,
  progressLogApprovalGrant,
  bulkVerifyProgressLogs,
  addProgressLogComment,
  // Profile Management
  getSupervisorProfile,
  updateSupervisorProfile,
  updateSupervisorPhoto,
  // Password Management
  requestPasswordChangeOTP,
  changeSupervisorPassword,
};
