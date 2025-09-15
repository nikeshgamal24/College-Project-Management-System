const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, "Comment message is required"],
    trim: true,
    maxlength: [1000, "Comment message cannot exceed 1000 characters"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Comment author is required"],
  },
  authorName: {
    type: String,
    required: [true, "Author name is required"],
  },
  authorRole: {
    type: String,
    enum: ["admin", "student", "supervisor", "evaluator"],
    required: [true, "Author role is required"],
  },
  isInternal: {
    type: Boolean,
    default: false, // Internal comments only visible to admins
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
  }],
}, {
  timestamps: true,
});

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: [true, "Ticket ID is required"],
    index: true,
  },
  title: {
    type: String,
    required: [true, "Ticket title is required"],
    trim: true,
    maxlength: [200, "Ticket title cannot exceed 200 characters"],
  },
  description: {
    type: String,
    required: [true, "Ticket description is required"],
    trim: true,
    maxlength: [2000, "Ticket description cannot exceed 2000 characters"],
  },
  status: {
    type: String,
    enum: ["new", "in_progress", "resolved", "closed", "on_hold"],
    default: "new",
    required: [true, "Ticket status is required"],
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
    required: [true, "Ticket priority is required"],
  },
  category: {
    type: String,
    enum: ["technical", "account", "academic", "billing", "feature_request", "other"],
    default: "other",
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Ticket submitter is required"],
  },
  submittedByName: {
    type: String,
    required: [true, "Submitter name is required"],
  },
  submittedByRole: {
    type: String,
    enum: ["student", "supervisor", "evaluator"],
    required: [true, "Submitter role is required"],
  },
  submittedByEmail: {
    type: String,
    required: [true, "Submitter email is required"],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  assignedToName: {
    type: String,
    default: null,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: [1000, "Resolution cannot exceed 1000 characters"],
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  closedAt: {
    type: Date,
    default: null,
  },
  comments: [commentSchema],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, "Tag cannot exceed 50 characters"],
  }],
  isPublic: {
    type: Boolean,
    default: true, // Whether the ticket is visible to the submitter
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  // Email notification tracking
  emailNotifications: {
    lastSentToSubmitter: Date,
    lastSentToAssignee: Date,
    submitterNotifiedCount: { type: Number, default: 0 },
    assigneeNotifiedCount: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ submittedBy: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ category: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ lastActivityAt: -1 });

// Pre-save middleware to generate ticket ID
ticketSchema.pre("save", async function (next) {
  if (this.isNew && !this.ticketId) {
    const count = await this.constructor.countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

// Pre-save middleware to update lastActivityAt
ticketSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastActivityAt = new Date();
  }
  next();
});

// Virtual for formatted status
ticketSchema.virtual("formattedStatus").get(function () {
  return this.status.charAt(0).toUpperCase() + this.status.slice(1).replace("_", " ");
});

// Virtual for formatted priority
ticketSchema.virtual("formattedPriority").get(function () {
  return this.priority.charAt(0).toUpperCase() + this.priority.slice(1);
});

// Virtual for formatted category
ticketSchema.virtual("formattedCategory").get(function () {
  return this.category.charAt(0).toUpperCase() + this.category.slice(1);
});

// Method to add comment
ticketSchema.methods.addComment = function (commentData) {
  this.comments.push(commentData);
  this.lastActivityAt = new Date();
  return this.save();
};

// Method to update status
ticketSchema.methods.updateStatus = function (newStatus, adminId, adminName) {
  this.status = newStatus;
  this.lastActivityAt = new Date();
  
  if (newStatus === "resolved") {
    this.resolvedAt = new Date();
  } else if (newStatus === "closed") {
    this.closedAt = new Date();
  }
  
  return this.save();
};

// Method to assign ticket
ticketSchema.methods.assignTicket = function (adminId, adminName) {
  this.assignedTo = adminId;
  this.assignedToName = adminName;
  this.lastActivityAt = new Date();
  return this.save();
};

// Static method to get ticket statistics
ticketSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
        urgent: { $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } },
      },
    },
  ]);
  
  return stats[0] || {
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
};

module.exports = mongoose.model("Ticket", ticketSchema);

