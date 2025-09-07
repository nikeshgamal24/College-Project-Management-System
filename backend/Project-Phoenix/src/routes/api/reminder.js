/**
 * Reminder Routes
 * Handles reminder-related API endpoints
 */

const express = require('express');
const router = express.Router();
const {
  setGeneralReminder,
  setPersonalReminder,
  updateReminder,
  getReminderSettings,
  testReminder,
  processPendingReminders
} = require('../../controllers/api/reminderController');
const verifyJWT = require('../../middleware/auth/verifyJWT');

// Apply JWT verification to all routes
router.use(verifyJWT);

/**
 * @route   POST /api/reminders/general/:meetingId
 * @desc    Set general reminder for a meeting
 * @access  Private (Students, Supervisors, Admins)
 */
router.post('/general/:meetingId', setGeneralReminder);

/**
 * @route   POST /api/reminders/personal/:meetingId
 * @desc    Set personal reminder for a meeting
 * @access  Private (Students, Supervisors, Admins)
 */
router.post('/personal/:meetingId', setPersonalReminder);

/**
 * @route   PUT /api/reminders/:meetingId
 * @desc    Update reminder settings for a meeting
 * @access  Private (Students, Supervisors, Admins)
 */
router.put('/:meetingId',(req, res, next) => {
  console.log('Updating reminder:', req.body);
  updateReminder(req, res, next);
});

/**
 * @route   GET /api/reminders/:meetingId
 * @desc    Get reminder settings for a meeting
 * @access  Private (Students, Supervisors, Admins)
 */
router.get('/:meetingId', getReminderSettings);

/**
 * @route   POST /api/reminders/test/:meetingId
 * @desc    Test reminder notification
 * @access  Private (Students, Supervisors, Admins)
 */
router.post('/test/:meetingId', testReminder);

/**
 * @route   POST /api/reminders/process
 * @desc    Process pending reminders (for cron jobs)
 * @access  Private (Admins only)
 */
router.post('/process', processPendingReminders);

module.exports = router;

