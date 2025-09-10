/**
 * Reminder Notification Service
 * Handles sending reminder emails for meetings
 */

const emailService = require('./emailService');
const { getGeneralReminderTemplate, getPersonalReminderTemplate } = require('./reminderEmailTemplates');
const Meeting = require('../../models/system/Meeting');
const Project = require('../../models/academic/Project');
const Student = require('../../models/user/Student');
const Supervisor = require('../../models/user/Supervisor');

class ReminderNotificationService {
  /**
   * Send general reminder notification to all team members and supervisor
   * @param {Object} meeting - Meeting object
   * @param {String} projectId - Project ID
   */
  static async sendGeneralReminderNotification(meeting, projectId) {
    try {
      // Get project details with populated team members and supervisor
      const project = await Project.findById(projectId)
        .populate('teamMembers')
        .populate('supervisor.supervisorId')
        .lean();

      if (!project) {
        throw new Error('Project not found');
      }

      // Get meeting details
      const meetingDetails = await Meeting.findById(meeting._id)
        .populate('student', 'name email')
        .populate('supervisor', 'name email')
        .lean();

      if (!meetingDetails) {
        throw new Error('Meeting not found');
      }

      // Get email template
      const emailTemplate = getGeneralReminderTemplate(meetingDetails, project);

      // Send email to supervisor
      const supervisor = project.supervisor?.supervisorId;
      console.log('Project supervisor details:', {
        supervisor: supervisor,
        hasEmail: !!supervisor?.email,
        email: supervisor?.email
      });
      
      if (supervisor?.email) {
        await emailService.sendMail({
          to: supervisor.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        });
        console.log(`General reminder sent to supervisor: ${supervisor.email}`);
      } else {
        console.log('No supervisor email found - supervisor details:', supervisor);
      }

      // Send email to all team members
      console.log('Project team members details:', {
        teamMembers: project.teamMembers,
        count: project.teamMembers?.length || 0
      });
      
      if (project.teamMembers && project.teamMembers.length > 0) {
        const studentEmails = project.teamMembers
          .filter(member => member.email)
          .map(member => member.email);

        console.log('Student emails found:', studentEmails);

        if (studentEmails.length > 0) {
          await emailService.sendMail({
            to: studentEmails.join(','),
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text
          });
          console.log(`General reminder sent to students: ${studentEmails.join(', ')}`);
        } else {
          console.log('No student emails found');
        }
      } else {
        console.log('No team members found');
      }

      return { success: true, message: 'General reminder notifications sent successfully' };
    } catch (error) {
      console.error('Error sending general reminder notification:', error);
      throw error;
    }
  }

  /**
   * Send personal reminder notification to specific user
   * @param {Object} meeting - Meeting object
   * @param {String} projectId - Project ID
   * @param {String} userId - User ID who set the reminder
   * @param {String} userRole - User role (Student, Supervisor, Admin)
   */
  static async sendPersonalReminderNotification(meeting, projectId, userId, userRole) {
    try {
      // Get project details
      const project = await Project.findById(projectId)
        .populate('teamMembers', 'name email')
        .populate('supervisor', 'name email')
        .lean();

      if (!project) {
        throw new Error('Project not found');
      }

      // Get meeting details
      const meetingDetails = await Meeting.findById(meeting._id)
        .populate('student', 'name email')
        .populate('supervisor', 'name email')
        .lean();

      if (!meetingDetails) {
        throw new Error('Meeting not found');
      }

      // Get user details based on role
      let user = null;
      console.log('User role:', userRole);
      console.log('User ID:', userId);
      if (userRole === 'Student') {
        user = await Student.findById(userId).select('name email').lean();
      } else if (userRole === 'Supervisor') {
        user = await Supervisor.findById(userId).select('name email').lean();
      }

      if (!user || !user.email) {
        throw new Error('User not found or email not available');
      }

      // Get email template
      const emailTemplate = getPersonalReminderTemplate(meetingDetails, project, user);

      // Send email to user
      await emailService.sendMail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });

