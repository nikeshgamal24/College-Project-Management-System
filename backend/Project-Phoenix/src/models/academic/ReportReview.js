const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportReviewSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  reportType: {
    type: String,
    enum: ['proposal', 'mid', 'final'],
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reportFile: {
    filePath: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'needs_revision', 'rejected'],
    default: 'submitted'
  },
  supervisorFeedback: {
    overallComments: {
      type: String,
      default: ''
    },
    sectionFeedback: [{
      sectionTitle: {
        type: String,
        required: true
      },
      pageNumber: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      },
      feedbackType: {
        type: String,
        enum: ['suggestion', 'correction', 'praise', 'question'],
        default: 'suggestion'
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      commentedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Supervisor',
        required: true
      },
      commentedAt: {
        type: Date,
        default: Date.now
      }
    }],
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Supervisor'
    },
    reviewedAt: {
      type: Date
    },
    approvedAt: {
      type: Date
    }
  },
  studentResponse: {
    responseComments: {
      type: String,
      default: ''
    },
    respondedAt: {
      type: Date
    },
    resubmittedAt: {
      type: Date
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
reportReviewSchema.index({ projectId: 1, reportType: 1, version: -1 });
reportReviewSchema.index({ submittedBy: 1, status: 1 });
reportReviewSchema.index({ 'supervisorFeedback.reviewedBy': 1, status: 1 });

const ReportReview = mongoose.model('ReportReview', reportReviewSchema);

module.exports = ReportReview;
