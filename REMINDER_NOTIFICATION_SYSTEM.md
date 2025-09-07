# 🔔 Reminder Notification System - Project Phoenix

## Overview

The Reminder Notification System provides automated email reminders for meetings, supporting both general reminders (sent to all team members and supervisor) and personal reminders (sent to specific users based on who set them).

## 🎯 Features

### **1. General Reminders**
- ✅ **Who can set**: Any team member (student) or supervisor
- ✅ **Who receives**: All team members + supervisor
- ✅ **When**: At the specified reminder time before meeting
- ✅ **Purpose**: Ensure everyone is aware of upcoming meetings

### **2. Personal Reminders**
- ✅ **Student sets**: Only students receive the reminder
- ✅ **Supervisor sets**: Only supervisor receives the reminder
- ✅ **When**: At the specified reminder time before meeting
- ✅ **Purpose**: Personal preparation and organization

## 🏗️ System Architecture

### **Backend Components**

#### **1. Database Schema (Meeting Model)**
```javascript
reminders: {
  general: {
    enabled: Boolean,
    timeBefore: Number, // minutes before meeting
    setBy: ObjectId,
    setByModel: String, // 'Student', 'Supervisor', 'Admin'
    setAt: Date
  },
  personal: {
    enabled: Boolean,
    timeBefore: Number, // minutes before meeting
    setBy: ObjectId,
    setByModel: String, // 'Student', 'Supervisor', 'Admin'
    setAt: Date
  }
}
```

#### **2. Email Templates (`reminderEmailTemplates.js`)**
- **General Reminder Template**: Professional design with team information
- **Personal Reminder Template**: Personalized design for individual users
- **Responsive Design**: Works on all devices
- **Rich Content**: Meeting details, links, team info

#### **3. Notification Service (`reminderNotificationService.js`)**
- **`sendGeneralReminderNotification()`**: Sends to all team members + supervisor
- **`sendPersonalReminderNotification()`**: Sends to specific user
- **`processPendingReminders()`**: Processes all pending reminders
- **`getMeetingsNeedingReminders()`**: Finds meetings needing reminders

#### **4. API Controller (`reminderController.js`)**
- **`setGeneralReminder()`**: Set general reminder for meeting
- **`setPersonalReminder()`**: Set personal reminder for meeting
- **`updateReminder()`**: Update existing reminder settings
- **`getReminderSettings()`**: Get current reminder settings
- **`testReminder()`**: Send test reminder email
- **`processPendingReminders()`**: Process pending reminders manually

#### **5. Cron Service (`reminderCronService.js`)**
- **Automatic Processing**: Runs every 5 minutes
- **Error Handling**: Graceful failure handling
- **Status Monitoring**: Track service status
- **Manual Processing**: Process reminders on demand

### **Frontend Components**

#### **1. ReminderSettings Component**
- **General Reminder Settings**: Enable/disable, time selection
- **Personal Reminder Settings**: Enable/disable, time selection
- **Test Functionality**: Send test reminders
- **Status Display**: Show current reminder status
- **Role-Based UI**: Different options for students vs supervisors

## 📋 API Endpoints

### **Set General Reminder**
```http
POST /api/reminders/general/:meetingId
Content-Type: application/json
Authorization: Bearer <token>

{
  "timeBefore": 30
}
```

### **Set Personal Reminder**
```http
POST /api/reminders/personal/:meetingId
Content-Type: application/json
Authorization: Bearer <token>

{
  "timeBefore": 15
}
```

### **Update Reminder Settings**
```http
PUT /api/reminders/:meetingId
Content-Type: application/json
Authorization: Bearer <token>

{
  "reminderType": "general",
  "timeBefore": 60,
  "enabled": true
}
```

### **Get Reminder Settings**
```http
GET /api/reminders/:meetingId
Authorization: Bearer <token>
```

### **Test Reminder**
```http
POST /api/reminders/test/:meetingId
Content-Type: application/json
Authorization: Bearer <token>

{
  "reminderType": "general"
}
```

### **Process Pending Reminders**
```http
POST /api/reminders/process
Content-Type: application/json
Authorization: Bearer <token>

{
  "reminderType": "general"
}
```

## 🔄 Workflow

### **Setting Reminders**

1. **User opens meeting details**
2. **Clicks "Set Reminder" button**
3. **Selects reminder type (General/Personal)**
4. **Chooses time before meeting (5 minutes to 24 hours)**
5. **System saves reminder settings**
6. **Confirmation message displayed**

### **Processing Reminders**

1. **Cron job runs every 5 minutes**
2. **Finds meetings needing reminders**
3. **Checks if reminder time has passed**
4. **Sends appropriate email notifications**
5. **Disables reminder after sending**
6. **Logs success/failure**

### **Email Delivery**

1. **System generates email template**
2. **Populates with meeting details**
3. **Sends to appropriate recipients**
4. **Logs delivery status**
5. **Handles failures gracefully**

## 🎨 Email Templates

### **General Reminder Email**
- **Subject**: "🔔 Meeting Reminder: [Meeting Title]"
- **Recipients**: All team members + supervisor
- **Content**: Meeting details, team info, portal link
- **Design**: Professional blue theme

