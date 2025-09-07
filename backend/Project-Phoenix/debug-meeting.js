#!/usr/bin/env node

/**
 * Debug Meeting Status Script
 * This script helps debug why a specific meeting isn't updating
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Meeting = require('./src/models/system/Meeting');
const connectDB = require('./src/config/database');

async function debugMeeting() {
  try {
    console.log('🔍 Starting meeting debug...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Find meetings for September 6th, 2025
    const targetDate = new Date('2025-09-06');
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log(`\n🔍 Looking for meetings on ${targetDate.toDateString()}`);
    console.log(`   Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    
    const meetings = await Meeting.find({
      scheduledDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('project', 'projectName');
    
    console.log(`\n📊 Found ${meetings.length} meetings on this date:`);
    
    const currentTime = new Date();
    console.log(`\n⏰ Current time: ${currentTime.toISOString()}`);
    console.log(`   Local time: ${currentTime.toLocaleString()}`);
    
    meetings.forEach((meeting, index) => {
      console.log(`\n📅 Meeting ${index + 1}:`);
      console.log(`   Title: ${meeting.title}`);
      console.log(`   Status: ${meeting.status}`);
      console.log(`   Scheduled: ${meeting.scheduledDate.toISOString()}`);
      console.log(`   Duration: ${meeting.duration} minutes`);
      
      const meetingStartTime = new Date(meeting.scheduledDate);
      const meetingEndTime = new Date(meetingStartTime.getTime() + meeting.duration * 60000);
      const reminderTime = new Date(meetingStartTime.getTime() - 5 * 60000);
      const completionTime = new Date(meetingEndTime.getTime() + 15 * 60000);
      
      console.log(`   Start time: ${meetingStartTime.toISOString()}`);
      console.log(`   End time: ${meetingEndTime.toISOString()}`);
      console.log(`   Reminder time (5min before): ${reminderTime.toISOString()}`);
      console.log(`   Completion time (15min after): ${completionTime.toISOString()}`);
      
      // Check status logic
      console.log(`\n   🔍 Status Logic Check:`);
      console.log(`   - Current time >= reminder time: ${currentTime >= reminderTime}`);
      console.log(`   - Current time < meeting start: ${currentTime < meetingStartTime}`);
      console.log(`   - Current time >= completion time: ${currentTime >= completionTime}`);
      
      if (meeting.status === 'scheduled') {
        if (currentTime >= reminderTime && currentTime < meetingStartTime) {
          console.log(`   ✅ Should be 'in_progress' (meeting starting soon)`);
        } else if (currentTime >= meetingStartTime) {
          console.log(`   ✅ Should be 'in_progress' (meeting has started)`);
        } else {
          console.log(`   ⏳ Still scheduled (meeting not starting yet)`);
        }
      } else if (meeting.status === 'in_progress') {
        if (currentTime >= completionTime) {
          console.log(`   ✅ Should be 'completed' (meeting ended)`);
        } else {
          console.log(`   ⏳ Still in progress (meeting ongoing)`);
        }
      }
      
      // Time differences
      const timeToStart = meetingStartTime.getTime() - currentTime.getTime();
      const timeSinceStart = currentTime.getTime() - meetingStartTime.getTime();
      const timeSinceEnd = currentTime.getTime() - meetingEndTime.getTime();
      
      console.log(`\n   ⏱️  Time Analysis:`);
      console.log(`   - Minutes until start: ${Math.round(timeToStart / 60000)}`);
      console.log(`   - Minutes since start: ${Math.round(timeSinceStart / 60000)}`);
      console.log(`   - Minutes since end: ${Math.round(timeSinceEnd / 60000)}`);
    });
    
    // Also check all meetings with 'scheduled' status
    console.log(`\n🔍 All 'scheduled' meetings:`);
    const scheduledMeetings = await Meeting.find({ status: 'scheduled' })
      .populate('project', 'projectName')
      .sort({ scheduledDate: 1 });
    
    console.log(`   Found ${scheduledMeetings.length} scheduled meetings:`);
    scheduledMeetings.forEach((meeting, index) => {
      const timeDiff = meeting.scheduledDate.getTime() - currentTime.getTime();
      const hoursDiff = Math.round(timeDiff / (1000 * 60 * 60));
      console.log(`   ${index + 1}. ${meeting.title} - ${meeting.scheduledDate.toISOString()} (${hoursDiff}h from now)`);
    });
    
    console.log('\n✅ Debug completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
    process.exit(1);
  }
}

// Run the script
debugMeeting();



