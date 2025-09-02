const express = require("express");
const router = express.Router();
const studentController = require("../../controllers/api/studentController");
const roleList = require("../../config/constants/roles");
const verifyRoles = require("../../middleware/auth/verifyRoles");
const { validate, validateParams, studentSchemas, paramSchemas } = require("../../middleware/validation/validation");
const {
  uploader,
  imageUploader,
} = require("../../controllers/helpers/file/multerUploader");

router
  .route("/events")
  .get(verifyRoles(roleList.Student), studentController.getAllEvents);

router
  .route("/students/:id")
  .put(
    verifyRoles(roleList.Student), 
    validateParams(paramSchemas.objectId),
    validate(studentSchemas.updateStudent),
    studentController.updateStudent
  );

router
  .route("/event")
  .get(verifyRoles(roleList.Student), studentController.getMyEvent);

router
  .route("/team/create")
  .post(
    verifyRoles(roleList.Student),
    validate(studentSchemas.createProject),
    studentController.createProjectTeam
  );

//here id of the project
router
  .route("/team/report/:id")
  .post(
    verifyRoles(roleList.Student),
    uploader.single("file"),
    studentController.submitReport
  );

router
  .route("/team/students")
  .get(verifyRoles(roleList.Student), studentController.getAllStudentsList);

router
  .route("/project/:id")
  .get(
    verifyRoles(roleList.Student),
    validateParams(paramSchemas.objectId),
    studentController.getProjectById
  );

router
  .route("/archive/")
  .get(verifyRoles(roleList.Student), studentController.getAllArchiveProjects);

router
  .route("/archive/:id")
  .get(
    verifyRoles(roleList.Student),
    validateParams(paramSchemas.objectId),
    studentController.getArchiveProjectById
  );

router
  .route("/progress-log/create")
  .post(verifyRoles(roleList.Student), studentController.createProgressLog);

router
  .route("/progress-log/:id") //get projectId for the log of the project id
  .get(verifyRoles(roleList.Student), studentController.getAllProjectLogsOfProject);

// Profile management routes
router
  .route("/profile/:id")
  .get(verifyRoles(roleList.Student), studentController.getStudentProfile)
  .put(
    verifyRoles(roleList.Student),
    validate(studentSchemas.updateProfile),
    studentController.updateStudentProfile
  );

router
  .route("/profile/:id/photo")
  .put(
    verifyRoles(roleList.Student),
    imageUploader.single("photo"),
    studentController.updateStudentPhoto
  );

router
  .route("/profile/:id/password/request-otp")
  .post(
    verifyRoles(roleList.Student),
    validate(studentSchemas.requestPasswordChangeOTP),
    studentController.requestPasswordChangeOTP
  );

router
  .route("/profile/:id/password/:otp")
  .put(
    verifyRoles(roleList.Student),
    validateParams(paramSchemas.idAndOtp),
    validate(studentSchemas.changePasswordWithOTP),
    studentController.changeStudentPassword
  );

module.exports = router;
