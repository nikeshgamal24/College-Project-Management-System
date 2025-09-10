const express = require("express");
const router = express.Router();
const { noticeUploader } = require("../../controllers/helpers/file/noticeUploader");
const { uploadFile } = require("../../controllers/helpers/file/uploadFile");
const verifyJWT = require("../../middleware/auth/verifyJWT");
const verifyRoles = require("../../middleware/auth/verifyRoles");
const { AppError } = require("../../middleware/errorHandler");
const roleList = require("../../config/constants/roles");

/**
 * @desc    Upload notice attachment
 * @route   POST /api/notices/upload
 * @access  Private (Admin only)
 */
router.post('/upload',
  verifyRoles(roleList.Admin), // Admin only
  noticeUploader.single('attachment'),
  async (req, res, next) => {
    try {
      console.log('Upload route hit');
      console.log('Request body:', req.body);
      console.log('Request file:', req.file);
      
      if (!req.file) {
        console.log('No file uploaded');
        return next(new AppError('No file uploaded', 400));
      }

      console.log('Notice attachment upload:', req.file);

      // Upload file to Cloudinary (from memory buffer)
      const uploadResult = await uploadFile(req.file);
      
      if (!uploadResult?.secure_url) {
        throw new AppError('File upload to Cloudinary failed', 500);
      }

      // Prepare attachment data
      const attachmentData = {
        fileName: req.file.originalname, // Use original name since we don't have a generated filename
        originalName: req.file.originalname,
        filePath: uploadResult.secure_url, // Store Cloudinary URL as filePath
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        url: uploadResult.secure_url
      };

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          attachment: attachmentData
        }
      });

    } catch (error) {
      console.error('Notice upload error:', error);
      console.error('Error stack:', error.stack);

      // Return proper error response
      res.status(500).json({
        success: false,
        message: error.message || 'File upload failed',
        error: error.message
      });
    }
  }
);

module.exports = router;
