const Notice = require('../../models/system/Notice');
const Admin = require('../../models/user/Admin');
const { validationResult } = require('express-validator');
const { logEvents } = require('../../middleware/logging/logEvents');
const transactionService = require('../../services/database/transactionService');
const { AppError } = require('../../middleware/errorHandler');

/**
 * @desc    Create a new notice
 * @route   POST /api/notices
 * @access  Private (Admin only)
 */
const createNotice = async (req, res) => {
  try {
    console.log('Create notice Block');
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    console.log('Create notice Block Before notice object');

    const {
      title,
      content,
      targetAudience,
      priority,
      category,
      tags,
      expiresAt,
      attachment
    } = req.body;
    console.log('Create notice Block After notice object');
    console.log('req.body', req.body);

    // Execute within transaction for data consistency and ACID compliance
    const result = await transactionService.executeTransaction(async (session) => {
      // Validate references to ensure data integrity
      await transactionService.validateReferences([
        {
          model: Admin,
          ids: [req.userId],
          fieldName: '_id'
        }
      ], session);

      // Create notice with transaction session
      // Always include Admin in target audience so admin can see all notices
      const audienceList = targetAudience || ['All'];
      if (!audienceList.includes('Admin') && !audienceList.includes('All')) {
        audienceList.push('Admin');
      }
      
      const notice = new Notice({
        title,
        content,
        targetAudience: audienceList,
        priority: priority || 'medium',
        category: category || 'general',
        tags: tags || [],
        expiresAt: expiresAt || null,
        attachment: attachment || null,
        publishedBy: req.userId,
        status: 'draft'
      });

      // Save with session to ensure atomicity
      await notice.save({ session });
      console.log('Notice created', notice);
      // Validate notice was created successfully
      const createdNotice = await Notice.findById(notice._id).session(session);

      if (!createdNotice) {
        throw new AppError('Failed to create notice', 500);
      }

      // Log the action (outside transaction for performance)
      setImmediate(() => {
        logEvents(`${req.email} created a new notice: ${title}`, 'noticeLog.txt');
      });

      return createdNotice;
    }, {
      retries: 3,
      retryDelay: 100,
      readConcern: 'majority',
      writeConcern: { w: 'majority', j: true }
    });

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: result
    });

  } catch (error) {
    console.error('Create notice error:', error);
    logEvents(`Create notice error: ${error.message}`, 'errLog.txt');

    res.status(500).json({
      success: false,
      message: 'Failed to create notice',
      error: error.message
    });
  }
};

/**
 * @desc    Get all notices (with filtering and pagination) - Admin only
 * @route   GET /api/notices
 * @access  Private (Admin only)
 */