      console.log(`Personal reminder sent to ${userRole}: ${user.email}`);

      return { success: true, message: 'Personal reminder notification sent successfully' };
    } catch (error) {
      console.error('Error sending personal reminder notification:', error);
      throw error;
    }
  }

  /**
   * Send reminder notification based on type
   * @param {Object} meeting - Meeting object
   * @param {String} projectId - Project ID
   * @param {String} reminderType - 'general' or 'personal'
   * @param {String} userId - User ID who set the reminder (for personal reminders)
   * @param {String} userRole - User role (for personal reminders)
   */
  static async sendReminderNotification(meeting, projectId, reminderType, userId = null, userRole = null) {
    try {
      if (reminderType === 'general') {
        return await this.sendGeneralReminderNotification(meeting, projectId);
      } else if (reminderType === 'personal') {
        if (!userId || !userRole) {
          throw new Error('User ID and role are required for personal reminders');
        }
        return await this.sendPersonalReminderNotification(meeting, projectId, userId, userRole);
      } else {
        throw new Error('Invalid reminder type. Must be "general" or "personal"');
      }
    } catch (error) {
      console.error('Error sending reminder notification:', error);
      throw error;
    }
  }

  /**
   * Get all meetings that need reminder notifications
   * @param {String} reminderType - 'general' or 'personal'
   * @returns {Array} Array of meetings needing reminders
   */
  static async getMeetingsNeedingReminders(reminderType = 'general') {
    try {
      const now = new Date();
      const reminderField = reminderType === 'general' ? 'reminders.general' : 'reminders.personal';
      
      // Find meetings where:
      // 1. Reminder is enabled
      // 2. Meeting is scheduled (not completed/cancelled)
      // 3. Reminder time has passed
      // 4. Meeting hasn't been cancelled
      const meetings = await Meeting.find({
        [`${reminderField}.enabled`]: true,
        status: { $nin: ['completed', 'cancelled'] },
        scheduledDate: { $gt: now }, // Meeting is in the future
        $expr: {
          $lte: [
            { $subtract: ['$scheduledDate', { $multiply: [`$${reminderField}.timeBefore`, 60000] }] },
            now
          ]
        }
      })
      .populate('project', 'title teamMembers supervisor.supervisorId')
      .populate('student', 'name email')
      .populate('supervisor', 'name email')
      .lean();

      return meetings;
    } catch (error) {
      console.error('Error getting meetings needing reminders:', error);
      throw error;
    }
  }

  /**
   * Process all pending reminders
   * @param {String} reminderType - 'general' or 'personal'
   */
  static async processPendingReminders(reminderType = 'general') {
    try {
      const meetings = await this.getMeetingsNeedingReminders(reminderType);
      
      console.log(`Found ${meetings.length} meetings needing ${reminderType} reminders`);

      for (const meeting of meetings) {
        try {
          if (reminderType === 'general') {
            await this.sendGeneralReminderNotification(meeting, meeting.project._id);
          } else {
            // For personal reminders, we need to find who set the reminder
            const reminderField = meeting.reminders.personal;
            if (reminderField.setBy && reminderField.setByModel) {
              await this.sendPersonalReminderNotification(
                meeting, 
                meeting.project._id, 
                reminderField.setBy, 
                reminderField.setByModel
              );
            }
          }

          // Disable the reminder after sending
          await Meeting.findByIdAndUpdate(meeting._id, {
            [`${reminderType === 'general' ? 'reminders.general.enabled' : 'reminders.personal.enabled'}`]: false
          });

          console.log(`Reminder sent for meeting: ${meeting.title}`);
        } catch (error) {
          console.error(`Error processing reminder for meeting ${meeting._id}:`, error);
          // Continue with other meetings even if one fails
        }
      }

      return { success: true, processed: meetings.length };
    } catch (error) {
      console.error('Error processing pending reminders:', error);
      throw error;
    }
  }
}

module.exports = ReminderNotificationService;
