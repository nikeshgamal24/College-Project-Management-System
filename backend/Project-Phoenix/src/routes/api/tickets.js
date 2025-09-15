const express = require("express");
const router = express.Router();
const ticketController = require("../../controllers/api/ticketController");
const verifyJWT = require("../../middleware/auth/verifyJWT");
const verifyRoles = require("../../middleware/auth/verifyRoles");
const { body, param, query, validationResult } = require("express-validator");
const roleList = require("../../config/constants/roles");



// Validation middleware function
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Validation middleware
const ticketValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Priority must be one of: low, medium, high, urgent"),
  body("category")
    .isIn(["technical", "account", "academic", "billing", "feature_request", "other"])
    .withMessage("Category must be one of: technical, account, academic, billing, feature_request, other"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
  body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments must be an array"),
];

const commentValidation = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Comment message is required")
    .isLength({ max: 1000 })
    .withMessage("Comment message cannot exceed 1000 characters"),
  body("isInternal")
    .optional()
    .isBoolean()
    .withMessage("isInternal must be a boolean"),
  body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments must be an array"),
];

const updateTicketValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("status")
    .optional()
    .isIn(["new", "in_progress", "resolved", "closed", "on_hold"])
    .withMessage("Status must be one of: new, in_progress, resolved, closed, on_hold"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Priority must be one of: low, medium, high, urgent"),
  body("category")
    .optional()
    .isIn(["technical", "account", "academic", "billing", "feature_request", "other"])
    .withMessage("Category must be one of: technical, account, academic, billing, feature_request, other"),
  body("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("Assigned to must be a valid MongoDB ObjectId"),
  body("resolution")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Resolution cannot exceed 1000 characters"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
];

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Tickets route working" });
});

// Statistics route
router.get("/statistics", verifyRoles(roleList.Admin), ticketController.getTicketStatistics);

// Get all tickets route
router.get("/", verifyRoles(roleList.Admin), ticketController.getAllTickets);

// Get current user's tickets route
router.get("/my-tickets", verifyRoles(roleList.Student, roleList.Supervisor, roleList.Evaluator), ticketController.getMyTickets);

// Create ticket route
router.post("/", verifyRoles(roleList.Student, roleList.Supervisor, roleList.Evaluator), ticketController.createTicket);

// Get ticket by ID route
router.get("/:id", verifyRoles(roleList.Admin), ticketController.getTicketById);

// Update ticket route
router.put("/:id", verifyRoles(roleList.Admin, roleList.Student, roleList.Supervisor), ticketController.updateTicket);

// Delete ticket route
router.delete("/:id", verifyRoles(roleList.Admin, roleList.Student, roleList.Supervisor), ticketController.deleteTicket);

// Add comment to ticket route
router.post("/:id/comments", verifyRoles(roleList.Admin, roleList.Student, roleList.Supervisor, roleList.Evaluator), ticketController.addComment);

// Update comment route
router.put("/:id/comments/:commentId", verifyRoles(roleList.Admin, roleList.Student, roleList.Supervisor, roleList.Evaluator), commentValidation, handleValidationErrors, ticketController.updateComment);

// Delete comment route
router.delete("/:id/comments/:commentId", verifyRoles(roleList.Admin, roleList.Student, roleList.Supervisor, roleList.Evaluator), ticketController.deleteComment);

module.exports = router;