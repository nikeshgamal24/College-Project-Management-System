//creating whiteList in order to ensure your server is accessed by limited domain
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3500",
  "https://project-phoenix-omega.vercel.app",
  "https://projectphoenix.vercel.app",
  "https://college-project-management-frontend-system.vercel.app",
  "https://college-project-management-backend-system.vercel.app",
  // Add all Vercel deployment domains
  "https://college-project-management-system-38x3-k27dya8ed.vercel.app",
  "https://college-project-management-system.vercel.app",
  // Add git-based deployment URLs
  "https://college-project-management-sy-git-9016f3-nikesh-gamals-projects.vercel.app"
];

module.exports = allowedOrigins;  
