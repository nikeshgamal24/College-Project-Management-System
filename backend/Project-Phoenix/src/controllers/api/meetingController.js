const Meeting = require('../../models/system/Meeting');
const Project = require('../../models/academic/Project');
const Student = require('../../models/user/Student');
const Supervisor = require('../../models/user/Supervisor');
const { AppError } = require('../../middleware/errorHandler');
const transactionService = require('../../services/database/transactionService');
const eventStatusList = require('../../config/constants/eventStatusList');
const { sendMailToUser } = require('../helpers/email/sendMailToUser');
const MeetingNotificationService = require('../../services/email/meetingNotificationService');
const roleList = require('../../config/constants/roles');

// Create a new meeting
const createMeeting = async (req, res, next) => {
  try {
    const meeting = await transactionService.executeTransaction(async (session) => {
      const {
        title,
        description,
        meetingType,
        studentId,
        projectId,
        scheduledDate,
        duration,
        meetingLocation,
        roomDetails,
        virtualMeetingLink,
        agenda,
        isRecurring,
        recurringPattern
      } = req.body;

      // Validate required fields
      if (!title || !meetingType || !studentId || !projectId || !scheduledDate || !duration) {
        throw new AppError('Missing required fields', 400);
      }

      console.log('Project ID:', projectId);
      console.log('User ID:', req.userId);
      console.log('User Role:', req.role);
      console.log('Student ID:', studentId);
      console.log('Scheduled Date:', scheduledDate);
      console.log('Duration:', duration);
      console.log('Meeting Type:', meetingType);

      // Verify project exists and user has access
      const project = await Project.findOne({
        _id: projectId,
        $or: [
          { teamMembers: { $in: [req.userId] } },
          { supervisor: req.userId }
        ],
        status: eventStatusList.active
      }).session(session);

      if (!project) {
        throw new AppError('Project not found or access denied', 404);
      }

      // Verify student exists and is part of the project
      if (!project.teamMembers.includes(studentId)) {
        throw new AppError('Student is not part of this project', 403);
      }

      const student = await Student.findOne({
        _id: studentId
      }).session(session);

      if (!student) {
        throw new AppError('Student not found or not part of this project', 404);
      }

      // Verify supervisor exists and is assigned to the project
      const supervisor = await Supervisor.findOne({
        _id: project.supervisor.supervisorId
      }).session(session);

      if (!supervisor) {
        throw new AppError('Supervisor not found for this project', 404);
      }

      // Check for scheduling conflicts
      const conflictCheck = await Meeting.findOne({
        $or: [
          { supervisor: supervisor._id },
          { student: studentId }
        ],
        scheduledDate: {
          $gte: new Date(scheduledDate),
          $lt: new Date(new Date(scheduledDate).getTime() + duration * 60000)
        },
        status: { $nin: ['cancelled'] }
      }).session(session);

      if (conflictCheck) {
        throw new AppError('Scheduling conflict detected. Please choose a different time.', 409);
      }

      // Convert role number to string for enum validation
      const getRoleString = (roleNumber) => {
        if (roleNumber == roleList.Student) return 'Student';
        if (roleNumber == roleList.Supervisor) return 'Supervisor';
        if (roleNumber == roleList.Admin) return 'Admin';
        return 'Student'; // default fallback
      };

      const userRoleString = getRoleString(req.role ? req.role[0] : roleList.Student);

      // Create meeting object with all team members
      const meetingData = {
        title,
        description,
        meetingType,
        supervisor: supervisor._id,
        student: project.teamMembers, // Include all team members
        project: projectId,
        scheduledDate: new Date(scheduledDate),
        duration,
        meetingLocation,
        roomDetails,
        virtualMeetingLink,
        agenda,
        createdBy: req.userId,
        createdByModel: userRoleString,
        history: [{
          action: 'created',
          performedBy: req.userId,
          performedByModel: roleList.userRoleString,
          details: `Meeting created by ${userRoleString} for all team members`
        }]
      };

      console.log('Meeting data being created:', JSON.stringify(meetingData, null, 2));
      console.log('Supervisor ID:', supervisor._id);
      console.log('Student ID:', studentId);
      console.log('Project ID:', projectId);

      // Handle recurring meetings
      if (isRecurring && recurringPattern) {
        meetingData.isRecurring = true;
        meetingData.recurringPattern = recurringPattern;
      }

      const meeting = new Meeting(meetingData);
      await meeting.save({ session });

      // Populate the meeting for response
      await meeting.populate([
        { path: 'supervisor', select: 'fullname email photo' },
        { path: 'student', select: 'fullname email rollNumber photo' },
        { path: 'project', select: 'projectName' }
      ]);

      // Send email notifications
      try {
        // Send meeting request notification to supervisor
        await MeetingNotificationService.sendMeetingRequestNotification(
          meeting,
          studentId,
          projectId
        );
        console.log('Meeting request notification sent to supervisor');
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the meeting creation if email fails
      }

      return meeting;
    });

    res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

// Get meetings for a user
const getMeetings = async (req, res, next) => {
  try {
    const { startDate, endDate, status, meetingType } = req.query;
    const userId = req.userId;
    const userRole = req.role ? req.role[0] : 'student';

    let query = {};

    // Build query based on user role
    if (userRole == roleList.Student) {
      query.student = { $in: [userId.toString()] };
    } else if (userRole == roleList.Supervisor) {
      query.supervisor = userId.toString();
    } else if (userRole == roleList.Admin) {
      // Admin can see all meetings
    } else {
      throw new AppError('Invalid user role', 403);
    }

    // Add date range filter
    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add meeting type filter
    if (meetingType) {
      query.meetingType = meetingType;
    }

    const meetings = await Meeting.find(query)
      .populate('supervisor', 'fullname email photo')
      .populate('student', 'fullname email rollNumber photo')
      .populate('project', 'projectName')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific meeting
const getMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.role ? req.role[0] : 'student';

    const meeting = await Meeting.findById(id)
      .populate('supervisor', 'fullname email photo')
      .populate('student', 'fullname email rollNumber photo')
      .populate('project', 'projectName');

    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    // Check if user has access to this meeting
    const hasAccess = userRole === 'admin' ||
      (userRole === 'student' && meeting.student.some(s => s._id.toString() === userId)) ||
      (userRole === 'supervisor' && meeting.supervisor._id.toString() === userId);

    if (!hasAccess) {
      throw new AppError('Access denied to this meeting', 403);
    }

    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

// Update a meeting
const updateMeeting = async (req, res, next) => {
  try {
    const meeting = await transactionService.executeTransaction(async (session) => {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.userId;
      const userRole = req.role ? req.role[0] : 'student';

      const meeting = await Meeting.findById(id).session(session);

      if (!meeting) {
        throw new AppError('Meeting not found', 404);
      }

      // Check if user has permission to update this meeting
      // Only supervisors and admins can edit meetings after they are created
      const canUpdate = userRole == roleList.Admin ||
        (userRole == roleList.Supervisor && meeting.supervisor.toString() === userId.toString());

      if (!canUpdate) {
        throw new AppError('Only supervisors can edit meetings after they are created', 403);
      }

      // Check if meeting can be updated (not completed or cancelled)
      if (meeting.status === 'completed' || meeting.status === 'cancelled') {
        throw new AppError('Cannot update completed or cancelled meetings', 400);
      }

      // If rescheduling, check for conflicts
      if (updateData.scheduledDate || updateData.duration) {
        const newDate = updateData.scheduledDate || meeting.scheduledDate;
        const newDuration = updateData.duration || meeting.duration;

        const conflictCheck = await Meeting.findOne({
          _id: { $ne: id },
          $or: [
            { supervisor: meeting.supervisor },
            { student: { $in: meeting.student } }
          ],
          scheduledDate: {
            $gte: new Date(newDate),
            $lt: new Date(new Date(newDate).getTime() + newDuration * 60000)
          },
          status: { $nin: ['cancelled'] }
        }).session(session);

        if (conflictCheck) {
          throw new AppError('Scheduling conflict detected. Please choose a different time.', 409);
        }
      }

      // Update meeting
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          meeting[key] = updateData[key];
        }
      });

      // Add to history
      meeting.history.push({
        action: 'rescheduled',
        performedBy: userId,
        performedByModel: userRole,
        details: `Meeting updated by ${userRole}`
      });

      await meeting.save({ session });

      // Populate the updated meeting
      await meeting.populate([
        { path: 'supervisor', select: 'fullname email photo' },
        { path: 'student', select: 'fullname email rollNumber photo' },
        { path: 'project', select: 'projectName' }
      ]);

      // Send email notifications
      try {
        // Send meeting update notification to all team members
        await MeetingNotificationService.sendMeetingUpdateNotification(
          meeting,
          meeting.project,
          `Meeting details updated by ${userRole}`
        );
        console.log('Meeting update notification sent to team members');
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the meeting update if email fails
      }

      return meeting;
    });

    res.status(200).json({
      success: true,
      message: 'Meeting updated successfully',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

// Cancel a meeting
const cancelMeeting = async (req, res, next) => {
  try {
    await transactionService.executeTransaction(async (session) => {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.userId;
      const userRole = req.role ? req.role[0] : 'student';

      const meeting = await Meeting.findById(id).session(session);

      if (!meeting) {
        throw new AppError('Meeting not found', 404);
      }

      // Check if user has permission to cancel this meeting
      // Only supervisors and admins can cancel meetings after they are created
      const canCancel = userRole == roleList.Admin ||
        (userRole == roleList.Supervisor && meeting.supervisor.toString() === userId);

      if (!canCancel) {
        throw new AppError('Only supervisors can cancel meetings after they are created', 403);
      }

      // Check if meeting can be cancelled
      if (meeting.status === 'completed' || meeting.status === 'cancelled') {
        throw new AppError('Meeting is already completed or cancelled', 400);
      }

      // Update meeting status
      meeting.status = 'cancelled';
      meeting.history.push({
        action: 'cancelled',
        performedBy: userId,
        performedByModel: userRole,
        details: `Meeting cancelled by ${userRole}. Reason: ${reason || 'No reason provided'}`
      });

      await meeting.save({ session });

      // Send email notifications
      try {
        // Send meeting cancellation notification to all team members
        await MeetingNotificationService.sendMeetingCancellationNotification(
          meeting,
          meeting.project,
          reason || 'No reason provided'
        );
        console.log('Meeting cancellation notification sent to team members');
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the meeting cancellation if email fails
      }

      return meeting;
    });

    res.status(200).json({
      success: true,
      message: 'Meeting cancelled successfully',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

// Delete a meeting
const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await transactionService.executeTransaction(async (session) => {
      const { id } = req.params;
      const userId = req.userId;
      const userRole = req.role ? req.role[0] : 'student';

      const meeting = await Meeting.findById(id).session(session);

      if (!meeting) {
        throw new AppError('Meeting not found', 404);
      }

      // Check if user has permission to delete this meeting
      // Only supervisors and admins can delete meetings after they are created
      const canDelete = userRole == roleList.Admin ||
        (userRole == roleList.Supervisor && meeting.supervisor.toString() === userId.toString());

      if (!canDelete) {
        throw new AppError('Only supervisors can delete meetings after they are created', 403);
      }

      // Delete the meeting
      await Meeting.findByIdAndDelete(id).session(session);

      return meeting;
    });

    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get available time slots
const getAvailableSlots = async (req, res, next) => {
  try {
    const { supervisorId, studentId, projectId, date, duration = 60 } = req.query;

    if (!supervisorId || !studentId || !projectId || !date) {
      throw new AppError('Supervisor ID, Student ID, Project ID, and date are required', 400);
    }

    // Get project to find all team members
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const requestedDate = new Date(date);
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(9, 0, 0, 0); // 9 AM

    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(17, 0, 0, 0); // 5 PM

    // Get existing meetings for the day (check conflicts with supervisor and all team members)
    const existingMeetings = await Meeting.find({
      $or: [
        { supervisor: supervisorId },
        { student: { $in: project.teamMembers } }
      ],
      scheduledDate: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      status: { $nin: ['cancelled'] }
    }).select('scheduledDate duration');

    // Generate available time slots
    const availableSlots = [];
    const slotDuration = parseInt(duration);
    const currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

      // Check if this slot conflicts with existing meetings
      const hasConflict = existingMeetings.some(meeting => {
        const meetingStart = new Date(meeting.scheduledDate);
        const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);

        return (currentTime < meetingEnd && slotEnd > meetingStart);
      });

      if (!hasConflict) {
        availableSlots.push({
          startTime: new Date(currentTime),
          endTime: new Date(slotEnd),
          duration: slotDuration
        });
      }

      // Move to next slot (30-minute intervals)
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    res.status(200).json({
      success: true,
      data: {
        date: requestedDate,
        availableSlots,
        totalSlots: availableSlots.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to send meeting notifications
const sendMeetingNotifications = async (meeting, action, reason = null) => {
  try {
    const meetingData = await Meeting.findById(meeting._id)
      .populate('supervisor', 'fullname email')
      .populate('student', 'fullname email')
      .populate('project', 'projectName');

    const { supervisor, student, project } = meetingData;

    let subject, message;

    switch (action) {
      case 'created':
        subject = `New Meeting Scheduled: ${meetingData.title}`;
        message = `
          A new meeting has been scheduled:
          
          Title: ${meetingData.title}
          Date: ${meetingData.scheduledDate.toLocaleDateString()}
          Time: ${meetingData.scheduledDate.toLocaleTimeString()}
          Duration: ${meetingData.duration} minutes
          Type: ${meetingData.meetingType}
          Project: ${project.projectName}
          
          ${meetingData.description ? `Description: ${meetingData.description}` : ''}
          
          ${meetingData.virtualMeetingLink?.link ? `Meeting Link: ${meetingData.virtualMeetingLink.link}` : ''}
        `;
        break;

      case 'updated':
        subject = `Meeting Updated: ${meetingData.title}`;
        message = `
          A meeting has been updated:
          
          Title: ${meetingData.title}
          Date: ${meetingData.scheduledDate.toLocaleDateString()}
          Time: ${meetingData.scheduledDate.toLocaleTimeString()}
          Duration: ${meetingData.duration} minutes
          Type: ${meetingData.meetingType}
          Project: ${project.projectName}
          
          Please check your calendar for the updated details.
        `;
        break;

      case 'cancelled':
        subject = `Meeting Cancelled: ${meetingData.title}`;
        message = `
          A meeting has been cancelled:
          
          Title: ${meetingData.title}
          Date: ${meetingData.scheduledDate.toLocaleDateString()}
          Time: ${meetingData.scheduledDate.toLocaleTimeString()}
          Project: ${project.projectName}
          
          ${reason ? `Reason: ${reason}` : ''}
        `;
        break;
    }

    // Send email to both supervisor and student
    await Promise.all([
      sendMailToUser({
        defenseType: 'meeting',
        evaluatorEmail: supervisor.email,
        accessCode: '',
        defenseDate: meetingData.scheduledDate.toISOString(),
        defenseTime: meetingData.scheduledDate.toISOString(),
        room: meetingData.meetingLocation === 'physical_room' ? 
              `${meetingData.roomDetails?.building} ${meetingData.roomDetails?.roomNumber}` : 
              'Virtual Meeting',
        evaluatorName: supervisor.fullname,
        subject: subject,
        message: message
      }),
      sendMailToUser({
        defenseType: 'meeting',
        evaluatorEmail: student[0]?.email || student.email,
        accessCode: '',
        defenseDate: meetingData.scheduledDate.toISOString(),
        defenseTime: meetingData.scheduledDate.toISOString(),
        room: meetingData.meetingLocation === 'physical_room' ? 
              `${meetingData.roomDetails?.building} ${meetingData.roomDetails?.roomNumber}` : 
              'Virtual Meeting',
        evaluatorName: student[0]?.fullname || student.fullname,
        subject: subject,
        message: message
      })
    ]);

  } catch (error) {
    console.error('Error sending meeting notifications:', error);
    throw error;
  }
};

// Approve meeting request
const approveMeetingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    if (!meeting.isCustomRequest) {
      throw new AppError('This is not a custom meeting request', 400);
    }

    if (meeting.status !== 'pending_approval') {
      throw new AppError('Meeting request is not pending approval', 400);
    }

    meeting.status = 'approved';
    meeting.approvedBy = approvedBy;
    meeting.approvedAt = new Date();

    await meeting.save();

    // Send email notifications
    try {
      // Send meeting confirmation notification to all team members
      await MeetingNotificationService.sendMeetingConfirmationNotification(
        meeting,
        meeting.project
      );
      console.log('Meeting confirmation notification sent to team members');
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the approval if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Meeting request approved successfully',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

// Reject meeting request
const rejectMeetingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    if (!meeting.isCustomRequest) {
      throw new AppError('This is not a custom meeting request', 400);
    }

    if (meeting.status !== 'pending_approval') {
      throw new AppError('Meeting request is not pending approval', 400);
    }

    meeting.status = 'rejected';
    meeting.rejectionReason = rejectionReason;

    await meeting.save();

    res.status(200).json({
      success: true,
      message: 'Meeting request rejected',
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

// Get pending meeting requests for supervisor
const getPendingMeetingRequests = async (req, res, next) => {
  try {
    const { supervisorId } = req.query;

    if (!supervisorId) {
      throw new AppError('Supervisor ID is required', 400);
    }

    const pendingRequests = await Meeting.find({
      supervisor: supervisorId,
      isCustomRequest: true,
      status: 'pending_approval'
    })
      .populate('student', 'fullname email rollNumber')
      .populate('project', 'projectName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: pendingRequests
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeeting,
  updateMeeting,
  cancelMeeting,
  deleteMeeting,
  getAvailableSlots,
  approveMeetingRequest,
  rejectMeetingRequest,
  getPendingMeetingRequests
};
