const emailService = require('./emailService');

/**
 * Email templates for meeting notifications
 */
class MeetingEmailTemplates {
  
  /**
   * Send meeting request notification to supervisor
   */
  static async sendMeetingRequestNotification(meeting, supervisor, student, project) {
    const subject = `New Meeting Request - ${meeting.title}`;
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const portalUrl = `${frontendUrl}/supervisor/dashboard`;
    const meetingUrl = `${frontendUrl}/supervisor/meetings`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📅 Meeting Request</h1>
          <p style="color: #e8f4fd; margin: 10px 0 0 0; font-size: 16px;">Project Phoenix - Academic Management System</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Hello ${supervisor.fullname}!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #34495e; margin-bottom: 25px;">
            <strong>${student.fullname}</strong> has requested a meeting for the project <strong>"${project.projectName}"</strong>.
          </p>

          <!-- Meeting Details Card -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #3498db; margin: 25px 0;">
            <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 20px;">📋 Meeting Details</h3>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📝 Title:</span>
                <span style="color: #2c3e50;">${meeting.title}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📅 Date:</span>
                <span style="color: #2c3e50;">${new Date(meeting.scheduledDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">🕐 Time:</span>
                <span style="color: #2c3e50;">${new Date(meeting.scheduledDate).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">⏱️ Duration:</span>
                <span style="color: #2c3e50;">${meeting.duration} minutes</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">🏢 Type:</span>
                <span style="color: #2c3e50;">${meeting.meetingType}</span>
              </div>
              
              ${meeting.meetingLocation ? `
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📍 Location:</span>
                <span style="color: #2c3e50;">${meeting.meetingLocation}</span>
              </div>
              ` : ''}
              
              ${meeting.agenda ? `
              <div style="display: flex; align-items: flex-start;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📋 Agenda:</span>
                <span style="color: #2c3e50; white-space: pre-line;">${meeting.agenda}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Student Information -->
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #2c3e50; margin-top: 0;">👨‍🎓 Requested by:</h4>
            <p style="margin: 5px 0; color: #34495e;"><strong>Name:</strong> ${student.fullname}</p>
            <p style="margin: 5px 0; color: #34495e;"><strong>Email:</strong> ${student.email}</p>
            <p style="margin: 5px 0; color: #34495e;"><strong>Roll Number:</strong> ${student.rollNumber}</p>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" 
               style="display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 0 10px; font-size: 16px;">
              🔗 Go to Portal
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
              This is an automated notification from Project Phoenix.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
Meeting Request - ${meeting.title}

Hello ${supervisor.fullname}!

${student.fullname} has requested a meeting for the project "${project.projectName}".

Meeting Details:
- Title: ${meeting.title}
- Date: ${new Date(meeting.scheduledDate).toLocaleDateString()}
- Time: ${new Date(meeting.scheduledDate).toLocaleTimeString()}
- Duration: ${meeting.duration} minutes
- Type: ${meeting.meetingType}
${meeting.meetingLocation ? `- Location: ${meeting.meetingLocation}` : ''}
${meeting.agenda ? `- Agenda: ${meeting.agenda}` : ''}

Student Information:
- Name: ${student.fullname}
- Email: ${student.email}
- Roll Number: ${student.rollNumber}

Please review and approve this meeting request at: ${portalUrl}

Best regards,
Project Phoenix Team
    `;

    return await emailService.sendMail({
      to: supervisor.email,
      subject,
      text,
      html
    });
  }

  /**
   * Send meeting confirmation notification to all team members
   */
  static async sendMeetingConfirmationNotification(meeting, teamMembers, supervisor, project) {
    const subject = `Meeting Confirmed - ${meeting.title}`;
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const portalUrl = `${frontendUrl}/student/dashboard`;
    const meetingUrl = `${frontendUrl}/student/meetings`;
    
    // Generate ICS file content for calendar integration
    const startDate = new Date(meeting.scheduledDate);
    const endDate = new Date(startDate.getTime() + meeting.duration * 60000);
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Project Phoenix//Meeting//EN
BEGIN:VEVENT
UID:${meeting._id}@projectphoenix.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${meeting.title}
DESCRIPTION:${meeting.description || ''}
LOCATION:${meeting.meetingLocation || 'TBD'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); border-radius: 10px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Meeting Confirmed</h1>
          <p style="color: #e8f5e8; margin: 10px 0 0 0; font-size: 16px;">Project Phoenix - Academic Management System</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Great News! Your meeting has been confirmed.</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #34495e; margin-bottom: 25px;">
            The meeting for project <strong>"${project.projectName}"</strong> has been approved and scheduled.
          </p>

          <!-- Meeting Details Card -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #27ae60; margin: 25px 0;">
            <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 20px;">📋 Confirmed Meeting Details</h3>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📝 Title:</span>
                <span style="color: #2c3e50;">${meeting.title}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📅 Date:</span>
                <span style="color: #2c3e50;">${new Date(meeting.scheduledDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">🕐 Time:</span>
                <span style="color: #2c3e50;">${new Date(meeting.scheduledDate).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">⏱️ Duration:</span>
                <span style="color: #2c3e50;">${meeting.duration} minutes</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">🏢 Type:</span>
                <span style="color: #2c3e50;">${meeting.meetingType}</span>
              </div>
              
              ${meeting.meetingLocation ? `
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📍 Location:</span>
                <span style="color: #2c3e50;">${meeting.meetingLocation}</span>
              </div>
              ` : ''}
              
              ${meeting.virtualMeetingLink ? `
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">🔗 Virtual Link:</span>
                <a href="${meeting.virtualMeetingLink}" style="color: #3498db; text-decoration: none;">Join Meeting</a>
              </div>
              ` : ''}
              
              ${meeting.agenda ? `
              <div style="display: flex; align-items: flex-start;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📋 Agenda:</span>
                <span style="color: #2c3e50; white-space: pre-line;">${meeting.agenda}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Team Information -->
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="color: #2c3e50; margin-top: 0;">👥 Meeting Participants:</h4>
            <p style="margin: 5px 0; color: #34495e;"><strong>Supervisor:</strong> ${supervisor.fullname}</p>
            <p style="margin: 5px 0; color: #34495e;"><strong>Team Members:</strong> ${teamMembers.map(member => member.fullname).join(', ')}</p>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" 
               style="display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 0 10px; font-size: 16px;">
              🔗 Go to Portal
            </a>
          </div>

          <!-- Calendar Integration -->
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 25px 0;">
            <h4 style="color: #856404; margin-top: 0;">📅 Add to Calendar</h4>
            <p style="color: #856404; margin: 10px 0;">You can add this meeting to your calendar by downloading the attached .ics file or clicking the calendar link above.</p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
              This is an automated notification from Project Phoenix.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
Meeting Confirmed - ${meeting.title}

Great News! Your meeting has been confirmed.

The meeting for project "${project.projectName}" has been approved and scheduled.

Meeting Details:
- Title: ${meeting.title}
- Date: ${new Date(meeting.scheduledDate).toLocaleDateString()}
- Time: ${new Date(meeting.scheduledDate).toLocaleTimeString()}
- Duration: ${meeting.duration} minutes
- Type: ${meeting.meetingType}
${meeting.meetingLocation ? `- Location: ${meeting.meetingLocation}` : ''}
${meeting.virtualMeetingLink ? `- Virtual Link: ${meeting.virtualMeetingLink}` : ''}
${meeting.agenda ? `- Agenda: ${meeting.agenda}` : ''}

Meeting Participants:
- Supervisor: ${supervisor.fullname}
- Team Members: ${teamMembers.map(member => member.fullname).join(', ')}

Go to Portal: ${portalUrl}

Best regards,
Project Phoenix Team
    `;

    // Send to all team members
    const emailPromises = teamMembers.map(member => 
      emailService.sendMail({
        to: member.email,
        subject,
        text,
        html,
        attachments: [{
          filename: `meeting-${meeting._id}.ics`,
          content: icsContent,
          contentType: 'text/calendar'
        }]
      })
    );

    return await Promise.all(emailPromises);
  }

  /**
   * Send meeting update notification
   */
  static async sendMeetingUpdateNotification(meeting, teamMembers, supervisor, project, updateDetails) {
    const subject = `Meeting Updated - ${meeting.title}`;
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const portalUrl = `${frontendUrl}/student/dashboard`;
    const meetingUrl = `${frontendUrl}/student/meetings`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); border-radius: 10px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔄 Meeting Updated</h1>
          <p style="color: #fef9e7; margin: 10px 0 0 0; font-size: 16px;">Project Phoenix - Academic Management System</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Meeting Details Updated</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #34495e; margin-bottom: 25px;">
            The meeting for project <strong>"${project.projectName}"</strong> has been updated.
          </p>

          ${updateDetails ? `
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 25px 0;">
            <h4 style="color: #856404; margin-top: 0;">📝 Changes Made:</h4>
            <p style="color: #856404; margin: 0;">${updateDetails}</p>
          </div>
          ` : ''}

          <!-- Meeting Details Card -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #f39c12; margin: 25px 0;">
            <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 20px;">📋 Updated Meeting Details</h3>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📝 Title:</span>
                <span style="color: #2c3e50;">${meeting.title}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📅 Date:</span>
                <span style="color: #2c3e50;">${new Date(meeting.scheduledDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">🕐 Time:</span>
                <span style="color: #2c3e50;">${new Date(meeting.scheduledDate).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">⏱️ Duration:</span>
                <span style="color: #2c3e50;">${meeting.duration} minutes</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">🏢 Type:</span>
                <span style="color: #2c3e50;">${meeting.meetingType}</span>
              </div>
              
              ${meeting.meetingLocation ? `
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📍 Location:</span>
                <span style="color: #2c3e50;">${meeting.meetingLocation}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" 
               style="display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 0 10px; font-size: 16px;">
              🔗 Go to Portal
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
              This is an automated notification from Project Phoenix.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
Meeting Updated - ${meeting.title}

The meeting for project "${project.projectName}" has been updated.

${updateDetails ? `Changes Made: ${updateDetails}` : ''}

Updated Meeting Details:
- Title: ${meeting.title}
- Date: ${new Date(meeting.scheduledDate).toLocaleDateString()}
- Time: ${new Date(meeting.scheduledDate).toLocaleTimeString()}
- Duration: ${meeting.duration} minutes
- Type: ${meeting.meetingType}
${meeting.meetingLocation ? `- Location: ${meeting.meetingLocation}` : ''}

Go to Portal: ${portalUrl}

Best regards,
Project Phoenix Team
    `;

    // Send to all team members
    const emailPromises = teamMembers.map(member => 
      emailService.sendMail({
        to: member.email,
        subject,
        text,
        html
      })
    );

    return await Promise.all(emailPromises);
  }

  /**
   * Send meeting cancellation notification
   */
  static async sendMeetingCancellationNotification(meeting, teamMembers, supervisor, project, reason = '') {
    const subject = `Meeting Cancelled - ${meeting.title}`;
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const portalUrl = `${frontendUrl}/student/dashboard`;
    const meetingUrl = `${frontendUrl}/student/meetings`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); border-radius: 10px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">❌ Meeting Cancelled</h1>
          <p style="color: #fadbd8; margin: 10px 0 0 0; font-size: 16px;">Project Phoenix - Academic Management System</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Meeting Has Been Cancelled</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #34495e; margin-bottom: 25px;">
            The meeting for project <strong>"${project.projectName}"</strong> has been cancelled.
          </p>

          ${reason ? `
          <div style="background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 25px 0;">
            <h4 style="color: #721c24; margin-top: 0;">📝 Reason for Cancellation:</h4>
            <p style="color: #721c24; margin: 0;">${reason}</p>
          </div>
          ` : ''}

          <!-- Meeting Details Card -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #e74c3c; margin: 25px 0;">
            <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 20px;">📋 Cancelled Meeting Details</h3>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📝 Title:</span>
                <span style="color: #2c3e50;">${meeting.title}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📅 Date:</span>
                <span style="color: #2c3e50;">${new Date(meeting.scheduledDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">🕐 Time:</span>
                <span style="color: #2c3e50;">${new Date(meeting.scheduledDate).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">⏱️ Duration:</span>
                <span style="color: #2c3e50;">${meeting.duration} minutes</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">🏢 Type:</span>
                <span style="color: #2c3e50;">${meeting.meetingType}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" 
               style="display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 0 10px; font-size: 16px;">
              🔗 Go to Portal
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
              This is an automated notification from Project Phoenix.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
Meeting Cancelled - ${meeting.title}

The meeting for project "${project.projectName}" has been cancelled.

${reason ? `Reason for Cancellation: ${reason}` : ''}

Cancelled Meeting Details:
- Title: ${meeting.title}
- Date: ${new Date(meeting.scheduledDate).toLocaleDateString()}
- Time: ${new Date(meeting.scheduledDate).toLocaleTimeString()}
- Duration: ${meeting.duration} minutes
- Type: ${meeting.meetingType}

Go to Portal: ${portalUrl}

Best regards,
Project Phoenix Team
    `;

    // Send to all team members
    const emailPromises = teamMembers.map(member => 
      emailService.sendMail({
        to: member.email,
        subject,
        text,
        html
      })
    );

    return await Promise.all(emailPromises);
  }

  /**
   * Send meeting reminder notification
   */
  static async sendMeetingReminderNotification(meeting, teamMembers, supervisor, project, reminderType = '24h') {
    const timeText = reminderType === '24h' ? '24 hours' : reminderType === '1h' ? '1 hour' : reminderType;
    const subject = `Meeting Reminder - ${meeting.title} (${timeText} notice)`;
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const portalUrl = `${frontendUrl}/student/dashboard`;
    const meetingUrl = `${frontendUrl}/student/meetings`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); border-radius: 10px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Meeting Reminder</h1>
          <p style="color: #f4ecf7; margin: 10px 0 0 0; font-size: 16px;">Project Phoenix - Academic Management System</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Upcoming Meeting Reminder</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #34495e; margin-bottom: 25px;">
            This is a friendly reminder that you have a meeting for project <strong>"${project.projectName}"</strong> in ${timeText}.
          </p>

          <!-- Meeting Details Card -->
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #9b59b6; margin: 25px 0;">
            <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 20px;">📋 Meeting Details</h3>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📝 Title:</span>
                <span style="color: #2c3e50;">${meeting.title}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📅 Date:</span>
                <span style="color: #2c3e50;">${new Date(meeting.scheduledDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">🕐 Time:</span>
                <span style="color: #2c3e50;">${new Date(meeting.scheduledDate).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">⏱️ Duration:</span>
                <span style="color: #2c3e50;">${meeting.duration} minutes</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">🏢 Type:</span>
                <span style="color: #2c3e50;">${meeting.meetingType}</span>
              </div>
              
              ${meeting.meetingLocation ? `
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">📍 Location:</span>
                <span style="color: #2c3e50;">${meeting.meetingLocation}</span>
              </div>
              ` : ''}
              
              ${meeting.virtualMeetingLink ? `
              <div style="display: flex; align-items: center;">
                <span style="font-weight: bold; color: #34495e; min-width: 120px;">🔗 Virtual Link:</span>
                <a href="${meeting.virtualMeetingLink}" style="color: #3498db; text-decoration: none;">Join Meeting</a>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" 
               style="display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 0 10px; font-size: 16px;">
              🔗 Go to Portal
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
              This is an automated reminder from Project Phoenix.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
Meeting Reminder - ${meeting.title} (${timeText} notice)

This is a friendly reminder that you have a meeting for project "${project.projectName}" in ${timeText}.

Meeting Details:
- Title: ${meeting.title}
- Date: ${new Date(meeting.scheduledDate).toLocaleDateString()}
- Time: ${new Date(meeting.scheduledDate).toLocaleTimeString()}
- Duration: ${meeting.duration} minutes
- Type: ${meeting.meetingType}
${meeting.meetingLocation ? `- Location: ${meeting.meetingLocation}` : ''}
${meeting.virtualMeetingLink ? `- Virtual Link: ${meeting.virtualMeetingLink}` : ''}

Go to Portal: ${portalUrl}

Best regards,
Project Phoenix Team
    `;

    // Send to all team members
    const emailPromises = teamMembers.map(member => 
      emailService.sendMail({
        to: member.email,
        subject,
        text,
        html
      })
    );

    return await Promise.all(emailPromises);
  }
}

module.exports = MeetingEmailTemplates;
