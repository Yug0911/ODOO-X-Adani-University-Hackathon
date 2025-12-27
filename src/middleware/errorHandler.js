const errorHandler = (err, req, res, next) => {
  console.error('❌ Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // PostgreSQL specific errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          success: false,
          message: 'Duplicate entry detected',
          error: 'A record with this value already exists. Please use a different value.',
          field: err.constraint
        });

      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          message: 'Invalid reference',
          error: 'The referenced record does not exist. Please select a valid option.',
          detail: err.detail
        });

      case '23502': // Not null violation
        return res.status(400).json({
          success: false,
          message: 'Required field missing',
          error: 'A required field cannot be empty.',
          column: err.column
        });

      case '22P02': // Invalid text representation
        return res.status(400).json({
          success: false,
          message: 'Invalid data type',
          error: 'Please provide data in the correct format.'
        });

      case '23514': // Check constraint violation
        return res.status(400).json({
          success: false,
          message: 'Invalid value',
          error: 'The provided value does not meet the required constraints.',
          constraint: err.constraint
        });
    }
  }

  // Generic error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Please try again later'
  });
};

module.exports = errorHandler;