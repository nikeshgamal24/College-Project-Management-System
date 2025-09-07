/**
 * Reminder Cron Service
 * Handles scheduled reminder processing
 */

const ReminderNotificationService = require('../email/reminderNotificationService');

class ReminderCronService {
  constructor() {
    this.cron = null;
    this.isRunning = false;
  }

  /**
   * Start the reminder cron service
   */
  start() {
    try {
      // Check if node-cron is available
      const cron = require('node-cron');
      
      if (this.isRunning) {
        console.log('Reminder cron service is already running');
        return;
      }

      // Schedule reminder processing every 5 minutes
      this.cron = cron.schedule('*/5 * * * *', async () => {
        try {
          console.log('Processing pending reminders...');
          
          // Process general reminders
          await ReminderNotificationService.processPendingReminders('general');
          
          // Process personal reminders
          await ReminderNotificationService.processPendingReminders('personal');
          
          console.log('Reminder processing completed');
        } catch (error) {
          console.error('Error processing reminders:', error);
        }
      }, {
        scheduled: false,
        timezone: 'UTC'
      });

      // Start the cron job
      this.cron.start();
      this.isRunning = true;
      
      console.log('Reminder cron service started - processing every 5 minutes');
    } catch (error) {
      console.warn('Warning: node-cron not available, reminder cron service disabled');
      console.log('To enable reminder processing, install node-cron: npm install node-cron');
    }
  }

  /**
   * Stop the reminder cron service
   */
  stop() {
    if (this.cron) {
      this.cron.stop();
      this.cron = null;
      this.isRunning = false;
      console.log('Reminder cron service stopped');
    }
  }

  /**
   * Get cron service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasCron: !!this.cron
    };
  }

  /**
   * Process reminders manually
   */
  async processReminders() {
    try {
      console.log('Processing reminders manually...');
      
      // Process general reminders
      const generalResult = await ReminderNotificationService.processPendingReminders('general');
      console.log(`General reminders processed: ${generalResult.processed}`);
      
      // Process personal reminders
      const personalResult = await ReminderNotificationService.processPendingReminders('personal');
      console.log(`Personal reminders processed: ${personalResult.processed}`);
      
      return {
        success: true,
        general: generalResult,
        personal: personalResult
      };
    } catch (error) {
      console.error('Error processing reminders manually:', error);
      throw error;
    }
  }
}

// Create singleton instance
const reminderCronService = new ReminderCronService();

module.exports = reminderCronService;

