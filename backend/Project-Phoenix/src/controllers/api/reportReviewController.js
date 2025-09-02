const ReportReview = require('../../models/academic/ReportReview');
const Project = require('../../models/academic/Project');
const { AppError } = require('../../middleware/errorHandler');
const { uploadFile } = require('../helpers/file/uploadFile');
const transactionService = require('../../services/database/transactionService');
const eventStatusList = require('../../config/constants/eventStatusList');

// Student submits report for review
const submitReportForReview = async (req, res, next) => {
  
  try {
    console.log("Report Submit For Review Block")
    const { projectId, reportType, version } = req.body;
    console.log("projectId:", projectId, "reportType:", reportType, "version:", version)

    if (!projectId || !reportType || !req.file) {
      return next(new AppError('Missing required fields', 400));
    }
    console.log("req.userId:", req.userId)

    const result = await transactionService.executeTransaction(async (session) => {
      // Validate project exists and user is a team member
      const project = await Project.findOne({
        _id: projectId,
        teamMembers: { $in: [req.userId.toString()] },
        status: eventStatusList.active,
      }).session(session);

      if (!project) {
        throw new AppError('Project not found or you are not a team member', 404);
      }

      // Upload file to cloudinary
      const uploadResult = await uploadFile(req.file.path);
      if (!uploadResult?.secure_url) {
        throw new AppError('File upload failed', 500);
      }

      // Create report review entry
      const reportReview = await ReportReview.create([{
        projectId,
        reportType,
        version: version || 1,
        submittedBy: req.userId,
        reportFile: {
          filePath: uploadResult.secure_url,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        },
        status: 'submitted'
      }], { session });

      return reportReview[0];
    });

    res.status(201).json({
      status: 'success',
      message: 'Report submitted for review successfully',
      data: {
        reportReview: result
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get reports for supervisor review
const getReportsForReview = async (req, res, next) => {
  try {
    const { status, reportType } = req.query;

    // First, find all projects where this supervisor is assigned
    const projects = await Project.find({
      'supervisor.supervisorId': req.userId,
      status: eventStatusList.active
    }).select('_id');

    const projectIds = projects.map(project => project._id);

    // Build query for reports from supervisor's projects
    const query = {
      projectId: { $in: projectIds },
      isActive: true
    };

    if (status) {
      query.status = status;
    }

    if (reportType) {
      query.reportType = reportType;
    }

    const reports = await ReportReview.find(query)
      .populate('projectId', 'projectName projectCode teamMembers supervisor')
      .populate('submittedBy', 'fullname email rollNumber')
      .populate('projectId.teamMembers', 'fullname email rollNumber')
      .populate('supervisorFeedback.reviewedBy', 'fullname email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        reports
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get specific report for review
const getReportForReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await ReportReview.findById(id)
      .populate('projectId', 'projectName projectCode teamMembers supervisor')
      .populate('submittedBy', 'fullname email rollNumber')
      .populate('projectId.teamMembers', 'fullname email rollNumber')
      .populate('supervisorFeedback.reviewedBy', 'fullname email')
      .populate('supervisorFeedback.sectionFeedback.commentedBy', 'fullname email');

    if (!report) {
      return next(new AppError('Report not found', 404));
    }

    // Verify supervisor is assigned to this project
    if (report.projectId.supervisor?.supervisorId?.toString() !== req.userId.toString()) {
      return next(new AppError('You are not authorized to review this report', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        report
      }
    });

  } catch (error) {
    next(error);
  }
};

// Add section feedback
const addSectionFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sectionTitle, pageNumber, comment, feedbackType, priority } = req.body;

    if (!sectionTitle || !pageNumber || !comment) {
      return next(new AppError('Missing required fields', 400));
    }

    const result = await transactionService.executeTransaction(async (session) => {
      const report = await ReportReview.findById(id).session(session);

      if (!report) {
        throw new AppError('Report not found', 404);
      }

      // Add section feedback
      const sectionFeedback = {
        sectionTitle,
        pageNumber,
        comment,
        feedbackType: feedbackType || 'suggestion',
        priority: priority || 'medium',
        commentedBy: req.userId,
        commentedAt: new Date()
      };

      report.supervisorFeedback.sectionFeedback.push(sectionFeedback);
      report.status = 'under_review';
      report.supervisorFeedback.reviewedBy = req.userId;
      report.supervisorFeedback.reviewedAt = new Date();

      await report.save({ session });

      return report;
    });

    res.status(200).json({
      status: 'success',
      message: 'Section feedback added successfully',
      data: {
        report: result
      }
    });

  } catch (error) {
    next(error);
  }
};

// Add overall comments
const addOverallComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { overallComments } = req.body;

    if (!overallComments) {
      return next(new AppError('Overall comments are required', 400));
    }

    const result = await transactionService.executeTransaction(async (session) => {
      const report = await ReportReview.findById(id).session(session);

      if (!report) {
        throw new AppError('Report not found', 404);
      }

      report.supervisorFeedback.overallComments = overallComments;
      report.supervisorFeedback.reviewedBy = req.userId;
      report.supervisorFeedback.reviewedAt = new Date();

      await report.save({ session });

      return report;
    });

    res.status(200).json({
      status: 'success',
      message: 'Overall comments added successfully',
      data: {
        report: result
      }
    });

  } catch (error) {
    next(error);
  }
};

// Approve or reject report
const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, overallComments } = req.body;

    if (!status || !['approved', 'needs_revision', 'rejected'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const result = await transactionService.executeTransaction(async (session) => {
      const report = await ReportReview.findById(id).session(session);

      if (!report) {
        throw new AppError('Report not found', 404);
      }

      report.status = status;
      report.supervisorFeedback.reviewedBy = req.userId;
      report.supervisorFeedback.reviewedAt = new Date();

      if (overallComments) {
        report.supervisorFeedback.overallComments = overallComments;
      }

      if (status === 'approved') {
        report.supervisorFeedback.approvedAt = new Date();
      }

      await report.save({ session });

      return report;
    });

    res.status(200).json({
      status: 'success',
      message: `Report ${status} successfully`,
      data: {
        report: result
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get student's submitted reports
const getStudentReports = async (req, res, next) => {
  try {
    const { projectId, reportType } = req.query;

    const query = {
      submittedBy: req.userId,
      isActive: true
    };

    if (projectId) {
      query.projectId = projectId;
    }

    if (reportType) {
      query.reportType = reportType;
    }

    const reports = await ReportReview.find(query)
      .populate('projectId', 'projectName projectCode')
      .populate('supervisorFeedback.reviewedBy', 'fullname email')
      .populate('supervisorFeedback.sectionFeedback.commentedBy', 'fullname email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        reports
      }
    });

  } catch (error) {
    next(error);
  }
};

// Student responds to feedback
const respondToFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { responseComments } = req.body;

    if (!responseComments) {
      return next(new AppError('Response comments are required', 400));
    }

    const result = await transactionService.executeTransaction(async (session) => {
      const report = await ReportReview.findById(id).session(session);

      if (!report) {
        throw new AppError('Report not found', 404);
      }

      // Verify student owns this report
      if (report.submittedBy.toString() !== req.userId.toString()) {
        throw new AppError('You are not authorized to respond to this report', 403);
      }

      report.studentResponse.responseComments = responseComments;
      report.studentResponse.respondedAt = new Date();

      await report.save({ session });

      return report;
    });

    res.status(200).json({
      status: 'success',
      message: 'Response to feedback submitted successfully',
      data: {
        report: result
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReportForReview,
  getReportsForReview,
  getReportForReview,
  addSectionFeedback,
  addOverallComments,
  updateReportStatus,
  getStudentReports,
  respondToFeedback
};
