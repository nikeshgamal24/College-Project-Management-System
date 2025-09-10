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
        
        let uploadOptions = {};
        
        // Handle both file object (from memory storage) and direct path string
        if (typeof fileOrPath === 'string') {
            // Direct path string provided (disk storage)
            console.log("📁 File path to upload:", fileOrPath);
            
            // Check if file exists
            const fs = require('fs');
            if (!fs.existsSync(fileOrPath)) {
                throw new Error(`File does not exist at path: ${fileOrPath}`);
            }
            
            uploadOptions = { resource_type: "auto" };
        } else if (fileOrPath && typeof fileOrPath === 'object') {
            // File object provided (from Multer)
            if (fileOrPath.buffer) {
                // Memory storage - upload from buffer
                console.log("📦 Uploading from buffer (memory storage)");
                uploadOptions = {
                    resource_type: "auto",
                    folder: "notices", // Optional: organize files in Cloudinary
                };
            } else if (fileOrPath.path || fileOrPath.filepath) {
                // Disk storage - upload from file path
                const filePath = fileOrPath.path || fileOrPath.filepath;
                console.log("📁 File path to upload:", filePath);
                
                // Check if file exists
                const fs = require('fs');
                if (!fs.existsSync(filePath)) {
                    throw new Error(`File does not exist at path: ${filePath}`);
                }
                
                uploadOptions = { resource_type: "auto" };
            } else {
                throw new Error('File object must have either buffer or path property');
            }
        } else {
            throw new Error('Invalid input: must be file object or path string');
        }
        
        console.log("☁️ Uploading to Cloudinary...");
        let result;
        
        if (fileOrPath && fileOrPath.buffer) {
            // Upload from buffer (memory storage)
            result = await cloudinary.uploader.upload(
                `data:${fileOrPath.mimetype};base64,${fileOrPath.buffer.toString('base64')}`,
                uploadOptions
            );
        } else {
            // Upload from file path (disk storage)
            const filePath = typeof fileOrPath === 'string' ? fileOrPath : (fileOrPath.path || fileOrPath.filepath);
            result = await cloudinary.uploader.upload(filePath, uploadOptions);
        }
        
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
