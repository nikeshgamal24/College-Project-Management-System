const express = require('express');
const router = express.Router();
const {
  createNotice,
  getNotices,
  getNotice,
  updateNotice,
  deleteNotice,
  publishNotice,
  archiveNotice,
  getNoticeStats
} = require('../../controllers/api/noticeController');
const verifyJWT = require('../../middleware/auth/verifyJWT');
const verifyRoles = require('../../middleware/auth/verifyRoles');
const { validate, validateParams } = require('../../middleware/validation/validation');
const {
  createNoticeValidation,
  updateNoticeValidation,
  getNoticesValidation,
  noticeIdValidation
} = require('../../validators/schemas/noticeValidation');
const ROLES_LIST = require('../../config/constants/roles');

// Apply JWT verification to all routes
router.use(verifyJWT);

/**
 * @route   GET /api/notices
 * @desc    Get all notices with filtering and pagination
 * @access  Private (Admin only)
 */
router.get('/', 
  verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Student, ROLES_LIST.Supervisor), // Admin only
  validate(getNoticesValidation.query),
  getNotices
);

/**
 * @route   GET /api/notices/stats
 * @desc    Get notice statistics
 * @access  Private (Admin only)
 */
router.get('/stats',
  verifyRoles(ROLES_LIST.Admin), // Admin only
  getNoticeStats
);

/**
 * @route   GET /api/notices/:id
 * @desc    Get a single notice by ID
 * @access  Private (Admin only)
 */
router.get('/:id',
  verifyRoles(ROLES_LIST.Admin), // Admin only
  validateParams(noticeIdValidation.params),
  getNotice
);

/**
 * @route   POST /api/notices
 * @desc    Create a new notice
 * @access  Private (Admin only)
 */
router.post('/',
  verifyRoles(ROLES_LIST.Admin), // Admin only
  (req, res, next) => {
    console.log('POST /api/notices route hit');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    next();
  },
  validate(createNoticeValidation.body),
  createNotice
);

/**
 * @route   PUT /api/notices/:id
 * @desc    Update a notice
 * @access  Private (Admin only)
 */
router.put('/:id',
  verifyRoles(ROLES_LIST.Admin), // Admin only
  validateParams(noticeIdValidation.params),
  validate(updateNoticeValidation.body),
  updateNotice
);

/**
 * @route   PATCH /api/notices/:id/publish
 * @desc    Publish a notice
 * @access  Private (Admin only)
 */
router.patch('/:id/publish',
  verifyRoles(ROLES_LIST.Admin), // Admin only
  validateParams(noticeIdValidation.params),
  publishNotice
);

/**
 * @route   PATCH /api/notices/:id/archive
 * @desc    Archive a notice
 * @access  Private (Admin only)
 */
router.patch('/:id/archive',
  verifyRoles(ROLES_LIST.Admin), // Admin only
  validateParams(noticeIdValidation.params),
  archiveNotice
);

/**
 * @route   DELETE /api/notices/:id
 * @desc    Delete a notice
 * @access  Private (Admin only)
 */
router.delete('/:id',
  verifyRoles(ROLES_LIST.Admin), // Admin only
  validateParams(noticeIdValidation.params),
  deleteNotice
);

module.exports = router;
