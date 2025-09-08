const Meeting = require('../../models/system/Meeting');
const MeetingNotificationService = require('../email/meetingNotificationService');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Service for automatic meeting status management
 */
class MeetingStatusService {
  
  /**
   * Update meeting status based on current time
   * @param {Object} meeting - Meeting object
   * @param {Date} currentTime - Current timestamp
   */
  static async updateMeetingStatus(meeting, currentTime = new Date()) {
    try {
      const meetingStartTime = new Date(meeting.scheduledDate);
      const meetingEndTime = new Date(meetingStartTime.getTime() + meeting.duration * 60000);
      const reminderTime = new Date(meetingStartTime.getTime() - 5 * 60000); // 5 minutes before
      const completionTime = new Date(meetingEndTime.getTime() + 15 * 60000); // 15 minutes after end
      const archiveTime = new Date(meetingEndTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours after end

      let statusChanged = false;
      let newStatus = meeting.status;
      let action = '';


      // Determine new status based on current time
      if (meeting.status === 'scheduled' && currentTime >= reminderTime) {
        // 5 minutes before meeting OR during meeting - send reminder and mark as in_progress
        newStatus = 'in_progress';
        action = 'created';
        statusChanged = true;
      } else if (meeting.status === 'in_progress' && currentTime >= completionTime) {
        // 15 minutes after meeting end - mark as completed
        newStatus = 'completed';
        action = 'completed';
        statusChanged = true;
      }
      
      // Note: No automatic archiving - completed meetings stay completed
      // Archived status is not available in the Meeting model enum
      
      // Update meeting if status changed
      if (statusChanged) {
        const oldStatus = meeting.status;
        meeting.status = newStatus;
        
        // Add to history
        meeting.history.push({
          action: action,
          performedBy: null, // System action, no specific user
          performedByModel: 'System',
          details: `Meeting status automatically updated from ${oldStatus} to ${newStatus}`,
          timestamp: currentTime
        });

        await meeting.save();

        // Send appropriate notifications
        await this.sendStatusNotification(meeting, action, oldStatus, newStatus);

        console.log(`Meeting ${meeting._id} status updated: ${oldStatus} → ${newStatus}`);
        return { statusChanged: true, oldStatus, newStatus, action };
      }

      return { statusChanged: false };
    } catch (error) {
      console.error('Error updating meeting status:', error);
      throw new AppError(`Failed to update meeting status: ${error.message}`, 500);
    }
  }

  /**
   * Send notification based on status change
   * @param {Object} meeting - Meeting object
   * @param {string} action - Action performed
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   */
  static async sendStatusNotification(meeting, action, oldStatus, newStatus) {
    try {
      switch (action) {
        case 'meeting_starting':
          await this.sendMeetingReminderNotification(meeting);
          break;
        case 'meeting_completed':
          await this.sendMeetingCompletionNotification(meeting);
          break;
        case 'meeting_archived':
          // No notification needed for archiving
          break;
        default:
          console.log(`No notification needed for action: ${action}`);
      }
    } catch (error) {
      console.error('Error sending status notification:', error);
      // Don't fail the status update if notification fails
    }
  }

  /**
   * Send meeting reminder notification (5 minutes before)
   * @param {Object} meeting - Meeting object
   */
  static async sendMeetingReminderNotification(meeting) {
    try {
      // This will use the existing reminder notification from MeetingEmailTemplates
      await MeetingNotificationService.sendMeetingReminderNotification(
        meeting,
        meeting.project,
        '5min'
      );
      console.log(`Meeting reminder sent for meeting ${meeting._id}`);
    } catch (error) {
      console.error('Error sending meeting reminder:', error);
    }
  }

  /**
   * Send meeting completion notification
   * @param {Object} meeting - Meeting object
   */
  static async sendMeetingCompletionNotification(meeting) {
    try {
      // This will use the existing completion notification from MeetingEmailTemplates
      await MeetingNotificationService.sendMeetingConfirmationNotification(
        meeting,
        meeting.project
      );
      console.log(`Meeting completion notification sent for meeting ${meeting._id}`);
    } catch (error) {
      console.error('Error sending meeting completion notification:', error);
    }
  }

  /**
   * Process all meetings for status updates
   * This should be called by a cron job or scheduled task
   */
  static async processAllMeetings() {
    try {
      console.log('Starting automatic meeting status processing...');
      
      const currentTime = new Date();
      
      // Get all active meetings that might need status updates
      const meetings = await Meeting.find({
        status: { $in: ['scheduled', 'in_progress', 'completed'] },
        scheduledDate: { $lte: new Date(currentTime.getTime() + 24 * 60 * 60 * 1000) } // Include meetings from last 24 hours
      }).populate('project', 'projectName teamMembers supervisor');

      let processedCount = 0;
      let updatedCount = 0;

      for (const meeting of meetings) {
        try {
          const result = await this.updateMeetingStatus(meeting, currentTime);
          processedCount++;
          
          if (result.statusChanged) {
            updatedCount++;
            console.log(`Updated meeting ${meeting._id}: ${result.oldStatus} → ${result.newStatus}`);
          }
        } catch (error) {
          console.error(`Error processing meeting ${meeting._id}:`, error);
        }
      }

      console.log(`Meeting status processing completed: ${updatedCount}/${processedCount} meetings updated`);
      return { processed: processedCount, updated: updatedCount };
    } catch (error) {
      console.error('Error processing all meetings:', error);
      throw new AppError(`Failed to process meetings: ${error.message}`, 500);
    }
  }

  /**
   * Get meetings that need status updates (for manual processing)
   * @param {Date} currentTime - Current timestamp
   */
  static async getMeetingsNeedingUpdate(currentTime = new Date()) {
    try {
      const meetings = await Meeting.find({
        status: { $in: ['scheduled', 'in_progress', 'completed'] },
        scheduledDate: { $lte: new Date(currentTime.getTime() + 24 * 60 * 60 * 1000) }
      }).populate('project', 'projectName teamMembers supervisor');

      const meetingsNeedingUpdate = [];

      for (const meeting of meetings) {
        const meetingStartTime = new Date(meeting.scheduledDate);
        const meetingEndTime = new Date(meetingStartTime.getTime() + meeting.duration * 60000);
        const reminderTime = new Date(meetingStartTime.getTime() - 5 * 60000);
        const completionTime = new Date(meetingEndTime.getTime() + 15 * 60000);
        const archiveTime = new Date(meetingEndTime.getTime() + 24 * 60 * 60 * 1000);

        let needsUpdate = false;
        let reason = '';

        if (meeting.status === 'scheduled' && currentTime >= reminderTime && currentTime < meetingStartTime) {
          needsUpdate = true;
          reason = 'Meeting starting soon (5 min reminder)';
        } else if (meeting.status === 'in_progress' && currentTime >= completionTime) {
          needsUpdate = true;
          reason = 'Meeting should be completed';
        } else if (meeting.status === 'completed' && currentTime >= archiveTime) {
          needsUpdate = true;
          reason = 'Meeting should be archived';
        }

        if (needsUpdate) {
          meetingsNeedingUpdate.push({
            meeting,
            reason,
            suggestedStatus: this.getSuggestedStatus(meeting, currentTime)
          });
        }
      }

      return meetingsNeedingUpdate;
    } catch (error) {
      console.error('Error getting meetings needing update:', error);
      throw new AppError(`Failed to get meetings needing update: ${error.message}`, 500);
    }
  }

  /**
   * Get suggested status for a meeting
   * @param {Object} meeting - Meeting object
   * @param {Date} currentTime - Current timestamp
   */
  static getSuggestedStatus(meeting, currentTime = new Date()) {
    const meetingStartTime = new Date(meeting.scheduledDate);
    const meetingEndTime = new Date(meetingStartTime.getTime() + meeting.duration * 60000);
    const reminderTime = new Date(meetingStartTime.getTime() - 5 * 60000);
    const completionTime = new Date(meetingEndTime.getTime() + 15 * 60000);
    const archiveTime = new Date(meetingEndTime.getTime() + 24 * 60 * 60 * 1000);

    if (meeting.status === 'scheduled' && currentTime >= reminderTime && currentTime < meetingStartTime) {
      return 'in_progress';
    } else if (meeting.status === 'in_progress' && currentTime >= completionTime) {
      return 'completed';
    } else if (meeting.status === 'completed' && currentTime >= archiveTime) {
      return 'archived';
    }

    return meeting.status;
  }

  /**
   * Manual status update (for admin override)
   * @param {string} meetingId - Meeting ID
   * @param {string} newStatus - New status
   * @param {string} reason - Reason for manual update
   * @param {string} updatedBy - User who made the update
   */
  static async manualStatusUpdate(meetingId, newStatus, reason, updatedBy) {
    try {
      const meeting = await Meeting.findById(meetingId);
      
      if (!meeting) {
        throw new AppError('Meeting not found', 404);
      }

      const oldStatus = meeting.status;
      meeting.status = newStatus;
      
      // Add to history
      meeting.history.push({
        action: 'manual_status_update',
        performedBy: updatedBy,
        performedByModel: 'Admin',
        details: `Meeting status manually updated from ${oldStatus} to ${newStatus}. Reason: ${reason}`,
        timestamp: new Date()
      });

      await meeting.save();

      console.log(`Meeting ${meetingId} manually updated: ${oldStatus} → ${newStatus}`);
      return { success: true, oldStatus, newStatus };
    } catch (error) {
      console.error('Error in manual status update:', error);
      throw new AppError(`Failed to manually update meeting status: ${error.message}`, 500);
    }
  }
}

module.exports = MeetingStatusService;