const getNotices = async (req, res) => {
  try {
    console.log('Get notices Block');
    const {
      page = 1,
      limit = 10,
      status = 'All',
      priority,
      category,
      targetAudience,
      search
    } = req.query;

    // Build filter object
    const filter = {};

    // Role-based filtering for target audience
    const userRole = req.role;
    if (userRole) {
      // Convert role number to string for comparison
      let roleString = '';
      switch (userRole[0]) {
        case 2001:
          roleString = 'Student';
          break;
        case 1984:
          roleString = 'Supervisor';
          break;
        case 5150:
          roleString = 'Admin';
          break;
        case 4334:
          roleString = 'Evaluator';
          break;
        default:
          roleString = 'Student'; // Default fallback
      }

      // Filter notices that are either for 'All' or for the specific user role
      filter.$or = [
        { targetAudience: { $in: ['All'] } },
        { targetAudience: { $in: [roleString] } }
      ];
    }

    // Add status filter
    if (status !== 'All') {
      filter.status = status;
    }

    // Add other filters
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Override targetAudience filter if provided (for admin use)
    if (targetAudience && userRole && userRole[0] === 5150) {
      filter.targetAudience = targetAudience;
      // Remove the role-based filter for admin
      delete filter.$or;
    }

    // Add search filter
    if (search) {
      const searchFilter = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      };

      // If we already have a $or filter for role-based filtering, combine them
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          searchFilter
        ];
        delete filter.$or;
      } else {
        Object.assign(filter, searchFilter);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get notices with pagination
    const notices = await Notice.find(filter)
      .populate('publishedBy', 'fullname email')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Notice.countDocuments(filter);

    res.json({
      success: true,
      data: {
        notices: notices,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get notices error:', error);
    logEvents(`Get notices error: ${error.message}`, 'errLog.txt');

    res.status(500).json({
      success: false,
      message: 'Failed to fetch notices',
      error: error.message
    });
  }
};

/**
 * @desc    Get a single notice by ID
 * @route   GET /api/notices/:id
 * @access  Private (Admin only)
 */
const getNotice = async (req, res) => {
  try {
    console.log('Get notice Block');
    const { id } = req.params;

    const notice = await Notice.findById(id)
      .populate('publishedBy', 'fullname email');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    res.json({
      success: true,
      data: notice
    });

  } catch (error) {
    console.error('Get notice error:', error);
    logEvents(`Get notice error: ${error.message}`, 'errLog.txt');

    res.status(500).json({
      success: false,
      message: 'Failed to fetch notice',
      error: error.message
    });
  }
};

/**
 * @desc    Update a notice
 * @route   PUT /api/notices/:id
 * @access  Private (Admin only)
 */
const updateNotice = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Execute within transaction for data consistency and ACID compliance
    const result = await transactionService.executeTransaction(async (session) => {
      // Find notice with session for consistency and locking
      const notice = await Notice.findById(id).session(session);

      if (!notice) {
        throw new AppError('Notice not found', 404);
      }

      // Check if user is the author or admin
      const userRoles = Array.isArray(req.role) ? req.role : [req.role];
      if (notice.publishedBy.toString() !== req.userId && !userRoles.includes(5150)) {
        throw new AppError('You can only update your own notices', 403);
      }

      // Handle targetAudience update properly to avoid duplication
      if (updateData.targetAudience) {
        // Filter out 'Admin' from frontend data since it's added automatically
        const frontendAudiences = updateData.targetAudience.filter(aud => aud !== 'Admin');
        
        // Ensure remaining values are valid frontend audiences
        const validFrontendAudiences = ['All', 'Student', 'Supervisor', 'Evaluator'];
        const invalidAudiences = frontendAudiences.filter(aud => !validFrontendAudiences.includes(aud));
        if (invalidAudiences.length > 0) {
          throw new AppError(`Invalid target audience values: ${invalidAudiences.join(', ')}`, 400);
        }
        
        // Always include Admin in target audience so admin can see all notices
        // Use Set to ensure no duplicates when adding Admin
        console.log('Frontend targetAudience (filtered):', frontendAudiences);
        const audienceSet = new Set(frontendAudiences);
        audienceSet.add('Admin');
        updateData.targetAudience = Array.from(audienceSet);
        console.log('Final targetAudience with Admin:', updateData.targetAudience);
      }

      // Use read-modify-write pattern for atomic update
      const updatedNotice = await transactionService.readModifyWrite(
        Notice,
        { _id: id },
        (doc) => {
          // Apply updates to the document
          Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
              doc[key] = updateData[key];
            }
          });
          return doc;
        },
        { session }
      );

      // Populate the publishedBy field
      await updatedNotice.populate('publishedBy', 'fullname email');

      // Log the action (outside transaction for performance)
      setImmediate(() => {
        logEvents(`${req.email} updated notice: ${updatedNotice.title}`, 'noticeLog.txt');
      });

      return updatedNotice;
    }, {
      retries: 3,
      retryDelay: 100,
      readConcern: 'majority',
      writeConcern: { w: 'majority', j: true }
    });

    res.json({
      success: true,
      message: 'Notice updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Update notice error:', error);
    logEvents(`Update notice error: ${error.message}`, 'errLog.txt');

    // Handle specific error types
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update notice',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a notice
 * @route   DELETE /api/notices/:id
 * @access  Private (Admin only)
 */
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    // Execute within transaction for data consistency and ACID compliance
    await transactionService.executeTransaction(async (session) => {
      // Find notice with session for consistency and locking
      const notice = await Notice.findById(id).session(session);

      if (!notice) {
        throw new AppError('Notice not found', 404);
      }

      // Check if user is the author or admin
      const userRoles = Array.isArray(req.role) ? req.role : [req.role];
      if (notice.publishedBy.toString() !== req.userId && !userRoles.includes(5150)) {
        throw new AppError('You can only delete your own notices', 403);
      }

      // Store notice data for logging before deletion
      const noticeData = {
        title: notice.title,
        publishedBy: notice.publishedBy,
        status: notice.status
      };

      // Delete notice with session to ensure atomicity
      const deleteResult = await Notice.findByIdAndDelete(id).session(session);

      if (!deleteResult) {
        throw new AppError('Failed to delete notice', 500);
      }

      // Log the action (outside transaction for performance)
      setImmediate(() => {
        logEvents(`${req.email} deleted notice: ${noticeData.title}`, 'noticeLog.txt');
      });

      return noticeData;
    }, {
      retries: 3,
      retryDelay: 100,
      readConcern: 'majority',
      writeConcern: { w: 'majority', j: true }
    });

    res.json({
      success: true,
      message: 'Notice deleted successfully'
    });

  } catch (error) {
    console.error('Delete notice error:', error);
    logEvents(`Delete notice error: ${error.message}`, 'errLog.txt');

    // Handle specific error types
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete notice',
      error: error.message
    });
  }
};

/**
 * @desc    Publish a notice
 * @route   PATCH /api/notices/:id/publish
 * @access  Private (Admin only)
 */
