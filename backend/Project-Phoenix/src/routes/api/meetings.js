const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getMeetings,
  getMeeting,
  updateMeeting,
  cancelMeeting,
  deleteMeeting,
  getAvailableSlots,
  approveMeetingRequest,
  rejectMeetingRequest,
  getPendingMeetingRequests
} = require('../../controllers/api/meetingController');
const verifyJWT = require('../../middleware/auth/verifyJWT');

// Apply JWT verification to all routes
router.use(verifyJWT);

// Get meetings for current user
router.get('/', getMeetings);

// Get available time slots
router.get('/available-slots', getAvailableSlots);

// Get pending meeting requests for supervisor
router.get('/pending-requests', getPendingMeetingRequests);

// Get a specific meeting
router.get('/:id', getMeeting);

// Create a new meeting
router.post('/', createMeeting);

// Update a meeting
router.put('/:id', updateMeeting);

// Cancel a meeting
router.patch('/:id/cancel', cancelMeeting);

// Delete a meeting
router.delete('/:id', deleteMeeting);

// Approve meeting request
router.patch('/:id/approve', approveMeetingRequest);

// Reject meeting request
router.patch('/:id/reject', rejectMeetingRequest);

module.exports = router;
