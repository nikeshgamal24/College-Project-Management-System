const nodemailer = require("nodemailer");

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

// Email templates
const getNewTicketTemplate = (ticket) => {
  return {
    subject: `New Support Ticket: ${ticket.ticketId} - ${ticket.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Support Ticket Created</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Ticket Details</h3>
          <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
          <p><strong>Title:</strong> ${ticket.title}</p>
          <p><strong>Priority:</strong> <span style="background-color: ${getPriorityColor(ticket.priority)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${ticket.priority.toUpperCase()}</span></p>
          <p><strong>Category:</strong> ${ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}</p>
          <p><strong>Submitted By:</strong> ${ticket.submittedByName} (${ticket.submittedByRole})</p>
          <p><strong>Submitted At:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Description</h3>
          <p style="white-space: pre-wrap;">${ticket.description}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/help-support" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Ticket
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    `,
  };
};

const getStatusChangeTemplate = (ticket, oldStatus, newStatus) => {
  return {
    subject: `Ticket ${ticket.ticketId} Status Updated: ${oldStatus} → ${newStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Ticket Status Updated</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Ticket Details</h3>
          <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
          <p><strong>Title:</strong> ${ticket.title}</p>
          <p><strong>Status:</strong> 
            <span style="background-color: ${getStatusColor(oldStatus)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px;">${oldStatus.toUpperCase()}</span>
            →
            <span style="background-color: ${getStatusColor(newStatus)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${newStatus.toUpperCase()}</span>
          </p>
          <p><strong>Priority:</strong> <span style="background-color: ${getPriorityColor(ticket.priority)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${ticket.priority.toUpperCase()}</span></p>
          <p><strong>Submitted By:</strong> ${ticket.submittedByName} (${ticket.submittedByRole})</p>
          <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        ${ticket.resolution ? `
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <h3 style="margin-top: 0; color: #166534;">Resolution</h3>
          <p style="white-space: pre-wrap;">${ticket.resolution}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/help-support/${ticket._id}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Ticket
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    `,
  };
};

const getNewCommentTemplate = (ticket, comment) => {
  return {
    subject: `New Comment on Ticket ${ticket.ticketId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Comment Added</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Ticket Details</h3>
          <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
          <p><strong>Title:</strong> ${ticket.title}</p>
          <p><strong>Status:</strong> <span style="background-color: ${getStatusColor(ticket.status)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${ticket.status.toUpperCase()}</span></p>
          <p><strong>Priority:</strong> <span style="background-color: ${getPriorityColor(ticket.priority)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${ticket.priority.toUpperCase()}</span></p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">New Comment</h3>
          <p><strong>Author:</strong> ${comment.authorName} (${comment.authorRole})</p>
          <p><strong>Posted At:</strong> ${new Date(comment.createdAt).toLocaleString()}</p>
          <div style="background-color: white; padding: 15px; border-radius: 6px; margin-top: 10px; border-left: 4px solid #2563eb;">
            <p style="white-space: pre-wrap; margin: 0;">${comment.message}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/help-support/${ticket._id}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Ticket
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    `,
  };
};

const getTicketAssignedTemplate = (ticket) => {
  return {
    subject: `Ticket ${ticket.ticketId} Assigned to You`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Ticket Assigned to You</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Ticket Details</h3>
          <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
          <p><strong>Title:</strong> ${ticket.title}</p>
          <p><strong>Priority:</strong> <span style="background-color: ${getPriorityColor(ticket.priority)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${ticket.priority.toUpperCase()}</span></p>
          <p><strong>Category:</strong> ${ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}</p>
          <p><strong>Submitted By:</strong> ${ticket.submittedByName} (${ticket.submittedByRole})</p>
          <p><strong>Assigned At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Description</h3>
          <p style="white-space: pre-wrap;">${ticket.description}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/help-support/${ticket._id}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Ticket
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    `,
  };
};

// Helper functions for colors
const getPriorityColor = (priority) => {
  switch (priority) {
    case "urgent":
      return "#dc2626";
    case "high":
      return "#ea580c";
    case "medium":
      return "#d97706";
    case "low":
      return "#16a34a";
    default:
      return "#6b7280";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "new":
      return "#2563eb";
    case "in_progress":
      return "#d97706";
    case "resolved":
      return "#16a34a";
    case "closed":
      return "#6b7280";
    case "on_hold":
      return "#7c3aed";
    default:
      return "#6b7280";
  }
};

// Main function to send ticket notification emails
const sendTicketNotificationEmail = async (ticket, notificationType, additionalData = {}) => {
  try {
    let emailTemplate;
    let recipients = [];

    // Ensure ticket is populated with user data
    if (!ticket.submittedByEmail && ticket.submittedBy) {
      const submittedBy = await ticket.submittedBy;
      ticket.submittedByEmail = submittedBy.email;
      ticket.submittedByName = submittedBy.fullname || submittedBy.firstName + ' ' + submittedBy.lastName;
    }

    if (!ticket.assignedToEmail && ticket.assignedTo) {
      const assignedTo = await ticket.assignedTo;
      ticket.assignedToEmail = assignedTo.email;
      ticket.assignedToName = assignedTo.fullname || assignedTo.firstName + ' ' + assignedTo.lastName;
    }

    switch (notificationType) {
      case "new_ticket":
        emailTemplate = getNewTicketTemplate(ticket);
        // Send to all admins
        const admins = await require("../../models/user/Admin").find({}, "email fullname firstName lastName");
        recipients = admins.map(admin => ({
          email: admin.email,
          name: admin.fullname || admin.firstName + ' ' + admin.lastName,
        }));
        break;

      case "status_change":
        emailTemplate = getStatusChangeTemplate(ticket, additionalData.oldStatus, additionalData.newStatus);
        // Send to submitter and assigned admin
        recipients = [
          {
            email: ticket.submittedByEmail,
            name: ticket.submittedByName,
          },
        ];
        if (ticket.assignedToEmail) {
          recipients.push({
            email: ticket.assignedToEmail,
            name: ticket.assignedToName,
          });
        }
        break;

      case "new_comment":
        emailTemplate = getNewCommentTemplate(ticket, additionalData.comment);
        // Send to submitter and assigned admin (if different from comment author)
        recipients = [
          {
            email: ticket.submittedByEmail,
            name: ticket.submittedByName,
          },
        ];
        if (ticket.assignedToEmail && ticket.assignedToEmail !== additionalData.comment?.authorEmail) {
          recipients.push({
            email: ticket.assignedToEmail,
            name: ticket.assignedToName,
          });
        }
        break;

      case "ticket_assigned":
        emailTemplate = getTicketAssignedTemplate(ticket);
        // Send to assigned admin
        if (ticket.assignedToEmail) {
          recipients = [
            {
              email: ticket.assignedToEmail,
              name: ticket.assignedToName,
            },
          ];
        }
        break;

      default:
        throw new Error(`Unknown notification type: ${notificationType}`);
    }

    // Send emails to all recipients
    const emailPromises = recipients.map(recipient => {
      const mailOptions = {
        from: {
          name: "Project Phoenix Support",
          address: process.env.NODEMAILER_USER,
        },
        to: recipient.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);
    console.log(`Ticket notification emails sent successfully for ${notificationType}`);

  } catch (error) {
    console.error("Error sending ticket notification email:", error);
    throw error;
  }
};

module.exports = {
  sendTicketNotificationEmail,
};
