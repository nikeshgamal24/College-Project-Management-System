const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noticeSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: [200, 'Notice title cannot exceed 200 characters']
    },
    
    content: {
      type: String,
      required: [true, 'Notice content is required'],
      trim: true,
      maxlength: [2000, 'Notice content cannot exceed 2000 characters']
    },
    
    // Target audience for the notice
    targetAudience: {
      type: [String],
      required: [true, 'Target audience is required'],
      enum: {
        values: ['All', 'Student', 'Supervisor', 'Evaluator', 'Admin'],
        message: 'Invalid target audience'
      },
      default: ['All']
    },
    
    // Notice priority level
    priority: {
      type: String,
      required: [true, 'Notice priority is required'],
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Invalid priority level'
      },
      default: 'medium'
    },
    
    // Notice status
    status: {
      type: String,
      required: [true, 'Notice status is required'],
      enum: {
        values: ['draft', 'published', 'archived'],
        message: 'Invalid notice status'
      },
      default: 'draft'
    },
    
    // Optional attachment
    attachment: {
      fileName: {
        type: String,
        trim: true
      },
      filePath: {
        type: String,
        trim: true
      },
      fileSize: {
        type: Number,
        min: 0
      },
      fileType: {
        type: String,
        enum: {
          values: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
          message: 'File type must be JPG, PNG, JPEG, or PDF'
        }
      },
      originalName: {
        type: String,
        trim: true
      },
      url: {
        type: String,
        trim: true
      }
    },
    
    // Publishing information
    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Published by is required']
    },
    
    publishedAt: {
      type: Date,
      default: null
    },
    
    // Expiry date for the notice (optional)
    expiresAt: {
      type: Date,
      default: null
    },
    
    // Read tracking (optional - for analytics)
    readBy: [{
      user: {
        type: Schema.Types.ObjectId,
        refPath: 'readBy.userType'
      },
      userType: {
        type: String,
        enum: ['Student', 'Supervisor', 'Evaluator', 'Admin']
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    // Notice category for better organization
    category: {
      type: String,
      enum: {
        values: ['general', 'academic', 'deadline', 'policy', 'emergency', 'maintenance'],
        message: 'Invalid notice category'
      },
      default: 'general'
    },
    
    // Tags for better searchability
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot exceed 50 characters']
    }]
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
noticeSchema.index({ status: 1, publishedAt: -1 }); // For published notices
noticeSchema.index({ targetAudience: 1, status: 1 });
noticeSchema.index({ priority: 1, status: 1 });
noticeSchema.index({ category: 1, status: 1 });
noticeSchema.index({ publishedBy: 1 });
noticeSchema.index({ expiresAt: 1 });

// Virtual for checking if notice is expired
noticeSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Pre-save middleware to set publishedAt when status changes to published
noticeSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Method to check if user can read this notice
noticeSchema.methods.canBeReadBy = function(userRole) {
  if (this.status !== 'published') return false;
  if (this.isExpired) return false;
  if (this.targetAudience.includes('All')) return true;
  return this.targetAudience.includes(userRole.toLowerCase() + 's');
};

// Method to mark notice as read by user
noticeSchema.methods.markAsRead = function(userId, userType) {
  const existingRead = this.readBy.find(
    read => read.user.toString() === userId.toString() && read.userType === userType
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      userType: userType,
      readAt: new Date()
    });
  }
};

module.exports = mongoose.model('Notice', noticeSchema);
