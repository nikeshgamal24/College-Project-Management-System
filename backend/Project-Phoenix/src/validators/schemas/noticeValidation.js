const Joi = require('joi');

// Notice creation validation
const createNoticeValidation = {
  body: Joi.object({
    title: Joi.string()
      .required()
      .trim()
      .min(5)
      .max(200)
      .custom((value, helpers) => {
        // Check only for leading or trailing whitespace (not spaces in between)
        if (value.startsWith(' ') || value.endsWith(' ')) {
          return helpers.error('string.trim');
        }
        return value;
      })
      .messages({
        'string.empty': 'Notice title is required',
        'string.min': 'Notice title must be at least 5 characters long',
        'string.max': 'Notice title cannot exceed 200 characters',
        'string.trim': 'Notice title must not have leading or trailing whitespace'
      }),
    
    content: Joi.string()
      .required()
      .trim()
      .min(10)
      .max(2000)
      .custom((value, helpers) => {
        // Check only for leading or trailing whitespace (not spaces in between)
        if (value.startsWith(' ') || value.endsWith(' ')) {
          return helpers.error('string.trim');
        }
        return value;
      })
      .messages({
        'string.empty': 'Notice content is required',
        'string.min': 'Notice content must be at least 10 characters long',
        'string.max': 'Notice content cannot exceed 2000 characters',
        'string.trim': 'Notice content must not have leading or trailing whitespace'
      }),
    
    targetAudience: Joi.array()
      .items(Joi.string().valid('All', 'Student', 'Supervisor', 'Evaluator', 'Admin'))
      .min(1)
      .messages({
        'array.min': 'At least one target audience must be selected',
        'any.only': 'Invalid target audience value'
      }),
    
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .default('medium')
      .messages({
        'any.only': 'Priority must be one of: low, medium, high, urgent'
      }),
    
    category: Joi.string()
      .valid('general', 'academic', 'deadline', 'policy', 'emergency', 'maintenance')
      .default('general')
      .messages({
        'any.only': 'Category must be one of: general, academic, deadline, policy, emergency, maintenance'
      }),
    
    tags: Joi.array()
      .items(
        Joi.string()
          .trim()
          .min(1)
          .max(50)
          .messages({
            'string.min': 'Tag cannot be empty',
            'string.max': 'Tag cannot exceed 50 characters'
          })
      )
      .max(10)
      .messages({
        'array.max': 'Maximum 10 tags allowed'
      }),
    
    expiresAt: Joi.alternatives()
      .try(
        Joi.date().greater('now').messages({
          'date.greater': 'Expiry date must be in the future'
        }),
        Joi.string().allow('').messages({
          'string.base': 'Expiry date must be a valid date'
        }),
        Joi.allow(null)
      )
      .messages({
        'alternatives.match': 'Expiry date must be a valid future date or empty'
      }),
    
    attachment: Joi.object({
      fileName: Joi.string().trim().required(),
      filePath: Joi.string().trim().required(),
      fileSize: Joi.number().min(0).required(),
      fileType: Joi.string()
        .valid('image/jpeg', 'image/jpg', 'image/png', 'application/pdf')
        .required()
        .messages({
          'any.only': 'File type must be JPG, PNG, JPEG, or PDF'
        }),
      originalName: Joi.string().trim().optional(),
      url: Joi.string().uri().trim().optional()
    }).allow(null)
  })
};

