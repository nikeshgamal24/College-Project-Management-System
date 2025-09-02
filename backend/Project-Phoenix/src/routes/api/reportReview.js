const express = require("express");
const router = express.Router();
const reportReviewController = require("../../controllers/api/reportReviewController");
const roleList = require("../../config/constants/roles");
const verifyRoles = require("../../middleware/auth/verifyRoles");
const { uploader } = require("../../controllers/helpers/file/multerUploader");

// Student routes
router
  .route("/student/submit")
  .post(
    verifyRoles(roleList.Student),
    uploader.single("reportFile"),
    reportReviewController.submitReportForReview
  );

router
  .route("/student/reports")
  .get(
    verifyRoles(roleList.Student),
    reportReviewController.getStudentReports
  );

router
  .route("/student/respond/:id")
  .post(
    verifyRoles(roleList.Student),
    reportReviewController.respondToFeedback
  );

// Supervisor routes
router
  .route("/supervisor/reports")
  .get(
    verifyRoles(roleList.Supervisor),
    reportReviewController.getReportsForReview
  );

router
  .route("/supervisor/report/:id")
  .get(
    verifyRoles(roleList.Supervisor),
    reportReviewController.getReportForReview
  );

router
  .route("/supervisor/feedback/:id")
  .post(
    verifyRoles(roleList.Supervisor),
    reportReviewController.addSectionFeedback
  );

router
  .route("/supervisor/comments/:id")
  .post(
    verifyRoles(roleList.Supervisor),
    reportReviewController.addOverallComments
  );

router
  .route("/supervisor/status/:id")
  .put(
    verifyRoles(roleList.Supervisor),
    reportReviewController.updateReportStatus
  );

module.exports = router;
