const { AppError } = require("../errorHandler");

const handleValidationErrors = (req, res, next) => {
  // This middleware is called after validation middleware
  // If we reach here, validation passed successfully
  next();
};

// Validation middleware function
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessage,
        status: 'fail'
      });
    }
    next();
  };
};

module.exports = { handleValidationErrors, validateRequest };
