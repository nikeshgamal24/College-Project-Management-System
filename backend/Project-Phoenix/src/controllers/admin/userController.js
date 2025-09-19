const Student = require("../../models/user/Student");
const Supervisor = require("../../models/user/Supervisor");
const Admin = require("../../models/user/Admin");
const Evaluator = require("../../models/user/Evaluator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const roleList = require("../../config/constants/roles");
const { AppError } = require("../../middleware/errorHandler");
const {
  extractRollAndBatch,
} = require("../helpers/validation/extractRollAndBatch");
const {
  initializeProgressStatus,
} = require("../helpers/project/initializeProgressStatus");
const emailService = require("../../services/email/emailService");

// Generate temporary password
const generateTemporaryPassword = () => {
  const length = 12;
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";

  // Ensure at least one character from each required type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase
  password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Special char

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Create single user
const createUser = async (req, res, next) => {
  try {
    const {
      fullname,
      email,
      phoneNumber,
      program,
      role,
      designation,
      institution,
      photo
    } = req.body;

    // Get user model based on role
    const getUserModel = (role) => {
      switch (role) {
        case roleList.Student:
          return Student;
        case roleList.Supervisor:
          return Supervisor;
        case roleList.Admin:
          return Admin;
        case roleList.Evaluator:
          return Evaluator;
        default:
          return null;
      }
    };

    const UserModel = getUserModel(role);
    if (!UserModel) {
      return next(new AppError('Invalid role specified', 400));
    }

    // Check for duplicate email across all user types
    const normalizedEmail = email.toLowerCase();
    const duplicate = await UserModel.findOne({ email: normalizedEmail }).exec();

    if (duplicate) {
      return next(new AppError('Email already exists', 409));
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Prepare user data
    let userData = {
      fullname,
      email: normalizedEmail,
      password: temporaryPassword, // Let the model's pre-save middleware hash it
      phoneNumber,
      role: [role],
      photo,
      isTemporaryPassword: true,
      status: 'PENDING_ACTIVATION',
      createdBy: req.userId, // Admin who created the user
      createdAt: new Date()
    };

    // Role-specific data preparation
    if (role === roleList.Student) {
      // Extract roll number and batch number from email
      const { rollNo, batchNo } = extractRollAndBatch(email);

      // Determine progress status based on batch
      const progressStatus = initializeProgressStatus(batchNo);

      // Convert program to number if it's a string
      const programValue = typeof program === 'string' ? parseInt(program, 10) : program;

      userData = {
        ...userData,
        rollNumber: rollNo,
        batchNumber: batchNo,
        program: programValue,
        progressStatus,
        isAssociated: false,
      };
    } else if (role === roleList.Supervisor) {
      userData = {
        ...userData,
        designation: designation || '',
        institution: institution || '',
        skillSet: [],
        isAvailable: true
      };
    } else if (role === roleList.Admin) {
      // Admin registration - no additional fields needed beyond base userData
      userData = {
        ...userData
      };
    } else if (role === roleList.Evaluator) {
      userData = {
        ...userData,
        designation: designation || '',
        institution: institution || '',
        evaluatorType: req.body.evaluatorType || '',
        contact: req.body.contact || '',
        defense: []
      };
    }

    // Create user
    const newUser = await UserModel.create(userData);

    // Prepare response (exclude sensitive data)
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // Send welcome email to the newly created user
    try {
      const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : '';
      await emailService.sendAccountCreationEmail(
        normalizedEmail,
        fullname,
        role,
        temporaryPassword,
        loginUrl
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the user creation if email fails
    }

    // Send response with temporary password (only for admin)
    res.status(201).json({
      status: 'success',
      message: `New ${role === roleList.Student ? 'student' : role === roleList.Supervisor ? 'supervisor' : role === roleList.Evaluator ? 'evaluator' : 'admin'} ${fullname} has been created successfully! Welcome email sent.`,
      data: {
        user: userResponse,
        temporaryPassword: temporaryPassword // Only sent to admin
      }
    });

  } catch (error) {
    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new AppError(`${field} already exists`, 409));
    }

    next(error);
  }
};

// Create multiple users (bulk creation)
const createBulkUsers = async (req, res, next) => {
  try {
    const { users } = req.body; // Array of user objects

    if (!Array.isArray(users) || users.length === 0) {
      return next(new AppError('Users array is required and cannot be empty', 400));
    }

    if (users.length > 100) {
      return next(new AppError('Cannot create more than 100 users at once', 400));
    }

    const results = {
      successful: [],
      failed: [],
      total: users.length
    };

    // Process each user
    for (const userData of users) {
      try {
        const {
          fullname,
          email,
          phoneNumber,
          program,
          role,
          designation,
          institution
        } = userData;

        // Get user model based on role
        const getUserModel = (role) => {
          switch (role) {
            case roleList.Student:
              return Student;
            case roleList.Supervisor:
              return Supervisor;
            case roleList.Admin:
              return Admin;
            case roleList.Evaluator:
              return Evaluator;
            default:
              return null;
          }
        };

        const UserModel = getUserModel(role);
        if (!UserModel) {
          results.failed.push({
            email: email,
            error: 'Invalid role specified'
          });
          continue;
        }

        // Check for duplicate email
        const normalizedEmail = email.toLowerCase();
        const duplicate = await UserModel.findOne({ email: normalizedEmail }).exec();

        if (duplicate) {
          results.failed.push({
            email: email,
            error: 'Email already exists'
          });
          continue;
        }

        // Generate temporary password
        const temporaryPassword = generateTemporaryPassword();

        // Prepare user data
        let user = {
          fullname,
          email: normalizedEmail,
          password: temporaryPassword, // Let the model's pre-save middleware hash it
          phoneNumber,
          role: [role],
          isTemporaryPassword: true,
          status: 'PENDING_ACTIVATION',
          createdBy: req.userId,
          createdAt: new Date()
        };

        // Role-specific data preparation
        if (role === roleList.Student) {
          const { rollNo, batchNo } = extractRollAndBatch(email);
          const progressStatus = initializeProgressStatus(batchNo);
          const programValue = typeof program === 'string' ? parseInt(program, 10) : program;

          user = {
            ...user,
            rollNumber: rollNo,
            batchNumber: batchNo,
            program: programValue,
            progressStatus,
            isAssociated: false,
          };
        } else if (role === roleList.Supervisor) {
          user = {
            ...user,
            designation: designation || '',
            institution: institution || '',
            skillSet: [],
            isAvailable: true
          };
        } else if (role === roleList.Evaluator) {
          user = {
            ...user,
            designation: designation || '',
            institution: institution || '',
            evaluatorType: userData.evaluatorType || '',
            contact: userData.contact || '',
            defense: []
          };
        }

        // Create user
        const newUser = await UserModel.create(user);

        // Prepare response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        // Send welcome email to the newly created user
        try {
          const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : '';
          await emailService.sendAccountCreationEmail(
            normalizedEmail,
            fullname,
            role,
            temporaryPassword,
            loginUrl
          );
        } catch (emailError) {
          console.error(`Failed to send welcome email to ${email}:`, emailError);
          // Don't fail the user creation if email fails
        }

        results.successful.push({
          user: userResponse,
          temporaryPassword: temporaryPassword
        });

      } catch (error) {
        results.failed.push({
          email: userData.email || 'unknown',
          error: error.message
        });
      }
    }

    res.status(201).json({
      status: 'success',
      message: `Bulk user creation completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      data: results
    });

  } catch (error) {
    next(error);
  }
};

// Get all users with filtering
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};

    if (role) {
      filter.role = { $in: [parseInt(role)] };
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users from all collections
    const [students, supervisors, admins, evaluators] = await Promise.all([
      Student.find(filter).select('-password').lean(),
      Supervisor.find(filter).select('-password').lean(),
      Admin.find(filter).select('-password').lean(),
      Evaluator.find(filter).select('-password').lean()
    ]);

    // Combine all users
    const allUsers = [...students, ...supervisors, ...admins, ...evaluators];

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    res.status(200).json({
      status: 'success',
      data: {
        users: paginatedUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(allUsers.length / limit),
          totalUsers: allUsers.length,
          usersPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};


// Update user details (admin only)
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      fullname,
      email,
      phoneNumber,
      status,
      program,
      designation,
      institution,
      evaluatorType,
      contact
    } = req.body;

    // Get user model based on role from query or find user first
    const { role } = req.query;

    let UserModel;
    if (role) {
      // If role is provided in query, use it (convert to number since query params are strings)
      const roleNumber = parseInt(role, 10);
      const getUserModel = (role) => {
        switch (role) {
          case roleList.Student:
            return Student;
          case roleList.Supervisor:
            return Supervisor;
          case roleList.Admin:
            return Admin;
          case roleList.Evaluator:
            return Evaluator;
          default:
            return null;
        }
      };
      UserModel = getUserModel(roleNumber);
    } else {
      // If no role provided, find user in all collections
      const [student, supervisor, admin, evaluator] = await Promise.all([
        Student.findById(userId).select('-password'),
        Supervisor.findById(userId).select('-password'),
        Admin.findById(userId).select('-password'),
        Evaluator.findById(userId).select('-password')
      ]);

      const user = student || supervisor || admin || evaluator;
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Determine which model to use based on found user
      if (student) UserModel = Student;
      else if (supervisor) UserModel = Supervisor;
      else if (admin) UserModel = Admin;
      else if (evaluator) UserModel = Evaluator;
    }

    if (!UserModel) {
      return next(new AppError('Invalid role specified', 400));
    }

    // Check for duplicate email if email is being updated
    if (email) {
      const normalizedEmail = email.toLowerCase();
      const duplicate = await UserModel.findOne({
        email: normalizedEmail,
        _id: { $ne: userId }
      }).exec();

      if (duplicate) {
        return next(new AppError('Email already exists', 409));
      }
    }

    // Prepare update data
    let updateData = {
      updatedAt: new Date(),
      updatedBy: req.userId
    };

    // Basic fields
    if (fullname) updateData.fullname = fullname;
    if (email) updateData.email = email.toLowerCase();
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (status) updateData.status = status;

    // Get current user to determine role
    const currentUser = await UserModel.findById(userId);
    if (!currentUser) {
      return next(new AppError('User not found', 404));
    }

    const userRole = currentUser.role[0];

    // Role-specific fields
    if (userRole === roleList.Student) {
      if (program !== undefined) {
        const programValue = typeof program === 'string' ? parseInt(program, 10) : program;
        updateData.program = programValue;
      }
    } else if (userRole === roleList.Supervisor) {
      if (designation !== undefined) updateData.designation = designation;
      if (institution !== undefined) updateData.institution = institution;
    } else if (userRole === roleList.Evaluator) {
      if (designation !== undefined) updateData.designation = designation;
      if (institution !== undefined) updateData.institution = institution;
      if (evaluatorType !== undefined) updateData.evaluatorType = evaluatorType;
      if (contact !== undefined) updateData.contact = contact;
    }

    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new AppError(`${field} already exists`, 409));
    }

    next(error);
  }
};

// Reset user password (admin only)
const resetUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    // Get user model based on role (convert to number since query params are strings)
    const roleNumber = parseInt(role, 10);
    const getUserModel = (role) => {
      switch (role) {
        case roleList.Student:
          return Student;
        case roleList.Supervisor:
          return Supervisor;
        case roleList.Admin:
          return Admin;
        case roleList.Evaluator:
          return Evaluator;
        default:
          return null;
      }
    };

    const UserModel = getUserModel(roleNumber);
    if (!UserModel) {
      return next(new AppError('Invalid role specified', 400));
    }

    // Generate new temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Find the user first to use save() method which triggers pre-save middleware
    const userToUpdate = await UserModel.findById(userId);
    if (!userToUpdate) {
      return next(new AppError('User not found', 404));
    }

    // Update user fields
    userToUpdate.password = temporaryPassword; // Let the model's pre-save middleware hash it
    userToUpdate.isTemporaryPassword = true;
    userToUpdate.status = 'PENDING_ACTIVATION';
    userToUpdate.updatedAt = new Date();
    userToUpdate.updatedBy = req.userId;

    // Save the user (this will trigger pre-save middleware for password hashing)
    await userToUpdate.save();

    // Get the updated user without password
    const user = await UserModel.findById(userId).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Send password reset email to the user
    try {
      const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : '';
      await emailService.sendAccountCreationEmail(
        user.email,
        user.fullname,
        user.role[0],
        temporaryPassword,
        loginUrl
      );
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the password reset if email fails
    }

    res.status(200).json({
      status: 'success',
      message: 'User password reset successfully. Reset email sent.',
      data: {
        user,
        temporaryPassword: temporaryPassword
      }
    });

  } catch (error) {
    next(error);
  }
};

// Delete user (admin only)
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    let UserModel;
    let deletedUser;

    if (role) {
      // If role is provided in query, use it (convert to number since query params are strings)
      const roleNumber = parseInt(role, 10);
      const getUserModel = (role) => {
        switch (role) {
          case roleList.Student:
            return Student;
          case roleList.Supervisor:
            return Supervisor;
          case roleList.Admin:
            return Admin;
          case roleList.Evaluator:
            return Evaluator;
          default:
            return null;
        }
      };
      UserModel = getUserModel(roleNumber);

      if (!UserModel) {
        return next(new AppError('Invalid role specified', 400));
      }

      // Delete user from specific collection
      deletedUser = await UserModel.findByIdAndDelete(userId);
    } else {
      // If no role provided, find and delete user from all collections
      const [student, supervisor, admin, evaluator] = await Promise.all([
        Student.findByIdAndDelete(userId),
        Supervisor.findByIdAndDelete(userId),
        Admin.findByIdAndDelete(userId),
        Evaluator.findByIdAndDelete(userId)
      ]);

      deletedUser = student || supervisor || admin || evaluator;
    }

    if (!deletedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      data: {
        user: {
          _id: deletedUser._id,
          fullname: deletedUser.fullname,
          email: deletedUser.email,
          role: deletedUser.role
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  createBulkUsers,
  getAllUsers,
  updateUser,
  resetUserPassword,
  deleteUser
};

