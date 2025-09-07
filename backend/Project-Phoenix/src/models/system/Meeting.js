const mongoose = require('mongoose');
const roleList = require('../../config/constants/roles');

const meetingSchema = new mongoose.Schema({
    // Meeting Details
    title: {
        type: String,
        required: [true, 'Meeting title is required'],
        trim: true,
        maxlength: [200, 'Meeting title cannot exceed 200 characters']
    },

    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Meeting description cannot exceed 1000 characters']
    },

    meetingType: {
        type: String,
        required: [true, 'Meeting type is required'],
        enum: {
            values: ['progress_review', 'report_discussion', 'defense_prep', 'general_discussion', 'emergency_meeting'],
            message: 'Invalid meeting type'
        }
    },

    // Participants
    supervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supervisor',
        required: [true, 'Supervisor is required']
    },

    student: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student is required']
    }],

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project is required']
    },

    // Scheduling
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required']
    },

    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [15, 'Minimum duration is 15 minutes'],
        max: [240, 'Maximum duration is 240 minutes']
    },

    // Meeting Location/Platform
    meetingLocation: {
        type: String,
        enum: {
            values: ['physical_room', 'virtual_meeting', 'hybrid'],
            message: 'Invalid meeting location type'
        },
        default: 'virtual_meeting'
    },

    roomDetails: {
        roomNumber: String,
        building: String,
        floor: String
    },

    virtualMeetingLink: {
        platform: {
            type: String,
            enum: ['zoom', 'teams', 'google_meet', 'other']
        },
        link: String,
        meetingId: String,
        password: String
    },

    // Meeting Status
    status: {
        type: String,
        enum: {
            values: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'pending_approval', 'approved', 'rejected'],
            message: 'Invalid meeting status'
        },
        default: 'scheduled'
    },

    // Custom Request Fields
    isCustomRequest: {
        type: Boolean,
        default: false
    },

    customRequestReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Custom request reason cannot exceed 500 characters']
    },

    isFlexible: {
        type: Boolean,
        default: false
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supervisor'
    },

    approvedAt: {
        type: Date
    },

    rejectionReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    },

    // Meeting Management
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Creator is required'],
        refPath: 'createdByModel'
    },

    createdByModel: {
        type: String,
        enum: ['Student', 'Supervisor', 'Admin'],
        required: true
    },

    // Meeting Notes and Outcomes
    agenda: [{
        item: String,
        description: String,
        duration: Number
    }],

    meetingNotes: {
        type: String,
        trim: true
    },

    actionItems: [{
        item: String,
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'actionItems.assignedToModel'
        },
        assignedToModel: {
            type: String,
            enum: ['Student', 'Supervisor']
        },
        dueDate: Date,
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed'],
            default: 'pending'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        }
    }],

    // Meeting Feedback
    feedback: {
        studentRating: {
            type: Number,
            min: 1,
            max: 5
        },
        supervisorRating: {
            type: Number,
            min: 1,
            max: 5
        },
        studentComments: String,
        supervisorComments: String
    },

    // Recurring Meeting Support
    isRecurring: {
        type: Boolean,
        default: false
    },

    recurringPattern: {
        frequency: {
            type: String,
            enum: ['weekly', 'biweekly', 'monthly']
        },
        endDate: Date,
        occurrences: Number
    },

    parentMeeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting'
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    },

    // Reminder Settings
    reminders: {
        general: {
            enabled: {
                type: Boolean,
                default: false
            },
            timeBefore: {
                type: Number, // minutes before meeting
                min: 5,
                max: 1440 // max 24 hours
            },
            setBy: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'reminders.general.setByModel'
            },
            setByModel: {
                type: String,
                enum: ['Student', 'Supervisor', 'Admin']
            },
            setAt: {
                type: Date,
                default: Date.now
            }
        },
        personal: {
            enabled: {
                type: Boolean,
                default: false
            },
            timeBefore: {
                type: Number, // minutes before meeting
                min: 5,
                max: 1440 // max 24 hours
            },
            setBy: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: 'reminders.personal.setByModel'
            },
            setByModel: {
                type: String,
                enum: ['Student', 'Supervisor', 'Admin']
            },
            setAt: {
                type: Date,
                default: Date.now
            }
        }
    },

    // Meeting History
    history: [{
        action: {
            type: String,
            enum: ['created', 'rescheduled', 'cancelled', 'completed', 'notes_updated', 'reminder_set', 'reminder_updated']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,   
            refPath: 'history.performedByModel'
        },
        performedByModel: {
            type: String,
            enum: [roleList.Student, roleList.Supervisor, roleList.Admin,'System']
        },
        details: String
    }]
}, {
    timestamps: true
});

// Indexes for better performance
meetingSchema.index({ supervisor: 1, scheduledDate: 1 });
meetingSchema.index({ student: 1, scheduledDate: 1 });
meetingSchema.index({ project: 1, scheduledDate: 1 });
meetingSchema.index({ status: 1, scheduledDate: 1 });
meetingSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual for meeting end time
meetingSchema.virtual('endTime').get(function () {
    return new Date(this.scheduledDate.getTime() + (this.duration * 60000));
});

// Virtual for meeting duration in hours
meetingSchema.virtual('durationHours').get(function () {
    return this.duration / 60;
});

// Pre-save middleware to update history
meetingSchema.pre('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.updatedAt = new Date();
    }
    next();
});

// Instance method to check if meeting is in the past
meetingSchema.methods.isPast = function () {
    return this.scheduledDate < new Date();
};

// Instance method to check if meeting is today
meetingSchema.methods.isToday = function () {
    const today = new Date();
    const meetingDate = new Date(this.scheduledDate);
    return meetingDate.toDateString() === today.toDateString();
};

// Instance method to check if meeting is upcoming (within next 24 hours)
meetingSchema.methods.isUpcoming = function () {
    const now = new Date();
    const meetingTime = new Date(this.scheduledDate);
    const timeDiff = meetingTime.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
};

// Static method to find meetings by date range
meetingSchema.statics.findByDateRange = function (startDate, endDate, userId, userType) {
    const query = {
        scheduledDate: {
            $gte: startDate,
            $lte: endDate
        }
    };

    if (userType === 'student') {
        query.student = { $in: [userId] };
    } else if (userType === 'supervisor') {
        query.supervisor = userId;
    }

    return this.find(query)
        .populate('supervisor', 'fullname email photo')
        .populate('student', 'fullname email rollNumber photo')
        .populate('project', 'projectName')
        .sort({ scheduledDate: 1 });
};

// Static method to find available time slots
meetingSchema.statics.findAvailableSlots = function (supervisorId, studentId, date, duration = 60) {
    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0); // 9 AM

    const endOfDay = new Date(date);
    endOfDay.setHours(17, 0, 0, 0); // 5 PM

    return this.find({
        $or: [
            { supervisor: supervisorId },
            { student: { $in: [studentId] } }
        ],
        scheduledDate: {
            $gte: startOfDay,
            $lt: endOfDay
        },
        status: { $nin: ['cancelled'] }
    }).select('scheduledDate duration');
};

module.exports = mongoose.model('Meeting', meetingSchema);
