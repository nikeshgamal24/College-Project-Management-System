const Joi = require("joi");

const updateProfile = Joi.object({
  fullname: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
});

const requestPasswordOTP = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
});

const changePassword = Joi.object({
  newPassword: Joi.string().min(8).required(),
});

module.exports = {
  updateProfile,
  requestPasswordOTP,
  changePassword,
};
