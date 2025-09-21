const Student = require("../../models/user/Student");
const Supervisor = require("../../models/user/Supervisor");
const Admin = require("../../models/user/Admin");
const Evaluator = require("../../models/user/Evaluator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const roleList = require("../../config/constants/roles");
const tokenService = require("../../services/auth/tokenService");
const { AppError } = require("../../middleware/errorHandler");

const handleLogin = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

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
console.log("🚀 ~ handleLogin ~ UserModel:", UserModel)
    console.log("🚀 ~ handleLogin ~ Email:", email)
    console.log("🚀 ~ handleLogin ~ Role:", role)
    // Find user by email and role
    const foundUser = await UserModel.findOne({
      email: email.toLowerCase(),
      role: { $in: [role] },
    }).select('+password').exec();
    
    console.log("🚀 ~ handleLogin ~ foundUser:", foundUser)

    if (!foundUser) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Verify password using bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    console.log("🚀 ~ handleLogin ~ isPasswordValid:", isPasswordValid);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check user status - prevent login for deactivated or suspended users
    if (foundUser.status === 'INACTIVE') {
      return next(new AppError('Your account has been deactivated. Please contact an administrator.', 403));
    }
    
    if (foundUser.status === 'SUSPENDED') {
      return next(new AppError('Your account has been suspended. Please contact an administrator.', 403));
    }

    // Update user status to ACTIVE if they were PENDING_ACTIVATION
    // Allow users to login with temporary password - password change will be in settings
    if (foundUser.status === 'PENDING_ACTIVATION') {
      foundUser.status = 'ACTIVE';
      // Keep isTemporaryPassword as true - user can change it in settings later
      await foundUser.save();
    }

    // Get user roles
    const userRoles = Object.values(foundUser.role);

    // Create tokens using token service
    const accessToken = tokenService.createAccessToken(
      foundUser,
      userRoles,
      process.env.ACCESS_TOKEN_EXPIRATION_TIME
    );

    const refreshToken = tokenService.createRefreshToken(
      foundUser,
      process.env.REFRESH_TOKEN_EXPIRATION_TIME
    );


    console.log("🚀 ~ handleEvaluatorLogin ~ refreshToken:", refreshToken)
    console.log("🚀 ~ handleEvaluatorLogin ~ accessToken:", accessToken)

    // Save refresh token and update user
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Set refresh token in cookie
    tokenService.setCookie(res, refreshToken);

    // Set access token in cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 15 * 60 * 1000, // 15 minutes (matches access token expiration)
    });

    // Prepare user response (exclude sensitive data)
    const userResponse = foundUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;
    delete userResponse.OTP;

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken,
        user: userResponse,
      },
    });

  } catch (error) {
    next(error);
  }
};

const handleEvaluatorLogin = async (req, res, next) => {
  try {
    const { accessCode, role } = req.body;

    // Find evaluators with the specified role
    const evaluators = await Evaluator.find({ role }).exec();

    if (!evaluators || evaluators.length === 0) {
      return next(new AppError('No evaluators found for this role', 404));
    }

    let foundUser = null;
    let currentDefenseId = null;

    // Search for evaluator with matching access code
    evaluatorLoop: for (const evaluator of evaluators) {
      for (const defenseObj of evaluator.defense) {
        if (defenseObj.accessCode) {
          const isAccessCodeValid = await bcrypt.compare(
            accessCode,
            defenseObj.accessCode
          );

          if (isAccessCodeValid) {
            foundUser = evaluator;
            currentDefenseId = defenseObj.defenseId;
            break evaluatorLoop;
          }
        }
      }
    }

    if (!foundUser) {
      return next(new AppError('Invalid access code', 401));
    }

    // Check user status - prevent login for deactivated or suspended evaluators
    if (foundUser.status === 'INACTIVE') {
      return next(new AppError('Your account has been deactivated. Please contact an administrator.', 403));
    }
    
    if (foundUser.status === 'SUSPENDED') {
      return next(new AppError('Your account has been suspended. Please contact an administrator.', 403));
    }

    // Get user roles
    const userRoles = Object.values(foundUser.role);

    // Create tokens using token service
    const accessToken = tokenService.createAccessToken(
      foundUser,
      userRoles,
      process.env.ACCESS_TOKEN_EXPIRATION_TIME
    );

    const refreshToken = tokenService.createRefreshToken(
      foundUser,
      process.env.REFRESH_TOKEN_EXPIRATION_TIME
    );

    // Update evaluator with current defense and refresh token
    foundUser.currentDefense = currentDefenseId;
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Set refresh token in cookie
    tokenService.setCookie(res, refreshToken);

    // Set access token in cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 15 * 60 * 1000, // 15 minutes (matches access token expiration)
    });

    // Prepare user response (exclude sensitive data)
    const userResponse = foundUser.toObject();
    delete userResponse.refreshToken;

    // Remove access codes from defense objects
    if (userResponse.defense) {
      userResponse.defense.forEach(defenseObj => {
        delete defenseObj.accessCode;
      });
    }

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Evaluator login successful',
      data: {
        accessToken,
        user: userResponse,
      },
    });

  } catch (error) {
    next(error);
  }
};

// Change temporary password
const changeTemporaryPassword = async (req, res, next) => {
  try {
    const { userId, newPassword, role } = req.body;

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

    // Find user
    const user = await UserModel.findById(userId).select('+password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if user has temporary password
    if (!user.isTemporaryPassword) {
      return next(new AppError('User does not have a temporary password', 400));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    user.password = hashedPassword;
    user.isTemporaryPassword = false;
    user.status = 'ACTIVE';
    user.lastPasswordChange = new Date();
    await user.save();

    // Prepare response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { handleLogin, handleEvaluatorLogin, changeTemporaryPassword };
