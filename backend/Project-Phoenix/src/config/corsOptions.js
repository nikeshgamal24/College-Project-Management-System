const allowedOrigins = require("./allowedOrigins");

// Unified CORS for both development and production
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS allowed origin (from allowedOrigins):', origin);
      return callback(null, true);
    }
    
    // Allow localhost with any port (for development)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('CORS allowed origin (localhost):', origin);
      return callback(null, true);
    }
    
    // Allow Vercel and college-project-management domains (for production)
    if (origin.includes('vercel.app') || 
        origin.includes('college-project-management') ||
        origin.includes('project-phoenix') ||
        origin.includes('projectphoenix') ||
        origin.includes('nikesh-gamals-projects.vercel.app')) {
      console.log('CORS allowed origin (wildcard match):', origin);
      return callback(null, true);
    }
    
    // Log the blocked origin for debugging
    console.log('CORS blocked origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    callback(new Error("Not Allowed by CORS"));
  },
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
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
