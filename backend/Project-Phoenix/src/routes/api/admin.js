const express = require("express");
const router = express.Router();
const multer = require("multer");
const adminController = require("../../controllers/api/adminController");
const verifyRoles = require("../../middleware/auth/verifyRoles");
const { validate, adminSchemas } = require("../../middleware/validation/validation");
const roleList = require("../../config/constants/roles");

// Configure multer for file uploads
const imageUploader = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/admin/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Profile management routes
router
  .route("/profile/:id")
  .get(verifyRoles(roleList.Admin), adminController.getAdminProfile)
  .put(
    verifyRoles(roleList.Admin),
    validate(adminSchemas.updateProfile),
    adminController.updateAdminProfile
  );

router
  .route("/profile/:id/photo")
  .put(
    verifyRoles(roleList.Admin),
    imageUploader.single("photo"),
    adminController.updateAdminPhoto
  );

// Password change routes
router
  .route("/profile/:id/password/request-otp")
  .post(
    verifyRoles(roleList.Admin),
    validate(adminSchemas.requestPasswordOTP),
    adminController.requestPasswordChangeOTP
  );

router
  .route("/profile/:id/password/:otp")
  .put(
    verifyRoles(roleList.Admin),
    validate(adminSchemas.changePassword),
    adminController.changeAdminPassword
  );

module.exports = router;
