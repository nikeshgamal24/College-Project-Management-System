const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const progressLogSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  logDate: {
    type: Date,
    default: Date.now
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Student', 
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedDate: {
    type: Date,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Supervisor',
  },
  supervisorComments: [{
    comment: {
      type: String,
      required: true
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
  }]
});

const ProgressLog = mongoose.model('ProgressLog', progressLogSchema);

module.exports = ProgressLog;
