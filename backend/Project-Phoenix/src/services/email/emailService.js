const nodemailer = require("nodemailer");
const { AppError } = require("../../middleware/errorHandler");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS,
        },
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  /**
   * Send email
   */
  async sendMail({ to, subject, text, html }) {
    try {
      if (!this.transporter) {
        throw new AppError('Email service not configured', 500);
      }

      const mailOptions = {
        from: {
          name: "Project Phoenix",
          address: process.env.NODEMAILER_USER,
        },
        to,
        subject,
        text,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new AppError('Failed to send email', 500);
    }
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(email, otp, userName = '') {
    const subject = "Password Reset OTP - Project Phoenix";
    const text = `Dear ${userName},\n\nYour password reset OTP is: ${otp}\n\nThis OTP will expire in 5 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nProject Phoenix Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50;">Project Phoenix</h1>
        </div>
        
        <h2 style="color: #34495e;">Password Reset Request</h2>
        <p>Dear ${userName},</p>
        <p>You requested to reset your password for Project Phoenix.</p>
        
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; margin: 30px 0; border-radius: 8px; border: 2px dashed #3498db;">
          <h3 style="margin: 0; color: #2c3e50;">Your OTP Code</h3>
          <h2 style="font-size: 32px; letter-spacing: 8px; color: #3498db; margin: 10px 0;">${otp}</h2>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> This OTP will expire in 10 minutes.</p>
        </div>
        
        <p>If you didn't request this password reset, please ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
        <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
          This is an automated message from Project Phoenix - Academic Project Management System<br>
          Please do not reply to this email.
        </p>
      </div>
    `;

    return await this.sendMail({ to: email, subject, text, html });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, userName, role) {
    const subject = "Welcome to Project Phoenix!";
    const text = `Welcome ${userName}! Your ${role} account has been created successfully.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Welcome to Project Phoenix!</h1>
        <p>Dear ${userName},</p>
        <p>Your ${role} account has been created successfully.</p>
        <p>You can now log in and start using the platform.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Project Phoenix - Academic Project Management System</p>
      </div>
    `;

    return await this.sendMail({ to: email, subject, text, html });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(email, title, message, userName = '') {
    const subject = `${title} - Project Phoenix`;
    const text = `Dear ${userName},\n\n${message}\n\nBest regards,\nProject Phoenix Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Project Phoenix</h1>
        <h2 style="color: #34495e;">${title}</h2>
        <p>Dear ${userName},</p>
        <p>${message}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Project Phoenix - Academic Project Management System</p>
      </div>
    `;

    return await this.sendMail({ to: email, subject, text, html });
  }

  /**
   * Send account creation email with temporary password
   */
  async sendAccountCreationEmail(email, userName, role, temporaryPassword, loginUrl = '') {
    const roleDisplayName = this.getRoleDisplayName(role);
    const subject = `Welcome to Project Phoenix - Your ${roleDisplayName} Account is Ready!`;
    
    const text = `Dear ${userName},\n\nYour ${roleDisplayName} account has been created successfully!\n\nLogin Credentials:\nEmail: ${email}\nTemporary Password: ${temporaryPassword}\n\nPlease log in and change your password immediately.\n\nLogin URL: ${loginUrl}\n\nBest regards,\nProject Phoenix Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="text-align: center; margin-bottom: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to Project Phoenix!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your ${roleDisplayName} Account is Ready</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">Account Created Successfully!</h2>
          <p style="color: #555; line-height: 1.6;">Dear <strong>${userName}</strong>,</p>
          <p style="color: #555; line-height: 1.6;">Your ${roleDisplayName} account has been created and is ready to use. Below are your login credentials:</p>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50;">🔐 Your Login Credentials</h3>
            <div style="margin-bottom: 10px;">
              <strong style="color: #495057;">Email:</strong> 
              <span style="color: #007bff; font-family: monospace; background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">${email}</span>
            </div>
            <div style="margin-bottom: 15px;">
              <strong style="color: #495057;">Temporary Password:</strong> 
              <span style="color: #dc3545; font-family: monospace; background-color: #f8d7da; padding: 2px 6px; border-radius: 3px; font-weight: bold;">${temporaryPassword}</span>
            </div>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin-top: 15px;">
              <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> Please change your password immediately after your first login for security reasons.</p>
            </div>
          </div>
          
          ${loginUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              🚀 Login to Your Account
            </a>
          </div>
          ` : ''}
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1976d2;">📋 Next Steps:</h4>
            <ol style="margin: 0; padding-left: 20px; color: #555;">
              <li>Log in using the credentials provided above</li>
              <li>Change your temporary password to a secure one</li>
              <li>Complete your profile setup</li>
              <li>Start exploring the platform features</li>
            </ol>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
          <p style="margin: 0;">This is an automated message from <strong>Project Phoenix</strong> - Academic Project Management System</p>
          <p style="margin: 5px 0 0 0;">Please do not reply to this email. For support, contact your system administrator.</p>
        </div>
      </div>
    `;

    return await this.sendMail({ to: email, subject, text, html });
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role) {
    switch (role) {
      case 2001:
        return 'Student';
      case 1984:
        return 'Supervisor';
      case 5150:
        return 'Admin';
      case 4334:
        return 'Evaluator';
      default:
        return 'User';
    }
  }
}

module.exports = new EmailService();
