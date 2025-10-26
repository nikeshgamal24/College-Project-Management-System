const express = require("express");
const router = express.Router();
const multer = require('multer');
const bulkUserController = require("../../controllers/admin/bulkUserController");
const verifyJWT = require("../../middleware/auth/verifyJWT");
const verifyRoles = require("../../middleware/auth/verifyRoles");
const { validateRequest } = require("../../middleware/validation/handleValidationErrors");
const roleList = require("../../config/constants/roles");
const Joi = require('joi');

// Configure multer for CSV file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept CSV files
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/csv' || 
        file.mimetype === 'text/plain' ||
        file.originalname.toLowerCase().endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Validation schemas
const bulkUserSchemas = {
  uploadCSV: Joi.object({
    userType: Joi.number()
      .integer()
      .valid(2001, 1984, 5150, 4334)
      .required()
      .messages({
        'any.only': 'Invalid user type specified',
        'any.required': 'User type is required'
      })
  }),
  processCSVText: Joi.object({
    csvText: Joi.string()
      .min(10)
      .required()
      .messages({
        'string.min': 'CSV text must be at least 10 characters long',
        'any.required': 'CSV text is required'
      }),
    userType: Joi.number()
      .integer()
      .valid(2001, 1984, 5150, 4334)
      .required()
      .messages({
        'any.only': 'Invalid user type specified',
        'any.required': 'User type is required'
      })
  }),
  createUsersFromCSV: Joi.object({
    users: Joi.array()
      .items(
        Joi.object({
          fullname: Joi.string()
            .min(2)
            .max(50)
            .pattern(/^[a-zA-Z\s]+$/)
            .required(),
          email: Joi.string()
            .email()
            .required(),
          phoneNumber: Joi.string()
            .pattern(/^[0-9]{10,15}$/)
            .required(),
          program: Joi.alternatives()
            .try(
              Joi.string().trim(),
              Joi.number().integer()
            )
            .optional(),
          designation: Joi.string().optional(),
          institution: Joi.string().optional(),
          evaluatorType: Joi.string().valid('internal', 'external').optional(),
          contact: Joi.string().optional(),
          photo: Joi.string().optional()
        })
      )
      .min(1)
      .max(100)
      .required()
      .messages({
        'array.min': 'At least one user is required',
        'array.max': 'Cannot create more than 100 users at once'
      }),
    userType: Joi.number()
      .integer()
      .valid(2001, 1984, 5150, 4334)
      .required()
      .messages({
        'any.only': 'Invalid user type specified',
        'any.required': 'User type is required'
      })
  }),
  validateCSVData: Joi.object({
    csvText: Joi.string()
      .min(10)
      .required()
      .messages({
        'string.min': 'CSV text must be at least 10 characters long',
        'any.required': 'CSV text is required'
      }),
    userType: Joi.number()
      .integer()
      .valid(2001, 1984, 5150, 4334)
      .required()
      .messages({
        'any.only': 'Invalid user type specified',
        'any.required': 'User type is required'
      })
  })
};

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
  }
  
  if (error.message === 'Only CSV files are allowed') {
    return res.status(400).json({
      status: 'error',
      message: 'Only CSV files are allowed'
    });
  }
  
  next(error);
};

// Apply authentication and authorization middleware to all routes
router.use(verifyJWT);
router.use(verifyRoles(roleList.Admin));

/**
 * @route GET /api/admin/bulk-users/types
 * @desc Get all available user types for bulk creation
 * @access Admin only
 */
router.get('/types', bulkUserController.getAllUserTypes);

/**
 * @route GET /api/admin/bulk-users/types/:userType
 * @desc Get information about a specific user type
 * @access Admin only
 */
router.get('/types/:userType', bulkUserController.getUserTypeInfo);

/**
 * @route GET /api/admin/bulk-users/guide/:userType
 * @desc Get comprehensive CSV formatting guide for a specific user type
 * @access Admin only
 */
router.get('/guide/:userType', bulkUserController.getCSVFormattingGuide);

/**
 * @route GET /api/admin/bulk-users/guidelines
 * @desc Get general CSV formatting guidelines
 * @access Admin only
 */
router.get('/guidelines', bulkUserController.getGeneralCSVGuidelines);

/**
 * @route GET /api/admin/bulk-users/template/:userType
 * @desc Generate CSV template for a specific user type
 * @access Admin only
 */
router.get('/template/:userType', bulkUserController.generateCSVTemplate);

/**
 * @route GET /api/admin/bulk-users/template/:userType/download
 * @desc Download CSV template for a specific user type
 * @access Admin only
 */
router.get('/template/:userType/download', bulkUserController.downloadCSVTemplate);

/**
 * @route POST /api/admin/bulk-users/upload
 * @desc Upload and process CSV file for bulk user creation
 * @access Admin only
 */
router.post(
  '/upload',
  upload.single('csvFile'),
  handleMulterError,
  validateRequest(bulkUserSchemas.uploadCSV),
  bulkUserController.uploadAndProcessCSV
);

/**
 * @route POST /api/admin/bulk-users/process-text
 * @desc Process CSV text for bulk user creation
 * @access Admin only
 */
router.post(
  '/process-text',
  validateRequest(bulkUserSchemas.processCSVText),
  bulkUserController.processCSVText
);

/**
 * @route POST /api/admin/bulk-users/validate
 * @desc Validate CSV data without creating users
 * @access Admin only
 */
router.post(
  '/validate',
  validateRequest(bulkUserSchemas.validateCSVData),
  bulkUserController.validateCSVData
);

/**
 * @route POST /api/admin/bulk-users/create
 * @desc Create users from validated CSV data
 * @access Admin only
 */
router.post(
  '/create',
  validateRequest(bulkUserSchemas.createUsersFromCSV),
  bulkUserController.createUsersFromCSV
);

module.exports = router;
