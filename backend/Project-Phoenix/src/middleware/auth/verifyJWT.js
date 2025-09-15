const jwt = require("jsonwebtoken");
require("dotenv").config();
const roleList = require("../../config/constants/roles");
const Student = require("../../models/user/Student");
const Supervisor = require("../../models/user/Supervisor");
const Admin = require("../../models/user/Admin");
const Evaluator = require("../../models/user/Evaluator");
 
const verifyJWT = (req, res, next) => {
  // Check for token in Authorization header first
  let authHeader = req.headers.authorization || req.headers.Authorization;
  let token = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    // Check for token in cookies
    const cookies = req.cookies;
    if (cookies && cookies.accessToken) {
      token = cookies.accessToken;
    }
  }

  // console.log('Headers:', req.headers.authorization);
  // console.log('Headers:', req.headers.Authorization);
  // console.log('Auth header:', authHeader);
  // console.log('Cookies:', req.cookies);
  // console.log('Token from cookies:', req.cookies?.accessToken);
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - No token provided',
      status: 'fail'
    });
  }

  // console.log('Token:', token);
  // console.log('Access token secret:', process.env.ACCESS_TOKEN_SECRET);
  // Verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Invalid token',
        status: 'fail'
      });
    }

    let freshUser;
    const email = decoded.UserInfo.email;
    const role = decoded.UserInfo.role;

    try {
      if (role.includes(roleList.Student)) {
        freshUser = await Student.findOne({ email }).exec();
      } else if (role.includes(roleList.Supervisor)) {
        freshUser = await Supervisor.findOne({ email }).exec();
      } else if (role.includes(roleList.Admin)) {
        freshUser = await Admin.findOne({ email }).exec();
      } else if (role.includes(roleList.Evaluator)) {
        freshUser = await Evaluator.findOne({ email }).exec();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Bad request - Invalid role',
          status: 'fail'
        });
      }

      if (!freshUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          status: 'fail'
        });
      }

      req.email = email;
      req.role = role;
      req.userId = freshUser._id;
      req.user = {
        userId: freshUser._id,
        userRole: role
      };
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        status: 'error'
      });
    }
  });
};

module.exports = verifyJWT;
