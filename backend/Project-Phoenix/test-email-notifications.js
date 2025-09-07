/**
 * Test script for email notifications
 * Run with: node test-email-notifications.js
 */

require('dotenv').config();
const MeetingNotificationService = require('./src/services/email/meetingNotificationService');

// Mock meeting data for testing
const mockMeeting = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Project Progress Review',
  description: 'Weekly progress review meeting',
  meetingType: 'Progress Review',
  scheduledDate: new Date('2024-02-15T10:00:00Z'),
  duration: 60,
  meetingLocation: 'Room 101',
  agenda: 'Discuss project progress and next steps',
  status: 'approved',
  isCustomRequest: false
};

const mockStudent = {
  _id: '507f1f77bcf86cd799439012',
  fullname: 'John Doe',
  email: 'john.doe@example.com',
  rollNumber: '2024001'
};

const mockSupervisor = {
  _id: '507f1f77bcf86cd799439013',
  fullname: 'Dr. Jane Smith',
  email: 'jane.smith@example.com'
};

const mockProject = {
  _id: '507f1f77bcf86cd799439014',
  projectName: 'AI-Powered Learning Management System',
  teamMembers: [mockStudent],
  supervisor: { supervisorId: mockSupervisor._id }
};

async function testEmailNotifications() {
  console.log('🧪 Testing Email Notifications...\n');

  try {
    // Test 1: Meeting Request Notification
    console.log('1️⃣ Testing Meeting Request Notification...');
    await MeetingNotificationService.sendMeetingRequestNotification(
      mockMeeting,
      mockStudent._id,
      mockProject._id
    );
    console.log('✅ Meeting request notification sent successfully\n');

    // Test 2: Meeting Confirmation Notification
    console.log('2️⃣ Testing Meeting Confirmation Notification...');
    await MeetingNotificationService.sendMeetingConfirmationNotification(
      mockMeeting,
      mockProject._id
    );
    console.log('✅ Meeting confirmation notification sent successfully\n');

    // Test 3: Meeting Update Notification
    console.log('3️⃣ Testing Meeting Update Notification...');
    await MeetingNotificationService.sendMeetingUpdateNotification(
      mockMeeting,
      mockProject._id,
      'Meeting time changed from 10:00 AM to 2:00 PM'
    );
    console.log('✅ Meeting update notification sent successfully\n');

    // Test 4: Meeting Cancellation Notification
    console.log('4️⃣ Testing Meeting Cancellation Notification...');
    await MeetingNotificationService.sendMeetingCancellationNotification(
      mockMeeting,
      mockProject._id,
      'Supervisor has a conflicting appointment'
    );
    console.log('✅ Meeting cancellation notification sent successfully\n');

    console.log('🎉 All email notification tests completed successfully!');
    console.log('\n📧 Check your email inbox for the test notifications.');
    console.log('💡 Make sure to configure your email credentials in the .env file:');
    console.log('   - NODEMAILER_USER=your-email@gmail.com');
    console.log('   - NODEMAILER_PASS=your-app-password');
    console.log('   - FRONTEND_URL=http://localhost:3000');

  } catch (error) {
    console.error('❌ Email notification test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if email credentials are configured in .env file');
    console.log('2. Verify NODEMAILER_USER and NODEMAILER_PASS are correct');
    console.log('3. Make sure you have enabled "Less secure app access" or use App Passwords');
    console.log('4. Check your internet connection');
  }
}

// Run the test
testEmailNotifications();
