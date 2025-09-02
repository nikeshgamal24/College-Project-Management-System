// Require the Cloudinary library
const cloudinary = require("cloudinary").v2;

//set cloudinary config section
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Validate Cloudinary configuration
if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
  console.error('Cloudinary configuration missing. Please check environment variables:');
  console.error('CLOUD_NAME:', process.env.CLOUD_NAME ? 'Set' : 'Missing');
  console.error('API_KEY:', process.env.API_KEY ? 'Set' : 'Missing');
  console.error('API_SECRET:', process.env.API_SECRET ? 'Set' : 'Missing');
}

const uploadFile = async (fileOrPath) => {
    try {
        console.log("🚀 Starting file upload to Cloudinary");
        console.log("📥 Input:", fileOrPath);
        
        let filePath;
        
        // Handle both file object and direct path string
        if (typeof fileOrPath === 'string') {
            // Direct path string provided
            filePath = fileOrPath;
        } else if (fileOrPath && typeof fileOrPath === 'object') {
            // File object provided (from Multer)
            filePath = fileOrPath.path || fileOrPath.filepath;
            
            if (!filePath) {
                throw new Error('File path not found in file object');
            }
        } else {
            throw new Error('Invalid input: must be file object or path string');
        }
        
        console.log("📁 File path to upload:", filePath);
        
        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            throw new Error(`File does not exist at path: ${filePath}`);
        }
        
        console.log("☁️ Uploading to Cloudinary...");
        const result = await cloudinary.uploader.upload(filePath);
        console.log("✅ Successfully uploaded to Cloudinary:", result);
        
        // Check if we have a valid result with URL
        if (!result || (!result.secure_url && !result.url)) {
            throw new Error('Cloudinary upload failed: No URL returned');
        }
        
        // Return the secure URL from the result
        const finalUrl = result.secure_url || result.url;
        console.log("Final URL:", finalUrl);
        return { secure_url: finalUrl };
        
    } catch (err) {
        console.error(`error-file-upload: ${err.message}`);
        throw err; // Re-throw the error so calling function can handle it
    }
};

module.exports= { uploadFile };
