// Quick test script to verify CORS configuration
const allowedOrigins = require("./src/config/allowedOrigins");
const corsOptions = require("./src/config/corsOptions");

console.log("=== CORS Configuration Test ===");
console.log("Allowed Origins:", allowedOrigins);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("CORS_STRICT:", process.env.CORS_STRICT);
console.log("USE_CORS_FALLBACK:", process.env.USE_CORS_FALLBACK);

// Test origin checking
const testOrigins = [
  "https://college-project-management-frontend-system.vercel.app",
  "https://college-project-management-backend-system.vercel.app",
  "http://localhost:5173"
];

console.log("\n=== Testing Origins ===");
testOrigins.forEach(origin => {
  console.log(`Testing origin: ${origin}`);
  console.log(`Included in allowedOrigins: ${allowedOrigins.includes(origin)}`);
});
