const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcryptjs");

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Please your cvalid email address!"],
      unique:true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email!!!"],
    },
    fullname: {
      type: String,
      required: [true, "Please, Enter your full name!"],
    },
    photo: String,
    phoneNumber: {
      type: String,
    },
    role: {
      type: [Number],
    },
    password: {
      type: String,
    },
    refreshToken: String,
    OTP: String,
    OTPExpiry: Date,
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
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Skip hashing if password is already hashed (starts with $2)
  if (this.password && this.password.startsWith('$2')) {
    return next();
  }
  
  try {
    // Hash password with salt rounds of 10
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Since password is not selected by default, we need to check if it exists
    if (!this.password) {
      return false;
    }
    
    // Use bcrypt.compare for secure password comparison
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model("Admin", adminSchema);
