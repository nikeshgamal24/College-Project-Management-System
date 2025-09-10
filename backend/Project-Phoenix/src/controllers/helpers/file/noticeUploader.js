const multer = require("multer");

// Storage configuration for notice attachments using memory storage
const storage = multer.memoryStorage();

// Uploader for notice attachments (JPG, PNG, JPEG, PDF)
const noticeUploader = multer({
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB limit for notice attachments
    },
    fileFilter: function (req, file, cb) {
        // Allow JPG, PNG, JPEG, and PDF files
        const allowedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'application/pdf'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG, JPEG, and PDF files are allowed for notice attachments!'), false);
        }
    }
});

module.exports = {
    noticeUploader
};
