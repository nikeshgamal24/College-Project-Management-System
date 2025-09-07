const express = require('express');
const router = express.Router();
const verifyJWT = require('../../middleware/auth/verifyJWT');
const {
  getMeetingsNeedingUpdate,
  processAllMeetings,
  manualStatusUpdate,
  getCronStatus,
  startCronService,
  stopCronService,
  runJob,
  getMeetingStatistics
} = require('../../controllers/api/meetingStatusController');

// Apply JWT verification to all routes
router.use(verifyJWT);

// Get meetings that need status updates
router.get('/needing-update', getMeetingsNeedingUpdate);

// Process all meetings for status updates
router.post('/process-all', processAllMeetings);

// Manually update meeting status
router.patch('/:meetingId/status', manualStatusUpdate);

// Get cron service status
router.get('/cron/status', getCronStatus);

// Start cron service
router.post('/cron/start', startCronService);

// Stop cron service
router.post('/cron/stop', stopCronService);

// Run specific job manually
router.post('/cron/run/:jobName', runJob);

// Get meeting statistics
router.get('/statistics', getMeetingStatistics);

module.exports = router;
