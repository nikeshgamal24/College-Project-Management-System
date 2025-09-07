/**
 * Test script for automatic meeting status management
 * Run with: node test-meeting-status.js
 */

require('dotenv').config();
const MeetingStatusService = require('./src/services/meeting/meetingStatusService');
const meetingCronService = require('./src/services/meeting/meetingCronService');

async function testMeetingStatusManagement() {
  console.log('🧪 Testing Automatic Meeting Status Management...\n');

  try {
    // Test 1: Get meetings needing update
    console.log('1️⃣ Testing getMeetingsNeedingUpdate...');
    const meetingsNeedingUpdate = await MeetingStatusService.getMeetingsNeedingUpdate();
    console.log(`✅ Found ${meetingsNeedingUpdate.length} meetings needing update\n`);

    // Test 2: Process all meetings
    console.log('2️⃣ Testing processAllMeetings...');
    const processResult = await MeetingStatusService.processAllMeetings();
    console.log(`✅ Processed ${processResult.processed} meetings, updated ${processResult.updated}\n`);

    // Test 3: Get cron service status
    console.log('3️⃣ Testing cron service status...');
    const cronStatus = meetingCronService.getStatus();
    console.log('✅ Cron service status:', cronStatus);
    console.log(`   - Running: ${cronStatus.isRunning}`);
    console.log(`   - Jobs: ${Object.keys(cronStatus.jobs).length}\n`);

    // Test 4: Get meeting statistics
    console.log('4️⃣ Testing meeting statistics...');
    const stats = await meetingCronService.getMeetingStatistics();
    console.log('✅ Meeting statistics:', stats);
    console.log(`   - Total meetings: ${stats.total}`);
    console.log(`   - By status:`, stats.byStatus);
    console.log('');

    // Test 5: Test manual status update (if we have a meeting ID)
    if (process.argv[2]) {
      console.log('5️⃣ Testing manual status update...');
      const meetingId = process.argv[2];
      const result = await MeetingStatusService.manualStatusUpdate(
        meetingId,
        'completed',
        'Test manual update',
        'test-user'
      );
      console.log(`✅ Manual update result:`, result);
      console.log('');
    }

    console.log('🎉 All meeting status management tests completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Install node-cron: npm install node-cron');
    console.log('2. Start the server: npm start');
    console.log('3. Check cron service: curl http://localhost:3500/api/meeting-status/cron/status');
    console.log('4. Process meetings: curl -X POST http://localhost:3500/api/meeting-status/process-all');

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
testMeetingStatusManagement();
