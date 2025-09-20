//creating whiteList in order to ensure your server is accessed by limited domain
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3500",
  "https://project-phoenix-omega.vercel.app",
  "https://projectphoenix.vercel.app",
  "https://college-project-management-frontend-system.vercel.app",
  "https://college-project-management-backend-system.vercel.app",
  // Add the exact frontend domain from the browser
  "https://college-project-management-frontend-system.vercel.app"
];

module.exports = allowedOrigins;  
