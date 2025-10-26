const allowedOrigins = require("../../config/allowedOrigins");

/**
 * Credentials middleware for CORS
 * Sets Access-Control-Allow-Credentials header for allowed origins
 * Works in conjunction with corsOptions.js
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

const credentials = (req, res, next) => {
  const origin = req.headers.origin;

  // Check if origin should be allowed credentials
  let allowCredentials = false;

  if (!origin) {
    // Allow credentials for requests with no origin (mobile apps, server-to-server)
    allowCredentials = true;
  } else if (allowedOrigins.includes(origin)) {
    // Allow credentials for whitelisted origins
    allowCredentials = true;
  } else if (process.env.NODE_ENV === 'development' && isLocalhost(origin)) {
    // Allow credentials for localhost in development
    allowCredentials = true;
  } else if ((process.env.NODE_ENV === 'production' || !process.env.NODE_ENV) && isValidVercelDomain(origin)) {
    // Allow credentials for valid Vercel domains in production (or when NODE_ENV is not set)
    allowCredentials = true;
  } else if (origin && origin.includes('vercel.app')) {
    // Additional fallback for Vercel domains
    allowCredentials = true;
  }

  if (allowCredentials) {
    res.header("Access-Control-Allow-Credentials", "true");
  }

  next();
};

module.exports = credentials;
