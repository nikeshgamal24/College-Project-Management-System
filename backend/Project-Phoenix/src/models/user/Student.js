const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const bcrypt = require("bcryptjs");

const studentSchema = new Schema(
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
    password: {
      type: String,
      minlength: 8,
      select: false, // Don't include password in queries by default
    },
    rollNumber: {
      type: Number,
    },
    batchNumber: {
      type: Number,
    },
    isAssociated: {
      type: Boolean,
      default: false,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    progressStatus: {
      type: String,
    },
    photo: String,
    phoneNumber: {
      type: String,
    },
    program: {
      type: Number,
    },
    role: {
      type: [Number],
    },
    refreshToken: {
      type: String,
      select: false, // Don't include refresh token in queries by default
    },
    OTP: {
      type: String,
      select: false // Hidden by default for security
    },
    OTPExpiry: {
      type: Date,
      select: false
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

// Indexes for better query performance
studentSchema.index({ rollNumber: 1, batchNumber: 1 }); // Compound index for roll and batch
studentSchema.index({ program: 1 }); // Index for program queries
studentSchema.index({ isAssociated: 1 }); // Index for association status
studentSchema.index({ progressStatus: 1 }); // Index for progress status
studentSchema.index({ role: 1 }); // Index for role-based queries



// Instance method to compare password
studentSchema.methods.comparePassword = async function(candidatePassword) {
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

// Pre-save middleware to hash password before saving (only if not already hashed)
studentSchema.pre('save', async function(next) {
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



module.exports = mongoose.model("Student", studentSchema);
