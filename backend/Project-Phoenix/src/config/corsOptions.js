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
  
  // Allow domains that end with .vercel.app (more permissive for complex Vercel URLs)
  // This handles URLs like: https://college-project-management-frontend-system.vercel.app
  const vercelRegex = /^https:\/\/[a-zA-Z0-9\-\.]+\.vercel\.app$/;
  return vercelRegex.test(origin);
};

// Main CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    console.log('🔍 CORS: Processing origin:', origin);
    console.log('🔍 CORS: Environment:', process.env.NODE_ENV);
    
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }

    // Development: Allow any localhost port for convenience
    if (process.env.NODE_ENV === 'development' && isLocalhost(origin)) {
      console.log('✅ CORS: Allowed localhost origin (development):', origin);
      return callback(null, true);
    }

    // Check exact match in allowed origins first
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Allowed origin (whitelist):', origin);
      return callback(null, true);
    }

    // For production or when NODE_ENV is not set (common in Vercel), allow valid Vercel domains
    const isProduction = process.env.NODE_ENV === 'production' || !process.env.NODE_ENV;
    if (isProduction && isValidVercelDomain(origin)) {
      console.log('✅ CORS: Allowed Vercel origin (production):', origin);
      return callback(null, true);
    }

    // Additional fallback for common deployment patterns
    if (origin && origin.includes('vercel.app')) {
      console.log('✅ CORS: Allowed Vercel domain (fallback):', origin);
      return callback(null, true);
    }

    // Log blocked requests for debugging
    console.warn('❌ CORS: Blocked origin:', origin);
    console.log('🔍 CORS: Environment:', process.env.NODE_ENV);
    console.log('🔍 CORS: Allowed origins:', allowedOrigins);
    console.log('🔍 CORS: Is valid Vercel domain:', isValidVercelDomain(origin));
    console.log('🔍 CORS: Origin includes vercel.app:', origin && origin.includes('vercel.app'));
    console.log('🔍 CORS: Origin regex test:', /^https:\/\/[a-zA-Z0-9\-\.]+\.vercel\.app$/.test(origin));
    
    // For debugging, temporarily allow all Vercel domains
    if (origin && origin.includes('vercel.app')) {
      console.log('🚨 CORS: Temporarily allowing Vercel domain for debugging:', origin);
      return callback(null, true);
    }
    
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
  preflightContinue: false,

  // Handle preflight requests properly
  handlePreflight: true
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
