const Ticket = require("../../models/system/Ticket");
const Admin = require("../../models/user/Admin");
const Student = require("../../models/user/Student");
const Supervisor = require("../../models/user/Supervisor");
const { validationResult } = require("express-validator");
const { sendTicketNotificationEmail } = require("../../services/email/ticketEmailService");
const roleList = require("../../config/constants/roles");

// @desc    Get all tickets with filtering and pagination
// @route   GET /api/tickets
// @access  Admin only
const getAllTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      assignedTo,
      submittedBy,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (category) {
      filter.category = category;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (submittedBy) {
      filter.submittedBy = submittedBy;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { ticketId: { $regex: search, $options: "i" } },
        { submittedByName: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get tickets with pagination
    const tickets = await Ticket.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalTickets = await Ticket.countDocuments(filter);

    // Get statistics
    const stats = await Ticket.getStatistics();

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTickets / parseInt(limit)),
          totalTickets,
          hasNextPage: skip + parseInt(limit) < totalTickets,
          hasPrevPage: parseInt(page) > 1,
        },
        statistics: stats,
      },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Admin only
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket",
      error: error.message,
    });
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Student, Supervisor, Evaluator
const createTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      title,
      description,
      priority = "medium",
      category,
      attachments = [],
      tags = [],
    } = req.body;

    // Get user information based on role
    let userInfo = {};
    const userId = req.userId;
    const userRole = req.role;
    const userEmail = req.email;
    
    if (userRole.includes(roleList.Student)) {
      const student = await Student.findById(userId);
      userInfo = {
        submittedBy: student._id,
        submittedByName: student.fullname,
        submittedByRole: "student",
        submittedByEmail: student.email,
      };
    } else if (userRole.includes(roleList.Supervisor)) {
      const supervisor = await Supervisor.findById(userId);
      userInfo = {
        submittedBy: supervisor._id,
        submittedByName: supervisor.fullname,
        submittedByRole: "supervisor",
        submittedByEmail: supervisor.email,
      };
    }

    // Generate ticket ID manually
    const ticketCount = await Ticket.countDocuments();
    const ticketId = `TKT-${String(ticketCount + 1).padStart(3, "0")}`;

    const ticketData = {
      ticketId,
      title,
      description,
      priority,
      category: category || "other",
      attachments,
      tags,
      ...userInfo,
    };

    const ticket = new Ticket(ticketData);
    await ticket.save();

    // Get the created ticket
    const populatedTicket = await Ticket.findById(ticket._id);

    // Send notification email to admins
    try {
      await sendTicketNotificationEmail(populatedTicket, "new_ticket");
    } catch (emailError) {
      console.error("Error sending ticket notification email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: populatedTicket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create ticket",
      error: error.message,
    });
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Ticket creator or Admin
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      category,
      assignedTo,
      resolution,
      tags,
    } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Check if user is authorized to update this ticket
    // Only the ticket creator or admin can update
    const isAdmin = req.role.includes(roleList.Admin);
    const isTicketCreator = ticket.submittedBy.toString() === req.userId.toString();
    
    if (!isAdmin && !isTicketCreator) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update tickets you created.",
      });
    }

    // Update fields
    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (status) {
      const oldStatus = ticket.status;
      await ticket.updateStatus(status, req.userId, req.user.fullname);
      
      // Send notification email on status change
      try {
        await sendTicketNotificationEmail(ticket, "status_change", { oldStatus, newStatus: status });
      } catch (emailError) {
        console.error("Error sending status change email:", emailError);
      }
    }
    if (priority) ticket.priority = priority;
    if (category) ticket.category = category;
    if (resolution) ticket.resolution = resolution;
    if (tags) ticket.tags = tags;

    // Handle assignment
    if (assignedTo && assignedTo !== ticket.assignedTo?.toString()) {
      const admin = await Admin.findById(assignedTo);
      if (admin) {
        await ticket.assignTicket(assignedTo, admin.fullname);
        
        // Send notification email to new assignee
        try {
          await sendTicketNotificationEmail(ticket, "ticket_assigned");
        } catch (emailError) {
          console.error("Error sending assignment email:", emailError);
        }
      }
    }

    await ticket.save();

    // Get the updated ticket
    const updatedTicket = await Ticket.findById(ticket._id);

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update ticket",
      error: error.message,
    });
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Admin, Student, Supervisor, Evaluator
const addComment = async (req, res) => {
  try {
    console.log("addComment block");
    const { id } = req.params;
    const { message, isInternal = false, attachments = [] } = req.body;

    const ticket = await Ticket.findById(id);
    console.log("🚀 ~ addComment ~ ticket:", ticket)
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Get user information
    let userInfo = {};
    if (req.role.includes(roleList.Admin)) {
      const admin = await Admin.findById(req.userId);
      userInfo = {
        author: admin._id,
        authorName: admin.fullname,
        authorRole: "admin",
      };
    } else if (req.role.includes(roleList.Student)) {
      const student = await Student.findById(req.userId);
      userInfo = {
        author: student._id,
        authorName: student.fullname,
        authorRole: "student",
      };
    } else if (req.role.includes(roleList.Supervisor)) {
      const supervisor = await Supervisor.findById(req.userId);
      userInfo = {
        author: supervisor._id,
        authorName: supervisor.fullname,
        authorRole: "supervisor",
      };
    }

    const commentData = {
      message,
      isInternal,
      attachments,
      ...userInfo,
    };

    await ticket.addComment(commentData);

    // Send notification email for new comment
    try {
      await sendTicketNotificationEmail(ticket, "new_comment");
    } catch (emailError) {
      console.error("Error sending comment notification email:", emailError);
    }

    // Get the updated ticket
    const updatedTicket = await Ticket.findById(ticket._id);

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

// @desc    Get ticket statistics
// @route   GET /api/tickets/statistics
// @access  Admin only
const getTicketStatistics = async (req, res) => {
  try {
    const stats = await Ticket.getStatistics();
    
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching ticket statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket statistics",
      error: error.message,
    });
  }
};