// Notice update validation
const updateNoticeValidation = {
  body: Joi.object({
    title: Joi.string()
      .trim()
      .min(5)
      .max(200)
      .custom((value, helpers) => {
        // Check only for leading or trailing whitespace (not spaces in between)
        if (value.startsWith(' ') || value.endsWith(' ')) {
          return helpers.error('string.trim');
        }
        return value;
      })
      .messages({
        'string.min': 'Notice title must be at least 5 characters long',
        'string.max': 'Notice title cannot exceed 200 characters',
        'string.trim': 'Notice title must not have leading or trailing whitespace'
      }),
    
    content: Joi.string()
      .trim()
      .min(10)
      .max(2000)
      .custom((value, helpers) => {
        // Check only for leading or trailing whitespace (not spaces in between)
        if (value.startsWith(' ') || value.endsWith(' ')) {
          return helpers.error('string.trim');
        }
        return value;
      })
      .messages({
        'string.min': 'Notice content must be at least 10 characters long',
        'string.max': 'Notice content cannot exceed 2000 characters',
        'string.trim': 'Notice content must not have leading or trailing whitespace'
      }),
    
    targetAudience: Joi.array()
      .items(Joi.string().valid('All', 'Student', 'Supervisor', 'Evaluator', 'Admin'))
      .min(1)
      .messages({
        'array.min': 'At least one target audience must be selected',
        'any.only': 'Invalid target audience value'
      }),
    
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .messages({
        'any.only': 'Priority must be one of: low, medium, high, urgent'
      }),
    
    category: Joi.string()
      .valid('general', 'academic', 'deadline', 'policy', 'emergency', 'maintenance')
      .messages({
        'any.only': 'Category must be one of: general, academic, deadline, policy, emergency, maintenance'
      }),
    
    tags: Joi.array()
      .items(
        Joi.string()
          .trim()
          .min(1)
          .max(50)
          .messages({
            'string.min': 'Tag cannot be empty',
            'string.max': 'Tag cannot exceed 50 characters'
          })
      )
      .max(10)
      .messages({
        'array.max': 'Maximum 10 tags allowed'
      }),
    
    expiresAt: Joi.alternatives()
      .try(
        Joi.date().greater('now').messages({
          'date.greater': 'Expiry date must be in the future'
        }),
        Joi.string().allow('').messages({
          'string.base': 'Expiry date must be a valid date'
        }),
        Joi.allow(null)
      )
      .messages({
        'alternatives.match': 'Expiry date must be a valid future date or empty'
      }),
    
    status: Joi.string()
      .valid('draft', 'published', 'archived')
      .messages({
        'any.only': 'Status must be one of: draft, published, archived'
      }),
    
    attachment: Joi.object({
      fileName: Joi.string().trim().required(),
      filePath: Joi.string().trim().required(),
      fileSize: Joi.number().min(0).required(),
      fileType: Joi.string()
        .valid('image/jpeg', 'image/jpg', 'image/png', 'application/pdf')
        .required()
        .messages({
          'any.only': 'File type must be JPG, PNG, JPEG, or PDF'
        }),
      originalName: Joi.string().trim().optional(),
      url: Joi.string().uri().trim().optional()
    }).allow(null)
  })
};

// Notice query parameters validation
const getNoticesValidation = {
  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      }),
    
    status: Joi.string()
      .valid('draft', 'published', 'archived', 'all')
      .default('all')
      .messages({
        'any.only': 'Status must be one of: draft, published, archived, all'
      }),
    
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .messages({
        'any.only': 'Priority must be one of: low, medium, high, urgent'
      }),
    
    category: Joi.string()
      .valid('general', 'academic', 'deadline', 'policy', 'emergency', 'maintenance')
      .messages({
        'any.only': 'Category must be one of: general, academic, deadline, policy, emergency, maintenance'
      }),
    
    targetAudience: Joi.string()
      .valid('All', 'Student', 'Supervisor', 'Evaluator')
      .messages({
        'any.only': 'Target audience must be one of: All, Student, Supervisor, Evaluator'
      }),
    
    search: Joi.string()
      .trim()
      .max(100)
      .messages({
        'string.max': 'Search term cannot exceed 100 characters'
      })
  })
};

// Notice ID parameter validation
const noticeIdValidation = {
  params: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid notice ID format',
        'any.required': 'Notice ID is required'
      })
  })
};

module.exports = {
  createNoticeValidation,
  updateNoticeValidation,
  getNoticesValidation,
  noticeIdValidation
};
