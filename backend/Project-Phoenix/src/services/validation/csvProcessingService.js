const csvValidationService = require('./csvValidationService');
const { AppError } = require('../../middleware/errorHandler');

/**
 * CSV Processing Service for Bulk User Creation
 * Handles file upload, parsing, and data processing
 */

class CSVProcessingService {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedMimeTypes = ['text/csv', 'application/csv', 'text/plain'];
  }

  /**
   * Process uploaded CSV file
   * @param {Object} file - Multer file object
   * @param {number} userType - User type role number
   * @returns {Object} Processed and validated data
   */
  async processCSVFile(file, userType) {
    try {
      // Validate file
      const fileValidation = this.validateFile(file);
      if (!fileValidation.valid) {
        throw new AppError(`File validation failed: ${fileValidation.errors.join(', ')}`, 400);
      }

      // Parse CSV content
      const csvText = file.buffer.toString('utf-8');
      const parsedData = csvValidationService.parseCSV(csvText);

      // Validate data against schema
      const validationResult = csvValidationService.validateCSVData(parsedData, userType);

        return {
          success: true,
          data: validationResult,
          userType: userType,
          userTypeName: csvValidationService.getUserTypeName(userType)
      };

    } catch (error) {
      throw new AppError(`CSV processing failed: ${error.message}`, 400);
    }
  }

  /**
   * Process CSV text (for direct text input)
   * @param {string} csvText - CSV text content
   * @param {number} userType - User type role number
   * @returns {Object} Processed and validated data
   */
  async processCSVText(csvText, userType) {
    try {
      // Parse CSV content
      const parsedData = csvValidationService.parseCSV(csvText);

      // Validate data against schema
      const validationResult = csvValidationService.validateCSVData(parsedData, userType);

      return {
        success: true,
        data: validationResult,
        userType: userType,
        userTypeName: csvValidationService.getUserTypeName(userType)
      };

    } catch (error) {
      throw new AppError(`CSV processing failed: ${error.message}`, 400);
    }
  }

  /**
   * Validate uploaded file
   * @param {Object} file - Multer file object
   * @returns {Object} Validation result
   */
  validateFile(file) {
    const result = { valid: true, errors: [] };

    // Check if file exists
    if (!file) {
      result.valid = false;
      result.errors.push('No file provided');
      return result;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      result.valid = false;
      result.errors.push(`File size must be less than ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      result.valid = false;
      result.errors.push('File must be a CSV file');
    }

    // Check if file has content
    if (!file.buffer || file.buffer.length === 0) {
      result.valid = false;
      result.errors.push('File is empty');
    }

    return result;
  }

  /**
   * Generate CSV template for download
   * @param {number} userType - User type role number
   * @returns {Object} Template data
   */
  generateTemplate(userType) {
    try {
      const template = csvValidationService.generateCSVTemplate(userType);
      const fieldDescriptions = csvValidationService.getFieldDescriptions(userType);
      const userTypeName = csvValidationService.getUserTypeName(userType);

      return {
        success: true,
        template: template,
        fieldDescriptions: fieldDescriptions,
        userType: userType,
        userTypeName: userTypeName,
        filename: `${userTypeName.toLowerCase()}_template.csv`
      };

    } catch (error) {
      throw new AppError(`Template generation failed: ${error.message}`, 400);
    }
  }

  /**
   * Get user type information
   * @param {number} userType - User type role number
   * @returns {Object} User type information
   */
  getUserTypeInfo(userType) {
    try {
      const userSchema = csvValidationService.userTypeSchemas[userType];
      if (!userSchema) {
        throw new Error(`Invalid user type: ${userType}`);
      }

      return {
        success: true,
        userType: userType,
        userTypeName: csvValidationService.getUserTypeName(userType),
        requiredFields: userSchema.requiredFields,
        optionalFields: userSchema.optionalFields,
        fieldDescriptions: csvValidationService.getFieldDescriptions(userType)
      };

    } catch (error) {
      throw new AppError(`Failed to get user type info: ${error.message}`, 400);
    }
  }

  /**
   * Get all available user types
   * @returns {Array} Array of user type information
   */
  getAllUserTypes() {
    const userTypes = [
      { value: 2001, name: 'Student', description: 'Students enrolled in programs' },
      { value: 1984, name: 'Supervisor', description: 'Academic supervisors for student projects' },
      { value: 4334, name: 'Evaluator', description: 'Internal and external project evaluators' },
      { value: 5150, name: 'Admin', description: 'System administrators' }
    ];

    return userTypes.map(type => ({
      ...type,
      ...this.getUserTypeInfo(type.value)
    }));
  }

  /**
   * Sanitize CSV data for processing
   * @param {Array} data - Raw CSV data
   * @returns {Array} Sanitized data
   */
  sanitizeData(data) {
    return data.map(row => {
      const sanitized = {};
      Object.keys(row).forEach(key => {
        // Remove extra whitespace and convert to appropriate types
        let value = row[key];
        if (typeof value === 'string') {
          value = value.trim();
        }
        sanitized[key] = value;
      });
      return sanitized;
    });
  }

  /**
   * Check for duplicate emails in the dataset
   * @param {Array} data - CSV data
   * @returns {Object} Duplicate check result
   */
  checkDuplicates(data) {
    const emailCounts = {};
    const duplicates = [];

    data.forEach((row, index) => {
      const email = row.email?.toLowerCase();
      if (email) {
        if (emailCounts[email]) {
          emailCounts[email].push(index + 2); // +2 for header row and 1-based indexing
        } else {
          emailCounts[email] = [index + 2];
        }
      }
    });

    Object.keys(emailCounts).forEach(email => {
      if (emailCounts[email].length > 1) {
        duplicates.push({
          email: email,
          rows: emailCounts[email]
        });
      }
    });

    return {
      hasDuplicates: duplicates.length > 0,
      duplicates: duplicates,
      totalDuplicates: duplicates.length
    };
  }
}

module.exports = new CSVProcessingService();