### **Personal Reminder Email**
- **Subject**: "🔔 Personal Meeting Reminder: [Meeting Title]"
- **Recipients**: Individual user who set reminder
- **Content**: Meeting details, personal message, portal link
- **Design**: Personal green theme

## ⚙️ Configuration

### **Environment Variables**
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cron Service
ENABLE_CRON=true
```

### **Time Options**
- **5 minutes** - Quick reminder
- **10 minutes** - Short notice
- **15 minutes** - Standard reminder
- **30 minutes** - Comfortable notice
- **1 hour** - Early reminder
- **2 hours** - Advance notice
- **4 hours** - Day-of reminder
- **8 hours** - Morning reminder
- **24 hours** - Day-before reminder

## 🔒 Permissions

### **Who Can Set Reminders**
- ✅ **Students**: Can set reminders for their team meetings
- ✅ **Supervisors**: Can set reminders for meetings they supervise
- ✅ **Admins**: Can set reminders for any meeting

### **Who Receives Reminders**
- **General Reminders**: All team members + supervisor
- **Personal Reminders**: 
  - If student sets: All students only
  - If supervisor sets: Supervisor only
  - If admin sets: Admin only

## 🧪 Testing

### **Test Script**
```bash
# Run reminder notification tests
node test-reminder-notifications.js
```

### **Manual Testing**
1. **Create a test meeting**
2. **Set general reminder for 5 minutes**
3. **Set personal reminder for 10 minutes**
4. **Wait for cron job to process**
5. **Check email delivery**
6. **Verify reminder settings**

### **API Testing**
```bash
# Test general reminder
curl -X POST http://localhost:3500/api/reminders/general/MEETING_ID \
  -H "Authorization: Bearer TOKEN" \
  -d '{"timeBefore": 30}'

# Test personal reminder
curl -X POST http://localhost:3500/api/reminders/personal/MEETING_ID \
  -H "Authorization: Bearer TOKEN" \
  -d '{"timeBefore": 15}'
```

## 📊 Monitoring

### **Cron Service Status**
- **Running**: Service is active and processing
- **Stopped**: Service is inactive
- **Error**: Service encountered an error

### **Reminder Processing**
- **Success**: Reminder sent successfully
- **Failed**: Reminder sending failed
- **Skipped**: No reminders to process

### **Email Delivery**
- **Sent**: Email delivered successfully
- **Failed**: Email delivery failed
- **Pending**: Email queued for delivery

## 🚀 Benefits

### **For Students**
- ✅ **Never miss meetings** - Automated reminders
- ✅ **Team coordination** - General reminders keep everyone informed
- ✅ **Personal organization** - Personal reminders for preparation
- ✅ **Flexible timing** - Choose reminder time that works for you

### **For Supervisors**
- ✅ **Team management** - Ensure all students are reminded
- ✅ **Personal preparation** - Set personal reminders for important meetings
- ✅ **Professional communication** - Automated, consistent reminders
- ✅ **Time management** - Plan ahead with advance reminders

### **For System**
- ✅ **Automated process** - No manual reminder management
- ✅ **Scalable** - Handles multiple meetings and users
- ✅ **Reliable** - Cron-based processing with error handling
- ✅ **Auditable** - Complete history of reminder actions

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Reminders Not Sending**
- **Check cron service status**
- **Verify email configuration**
- **Check meeting reminder settings**
- **Review server logs**

#### **2. Email Delivery Failed**
- **Verify SMTP credentials**
- **Check email addresses**
- **Review email template**
- **Check network connectivity**

#### **3. Cron Service Not Starting**
- **Install node-cron**: `npm install node-cron`
- **Check environment variables**
- **Review server logs**
- **Verify permissions**

### **Debug Commands**
```bash
# Check cron service status
curl -X GET http://localhost:3500/api/reminders/status

# Process reminders manually
curl -X POST http://localhost:3500/api/reminders/process \
  -H "Authorization: Bearer TOKEN" \
  -d '{"reminderType": "general"}'

# Test reminder
curl -X POST http://localhost:3500/api/reminders/test/MEETING_ID \
  -H "Authorization: Bearer TOKEN" \
  -d '{"reminderType": "general"}'
```

## 📈 Future Enhancements

### **Planned Features**
- **SMS Reminders**: Send text message reminders
- **Push Notifications**: Browser and mobile push notifications
- **Custom Templates**: User-defined email templates
- **Recurring Reminders**: Set reminders for recurring meetings
- **Reminder Analytics**: Track reminder effectiveness
- **Integration**: Calendar app integration

### **Advanced Options**
- **Multiple Reminders**: Set multiple reminders for same meeting
- **Conditional Reminders**: Reminders based on meeting type
- **Smart Timing**: AI-suggested reminder times
- **Reminder Preferences**: User-specific reminder settings

## 🎉 Conclusion

The Reminder Notification System provides a comprehensive solution for meeting reminders, ensuring that all team members stay informed and prepared for their meetings. With support for both general and personal reminders, flexible timing options, and automated processing, it significantly improves meeting attendance and preparation.

The system is designed to be scalable, reliable, and user-friendly, making it an essential component of the Project Phoenix meeting management system! 🚀

