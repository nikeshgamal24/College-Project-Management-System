const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const evaluatorSchema = new Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please, Enter your full name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide a valid email address!"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false, // Don't include password in queries by default
    },
    phoneNumber: {
      type: String,
      required: [true, "Please enter your phone number!"],
    },
    contact:{
     type:String,
    },
    currentDefense:{
      type:Schema.Types.ObjectId,
      ref:"Defense"
    },
    defense: [
      {
        defenseId: {
          type: Schema.Types.ObjectId,
          ref: "Defense",
        },
        accessCode: {
          type: String,
        },
      },
    ],
    refreshToken: {
      type: String,
    },
    role: {
      type: [Number],
    },
    evaluatorType: {
      type: String,
    },
    designation:{
      type:String,
    },
    institution:{
      type:String,
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
evaluatorSchema.pre('save', async function(next) {
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
evaluatorSchema.methods.comparePassword = async function(candidatePassword) {
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

module.exports = mongoose.model("Evaluator", evaluatorSchema);
