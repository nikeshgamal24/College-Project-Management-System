const Joi = require('joi');
const roleList = require('../../config/constants/roles');

/**
 * CSV Validation Service for Bulk User Creation
 * Provides comprehensive validation for CSV data based on user schemas
 */

class CSVValidationService {
  constructor() {
    this.userTypeSchemas = this.initializeUserTypeSchemas();
  }

  /**
   * Initialize validation schemas for each user type
   */
  initializeUserTypeSchemas() {
    return {
      [roleList.Student]: {
        requiredFields: ['fullname', 'email', 'phoneNumber', 'program'],
        optionalFields: ['photo'],
        schema: Joi.object({
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
          program: Joi.alternatives()
            .try(
              Joi.string().trim(),
              Joi.number().integer()
            )
            .required()
            .messages({
              'any.required': 'Program is required for students'
            }),
          photo: Joi.string().optional()
        })
      },
      [roleList.Supervisor]: {
        requiredFields: ['fullname', 'email', 'phoneNumber'],
        optionalFields: ['designation', 'institution', 'photo'],
        schema: Joi.object({
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
          designation: Joi.string().optional(),
          institution: Joi.string().optional(),
          photo: Joi.string().optional()
        })
      },
      [roleList.Evaluator]: {
        requiredFields: ['fullname', 'email', 'phoneNumber'],
        optionalFields: ['designation', 'institution', 'evaluatorType', 'contact', 'photo'],
        schema: Joi.object({
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
          designation: Joi.string().optional(),
          institution: Joi.string().optional(),
          evaluatorType: Joi.string().valid('internal', 'external').optional(),
          contact: Joi.string().optional(),
          photo: Joi.string().optional()
        })
      },
      [roleList.Admin]: {
        requiredFields: ['fullname', 'email', 'phoneNumber'],
        optionalFields: ['photo'],
        schema: Joi.object({
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
          photo: Joi.string().optional()
        })
      }
    };
  }

