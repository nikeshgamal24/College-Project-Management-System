const MeetingEmailTemplates = require('./meetingEmailTemplates');
const Student = require('../../models/user/Student');
const Supervisor = require('../../models/user/Supervisor');
const Project = require('../../models/academic/Project');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Service for sending meeting-related email notifications
 */
class MeetingNotificationService {
  
  /**
   * Send meeting request notification to supervisor
   * @param {Object} meeting - Meeting object
   * @param {string} studentId - ID of the student who requested the meeting
   * @param {string} projectId - ID of the project
   */
  static async sendMeetingRequestNotification(meeting, studentId, projectId) {
    try {
      console.log('Sending meeting request notification...');
      
      // Get student details
      const student = await Student.findById(studentId).select('fullname email rollNumber');
      if (!student) {
        throw new AppError('Student not found', 404);
      }

      // Get project details
      const project = await Project.findById(projectId).select('projectName supervisor');
      if (!project) {
        throw new AppError('Project not found', 404);
      }

      // Get supervisor details
      const supervisor = await Supervisor.findById(project.supervisor.supervisorId).select('fullname email');
      if (!supervisor) {
        throw new AppError('Supervisor not found', 404);
      }

      console.log('Sending email to supervisor:', supervisor.email);
      
      // Send email notification
      await MeetingEmailTemplates.sendMeetingRequestNotification(
        meeting,
        supervisor,
        student,
        project
      );

      console.log('Meeting request notification sent successfully');
      return { success: true, message: 'Notification sent successfully' };
      
    } catch (error) {
      console.error('Failed to send meeting request notification:', error);
      throw new AppError(`Failed to send meeting request notification: ${error.message}`, 500);
    }
  }

  /**
   * Send meeting confirmation notification to all team members
   * @param {Object} meeting - Meeting object
   * @param {string} projectId - ID of the project
   */
  static async sendMeetingConfirmationNotification(meeting, projectId) {
    try {
      console.log('Sending meeting confirmation notification...');
      
      // Get project details with team members
      const project = await Project.findById(projectId)
        .populate('teamMembers', 'fullname email')
        .populate('supervisor.supervisorId', 'fullname email')
        .select('projectName teamMembers supervisor');
      
      if (!project) {
        throw new AppError('Project not found', 404);
      }

      const teamMembers = project.teamMembers;
      const supervisor = project.supervisor.supervisorId;

      if (!teamMembers || teamMembers.length === 0) {
        throw new AppError('No team members found for this project', 404);
      }

      console.log(`Sending confirmation emails to ${teamMembers.length} team members`);
      
      // Send email notifications to all team members
      await MeetingEmailTemplates.sendMeetingConfirmationNotification(
        meeting,
        teamMembers,
        supervisor,
        project
      );

      console.log('Meeting confirmation notifications sent successfully');
      return { success: true, message: 'Confirmation notifications sent successfully' };
      
    } catch (error) {
      console.error('Failed to send meeting confirmation notification:', error);
      throw new AppError(`Failed to send meeting confirmation notification: ${error.message}`, 500);
    }
  }

  /**
   * Send meeting update notification to all team members
   * @param {Object} meeting - Updated meeting object
   * @param {string} projectId - ID of the project
   * @param {string} updateDetails - Description of what was updated
   */
  static async sendMeetingUpdateNotification(meeting, projectId, updateDetails = '') {
    try {
      console.log('Sending meeting update notification...');
      
      // Get project details with team members
      const project = await Project.findById(projectId)
        .populate('teamMembers', 'fullname email')
        .populate('supervisor.supervisorId', 'fullname email')
        .select('projectName teamMembers supervisor');
      
      if (!project) {
        throw new AppError('Project not found', 404);
      }

      const teamMembers = project.teamMembers;
      const supervisor = project.supervisor.supervisorId;

      if (!teamMembers || teamMembers.length === 0) {
        throw new AppError('No team members found for this project', 404);
      }

      console.log(`Sending update emails to ${teamMembers.length} team members`);
      
      // Send email notifications to all team members
      await MeetingEmailTemplates.sendMeetingUpdateNotification(
        meeting,
        teamMembers,
        supervisor,
        project,
        updateDetails
      );

      console.log('Meeting update notifications sent successfully');
      return { success: true, message: 'Update notifications sent successfully' };
      
    } catch (error) {
      console.error('Failed to send meeting update notification:', error);
      throw new AppError(`Failed to send meeting update notification: ${error.message}`, 500);
    }
  }

  /**
   * Send meeting cancellation notification to all team members
   * @param {Object} meeting - Cancelled meeting object
   * @param {string} projectId - ID of the project
   * @param {string} reason - Reason for cancellation
   */
  static async sendMeetingCancellationNotification(meeting, projectId, reason = '') {
    try {
      console.log('Sending meeting cancellation notification...');
      
      // Get project details with team members
      const project = await Project.findById(projectId)
        .populate('teamMembers', 'fullname email')
        .populate('supervisor.supervisorId', 'fullname email')
        .select('projectName teamMembers supervisor');
      
      if (!project) {
        throw new AppError('Project not found', 404);
      }

      const teamMembers = project.teamMembers;
      const supervisor = project.supervisor.supervisorId;

      if (!teamMembers || teamMembers.length === 0) {
        throw new AppError('No team members found for this project', 404);
      }

      console.log(`Sending cancellation emails to ${teamMembers.length} team members`);
      
      // Send email notifications to all team members
      await MeetingEmailTemplates.sendMeetingCancellationNotification(
        meeting,
        teamMembers,
        supervisor,
        project,
        reason
      );

      console.log('Meeting cancellation notifications sent successfully');
      return { success: true, message: 'Cancellation notifications sent successfully' };
      
    } catch (error) {
      console.error('Failed to send meeting cancellation notification:', error);
      throw new AppError(`Failed to send meeting cancellation notification: ${error.message}`, 500);
    }
  }

  /**
   * Send meeting reminder notification (for future implementation)
   * @param {Object} meeting - Meeting object
   * @param {string} projectId - ID of the project
   * @param {string} reminderType - Type of reminder (24h, 1h, etc.)
   */
  static async sendMeetingReminderNotification(meeting, projectId, reminderType = '24h') {
    try {
      console.log(`Sending ${reminderType} meeting reminder notification...`);
      
      // Get project details with team members
      const project = await Project.findById(projectId)
        .populate('teamMembers', 'fullname email')
        .populate('supervisor.supervisorId', 'fullname email')
        .select('projectName teamMembers supervisor');
      
      if (!project) {
        throw new AppError('Project not found', 404);
      }

      const teamMembers = project.teamMembers;
      const supervisor = project.supervisor.supervisorId;

      if (!teamMembers || teamMembers.length === 0) {
        throw new AppError('No team members found for this project', 404);
      }

      console.log(`Sending ${reminderType} reminder emails to ${teamMembers.length} team members`);
      
      // Send email notifications to all team members
      await MeetingEmailTemplates.sendMeetingReminderNotification(
        meeting,
        teamMembers,
        supervisor,
        project,
        reminderType
      );

      console.log(`${reminderType} meeting reminder notifications sent successfully`);
      return { success: true, message: `${reminderType} reminder notifications sent successfully` };
      
    } catch (error) {
      console.error(`Failed to send ${reminderType} meeting reminder notification:`, error);
      throw new AppError(`Failed to send ${reminderType} meeting reminder notification: ${error.message}`, 500);
    }
  }
}

module.exports = MeetingNotificationService;
