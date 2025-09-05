/**
 * Simple test script for meeting status management (without cron)
 * Run with: node test-meeting-status-simple.js
 */

require('dotenv').config();

async function testMeetingStatusSimple() {
  console.log('🧪 Testing Meeting Status Management (Simple)...\n');

  try {
    // Test the MeetingStatusService directly
    const MeetingStatusService = require('./src/services/meeting/meetingStatusService');
    
    console.log('1️⃣ Testing getMeetingsNeedingUpdate...');
    const meetingsNeedingUpdate = await MeetingStatusService.getMeetingsNeedingUpdate();
    console.log(`✅ Found ${meetingsNeedingUpdate.length} meetings needing update\n`);

    console.log('2️⃣ Testing processAllMeetings...');
    const processResult = await MeetingStatusService.processAllMeetings();
    console.log(`✅ Processed ${processResult.processed} meetings, updated ${processResult.updated}\n`);

    console.log('3️⃣ Testing getSuggestedStatus...');
    if (meetingsNeedingUpdate.length > 0) {
      const meeting = meetingsNeedingUpdate[0].meeting;
      const suggestedStatus = MeetingStatusService.getSuggestedStatus(meeting);
      console.log(`✅ Suggested status for meeting ${meeting._id}: ${suggestedStatus}\n`);
    }

    console.log('🎉 Meeting status management test completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the server: npm start');
    console.log('2. Enable cron service: ENABLE_CRON=true npm start');
    console.log('3. Test API endpoints:');
    console.log('   - GET http://localhost:3500/api/meeting-status/needing-update');
    console.log('   - POST http://localhost:3500/api/meeting-status/process-all');

  } catch (error) {
    console.error('❌ Meeting status management test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check database connection');
    console.log('3. Verify meeting data exists');
    console.log('4. Check server logs for errors');
  }
}

// Run the test
testMeetingStatusSimple();
