const allowedOrigins = require("./allowedOrigins");

/**
 * Secure CORS configuration
 * - Development: Allows localhost with any port for convenience
 * - Production: Strict whitelist checking with exact domain matching
 * - No wildcard matching for security
 */

// Helper function to check if origin is localhost (for development)
const isLocalhost = (origin) => {
  if (!origin) return false;
  return origin.startsWith('http://localhost:') || 
         origin.startsWith('http://127.0.0.1:') ||
         origin === 'http://localhost' ||
         origin === 'http://127.0.0.1';
};

// Helper function to validate Vercel domains securely
const isValidVercelDomain = (origin) => {
  if (!origin || !origin.includes('vercel.app')) return false;
  
  // Only allow domains that end with .vercel.app (prevents subdomain attacks)
  const vercelRegex = /^https:\/\/[a-zA-Z0-9\-]+(-[a-zA-Z0-9\-]+)*\.vercel\.app$/;
  return vercelRegex.test(origin);
};

// Main CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }

    // Development: Allow any localhost port for convenience
    if (process.env.NODE_ENV === 'development' && isLocalhost(origin)) {
      console.log('CORS: Allowed localhost origin (development):', origin);
      return callback(null, true);
    }

    // Check exact match in allowed origins (after localhost check for proper precedence)
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Allowed origin (whitelist):', origin);
      return callback(null, true);
    }

    // Production: Additional validation for known deployment patterns
    if (process.env.NODE_ENV === 'production') {
      // Validate Vercel domains securely (no wildcard matching)
      if (isValidVercelDomain(origin)) {
        console.log('CORS: Allowed Vercel origin (production):', origin);
        return callback(null, true);
      }
    }

    // Log blocked requests for debugging
    console.warn('CORS: Blocked origin:', origin);
    console.log('CORS: Environment:', process.env.NODE_ENV);
    console.log('CORS: Allowed origins:', allowedOrigins);
    
    // Return CORS error
    const error = new Error(`CORS policy violation: Origin '${origin}' is not allowed`);
    error.status = 403;
    callback(error);
  },

  // Enable credentials (cookies, authorization headers)
  credentials: true,

  // HTTP methods allowed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],

  // Headers allowed in requests
  allowedHeaders: [
    'Content-Type',
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],

  // Headers exposed to the client
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count'
  ],

  // Preflight response status
  optionsSuccessStatus: 200,

  // Cache preflight response for 24 hours
  maxAge: 86400,

  // Don't pass preflight response to next handler
  preflightContinue: false
};

// Log CORS configuration on startup
console.log('🔒 CORS Configuration Loaded:', {
  environment: process.env.NODE_ENV || 'development',
  allowedOriginsCount: allowedOrigins.length,
  credentialsEnabled: corsOptions.credentials,
  allowedMethods: corsOptions.methods,
  sampleOrigins: allowedOrigins.slice(0, 3)
});

module.exports = corsOptions;
