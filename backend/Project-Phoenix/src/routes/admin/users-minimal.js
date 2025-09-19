const express = require("express");
const router = express.Router();
const userController = require("../../controllers/admin/userController");
const { verifyJWT } = require("../../middleware/auth/verifyJWT");
const verifyRoles = require("../../middleware/auth/verifyRoles");
const roleList = require("../../config/constants/roles");

// Test route
router.post(
  "/",
  (req, res) => {
    res.json({ message: "User creation route working" });
  }
);

module.exports = router;
