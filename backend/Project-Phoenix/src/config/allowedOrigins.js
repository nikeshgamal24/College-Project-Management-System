// Whitelist of allowed origins for CORS
// Only exact matches are allowed for security
const allowedOrigins = [
  // Production frontend origins
  "https://project-phoenix-omega.vercel.app",
  "https://projectphoenix.vercel.app", 
  "https://college-project-management-frontend-system.vercel.app",
  "https://college-project-management-system.vercel.app",
  "https://college-project-management-system-38x3-k27dya8ed.vercel.app",
  "https://college-project-management-sy-git-9016f3-nikesh-gamals-projects.vercel.app",
  
  // Production backend origins (for internal API calls)
  "https://college-project-management-backend-system.vercel.app",
  
  // Add more Vercel deployment patterns as needed
  // Format: https://[app-name]-[hash]-[username].vercel.app
  // Add specific URLs here as they are created
  
  // Note: localhost origins are handled dynamically in development mode
  // They are not included here for security - production should never allow localhost
];

// Helper function to check if origin is allowed
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow requests with no origin (mobile apps, Postman, etc.)
  return allowedOrigins.includes(origin);
};

// Helper function to add dynamic origins in development
const getDynamicAllowedOrigins = () => {
  const dynamicOrigins = [...allowedOrigins];
  
  // In development, allow any localhost port for convenience
  if (process.env.NODE_ENV === 'development') {
    // This will be handled in corsOptions.js for localhost pattern matching
  }
  
  return dynamicOrigins;
};

module.exports = allowedOrigins;
module.exports.isOriginAllowed = isOriginAllowed;
module.exports.getDynamicAllowedOrigins = getDynamicAllowedOrigins;  
