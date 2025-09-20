const allowedOrigins = require("./allowedOrigins");

// More permissive CORS for production
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // In development, allow localhost with any port
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // In production, be more permissive with Vercel and college-project-management domains
    if (process.env.NODE_ENV === 'production') {
      if (origin.includes('vercel.app') || 
          origin.includes('college-project-management') ||
          origin.includes('project-phoenix') ||
          origin.includes('projectphoenix')) {
        console.log('CORS allowed origin (production wildcard):', origin);
        return callback(null, true);
      }
    }
    
    // Log the blocked origin for debugging
    console.log('CORS blocked origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Request headers:', origin);
    
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

// Use fallback CORS in production if CORS_STRICT is not set or if we detect common CORS issues
const shouldUseFallback = process.env.NODE_ENV === 'production' && 
  (!process.env.CORS_STRICT || process.env.USE_CORS_FALLBACK === 'true');

const finalCorsOptions = shouldUseFallback ? fallbackCorsOptions : corsOptions;

// Log CORS configuration for debugging
console.log('CORS Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  CORS_STRICT: process.env.CORS_STRICT,
  USE_CORS_FALLBACK: process.env.USE_CORS_FALLBACK,
  usingFallback: shouldUseFallback,
  allowedOrigins: allowedOrigins
});

module.exports = finalCorsOptions;
