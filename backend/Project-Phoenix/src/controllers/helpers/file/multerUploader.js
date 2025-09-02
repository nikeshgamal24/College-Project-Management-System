const multer = require("multer");
const path = require("path");

// Common storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Uploader for PDF files (reports)
const pdfUploader = multer({
    storage: storage,
    limits: { fileSize: 25000000 }, // 25MB limit
    fileFilter: function (req, file, cb) {
        // Allow PDF files only
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Uploader for image files (photos)
const imageUploader = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        // Allow image files only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Default uploader (for backward compatibility - allows PDFs)
const uploader = pdfUploader;

module.exports = {
    uploader,        // Default (PDF only)
    pdfUploader,     // PDF files only
    imageUploader    // Image files only
}