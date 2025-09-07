/**
 * Reminder Controller
 * Handles reminder-related API endpoints
 */

const { AppError } = require('../../middleware/errorHandler');
const ReminderNotificationService = require('../../services/email/reminderNotificationService');
const Meeting = require('../../models/system/Meeting');
const Project = require('../../models/academic/Project');
const roleList = require('../../config/constants/roles');

/**
 * Set general reminder for a meeting
 * POST /api/reminders/general/:meetingId
 */
const setGeneralReminder = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const { timeBefore } = req.body;
    const { userId, userRole } = req.user;

    console.log('Setting general reminder:', { meetingId, timeBefore, userId, userRole });

    // Validate input
    if (!timeBefore || timeBefore < 5 || timeBefore > 1440) {
      return next(new AppError('Time before must be between 5 and 1440 minutes', 400));
    }

    // Get meeting
    const meeting = await Meeting.findById(meetingId)
      .populate('project', 'projectName teamMembers supervisor')
      .lean();

    if (!meeting) {
      return next(new AppError('Meeting not found', 404));
    }

    console.log('Meeting found:', {
      meetingId: meeting._id,
      projectId: meeting.project._id,
      projectName: meeting.project.projectName,
      students: meeting.student,
      supervisor: meeting.supervisor
    });

    // Check if user has permission to set reminder
    let canSetReminder = false;

    console.log('Permission check:', {
      userRole,
      userId,
      meetingStudents: meeting.student,
      meetingSupervisor: meeting.supervisor,
      roleList
    });

    if (userRole == roleList.Admin || userRole === 'Admin') {
      canSetReminder = true;
    } else if (userRole == roleList.Student || userRole === 'Student') {
      // Check if user is in the meeting's student array
      canSetReminder = meeting.student.some(studentId => studentId.toString() === userId.toString());
    } else if (userRole == roleList.Supervisor || userRole === 'Supervisor') {
      // Check if user is the meeting's supervisor
      canSetReminder = meeting.supervisor.toString() === userId.toString();
    }

    console.log('Can set reminder:', canSetReminder);

    if (!canSetReminder) {
      return next(new AppError('Permission denied to set reminder for this meeting', 403));
    }

    // Update meeting with general reminder
    console.log('Updating meeting with general reminder...');
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      {
        'reminders.general.enabled': true,
        'reminders.general.timeBefore': timeBefore,
        'reminders.general.setBy': userId,
        'reminders.general.setByModel': userRole == roleList.Student ? 'Student' :
          userRole == roleList.Supervisor ? 'Supervisor' : 'Admin',
        'reminders.general.setAt': new Date(),
        $push: {
          history: {
            action: 'reminder_set',
            performedBy: userId,
            performedByModel: userRole == roleList.Student ? roleList.Student :
              userRole == roleList.Supervisor ? roleList.Supervisor : roleList.Admin,
            details: `General reminder set for ${timeBefore} minutes before meeting`
          }
        }
      },
      { new: true }
    );

    console.log('Meeting updated successfully:', updatedMeeting ? 'Yes' : 'No');

    // Note: General reminder emails will be sent automatically by the cron service
    // at the scheduled time (e.g., 5 minutes before the meeting)
    console.log('General reminder set successfully. Email will be sent automatically at the scheduled time.');

    res.status(200).json({
      success: true,
      message: 'General reminder set successfully',
      data: {
        meeting: updatedMeeting,
        reminder: {
          type: 'general',
          enabled: true,
          timeBefore: timeBefore,
          setBy: userId,
          setAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error in setGeneralReminder:', error);
    next(error);
  }
};

/**
 * Set personal reminder for a meeting
 * POST /api/reminders/personal/:meetingId
 */
const setPersonalReminder = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const { timeBefore } = req.body;
    const { userId, userRole } = req.user;

    // Validate input
    if (!timeBefore || timeBefore < 5 || timeBefore > 1440) {
      return next(new AppError('Time before must be between 5 and 1440 minutes', 400));
    }

    // Get meeting
    const meeting = await Meeting.findById(meetingId)
      .populate('project', 'teamMembers supervisor')
      .lean();

    if (!meeting) {
      return next(new AppError('Meeting not found', 404));
    }

    // Check if user has permission to set reminder
    let canSetReminder = false;

    if (userRole == roleList.Admin || userRole === 'Admin') {
      canSetReminder = true;
    } else if (userRole == roleList.Student || userRole === 'Student') {
      // Check if user is in the meeting's student array
      canSetReminder = meeting.student.some(studentId => studentId.toString() === userId.toString());
    } else if (userRole == roleList.Supervisor || userRole === 'Supervisor') {
      // Check if user is the meeting's supervisor
      canSetReminder = meeting.supervisor.toString() === userId.toString();
    }

    if (!canSetReminder) {
      return next(new AppError('Permission denied to set reminder for this meeting', 403));
    }

    // Update meeting with personal reminder
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      {
        'reminders.personal.enabled': true,
        'reminders.personal.timeBefore': timeBefore,
        'reminders.personal.setBy': userId,
        'reminders.personal.setByModel': userRole == roleList.Student ? 'Student' :
          userRole == roleList.Supervisor ? 'Supervisor' : 'Admin',
        'reminders.personal.setAt': new Date(),
        $push: {
          history: {
            action: 'reminder_set',
            performedBy: userId,
            performedByModel: userRole == roleList.Student ? roleList.Student :
              userRole == roleList.Supervisor ? roleList.Supervisor : roleList.Admin,
            details: `Personal reminder set for ${timeBefore} minutes before meeting`
          }
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Personal reminder set successfully',
      data: {
        meeting: updatedMeeting,
        reminder: {
          type: 'personal',
          enabled: true,
          timeBefore: timeBefore,
          setBy: userId,
          setAt: new Date()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update reminder settings
 * PUT /api/reminders/:meetingId
 */
const updateReminder = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const { reminderType, timeBefore, enabled } = req.body;
    const { userId, userRole } = req.user;

    console.log('Updating reminder:', { meetingId, reminderType, timeBefore, enabled, userId, userRole });

    // Validate input
    if (!reminderType || !['general', 'personal'].includes(reminderType)) {
      return next(new AppError('Invalid reminder type. Must be "general" or "personal"', 400));
    }

    if (timeBefore && (timeBefore < 5 || timeBefore > 1440)) {
      return next(new AppError('Time before must be between 5 and 1440 minutes', 400));
    }

    // Get meeting
    const meeting = await Meeting.findById(meetingId)
      .populate('project', 'teamMembers supervisor')
      .lean();
    console.log('Meeting found:', meeting);

    if (!meeting) {
      return next(new AppError('Meeting not found', 404));
    }

    // Check if user has permission to update reminder
    console.log('User role:', userRole);
    console.log('User ID:', userId);
    console.log('Meeting project team members:', meeting.project.teamMembers);
    console.log('Meeting project supervisor:', meeting.project.supervisor);
    console.log(userRole == roleList.Admin, userRole == roleList.Student, userRole == roleList.Supervisor);
    const canUpdateReminder = userRole == roleList.Admin ||
      (userRole == roleList.Student && meeting.project.teamMembers.some(member => member.toString() === userId.toString()) ||
      (userRole == roleList.Supervisor && meeting.project.supervisor.toString() === userId.toString()));

    console.log('Can update reminder:', canUpdateReminder);

    if (!canUpdateReminder) {
      return next(new AppError('Permission denied to update reminder for this meeting', 403));
    }

    // Prepare update data
    const updateData = {};
    if (timeBefore !== undefined) {
      updateData[`reminders.${reminderType}.timeBefore`] = timeBefore;
    }
    if (enabled !== undefined) {
      updateData[`reminders.${reminderType}.enabled`] = enabled;
    }

    console.log('Working before updating meeting')
    // Update meeting
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      {
        ...updateData,
        $push: {
          history: {
            action: 'reminder_updated',
            performedBy: userId,
            performedByModel: userRole == roleList.Student ? roleList.Student :
              userRole == roleList.Supervisor ? roleList.Supervisor : roleList.Admin,
            details: `${reminderType} reminder updated`
          }
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `${reminderType} reminder updated successfully`,
      data: {
        meeting: updatedMeeting,
        reminder: {
          type: reminderType,
          enabled: updatedMeeting.reminders[reminderType].enabled,
          timeBefore: updatedMeeting.reminders[reminderType].timeBefore,
          setBy: updatedMeeting.reminders[reminderType].setBy,
          setAt: updatedMeeting.reminders[reminderType].setAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reminder settings for a meeting
 * GET /api/reminders/:meetingId
 */
const getReminderSettings = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const { userId, userRole } = req.user;

    // Get meeting
    const meeting = await Meeting.findById(meetingId)
      .populate('project', 'teamMembers supervisor')
      .lean();

    if (!meeting) {
      return next(new AppError('Meeting not found', 404));
    }

    // Check if user has permission to view reminder settings
    const canViewReminder = userRole == roleList.Admin ||
      (userRole == roleList.Student && meeting.project.teamMembers.some(member => member.toString() === userId)) ||
      (userRole == roleList.Supervisor && meeting.project.supervisor.toString() === userId);

    if (!canViewReminder) {
      return next(new AppError('Permission denied to view reminder settings for this meeting', 403));
    }

    res.status(200).json({
      success: true,
      data: {
        meetingId: meeting._id,
        title: meeting.title,
        scheduledDate: meeting.scheduledDate,
        reminders: meeting.reminders
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Test reminder notification
 * POST /api/reminders/test/:meetingId
 */
const testReminder = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const { reminderType } = req.body;
    const { userId, userRole } = req.user;

    // Validate input
    if (!reminderType || !['general', 'personal'].includes(reminderType)) {
      return next(new AppError('Invalid reminder type. Must be "general" or "personal"', 400));
    }

    // Get meeting
    const meeting = await Meeting.findById(meetingId)
      .populate('project', 'teamMembers supervisor')
      .lean();

    if (!meeting) {
      return next(new AppError('Meeting not found', 404));
    }

    // Check if user has permission to test reminder
    const canTestReminder = userRole == roleList.Admin ||
      (userRole == roleList.Student && meeting.project.teamMembers.some(member => member.toString() === userId)) ||
      (userRole == roleList.Supervisor && meeting.project.supervisor.toString() === userId);

    if (!canTestReminder) {
      return next(new AppError('Permission denied to test reminder for this meeting', 403));
    }

    // Send test reminder
    try {
      if (reminderType === 'general') {
        await ReminderNotificationService.sendGeneralReminderNotification(meeting, meeting.project._id);
      } else {
        await ReminderNotificationService.sendPersonalReminderNotification(
          meeting,
          meeting.project._id,
          userId,
          userRole == roleList.Student ? 'Student' :
            userRole == roleList.Supervisor ? 'Supervisor' : 'Admin'
        );
      }

      res.status(200).json({
        success: true,
        message: `Test ${reminderType} reminder sent successfully`
      });
    } catch (emailError) {
      console.error('Test reminder email failed:', emailError);
      res.status(500).json({
        success: false,
        message: 'Test reminder email failed',
        error: emailError.message
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Process pending reminders (for cron jobs)
 * POST /api/reminders/process
 */
const processPendingReminders = async (req, res, next) => {
  try {
    const { reminderType = 'general' } = req.body;

    // Validate input
    if (!['general', 'personal'].includes(reminderType)) {
      return next(new AppError('Invalid reminder type. Must be "general" or "personal"', 400));
    }

    // Process pending reminders
    const result = await ReminderNotificationService.processPendingReminders(reminderType);

    res.status(200).json({
      success: true,
      message: `Processed ${result.processed} ${reminderType} reminders`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setGeneralReminder,
  setPersonalReminder,
  updateReminder,
  getReminderSettings,
  testReminder,
  processPendingReminders
};
