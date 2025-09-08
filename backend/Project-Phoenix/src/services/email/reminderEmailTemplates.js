/**
 * Email templates for meeting reminder notifications
 * Supports both general and personal reminder types
 */

const getRoleString = (role) => {
  const roleMap = {
    2001: 'Student',
    2002: 'Supervisor', 
    2003: 'Admin'
  };
  return roleMap[role] || 'User';
};

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * General Reminder Email Template
 * Sent to all team members and supervisor
 */
const getGeneralReminderTemplate = (meeting, project, reminderType = 'general') => {
  const meetingDate = new Date(meeting.scheduledDate);
  const reminderTime = new Date(meetingDate.getTime() - (meeting.reminders.general.timeBefore * 60000));
  
  return {
    subject: `🔔 General Reminder: ${meeting.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>General Reminder</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 30px; }
          .meeting-card { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .meeting-title { font-size: 20px; font-weight: 600; color: #2c3e50; margin-bottom: 15px; }
          .meeting-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .detail-item { display: flex; align-items: center; gap: 8px; }
          .detail-icon { width: 16px; height: 16px; color: #667eea; }
          .detail-text { font-size: 14px; color: #555; }
          .reminder-info { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .reminder-text { font-size: 14px; color: #1976d2; font-weight: 500; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-align: center; margin: 20px 0; }
          .cta-button:hover { background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%); }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef; }
          .footer-text { font-size: 12px; color: #6c757d; margin: 0; }
          .team-info { background-color: #f1f3f4; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .team-title { font-size: 14px; font-weight: 600; color: #2c3e50; margin-bottom: 8px; }
          .team-members { font-size: 13px; color: #555; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 General Reminder</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${project.projectName || 'Project Phoenix'} - Team Meeting</p>
          </div>
          
          <div class="content">
            <div class="meeting-card">
              <div class="meeting-title">${meeting.title}</div>
              
              <div class="meeting-details">
                <div class="detail-item">
                  <span class="detail-icon">📅</span>
                  <div class="detail-text">
                    <strong>Date:</strong><br>
                    ${meetingDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                
                <div class="detail-item">
                  <span class="detail-icon">⏰</span>
                  <div class="detail-text">
                    <strong>Time:</strong><br>
                    ${meetingDate.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })} - ${new Date(meetingDate.getTime() + meeting.duration * 60000).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                </div>
                
                <div class="detail-item">
                  <span class="detail-icon">📍</span>
                  <div class="detail-text">
                    <strong>Location:</strong><br>
                    ${meeting.meetingLocation === 'virtual_meeting' ? 'Virtual Meeting' : 
                      meeting.meetingLocation === 'physical_room' ? `Room ${meeting.roomDetails?.roomNumber || 'TBD'}` : 
                      'Hybrid Meeting'}
                  </div>
                </div>
                
                <div class="detail-item">
                  <span class="detail-icon">⏱️</span>
                  <div class="detail-text">
                    <strong>Duration:</strong><br>
                    ${meeting.duration} minutes
                  </div>
                </div>
              </div>
              
              ${meeting.description ? `
                <div style="margin-top: 15px;">
                  <strong>Description:</strong><br>
                  <span style="color: #555; font-size: 14px;">${meeting.description}</span>
                </div>
              ` : ''}
              
              ${meeting.virtualMeetingLink?.link ? `
                <div style="margin-top: 15px;">
                  <strong>Meeting Link:</strong><br>
                  <a href="${meeting.virtualMeetingLink.link}" style="color: #667eea; text-decoration: none; font-size: 14px;">
                    ${meeting.virtualMeetingLink.link}
                  </a>
                </div>
              ` : ''}
            </div>
            
            <div class="reminder-info">
              <div class="reminder-text">
                ⏰ This reminder was set ${meeting.reminders.general.timeBefore} minutes before the meeting
              </div>
            </div>
            
            <div class="team-info">
              <div class="team-title">👥 Meeting Attendees</div>
              <div class="team-members">
                <strong>Supervisor:</strong> ${project.supervisor?.supervisorId?.fullname || 'TBD'}<br>
                <strong>Students:</strong> ${project.teamMembers && project.teamMembers.length > 0 ? 
                  project.teamMembers.map(member => member.fullname || 'Unknown').join(', ') : 'No students assigned'}
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${frontendUrl}/meetings" class="cta-button">
                View Meeting Details
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              This is an automated reminder from Project Phoenix.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Meeting Reminder: ${meeting.title}

Meeting Details:
- Date: ${meetingDate.toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
- Time: ${meetingDate.toLocaleTimeString('en-US', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: true 
})} - ${new Date(meetingDate.getTime() + meeting.duration * 60000).toLocaleTimeString('en-US', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: true 
})}
- Location: ${meeting.meetingLocation === 'virtual_meeting' ? 'Virtual Meeting' : 
  meeting.meetingLocation === 'physical_room' ? `Room ${meeting.roomDetails?.roomNumber || 'TBD'}` : 
  'Hybrid Meeting'}
- Duration: ${meeting.duration} minutes

${meeting.description ? `Description: ${meeting.description}` : ''}

${meeting.virtualMeetingLink?.link ? `Meeting Link: ${meeting.virtualMeetingLink.link}` : ''}

This reminder was set ${meeting.reminders.general.timeBefore} minutes before the meeting.

Team Members:
- Supervisor: ${project.supervisor?.name || 'TBD'}
- Students: ${project.teamMembers?.map(member => member.name).join(', ') || 'TBD'}

View Meeting Details: ${frontendUrl}/meetings

This is an automated reminder from Project Phoenix.
Please do not reply to this email.
    `
  };
};

