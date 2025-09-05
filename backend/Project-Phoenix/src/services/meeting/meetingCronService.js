let cron;
try {
  cron = require('node-cron');
} catch (error) {
  console.warn('node-cron not available. Cron service will be disabled.');
  cron = null;
}

const MeetingStatusService = require('./meetingStatusService');

/**
 * Cron service for automatic meeting status management
 */
class MeetingCronService {
  
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Start all cron jobs
   */
  start() {
    if (!cron) {
      throw new Error('node-cron is not available. Please install it with: npm install node-cron');
    }

    if (this.isRunning) {
      console.log('Meeting cron service is already running');
      return;
    }

    console.log('Starting meeting cron service...');

    // Job 1: Check for meetings every 5 minutes
    const statusCheckJob = cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('Running meeting status check...');
        await MeetingStatusService.processAllMeetings();
      } catch (error) {
        console.error('Error in meeting status check:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kathmandu' // Adjust timezone as needed
    });

    // Job 2: Daily cleanup at midnight
    const dailyCleanupJob = cron.schedule('0 0 * * *', async () => {
      try {
        console.log('Running daily meeting cleanup...');
        await this.dailyCleanup();
      } catch (error) {
        console.error('Error in daily cleanup:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kathmandu'
    });

    // Job 3: Weekly report generation (Sundays at 6 AM)
    const weeklyReportJob = cron.schedule('0 6 * * 0', async () => {
      try {
        console.log('Generating weekly meeting report...');
        await this.generateWeeklyReport();
      } catch (error) {
        console.error('Error generating weekly report:', error);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kathmandu'
    });

    // Store job references
    this.jobs.set('statusCheck', statusCheckJob);
    this.jobs.set('dailyCleanup', dailyCleanupJob);
    this.jobs.set('weeklyReport', weeklyReportJob);

    // Start all jobs
    statusCheckJob.start();
    dailyCleanupJob.start();
    weeklyReportJob.start();

    this.isRunning = true;
    console.log('Meeting cron service started successfully');
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    if (!this.isRunning) {
      console.log('Meeting cron service is not running');
      return;
    }

    console.log('Stopping meeting cron service...');

    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`Stopped ${name} job`);
    }

    this.jobs.clear();
    this.isRunning = false;
    console.log('Meeting cron service stopped');
  }

  /**
   * Get job status
   */
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      jobs: {}
    };

    for (const [name, job] of this.jobs) {
      status.jobs[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    }

    return status;
  }

  /**
   * Daily cleanup tasks
   */
  async dailyCleanup() {
    try {
      // Process any missed meetings
      await MeetingStatusService.processAllMeetings();
      
      // Log cleanup statistics
      const stats = await this.getMeetingStatistics();
      console.log('Daily cleanup completed:', stats);
    } catch (error) {
      console.error('Error in daily cleanup:', error);
    }
  }

  /**
   * Generate weekly meeting report
   */
  async generateWeeklyReport() {
    try {
      const Meeting = require('../../models/system/Meeting');
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      
      const meetings = await Meeting.find({
        scheduledDate: { $gte: startOfWeek },
        status: { $in: ['completed', 'cancelled'] }
      }).populate('project', 'projectName');

      const stats = {
        totalMeetings: meetings.length,
        completedMeetings: meetings.filter(m => m.status === 'completed').length,
        cancelledMeetings: meetings.filter(m => m.status === 'cancelled').length,
        completionRate: 0
      };

      if (stats.totalMeetings > 0) {
        stats.completionRate = (stats.completedMeetings / stats.totalMeetings) * 100;
      }

      console.log('Weekly meeting report:', stats);
      return stats;
    } catch (error) {
      console.error('Error generating weekly report:', error);
    }
  }

  /**
   * Get meeting statistics
   */
  async getMeetingStatistics() {
    try {
      const Meeting = require('../../models/system/Meeting');
      
      const stats = await Meeting.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        total: 0,
        byStatus: {}
      };

      stats.forEach(stat => {
        result.byStatus[stat._id] = stat.count;
        result.total += stat.count;
      });

      return result;
    } catch (error) {
      console.error('Error getting meeting statistics:', error);
      return { total: 0, byStatus: {} };
    }
  }

  /**
   * Run a specific job manually
   * @param {string} jobName - Name of the job to run
   */
  async runJob(jobName) {
    try {
      switch (jobName) {
        case 'statusCheck':
          await MeetingStatusService.processAllMeetings();
          break;
        case 'dailyCleanup':
          await this.dailyCleanup();
          break;
        case 'weeklyReport':
          await this.generateWeeklyReport();
          break;
        default:
          throw new Error(`Unknown job: ${jobName}`);
      }
      console.log(`Job ${jobName} completed successfully`);
    } catch (error) {
      console.error(`Error running job ${jobName}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const meetingCronService = new MeetingCronService();

module.exports = meetingCronService;
