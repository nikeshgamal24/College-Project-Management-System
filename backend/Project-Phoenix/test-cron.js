#!/usr/bin/env node

/**
 * Test Cron Service Script
 * This script tests if the cron service is working
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MeetingStatusService = require('./src/services/meeting/meetingStatusService');
const meetingCronService = require('./src/services/meeting/meetingCronService');
const connectDB = require('./src/config/database');

async function testCron() {
  try {
    console.log('🧪 Testing Cron Service...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Check if cron service is running
    console.log('\n🔍 Checking Cron Service Status:');
    const cronStatus = meetingCronService.getStatus();
    console.log(`   - Is Running: ${cronStatus.isRunning}`);
    console.log(`   - Jobs: ${Object.keys(cronStatus.jobs).length}`);
    
    if (cronStatus.isRunning) {
      console.log('   - Job Details:');
      Object.entries(cronStatus.jobs).forEach(([name, job]) => {
        console.log(`     * ${name}: running=${job.running}, scheduled=${job.scheduled}`);
      });
    }
    
    // Test manual processing
    console.log('\n🔄 Testing Manual Meeting Processing:');
    const result = await MeetingStatusService.processAllMeetings();
    console.log(`   - Processed: ${result.processed} meetings`);
    console.log(`   - Updated: ${result.updated} meetings`);
    
    // Check meetings needing updates
    console.log('\n📋 Meetings Needing Updates:');
    const meetingsNeedingUpdate = await MeetingStatusService.getMeetingsNeedingUpdate();
    console.log(`   - Count: ${meetingsNeedingUpdate.length}`);
    
    if (meetingsNeedingUpdate.length > 0) {
      meetingsNeedingUpdate.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.meeting.title} - ${item.reason}`);
        console.log(`      Current: ${item.meeting.status} → Suggested: ${item.suggestedStatus}`);
      });
    }
    
    // Test specific meeting from your image (September 6th, 2025)
    console.log('\n🎯 Testing Specific Meeting (Sep 6, 2025):');
    const targetDate = new Date('2025-09-06T10:35:00'); // 10:35 AM
    const meetings = await mongoose.connection.db.collection('meetings').find({
      scheduledDate: {
        $gte: new Date('2025-09-06T00:00:00'),
        $lt: new Date('2025-09-07T00:00:00')
      }
    }).toArray();
    
    console.log(`   - Found ${meetings.length} meetings on Sep 6, 2025`);
    
    meetings.forEach((meeting, index) => {
      console.log(`\n   Meeting ${index + 1}:`);
      console.log(`   - Title: ${meeting.title}`);
      console.log(`   - Status: ${meeting.status}`);
      console.log(`   - Scheduled: ${meeting.scheduledDate}`);
      console.log(`   - Duration: ${meeting.duration} minutes`);
      
      const currentTime = new Date();
      const meetingStartTime = new Date(meeting.scheduledDate);
      const meetingEndTime = new Date(meetingStartTime.getTime() + meeting.duration * 60000);
      
      console.log(`   - Current Time: ${currentTime.toISOString()}`);
      console.log(`   - Meeting Start: ${meetingStartTime.toISOString()}`);
      console.log(`   - Meeting End: ${meetingEndTime.toISOString()}`);
      
      const timeSinceStart = currentTime.getTime() - meetingStartTime.getTime();
      const timeSinceEnd = currentTime.getTime() - meetingEndTime.getTime();
      
      console.log(`   - Minutes since start: ${Math.round(timeSinceStart / 60000)}`);
      console.log(`   - Minutes since end: ${Math.round(timeSinceEnd / 60000)}`);
      
      if (meeting.status === 'scheduled') {
        if (timeSinceStart > 0) {
          console.log(`   ⚠️  Meeting should be 'in_progress' or 'completed'!`);
        } else {
          console.log(`   ✅ Meeting is still scheduled (not started yet)`);
        }
      }
    });
    
    console.log('\n✅ Cron test completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during cron test:', error);
    process.exit(1);
  }
}

// Run the test
testCron();



