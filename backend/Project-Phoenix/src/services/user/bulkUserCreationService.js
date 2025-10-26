const Student = require('../../models/user/Student');
const Supervisor = require('../../models/user/Supervisor');
const Admin = require('../../models/user/Admin');
const Evaluator = require('../../models/user/Evaluator');
const roleList = require('../../config/constants/roles');
const { extractRollAndBatch } = require('../../controllers/helpers/validation/extractRollAndBatch');
const { initializeProgressStatus } = require('../../controllers/helpers/project/initializeProgressStatus');
const emailService = require('../email/emailService');
const { AppError } = require('../../middleware/errorHandler');

/**
 * Bulk User Creation Service
 * Handles the creation of multiple users with proper error handling and transaction management
 */

class BulkUserCreationService {
  constructor() {
    this.userModels = {
      [roleList.Student]: Student,
      [roleList.Supervisor]: Supervisor,
      [roleList.Admin]: Admin,
      [roleList.Evaluator]: Evaluator
    };
  }

  /**
   * Generate temporary password
   * @returns {string} Generated temporary password
   */
  generateTemporaryPassword() {
    const length = 12;
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";

    // Ensure at least one character from each required type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase
    password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Special char

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Get user model based on role
   * @param {number} role - User role number
   * @returns {Object} Mongoose model
   */
  getUserModel(role) {
    const model = this.userModels[role];
    if (!model) {
      throw new AppError(`Invalid role specified: ${role}`, 400);
    }
    return model;
  }

  /**
   * Prepare user data based on role
   * @param {Object} userData - Raw user data
   * @param {number} role - User role
   * @param {string} temporaryPassword - Generated temporary password
   * @param {string} createdBy - Admin ID who created the user
   * @returns {Object} Prepared user data
   */
  prepareUserData(userData, role, temporaryPassword, createdBy) {
    const baseData = {
      fullname: userData.fullname,
      email: userData.email.toLowerCase(),
      password: temporaryPassword,
      phoneNumber: userData.phoneNumber,
      role: [role],
      isTemporaryPassword: true,
      status: 'PENDING_ACTIVATION',
      createdBy: createdBy,
      createdAt: new Date()
    };

    // Add optional fields if they exist
    if (userData.photo) baseData.photo = userData.photo;

    // Role-specific data preparation
    switch (role) {
      case roleList.Student:
        return this.prepareStudentData(baseData, userData);
      case roleList.Supervisor:
        return this.prepareSupervisorData(baseData, userData);
      case roleList.Evaluator:
        return this.prepareEvaluatorData(baseData, userData);
      case roleList.Admin:
        return baseData; // Admin has no additional fields
      default:
        throw new AppError(`Unsupported role: ${role}`, 400);
    }
  }

  /**
   * Prepare student-specific data
   * @param {Object} baseData - Base user data
   * @param {Object} userData - Raw user data
   * @returns {Object} Prepared student data
   */
  prepareStudentData(baseData, userData) {
    // Extract roll number and batch number from email
    const { rollNo, batchNo } = extractRollAndBatch(userData.email);

    // Determine progress status based on batch
    const progressStatus = initializeProgressStatus(batchNo);

    // Convert program to number if it's a string
    const programValue = typeof userData.program === 'string' ? 
      parseInt(userData.program, 10) : userData.program;

    return {
      ...baseData,
      rollNumber: rollNo,
      batchNumber: batchNo,
      program: programValue,
      progressStatus,
      isAssociated: false
    };
  }

  /**
   * Prepare supervisor-specific data
   * @param {Object} baseData - Base user data
   * @param {Object} userData - Raw user data
   * @returns {Object} Prepared supervisor data
   */
  prepareSupervisorData(baseData, userData) {
    return {
      ...baseData,
      designation: userData.designation || '',
      institution: userData.institution || '',
      skillSet: [],
      isAvailable: true
    };
  }

  /**
   * Prepare evaluator-specific data
   * @param {Object} baseData - Base user data
   * @param {Object} userData - Raw user data
   * @returns {Object} Prepared evaluator data
   */
  prepareEvaluatorData(baseData, userData) {
    return {
      ...baseData,
      designation: userData.designation || '',
      institution: userData.institution || '',
      evaluatorType: userData.evaluatorType || '',
      contact: userData.contact || '',
      defense: []
    };
  }

  /**
   * Check for duplicate email across all user types
   * @param {string} email - Email to check
   * @param {number} role - User role
   * @returns {boolean} True if duplicate exists
   */
  async checkDuplicateEmail(email, role) {
    const UserModel = this.getUserModel(role);
    const normalizedEmail = email.toLowerCase();
    const duplicate = await UserModel.findOne({ email: normalizedEmail }).exec();
    return !!duplicate;
  }

  /**
   * Create a single user
   * @param {Object} userData - User data
   * @param {number} role - User role
   * @param {string} createdBy - Admin ID
   * @returns {Object} Creation result
   */
  async createSingleUser(userData, role, createdBy) {
    try {
      // Check for duplicate email
      const isDuplicate = await this.checkDuplicateEmail(userData.email, role);
      if (isDuplicate) {
        return {
          success: false,
          error: 'Email already exists',
          email: userData.email
        };
      }

      // Generate temporary password
      const temporaryPassword = this.generateTemporaryPassword();

      // Prepare user data
      const preparedData = this.prepareUserData(userData, role, temporaryPassword, createdBy);

      // Get user model and create user
      const UserModel = this.getUserModel(role);
      const newUser = await UserModel.create(preparedData);

      // Prepare response (exclude sensitive data)
      const userResponse = newUser.toObject();
      delete userResponse.password;

      // Send welcome email
      try {
        const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : '';
        await emailService.sendAccountCreationEmail(
          userData.email.toLowerCase(),
          userData.fullname,
          role,
          temporaryPassword,
          loginUrl
        );
      } catch (emailError) {
        console.error(`Failed to send welcome email to ${userData.email}:`, emailError);
        // Don't fail the user creation if email fails
      }

      return {
        success: true,
        user: userResponse,
        temporaryPassword: temporaryPassword,
        email: userData.email
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        email: userData.email
      };
    }
  }

  /**
   * Create multiple users in bulk
   * @param {Array} usersData - Array of user data
   * @param {number} role - User role for all users
   * @param {string} createdBy - Admin ID
   * @returns {Object} Bulk creation result
   */
  async createBulkUsers(usersData, role, createdBy) {
    if (!Array.isArray(usersData) || usersData.length === 0) {
      throw new AppError('Users array is required and cannot be empty', 400);
    }

    if (usersData.length > 100) {
      throw new AppError('Cannot create more than 100 users at once', 400);
    }

    const results = {
      successful: [],
      failed: [],
      total: usersData.length
    };

    // Process each user
    for (const userData of usersData) {
      const result = await this.createSingleUser(userData, role, createdBy);
      
      if (result.success) {
        results.successful.push({
          user: result.user,
          temporaryPassword: result.temporaryPassword,
          email: result.email
        });
      } else {
        results.failed.push({
          email: result.email,
          error: result.error
        });
      }
    }

    return results;
  }

  /**
   * Create users with transaction support
   * @param {Array} usersData - Array of user data
   * @param {number} role - User role for all users
   * @param {string} createdBy - Admin ID
   * @param {Object} session - MongoDB session for transaction
   * @returns {Object} Bulk creation result
   */
  async createBulkUsersWithTransaction(usersData, role, createdBy, session) {
    if (!Array.isArray(usersData) || usersData.length === 0) {
      throw new AppError('Users array is required and cannot be empty', 400);
    }

    if (usersData.length > 100) {
      throw new AppError('Cannot create more than 100 users at once', 400);
    }

    const results = {
      successful: [],
      failed: [],
      total: usersData.length
    };

    const UserModel = this.getUserModel(role);

    // Process each user
    for (const userData of usersData) {
      try {
        // Check for duplicate email
        const isDuplicate = await this.checkDuplicateEmail(userData.email, role);
        if (isDuplicate) {
          results.failed.push({
            email: userData.email,
            error: 'Email already exists'
          });
          continue;
        }

        // Generate temporary password
        const temporaryPassword = this.generateTemporaryPassword();

        // Prepare user data
        const preparedData = this.prepareUserData(userData, role, temporaryPassword, createdBy);

        // Create user with session
        const newUser = await UserModel.create([preparedData], { session });

        // Prepare response
        const userResponse = newUser[0].toObject();
        delete userResponse.password;

        results.successful.push({
          user: userResponse,
          temporaryPassword: temporaryPassword,
          email: userData.email
        });

      } catch (error) {
        results.failed.push({
          email: userData.email,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get creation statistics
   * @param {Object} results - Creation results
   * @returns {Object} Statistics
   */
  getCreationStatistics(results) {
    return {
      total: results.total,
      successful: results.successful.length,
      failed: results.failed.length,
      successRate: results.total > 0 ? (results.successful.length / results.total * 100).toFixed(2) : 0
    };
  }
}

module.exports = new BulkUserCreationService();