// @desc    Update comment
// @route   PUT /api/tickets/:id/comments/:commentId
// @access  Comment author or Admin
const updateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { message } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const comment = ticket.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the comment author or admin
    const isAdmin = req.role.includes("admin");
    const isCommentAuthor = comment.author.toString() === req.userId.toString();
    
    if (!isAdmin && !isCommentAuthor) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments",
      });
    }

    // Update comment
    comment.message = message;
    comment.updatedAt = new Date();
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
      error: error.message,
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/tickets/:id/comments/:commentId
// @access  Comment author or Admin
const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const comment = ticket.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is the comment author or admin
    const isAdmin = req.role.includes("admin");
    const isCommentAuthor = comment.author.toString() === req.userId.toString();
    
    if (!isAdmin && !isCommentAuthor) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    // Remove comment
    ticket.comments.pull(commentId);
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Admin only
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Check if user is authorized to delete this ticket
    // Only the ticket creator or admin can delete
    const isAdmin = req.role && req.role.includes(roleList.Admin);
    const isTicketCreator = ticket.submittedBy.toString() === req.userId.toString();
    
    if (!isAdmin && !isTicketCreator) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete tickets you created.",
      });
    }

    await Ticket.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete ticket",
      error: error.message,
    });
  }
};

// @desc    Get current user's tickets
// @route   GET /api/tickets/my-tickets
// @access  Student, Supervisor, Evaluator
const getMyTickets = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { submittedBy: userId };

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { ticketNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get tickets
    const tickets = await Ticket.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Ticket.countDocuments(filter);

    // Calculate statistics for user's tickets
    const stats = await Ticket.aggregate([
      { $match: { submittedBy: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] } },
        },
      },
    ]);

    const statistics = stats[0] || {
      total: 0,
      new: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      urgent: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
        statistics,
      },
    });
  } catch (error) {
    console.error("Error getting user tickets:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  addComment,
  updateComment,
  deleteComment,
  getTicketStatistics,
  deleteTicket,
  getMyTickets,
};