const publishNotice = async (req, res) => {
  try {
    const { id } = req.params;

    // Execute within transaction for data consistency and ACID compliance
    const result = await transactionService.executeTransaction(async (session) => {
      // Find notice with session for consistency and locking
      const notice = await Notice.findById(id).session(session);

      if (!notice) {
        throw new AppError('Notice not found', 404);
      }

      // Check if user is the author or admin
      const userRoles = Array.isArray(req.role) ? req.role : [req.role];
      if (notice.publishedBy.toString() !== req.userId && !userRoles.includes(5150)) {
        throw new AppError('You can only publish your own notices', 403);
      }

      // Check if notice is already published
      if (notice.status === 'published') {
        throw new AppError('Notice is already published', 400);
      }

      // Use read-modify-write pattern for atomic status update
      const updatedNotice = await transactionService.readModifyWrite(
        Notice,
        { _id: id },
        (doc) => {
          doc.status = 'published';
          doc.publishedAt = new Date();
          return doc;
        },
        { session }
      );

      // Log the action (outside transaction for performance)
      setImmediate(() => {
        logEvents(`${req.email} published notice: ${updatedNotice.title}`, 'noticeLog.txt');
      });

      return updatedNotice;
    }, {
      retries: 3,
      retryDelay: 100,
      readConcern: 'majority',
      writeConcern: { w: 'majority', j: true }
    });

    res.json({
      success: true,
      message: 'Notice published successfully',
      data: result
    });

  } catch (error) {
    console.error('Publish notice error:', error);
    logEvents(`Publish notice error: ${error.message}`, 'errLog.txt');

    // Handle specific error types
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to publish notice',
      error: error.message
    });
  }
};

/**
 * @desc    Archive a notice
 * @route   PATCH /api/notices/:id/archive
 * @access  Private (Admin only)
 */
const archiveNotice = async (req, res) => {
  try {
    const { id } = req.params;

    // Execute within transaction for data consistency and ACID compliance
    const result = await transactionService.executeTransaction(async (session) => {
      // Find notice with session for consistency and locking
      const notice = await Notice.findById(id).session(session);

      if (!notice) {
        throw new AppError('Notice not found', 404);
      }

      // Check if user is the author or admin
      const userRoles = Array.isArray(req.role) ? req.role : [req.role];
      if (notice.publishedBy.toString() !== req.userId && !userRoles.includes(5150)) {
        throw new AppError('You can only archive your own notices', 403);
      }

      // Check if notice is already archived
      if (notice.status === 'archived') {
        throw new AppError('Notice is already archived', 400);
      }

      // Use read-modify-write pattern for atomic status update
      const updatedNotice = await transactionService.readModifyWrite(
        Notice,
        { _id: id },
        (doc) => {
          doc.status = 'archived';
          return doc;
        },
        { session }
      );

      // Log the action (outside transaction for performance)
      setImmediate(() => {
        logEvents(`${req.email} archived notice: ${updatedNotice.title}`, 'noticeLog.txt');
      });

      return updatedNotice;
    }, {
      retries: 3,
      retryDelay: 100,
      readConcern: 'majority',
      writeConcern: { w: 'majority', j: true }
    });

    res.json({
      success: true,
      message: 'Notice archived successfully',
      data: result
    });

  } catch (error) {
    console.error('Archive notice error:', error);
    logEvents(`Archive notice error: ${error.message}`, 'errLog.txt');

    // Handle specific error types
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to archive notice',
      error: error.message
    });
  }
};

/**
 * @desc    Get notice statistics
 * @route   GET /api/notices/stats
 * @access  Private (Admin only)
 */
const getNoticeStats = async (req, res) => {
  try {
    const stats = await Notice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalNotices = await Notice.countDocuments();
    const publishedNotices = await Notice.countDocuments({ status: 'published' });
    const draftNotices = await Notice.countDocuments({ status: 'draft' });
    const archivedNotices = await Notice.countDocuments({ status: 'archived' });

    // Get notices by target audience
    const audienceStats = await Notice.aggregate([
      { $unwind: '$targetAudience' },
      {
        $group: {
          _id: '$targetAudience',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get notices by priority
    const priorityStats = await Notice.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: totalNotices,
        published: publishedNotices,
        draft: draftNotices,
        archived: archivedNotices,
        byAudience: audienceStats,
        byPriority: priorityStats
      }
    });

  } catch (error) {
    console.error('Get notice stats error:', error);
    logEvents(`Get notice stats error: ${error.message}`, 'errLog.txt');

    res.status(500).json({
      success: false,
      message: 'Failed to fetch notice statistics',
      error: error.message
    });
  }
};

module.exports = {
  createNotice,
  getNotices,
  getNotice,
  updateNotice,
  deleteNotice,
  publishNotice,
  archiveNotice,
  getNoticeStats
};
