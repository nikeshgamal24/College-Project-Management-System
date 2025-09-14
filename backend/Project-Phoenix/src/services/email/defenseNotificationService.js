const { sendMailToUser } = require('../../controllers/helpers/email/sendMailToUser');
const Evaluator = require('../../models/user/Evaluator');
const { format } = require('date-fns');

/**
 * Service for sending defense-related email notifications
 */
class DefenseNotificationService {
  
  /**
   * Send defense time update notification to evaluators
   * @param {Object} defense - Defense object with updated time
   * @param {string} oldDefenseTime - Previous defense time
   * @param {string} oldDefenseDate - Previous defense date
   * @param {string} reason - Reason for the update
   */
  static async sendDefenseTimeUpdateNotification(defense, oldDefenseTime, oldDefenseDate, reason) {
    try {
      console.log('Sending defense time update notification...');
      
      // Get all evaluators for this defense
      const evaluators = await Evaluator.find({
        'defense.defenseId': defense._id
      }).select('fullname email defense');

      if (!evaluators || evaluators.length === 0) {
        console.log('No evaluators found for this defense');
        return;
      }

      // Format dates for display
      const oldDate = format(new Date(oldDefenseDate), 'PPP');
      const oldTime = format(new Date(oldDefenseTime), 'hh:mm a');
      const newDate = format(new Date(defense.defenseDate), 'PPP');
      const newTime = format(new Date(defense.defenseTime), 'hh:mm a');

      // Send email to each evaluator
      for (const evaluator of evaluators) {
        const emailData = {
          to: evaluator.email,
          subject: `Defense Time Update - ${defense.event?.eventName || 'Project Defense'}`,
          html: this.generateDefenseTimeUpdateEmail({
            evaluatorName: evaluator.fullname,
            eventName: defense.event?.eventName || 'Project Defense',
            defenseType: defense.defenseType,
            oldDate,
            oldTime,
            newDate,
            newTime,
            reason: reason || 'Defense time has been updated',
            eventCode: defense.event?.eventCode || 'N/A'
          })
        };

        await sendMailToUser(emailData);
        console.log(`Defense time update notification sent to ${evaluator.email}`);
      }

      console.log('All defense time update notifications sent successfully');
    } catch (error) {
      console.error('Error sending defense time update notifications:', error);
      throw error;
    }
  }

  /**
   * Generate HTML email template for defense time update
   * @param {Object} data - Email data
   * @returns {string} HTML email content
   */
  static generateDefenseTimeUpdateEmail(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Defense Time Update</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e74c3c;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #e74c3c;
            margin: 0;
            font-size: 24px;
          }
          .content {
            margin-bottom: 30px;
          }
          .defense-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #e74c3c;
          }
          .time-change {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 15px 0;
            padding: 15px;
            background-color: #fff3cd;
            border-radius: 6px;
            border: 1px solid #ffeaa7;
          }
          .old-time, .new-time {
            text-align: center;
          }
          .old-time {
            color: #6c757d;
          }
          .new-time {
            color: #28a745;
            font-weight: bold;
          }
          .arrow {
            font-size: 24px;
            color: #e74c3c;
            margin: 0 20px;
          }
          .reason {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-style: italic;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background-color: #e74c3c;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background-color: #c0392b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🕒 Defense Time Update</h1>
          </div>
          
          <div class="content">
            <p>Dear <strong>${data.evaluatorName}</strong>,</p>
            
            <p>This is to inform you that the defense time for the following event has been updated:</p>
            
            <div class="defense-info">
              <h3>${data.eventName}</h3>
              <p><strong>Event Code:</strong> ${data.eventCode}</p>
              <p><strong>Defense Type:</strong> ${data.defenseType.charAt(0).toUpperCase() + data.defenseType.slice(1)} Defense</p>
            </div>
            
            <h3>Time Change Details:</h3>
            <div class="time-change">
              <div class="old-time">
                <strong>Previous Time</strong><br>
                ${data.oldDate}<br>
                ${data.oldTime}
              </div>
              <div class="arrow">→</div>
              <div class="new-time">
                <strong>New Time</strong><br>
                ${data.newDate}<br>
                ${data.newTime}
              </div>
            </div>
            
            <div class="reason">
              <strong>Reason for Change:</strong> ${data.reason}
            </div>
            
            <p>Please make note of this change and plan accordingly. If you have any questions or concerns, please contact the administration.</p>
            
            <p>Thank you for your understanding.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from Project Phoenix Defense Management System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = DefenseNotificationService;

