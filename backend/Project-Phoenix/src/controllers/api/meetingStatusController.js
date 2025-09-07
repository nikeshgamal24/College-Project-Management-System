const MeetingStatusService = require('../../services/meeting/meetingStatusService');
const meetingCronService = require('../../services/meeting/meetingCronService');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Controller for meeting status management
 */

// Get meetings that need status updates
const getMeetingsNeedingUpdate = async (req, res, next) => {
  try {
    const meetings = await MeetingStatusService.getMeetingsNeedingUpdate();
    
    res.status(200).json({
      success: true,
      message: 'Meetings needing update retrieved successfully',
      data: meetings
    });
  } catch (error) {
    next(error);
  }
};

// Process all meetings for status updates
const processAllMeetings = async (req, res, next) => {
  try {
    const result = await MeetingStatusService.processAllMeetings();
    
    res.status(200).json({
      success: true,
      message: 'All meetings processed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Manually update meeting status
const manualStatusUpdate = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const { newStatus, reason } = req.body;
    const updatedBy = req.userId;

    if (!newStatus) {
      throw new AppError('New status is required', 400);
    }

    const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'archived'];
    if (!validStatuses.includes(newStatus)) {
      throw new AppError('Invalid status. Must be one of: ' + validStatuses.join(', '), 400);
    }

    const result = await MeetingStatusService.manualStatusUpdate(
      meetingId,
      newStatus,
      reason || 'Manual update',
      updatedBy
    );

    res.status(200).json({
      success: true,
      message: 'Meeting status updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Get cron service status
const getCronStatus = async (req, res, next) => {
  try {
    const status = meetingCronService.getStatus();
    
    res.status(200).json({
      success: true,
      message: 'Cron service status retrieved successfully',
      data: status
    });
  } catch (error) {
    next(error);
  }
};

// Start cron service
const startCronService = async (req, res, next) => {
  try {
    meetingCronService.start();
    
    res.status(200).json({
      success: true,
      message: 'Cron service started successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Stop cron service
const stopCronService = async (req, res, next) => {
  try {
    meetingCronService.stop();
    
    res.status(200).json({
      success: true,
      message: 'Cron service stopped successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Run specific job manually
const runJob = async (req, res, next) => {
  try {
    const { jobName } = req.params;
    
    const validJobs = ['statusCheck', 'dailyCleanup', 'weeklyReport'];
    if (!validJobs.includes(jobName)) {
      throw new AppError('Invalid job name. Must be one of: ' + validJobs.join(', '), 400);
    }

    await meetingCronService.runJob(jobName);
    
    res.status(200).json({
      success: true,
      message: `Job ${jobName} completed successfully`
    });
  } catch (error) {
    next(error);
  }
};

// Get meeting statistics
const getMeetingStatistics = async (req, res, next) => {
  try {
    const stats = await meetingCronService.getMeetingStatistics();
    
    res.status(200).json({
      success: true,
      message: 'Meeting statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeetingsNeedingUpdate,
  processAllMeetings,
  manualStatusUpdate,
  getCronStatus,
  startCronService,
  stopCronService,
  runJob,
  getMeetingStatistics
};
