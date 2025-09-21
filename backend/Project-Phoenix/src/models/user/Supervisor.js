const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcryptjs");

const supervisorSchema = new Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please, Enter your full name!"],
    },
    email: {
      type: String,
      required: [true, "Please your calid email address!"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email!!!"],
    },
    photo: String,
    password: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: [true, "Please enter your phone number!"],
    },
    role: {
      type: [Number],
    },
    designation: {
      type: String,
    },
    institution: {
      type: String,
    },
    skillSet: {
      type: [String],
    },
    refreshToken: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    OTP: {
      type: String,
      select: false // Hidden by default for security
    },
    OTPExpiry: {
      type: Date,
      select: false
    },
    // Admin user management fields
    isTemporaryPassword: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['PENDING_ACTIVATION', 'ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin'
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin'
    },
    lastPasswordChange: {
      type: Date,
      default: null
    },
    timeStamps: {
      type: Date,
      timestamps: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware for password hashing
supervisorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Only hash if password is not already hashed
  if (!this.password.startsWith('$2')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  next();
});

// Password comparison method
supervisorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Supervisor", supervisorSchema);