/**
 * Personal Reminder Email Template
 * Sent to individual users based on who set the reminder
 */
const getPersonalReminderTemplate = (meeting, project, user, reminderType = 'personal') => {
  const meetingDate = new Date(meeting.scheduledDate);
  const reminderTime = new Date(meetingDate.getTime() - (meeting.reminders.personal.timeBefore * 60000));
  
  return {
    subject: `🔔 Personal Meeting Reminder: ${meeting.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Personal Meeting Reminder</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 30px; }
          .meeting-card { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .meeting-title { font-size: 20px; font-weight: 600; color: #2c3e50; margin-bottom: 15px; }
          .meeting-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .detail-item { display: flex; align-items: center; gap: 8px; }
          .detail-icon { width: 16px; height: 16px; color: #28a745; }
          .detail-text { font-size: 14px; color: #555; }
          .reminder-info { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .reminder-text { font-size: 14px; color: #155724; font-weight: 500; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-align: center; margin: 20px 0; }
          .cta-button:hover { background: linear-gradient(135deg, #218838 0%, #1e7e34 100%); }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef; }
          .footer-text { font-size: 12px; color: #6c757d; margin: 0; }
          .personal-info { background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .personal-title { font-size: 14px; font-weight: 600; color: #2c3e50; margin-bottom: 8px; }
          .personal-text { font-size: 13px; color: #555; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Personal Meeting Reminder</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Project Phoenix - Your Meeting</p>
          </div>
          
          <div class="content">
            <div class="meeting-card">
              <div class="meeting-title">${meeting.title}</div>
              
              <div class="meeting-details">
                <div class="detail-item">
                  <span class="detail-icon">📅</span>
                  <div class="detail-text">
                    <strong>Date:</strong><br>
                    ${meetingDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                
                <div class="detail-item">
                  <span class="detail-icon">⏰</span>
                  <div class="detail-text">
                    <strong>Time:</strong><br>
                    ${meetingDate.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })} - ${new Date(meetingDate.getTime() + meeting.duration * 60000).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                </div>
                
                <div class="detail-item">
                  <span class="detail-icon">📍</span>
                  <div class="detail-text">
                    <strong>Location:</strong><br>
                    ${meeting.meetingLocation === 'virtual_meeting' ? 'Virtual Meeting' : 
                      meeting.meetingLocation === 'physical_room' ? `Room ${meeting.roomDetails?.roomNumber || 'TBD'}` : 
                      'Hybrid Meeting'}
                  </div>
                </div>
                
                <div class="detail-item">
                  <span class="detail-icon">⏱️</span>
                  <div class="detail-text">
                    <strong>Duration:</strong><br>
                    ${meeting.duration} minutes
                  </div>
                </div>
              </div>
              
              ${meeting.description ? `
                <div style="margin-top: 15px;">
                  <strong>Description:</strong><br>
                  <span style="color: #555; font-size: 14px;">${meeting.description}</span>
                </div>
              ` : ''}
              
              ${meeting.virtualMeetingLink?.link ? `
                <div style="margin-top: 15px;">
                  <strong>Meeting Link:</strong><br>
                  <a href="${meeting.virtualMeetingLink.link}" style="color: #28a745; text-decoration: none; font-size: 14px;">
                    ${meeting.virtualMeetingLink.link}
                  </a>
                </div>
              ` : ''}
            </div>
            
            <div class="reminder-info">
              <div class="reminder-text">
                ⏰ This personal reminder was set ${meeting.reminders.personal.timeBefore} minutes before the meeting
              </div>
            </div>
            
            <div class="personal-info">
              <div class="personal-title">👤 Personal Reminder</div>
              <div class="personal-text">
                This is your personal reminder for the meeting. You set this reminder to help you prepare.
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${frontendUrl}/meetings" class="cta-button">
                View Meeting Details
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              This is a personal reminder from Project Phoenix.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Personal Meeting Reminder: ${meeting.title}

Meeting Details:
- Date: ${meetingDate.toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
- Time: ${meetingDate.toLocaleTimeString('en-US', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: true 
})} - ${new Date(meetingDate.getTime() + meeting.duration * 60000).toLocaleTimeString('en-US', { 
  hour: '2-digit', 
  minute: '2-digit',
  hour12: true 
})}
- Location: ${meeting.meetingLocation === 'virtual_meeting' ? 'Virtual Meeting' : 
  meeting.meetingLocation === 'physical_room' ? `Room ${meeting.roomDetails?.roomNumber || 'TBD'}` : 
  'Hybrid Meeting'}
- Duration: ${meeting.duration} minutes

${meeting.description ? `Description: ${meeting.description}` : ''}

${meeting.virtualMeetingLink?.link ? `Meeting Link: ${meeting.virtualMeetingLink.link}` : ''}

This personal reminder was set ${meeting.reminders.personal.timeBefore} minutes before the meeting.

This is your personal reminder for the meeting. You set this reminder to help you prepare.

View Meeting Details: ${frontendUrl}/meetings

This is a personal reminder from Project Phoenix.
Please do not reply to this email.
    `
  };
};

module.exports = {
  getGeneralReminderTemplate,
  getPersonalReminderTemplate
};