  /**
   * Parse CSV text into array of objects
   * @param {string} csvText - Raw CSV text
   * @returns {Array} Array of parsed objects
   */
  parseCSV(csvText) {
    if (!csvText || typeof csvText !== 'string') {
      throw new Error('CSV text is required and must be a string');
    }

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        throw new Error(`Row ${i + 1}: Column count mismatch. Expected ${headers.length}, got ${values.length}`);
      }

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return { headers, data };
  }

  /**
   * Validate CSV data against user type schema
   * @param {Array} csvData - Parsed CSV data
   * @param {number} userType - User type role number
   * @returns {Object} Validation result with errors and valid data
   */
  validateCSVData(csvData, userType) {
    const userSchema = this.userTypeSchemas[userType];
    if (!userSchema) {
      throw new Error(`Invalid user type: ${userType}`);
    }

    const validationResult = {
      valid: [],
      invalid: [],
      totalRows: csvData.length,
      errors: []
    };

    // Check for required headers
    const missingHeaders = userSchema.requiredFields.filter(
      field => !csvData.headers.includes(field.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      validationResult.errors.push({
        type: 'missing_headers',
        message: `Missing required headers: ${missingHeaders.join(', ')}`,
        details: `Required headers for ${this.getUserTypeName(userType)}: ${userSchema.requiredFields.join(', ')}`
      });
    }

    // Validate each row
    csvData.data.forEach((row, index) => {
      try {
        // Add role to the data for validation
        const rowWithRole = { ...row, role: userType };
        
        // Convert program to number if it's a string for students
        if (userType === roleList.Student && row.program) {
          rowWithRole.program = typeof row.program === 'string' ? 
            parseInt(row.program, 10) : row.program;
        }

        const { error, value } = userSchema.schema.validate(rowWithRole, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          validationResult.invalid.push({
            row: index + 2, // +2 because CSV is 1-indexed and we skip header
            data: row,
            errors: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message
            }))
          });
        } else {
          validationResult.valid.push(value);
        }
      } catch (err) {
        validationResult.invalid.push({
          row: index + 2,
          data: row,
          errors: [{ field: 'general', message: err.message }]
        });
      }
    });

    return validationResult;
  }

  /**
   * Generate CSV template for a specific user type
   * @param {number} userType - User type role number
   * @returns {string} CSV template string
   */
  generateCSVTemplate(userType) {
    const userSchema = this.userTypeSchemas[userType];
    if (!userSchema) {
      throw new Error(`Invalid user type: ${userType}`);
    }

    const allFields = [...userSchema.requiredFields, ...userSchema.optionalFields];
    const headers = allFields.join(',');
    
    // Generate sample data based on user type
    const sampleData = this.generateSampleData(userType, allFields);
    
    return [headers, ...sampleData].join('\n');
  }

  /**
   * Generate sample data for CSV template
   * @param {number} userType - User type role number
   * @param {Array} fields - Field names
   * @returns {Array} Array of sample data rows
   */
  generateSampleData(userType, fields) {
    const samples = [];
    
    if (userType === roleList.Student) {
      samples.push(
        'John Doe,john.doe@ncit.edu.np,9876543210,700',
        'Jane Smith,jane.smith@ncit.edu.np,9876543211,701',
        'Bob Wilson,bob.wilson@ncit.edu.np,9876543212,702'
      );
    } else if (userType === roleList.Supervisor) {
      samples.push(
        'Dr. Smith,dr.smith@ncit.edu.np,9876543210,Professor,NCIT',
        'Prof. Johnson,prof.johnson@ncit.edu.np,9876543211,Associate Professor,TU',
        'Ms. Davis,ms.davis@ncit.edu.np,9876543212,Lecturer,KMC'
      );
    } else if (userType === roleList.Evaluator) {
      samples.push(
        'Dr. Brown,dr.brown@ncit.edu.np,9876543210,Professor,NCIT,internal,Department of Computer Engineering',
        'Prof. Wilson,prof.wilson@tu.edu.np,9876543211,Professor,TU,external,External evaluator contact info',
        'Dr. Lee,dr.lee@kmc.edu.np,9876543212,Associate Professor,KMC,internal,Internal evaluation team'
      );
    } else if (userType === roleList.Admin) {
      samples.push(
        'Admin User,admin@ncit.edu.np,9876543210',
        'System Admin,system@ncit.edu.np,9876543211',
        'Super Admin,superadmin@ncit.edu.np,9876543212'
      );
    }

    return samples;
  }

  /**
   * Get user type name from role number
   * @param {number} userType - User type role number
   * @returns {string} User type name
   */
  getUserTypeName(userType) {
    const typeNames = {
      [roleList.Student]: 'Student',
      [roleList.Supervisor]: 'Supervisor',
      [roleList.Evaluator]: 'Evaluator',
      [roleList.Admin]: 'Admin'
    };
    return typeNames[userType] || 'Unknown';
  }

  /**
   * Get field descriptions for a user type
   * @param {number} userType - User type role number
   * @returns {Object} Field descriptions
   */
  getFieldDescriptions(userType) {
    const descriptions = {
      [roleList.Student]: {
        fullname: 'Full name of the student (letters and spaces only)',
        email: 'Valid email address (will be used for login)',
        phoneNumber: 'Phone number (10-15 digits)',
        program: 'Program code (700=Computer Engineering, 701=Electronics, 702=Civil, 703=Mechanical)',
        photo: 'Photo URL (optional)'
      },
      [roleList.Supervisor]: {
        fullname: 'Full name of the supervisor (letters and spaces only)',
        email: 'Valid email address (will be used for login)',
        phoneNumber: 'Phone number (10-15 digits)',
        designation: 'Job title or designation (optional)',
        institution: 'Institution name (optional)',
        photo: 'Photo URL (optional)'
      },
      [roleList.Evaluator]: {
        fullname: 'Full name of the evaluator (letters and spaces only)',
        email: 'Valid email address (will be used for login)',
        phoneNumber: 'Phone number (10-15 digits)',
        designation: 'Job title or designation (optional)',
        institution: 'Institution name (optional)',
        evaluatorType: 'Type of evaluator: internal or external (optional)',
        contact: 'Additional contact information (optional)',
        photo: 'Photo URL (optional)'
      },
      [roleList.Admin]: {
        fullname: 'Full name of the admin (letters and spaces only)',
        email: 'Valid email address (will be used for login)',
        phoneNumber: 'Phone number (10-15 digits)',
        photo: 'Photo URL (optional)'
      }
    };
    return descriptions[userType] || {};
  }

  /**
   * Get comprehensive CSV formatting guide for a user type
   * @param {number} userType - User type role number
   * @returns {Object} Complete formatting guide
   */
  getCSVFormattingGuide(userType) {
    const guides = {
      [roleList.Student]: {
        title: 'Student CSV Format Guide',
        description: 'Follow this guide to create a properly formatted CSV file for student bulk creation.',
        requiredFields: [
          {
            name: 'fullname',
            description: 'Student\'s full name',
            format: 'Letters and spaces only, 2-50 characters',
            example: 'John Doe',
            required: true
          },
          {
            name: 'email',
            description: 'Student\'s email address',
            format: 'Valid email format (will be used for login)',
            example: 'john.doe@ncit.edu.np',
            required: true
          },
          {
            name: 'phoneNumber',
            description: 'Student\'s phone number',
            format: '10-15 digits only, no spaces or special characters',
            example: '9876543210',
            required: true
          },
          {
            name: 'program',
            description: 'Student\'s program code',
            format: 'Must be one of: 700, 701, 702, 703',
            example: '700',
            required: true,
            validValues: [
              { code: '700', name: 'Computer Engineering' },
              { code: '701', name: 'Electronics Engineering' },
              { code: '702', name: 'Civil Engineering' },
              { code: '703', name: 'Mechanical Engineering' }
            ]
          }
        ],
        optionalFields: [
          {
            name: 'photo',
            description: 'Student\'s photo URL',
            format: 'Valid URL to image file',
            example: 'https://example.com/photo.jpg',
            required: false
          }
        ],
        csvExample: `fullname,email,phoneNumber,program
John Doe,john.doe@ncit.edu.np,9876543210,700
Jane Smith,jane.smith@ncit.edu.np,9876543211,701
Bob Wilson,bob.wilson@ncit.edu.np,9876543212,702`,
        commonErrors: [
          'Using invalid program codes (must be 700, 701, 702, or 703)',
          'Including special characters in phone numbers',
          'Using invalid email formats',
          'Missing required fields',
          'Using numbers or special characters in full names'
        ]
      },
      [roleList.Supervisor]: {
        title: 'Supervisor CSV Format Guide',
        description: 'Follow this guide to create a properly formatted CSV file for supervisor bulk creation.',
        requiredFields: [
          {
            name: 'fullname',
            description: 'Supervisor\'s full name',
            format: 'Letters and spaces only, 2-50 characters',
            example: 'Dr. John Smith',
            required: true
          },
          {
            name: 'email',
            description: 'Supervisor\'s email address',
            format: 'Valid email format (will be used for login)',
            example: 'dr.smith@ncit.edu.np',
            required: true
          },
          {
            name: 'phoneNumber',
            description: 'Supervisor\'s phone number',
            format: '10-15 digits only, no spaces or special characters',
            example: '9876543210',
            required: true
          }
        ],
        optionalFields: [
          {
            name: 'designation',
            description: 'Job title or designation',
            format: 'Any text, 1-100 characters',
            example: 'Professor',
            required: false
          },
          {
            name: 'institution',
            description: 'Institution name',
            format: 'Any text, 1-100 characters',
            example: 'NCIT',
            required: false
          },
          {
            name: 'photo',
            description: 'Supervisor\'s photo URL',
            format: 'Valid URL to image file',
            example: 'https://example.com/photo.jpg',
            required: false
          }
        ],
        csvExample: `fullname,email,phoneNumber,designation,institution
Dr. Smith,dr.smith@ncit.edu.np,9876543210,Professor,NCIT
Prof. Johnson,prof.johnson@ncit.edu.np,9876543211,Associate Professor,TU
Ms. Davis,ms.davis@ncit.edu.np,9876543212,Lecturer,KMC`,
        commonErrors: [
          'Missing required fields (fullname, email, phoneNumber)',
          'Using invalid email formats',
          'Including special characters in phone numbers',
          'Using numbers or special characters in full names'
        ]
      },
      [roleList.Evaluator]: {
        title: 'Evaluator CSV Format Guide',
        description: 'Follow this guide to create a properly formatted CSV file for evaluator bulk creation.',
        requiredFields: [
          {
            name: 'fullname',
            description: 'Evaluator\'s full name',
            format: 'Letters and spaces only, 2-50 characters',
            example: 'Dr. John Brown',
            required: true
          },
          {
            name: 'email',
            description: 'Evaluator\'s email address',
            format: 'Valid email format (will be used for login)',
            example: 'dr.brown@ncit.edu.np',
            required: true
          },
          {
            name: 'phoneNumber',
            description: 'Evaluator\'s phone number',
            format: '10-15 digits only, no spaces or special characters',
            example: '9876543210',
            required: true
          }
        ],
        optionalFields: [
          {
            name: 'designation',
            description: 'Job title or designation',
            format: 'Any text, 1-100 characters',
            example: 'Professor',
            required: false
          },
          {
            name: 'institution',
            description: 'Institution name',
            format: 'Any text, 1-100 characters',
            example: 'NCIT',
            required: false
          },
          {
            name: 'evaluatorType',
            description: 'Type of evaluator',
            format: 'Must be either "internal" or "external"',
            example: 'internal',
            required: false,
            validValues: [
              { value: 'internal', description: 'Internal evaluator from the institution' },
              { value: 'external', description: 'External evaluator from outside' }
            ]
          },
          {
            name: 'contact',
            description: 'Additional contact information',
            format: 'Any text, 1-200 characters',
            example: 'Department of Computer Engineering',
            required: false
          },
          {
            name: 'photo',
            description: 'Evaluator\'s photo URL',
            format: 'Valid URL to image file',
            example: 'https://example.com/photo.jpg',
            required: false
          }
        ],
        csvExample: `fullname,email,phoneNumber,designation,institution,evaluatorType,contact
Dr. Brown,dr.brown@ncit.edu.np,9876543210,Professor,NCIT,internal,Department of Computer Engineering
Prof. Wilson,prof.wilson@tu.edu.np,9876543211,Professor,TU,external,External evaluator contact info
Dr. Lee,dr.lee@kmc.edu.np,9876543212,Associate Professor,KMC,internal,Internal evaluation team`,
        commonErrors: [
          'Using invalid evaluatorType (must be "internal" or "external")',
          'Missing required fields (fullname, email, phoneNumber)',
          'Using invalid email formats',
          'Including special characters in phone numbers',
          'Using numbers or special characters in full names'
        ]
      },
      [roleList.Admin]: {
        title: 'Admin CSV Format Guide',
        description: 'Follow this guide to create a properly formatted CSV file for admin bulk creation.',
        requiredFields: [
          {
            name: 'fullname',
            description: 'Admin\'s full name',
            format: 'Letters and spaces only, 2-50 characters',
            example: 'Admin User',
            required: true
          },
          {
            name: 'email',
            description: 'Admin\'s email address',
            format: 'Valid email format (will be used for login)',
            example: 'admin@ncit.edu.np',
            required: true
          },
          {
            name: 'phoneNumber',
            description: 'Admin\'s phone number',
            format: '10-15 digits only, no spaces or special characters',
            example: '9876543210',
            required: true
          }
        ],
        optionalFields: [
          {
            name: 'photo',
            description: 'Admin\'s photo URL',
            format: 'Valid URL to image file',
            example: 'https://example.com/photo.jpg',
            required: false
          }
        ],
        csvExample: `fullname,email,phoneNumber
Admin User,admin@ncit.edu.np,9876543210
System Admin,system@ncit.edu.np,9876543211
Super Admin,superadmin@ncit.edu.np,9876543212`,
        commonErrors: [
          'Missing required fields (fullname, email, phoneNumber)',
          'Using invalid email formats',
          'Including special characters in phone numbers',
          'Using numbers or special characters in full names'
        ]
      }
    };
    return guides[userType] || {};
  }

  /**
   * Get general CSV formatting tips
   * @returns {Object} General formatting guidelines
   */
  getGeneralCSVGuidelines() {
    return {
      title: 'General CSV Formatting Guidelines',
      guidelines: [
        {
          title: 'File Format',
          description: 'Save your file as a CSV (.csv) format',
          tips: [
            'Use Excel, Google Sheets, or any text editor',
            'Ensure file extension is .csv',
            'Maximum file size: 5MB'
          ]
        },
        {
          title: 'Header Row',
          description: 'First row must contain column headers',
          tips: [
            'Use exact column names as shown in templates',
            'Headers are case-sensitive',
            'Don\'t skip the header row'
          ]
        },
        {
          title: 'Data Formatting',
          description: 'Follow these rules for data entry',
          tips: [
            'No empty rows between data',
            'Use commas to separate columns',
            'Don\'t use quotes unless necessary',
            'Remove extra spaces before/after data'
          ]
        },
        {
          title: 'Special Characters',
          description: 'Handle special characters properly',
          tips: [
            'Avoid commas in data (use semicolons if needed)',
            'Escape quotes by doubling them ("")',
            'Use UTF-8 encoding for international characters'
          ]
        },
        {
          title: 'Data Validation',
          description: 'Ensure data quality',
          tips: [
            'Check for duplicate emails',
            'Verify email formats',
            'Ensure phone numbers are digits only',
            'Validate required fields are not empty'
          ]
        }
      ],
      commonMistakes: [
        'Using wrong column names or order',
        'Including empty rows in the middle of data',
        'Using wrong data types (text instead of numbers)',
        'Missing required fields',
        'Using invalid characters in specific fields',
        'Having duplicate email addresses',
        'Including headers in data rows'
      ],
      troubleshooting: [
        {
          problem: 'File not uploading',
          solution: 'Check file size (max 5MB) and format (.csv)'
        },
        {
          problem: 'Validation errors',
          solution: 'Review field formats and required fields'
        },
        {
          problem: 'Duplicate email errors',
          solution: 'Remove duplicate email addresses from your CSV'
        },
        {
          problem: 'Invalid data format',
          solution: 'Check phone numbers (digits only) and email formats'
        }
      ]
    };
  }

  /**
   * Validate file type and size
   * @param {Object} file - File object
   * @returns {Object} Validation result
   */
  validateFile(file) {
    const result = { valid: true, errors: [] };

    // Check file type
    if (!file.mimetype || !file.mimetype.includes('text/csv')) {
      result.valid = false;
      result.errors.push('File must be a CSV file');
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      result.valid = false;
      result.errors.push('File size must be less than 5MB');
    }

    return result;
  }
}

module.exports = new CSVValidationService();
