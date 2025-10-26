const express = require("express");
const router = express.Router();
const userController = require("../../controllers/admin/userController");
const verifyJWT = require("../../middleware/auth/verifyJWT");
const verifyRoles = require("../../middleware/auth/verifyRoles");
const { validate, authSchemas } = require("../../middleware/validation/validation");
const { handleValidationErrors, validateRequest } = require("../../middleware/validation/handleValidationErrors");
const roleList = require("../../config/constants/roles");

// Validation schemas for admin user creation
const Joi = require('joi');

const adminUserSchemas = {
  createUser: Joi.object({
    fullname: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name cannot exceed 50 characters',
        'string.pattern.base': 'Full name can only contain letters and spaces',
        'any.required': 'Full name is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be 10-15 digits',
        'any.required': 'Phone number is required'
      }),
    role: Joi.number()
      .integer()
      .valid(2001, 1984, 5150, 4334)
      .required()
      .messages({
        'any.only': 'Invalid role specified',
        'any.required': 'Role is required'
      }),
    program: Joi.alternatives()
      .try(
        Joi.string().trim(),
        Joi.number().integer()
      )
      .when('role', {
        is: 2001, // Student role
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'any.required': 'Program is required for students'
      }),
    designation: Joi.string().optional(),
    institution: Joi.string().optional(),
    evaluatorType: Joi.string().valid('internal', 'external').optional(),
    contact: Joi.string().optional(),
    photo: Joi.string().optional()
  }),
  createBulkUsers: Joi.object({
    users: Joi.array().items(
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
        role: Joi.number()
          .integer()
          .valid(2001, 1984, 5150, 4334)
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
        contact: Joi.string().optional()
      })
    ).min(1).max(100).required()
  }),
  updateUser: Joi.object({
    fullname: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .optional()
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name cannot exceed 50 characters',
        'string.pattern.base': 'Full name can only contain letters and spaces'
      }),
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Phone number must be 10-15 digits'
      }),
    status: Joi.string()
      .valid('PENDING_ACTIVATION', 'ACTIVE', 'INACTIVE', 'SUSPENDED')
      .optional(),
    program: Joi.alternatives()
      .try(
        Joi.string().trim(),
        Joi.number().integer()
      )
      .optional(),
    designation: Joi.string().optional(),
    institution: Joi.string().optional(),
    evaluatorType: Joi.string().valid('internal', 'external').optional(),
    contact: Joi.string().optional()
  }),
  resetUserPassword: Joi.object({
    // No body validation needed for reset password, just userId in params
  })
};

router.post(
  "/",
  verifyJWT,
  verifyRoles(roleList.Admin),
  validateRequest(adminUserSchemas.createUser),
  userController.createUser
);


router.post(
  "/bulk",
  verifyJWT,
  verifyRoles(roleList.Admin),
  validateRequest(adminUserSchemas.createBulkUsers),
  userController.createBulkUsers
);

router.get(
  "/",
  verifyJWT,
  verifyRoles(roleList.Admin),
  userController.getAllUsers
);

router.put(
  "/:userId",
  verifyJWT,
  verifyRoles(roleList.Admin),
  validateRequest(adminUserSchemas.updateUser),
  userController.updateUser
);



router.put(
  "/:userId/reset-password",
  verifyJWT,
  verifyRoles(roleList.Admin),
  validateRequest(adminUserSchemas.resetUserPassword),
  userController.resetUserPassword
);

router.delete(
  "/:userId",
  verifyJWT,
  verifyRoles(roleList.Admin),
  userController.deleteUser
);

// Import and use bulk user routes
const bulkUserRoutes = require('./bulkUsers');
router.use('/bulk', bulkUserRoutes);

module.exports = router;
