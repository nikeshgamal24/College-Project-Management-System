const allowedOrigins = require("./allowedOrigins");

// More permissive CORS for both development and production
const corsOptions = {
  origin: (origin, callback) => {
    console.log('CORS check - Origin:', origin);
    console.log('CORS check - NODE_ENV:', process.env.NODE_ENV);
    
    // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
    if (!origin) {
      console.log('CORS allowed: No origin (same-origin or mobile app)');
      return callback(null, true);
    }
    
    // Check if origin is in allowed origins list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS allowed origin (from allowedOrigins list):', origin);
      return callback(null, true);
    }
    
    // Allow all localhost variations (for development)
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('0.0.0.0')) {
      console.log('CORS allowed origin (localhost/development):', origin);
      return callback(null, true);
    }
    
    // Allow all Vercel domains (for production)
    if (origin.includes('vercel.app')) {
      console.log('CORS allowed origin (Vercel domain):', origin);
      return callback(null, true);
    }
    
    // Allow college-project-management domains
    if (origin.includes('college-project-management')) {
      console.log('CORS allowed origin (college-project-management):', origin);
      return callback(null, true);
    }
    
    // Allow project-phoenix domains
    if (origin.includes('project-phoenix') || origin.includes('projectphoenix')) {
      console.log('CORS allowed origin (project-phoenix):', origin);
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log('CORS BLOCKED origin:', origin);
    console.log('Available allowed origins:', allowedOrigins);
    
    // For now, allow all origins to debug (REMOVE IN PRODUCTION)
    console.log('CORS: Allowing all origins for debugging');
    return callback(null, true);
  },
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Set-Cookie'],
};

// Fallback CORS for production if the above fails
const fallbackCorsOptions = {
  origin: true, // Allow all origins in production
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false
};

// Log CORS configuration for debugging
console.log('CORS Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  allowedOrigins: allowedOrigins,
  message: 'Using unified CORS for both development and production'
});

// Export the unified CORS configuration
module.exports = corsOptions;
