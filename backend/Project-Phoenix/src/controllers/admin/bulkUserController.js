const csvProcessingService = require('../../services/validation/csvProcessingService');
const bulkUserCreationService = require('../../services/user/bulkUserCreationService');
const { AppError } = require('../../middleware/errorHandler');
const roleList = require('../../config/constants/roles');

/**
 * Enhanced Bulk User Creation Controller
 * Handles CSV file upload and bulk user creation with comprehensive validation
 */

/**
 * Upload and process CSV file for bulk user creation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const uploadAndProcessCSV = async (req, res, next) => {
  try {
    const { userType } = req.body;
    const file = req.file;

    // Validate user type
    if (!userType || !Object.values(roleList).includes(parseInt(userType))) {
      return next(new AppError('Valid user type is required', 400));
    }

    const userTypeNumber = parseInt(userType);

    // Process CSV file
    const result = await csvProcessingService.processCSVFile(file, userTypeNumber);

    res.status(200).json({
      status: 'success',
      message: 'CSV file processed successfully',
      data: {
        validation: result.data,
        userType: result.userType,
        userTypeName: result.userTypeName,
        totalRows: result.data.totalRows,
        validRows: result.data.valid.length,
        invalidRows: result.data.invalid.length,
        errors: result.data.errors
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Process CSV text for bulk user creation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const processCSVText = async (req, res, next) => {
  try {
    const { csvText, userType } = req.body;

    // Validate inputs
    if (!csvText || typeof csvText !== 'string') {
      return next(new AppError('CSV text is required', 400));
    }

    if (!userType || !Object.values(roleList).includes(parseInt(userType))) {
      return next(new AppError('Valid user type is required', 400));
    }

    const userTypeNumber = parseInt(userType);

    // Process CSV text
    const result = await csvProcessingService.processCSVText(csvText, userTypeNumber);

    res.status(200).json({
      status: 'success',
      message: 'CSV text processed successfully',
      data: {
        validation: result.data,
        userType: result.userType,
        userTypeName: result.userTypeName,
        totalRows: result.data.totalRows,
        validRows: result.data.valid.length,
        invalidRows: result.data.invalid.length,
        errors: result.data.errors
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Create users from validated CSV data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const createUsersFromCSV = async (req, res, next) => {
  try {
    const { users, userType } = req.body;

    // Validate inputs
    if (!Array.isArray(users) || users.length === 0) {
      return next(new AppError('Users array is required and cannot be empty', 400));
    }

    if (!userType || !Object.values(roleList).includes(parseInt(userType))) {
      return next(new AppError('Valid user type is required', 400));
    }

    const userTypeNumber = parseInt(userType);

    // Create users using bulk service
    const results = await bulkUserCreationService.createBulkUsers(
      users,
      userTypeNumber,
      req.userId
    );

    // Get statistics
    const statistics = bulkUserCreationService.getCreationStatistics(results);

    res.status(201).json({
      status: 'success',
      message: `Bulk user creation completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      data: {
        results: results,
        statistics: statistics,
        userType: userTypeNumber,
        userTypeName: bulkUserCreationService.getUserModel(userTypeNumber).modelName
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Generate CSV template for a specific user type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const generateCSVTemplate = async (req, res, next) => {
  try {
    const { userType } = req.params;

    // Validate user type
    if (!userType || !Object.values(roleList).includes(parseInt(userType))) {
      return next(new AppError('Valid user type is required', 400));
    }

    const userTypeNumber = parseInt(userType);

    // Generate template
    const template = csvProcessingService.generateTemplate(userTypeNumber);

    res.status(200).json({
      status: 'success',
      message: 'CSV template generated successfully',
      data: template
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Download CSV template for a specific user type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const downloadCSVTemplate = async (req, res, next) => {
  try {
    const { userType } = req.params;

    // Validate user type
    if (!userType || !Object.values(roleList).includes(parseInt(userType))) {
      return next(new AppError('Valid user type is required', 400));
    }

    const userTypeNumber = parseInt(userType);

    // Generate template
    const template = csvProcessingService.generateTemplate(userTypeNumber);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);

    res.status(200).send(template.template);

  } catch (error) {
    next(error);
  }
};

/**
 * Get user type information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getUserTypeInfo = async (req, res, next) => {
  try {
    const { userType } = req.params;

    // Validate user type
    if (!userType || !Object.values(roleList).includes(parseInt(userType))) {
      return next(new AppError('Valid user type is required', 400));
    }

    const userTypeNumber = parseInt(userType);

    // Get user type info
    const info = csvProcessingService.getUserTypeInfo(userTypeNumber);

    res.status(200).json({
      status: 'success',
      message: 'User type information retrieved successfully',
      data: info
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get all available user types
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getAllUserTypes = async (req, res, next) => {
  try {
    const userTypes = csvProcessingService.getAllUserTypes();

    res.status(200).json({
      status: 'success',
      message: 'User types retrieved successfully',
      data: {
        userTypes: userTypes
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive CSV formatting guide for a user type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getCSVFormattingGuide = async (req, res, next) => {
  try {
    const { userType } = req.params;

    // Validate user type
    if (!userType || !Object.values(roleList).includes(parseInt(userType))) {
      return next(new AppError('Valid user type is required', 400));
    }

    const userTypeNumber = parseInt(userType);

    // Get comprehensive formatting guide
    const guide = csvValidationService.getCSVFormattingGuide(userTypeNumber);

    res.status(200).json({
      status: 'success',
      message: 'CSV formatting guide retrieved successfully',
      data: guide
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get general CSV formatting guidelines
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getGeneralCSVGuidelines = async (req, res, next) => {
  try {
    const guidelines = csvValidationService.getGeneralCSVGuidelines();

    res.status(200).json({
      status: 'success',
      message: 'General CSV guidelines retrieved successfully',
      data: guidelines
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Validate CSV data without creating users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateCSVData = async (req, res, next) => {
  try {
    const { csvText, userType } = req.body;

    // Validate inputs
    if (!csvText || typeof csvText !== 'string') {
      return next(new AppError('CSV text is required', 400));
    }

    if (!userType || !Object.values(roleList).includes(parseInt(userType))) {
      return next(new AppError('Valid user type is required', 400));
    }

    const userTypeNumber = parseInt(userType);

    // Process and validate CSV
    const result = await csvProcessingService.processCSVText(csvText, userTypeNumber);

    // Check for duplicates within the dataset
    const duplicateCheck = csvProcessingService.checkDuplicates(result.data.valid);

    res.status(200).json({
      status: 'success',
      message: 'CSV data validated successfully',
      data: {
        validation: result.data,
        userType: result.userType,
        userTypeName: result.userTypeName,
        duplicateCheck: duplicateCheck,
        totalRows: result.data.totalRows,
        validRows: result.data.valid.length,
        invalidRows: result.data.invalid.length,
        errors: result.data.errors
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAndProcessCSV,
  processCSVText,
  createUsersFromCSV,
  generateCSVTemplate,
  downloadCSVTemplate,
  getUserTypeInfo,
  getAllUserTypes,
  getCSVFormattingGuide,
  getGeneralCSVGuidelines,
  validateCSVData
};
