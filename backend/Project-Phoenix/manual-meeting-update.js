#!/usr/bin/env node

/**
 * Manual Meeting Status Update Script
 * This script manually processes all meetings and updates their status
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MeetingStatusService = require('./src/services/meeting/meetingStatusService');
const connectDB = require('./src/config/database');

async function manualMeetingUpdate() {
  try {
    console.log('🔄 Starting manual meeting status update...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Process all meetings
    const result = await MeetingStatusService.processAllMeetings();
    
    console.log('📊 Results:');
    console.log(`   - Processed: ${result.processed} meetings`);
    console.log(`   - Updated: ${result.updated} meetings`);
    
    // Get meetings that need updates
    const meetingsNeedingUpdate = await MeetingStatusService.getMeetingsNeedingUpdate();
    console.log(`   - Still needing updates: ${meetingsNeedingUpdate.length} meetings`);
    
    if (meetingsNeedingUpdate.length > 0) {
      console.log('\n📋 Meetings that need updates:');
      meetingsNeedingUpdate.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.meeting.title} - ${item.reason} (suggested: ${item.suggestedStatus})`);
      });
    }
    
    console.log('\n✅ Manual update completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during manual update:', error);
    process.exit(1);
  }
}

// Run the script
manualMeetingUpdate();



