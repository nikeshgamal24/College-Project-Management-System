# Meeting Management System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Frontend Components](#frontend-components)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Workflow](#workflow)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)

## Overview

The Meeting Management System is a comprehensive solution for scheduling, managing, and tracking meetings between supervisors and students in the Project Phoenix application. It provides real-time collaboration features, conflict detection, and team-based meeting management.

### Key Capabilities
- **Smart Scheduling**: Automated conflict detection and availability checking
- **Team Collaboration**: All team members can view and manage meetings
- **Role-based Access**: Different permissions for supervisors, students, and admins
- **Real-time Updates**: Live calendar updates and notifications
- **Audit Trail**: Complete history tracking of all meeting changes
- **Task Management**: Action items and follow-up tasks

## Features

### 1. Meeting Scheduling
- **Custom Time Requests**: Students can request specific meeting times
- **Availability Checking**: Automatic conflict detection with existing meetings
- **Multiple Meeting Types**: Support for different meeting categories (proposal, mid-term, final, etc.)
- **Duration Management**: Configurable meeting durations
- **Location Support**: Physical and virtual meeting locations

### 2. Meeting Management
- **Edit Meetings**: Update meeting details, time, location, and type
- **Delete Meetings**: Remove meetings with proper authorization
- **Status Tracking**: Monitor meeting status (scheduled, completed, cancelled)
- **Approval Workflow**: Supervisors can approve/reject meeting requests

### 3. Team Collaboration
- **Shared Visibility**: All team members can see team meetings
- **Collective Management**: Any team member can edit/delete team meetings
- **Project Integration**: Meetings are linked to specific projects
- **Member Notifications**: Automatic notifications for all team members

### 4. Calendar Integration
- **Interactive Calendar**: Visual calendar with meeting display
- **Month Navigation**: Easy month-to-month navigation
- **Meeting Details**: Quick access to meeting information
- **Responsive Design**: Works on desktop and mobile devices

### 5. Audit & History
- **Change Tracking**: Complete history of all meeting modifications
- **Action Logging**: Who made changes and when
- **Details Recording**: Specific details about each change
- **Role Tracking**: Track which role performed each action

## Architecture

### System Overview
```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React Components]
        B[Redux Store]
        C[RTK Query]
        D[UI Components]
    end
    
    subgraph "API Layer"
        E[REST API Endpoints]
        F[Authentication Middleware]
        G[Authorization Middleware]
        H[Validation Middleware]
    end
    
    subgraph "Business Logic Layer"
        I[Meeting Controller]
        J[Permission Service]
        K[Conflict Detection]
        L[Notification Service]
    end
    
    subgraph "Data Layer"
        M[MongoDB Database]
        N[Meeting Model]
        O[User Model]
        P[Project Model]
    end
    
    A --> E
    B --> C
    C --> E
    D --> A
    
    E --> F
    F --> G
    G --> H
    H --> I
    
    I --> J
    I --> K
    I --> L
    I --> M
    
    M --> N
    M --> O
    M --> P
```

### Backend Architecture
```mermaid
graph LR
    subgraph "Controllers"
        A[meetingController.js]
        B[userController.js]
        C[projectController.js]
    end
    
    subgraph "Models"
        D[Meeting.js]
        E[User.js]
        F[Project.js]
    end
    
    subgraph "Routes"
        G[meetingRoutes.js]
        H[userRoutes.js]
        I[projectRoutes.js]
    end
    
    subgraph "Middleware"
        J[Authentication]
        K[Authorization]
        L[Validation]
    end
    
    subgraph "Services"
        M[Transaction Service]
        N[Email Service]
        O[Conflict Detection]
    end
    
    A --> D
    A --> M
    A --> N
    A --> O
    
    G --> A
    G --> J
    G --> K
    G --> L
    
    D --> P[(MongoDB)]
    E --> P
    F --> P
```

### Frontend Architecture
```mermaid
graph TB
    subgraph "UI Components"
        A[MeetingCalendar]
        B[MeetingScheduler]
        C[MeetingList]
        D[EditMeetingDialog]
    end
    
    subgraph "State Management"
        E[Redux Store]
        F[RTK Query Cache]
        G[Component State]
    end
    
    subgraph "API Integration"
        H[meetingApiSlice]
        I[userApiSlice]
        J[projectApiSlice]
    end
    
    subgraph "Utilities"
        K[Date Utilities]
        L[Validation Utils]
        M[Permission Utils]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    
    E --> F
    F --> H
    
    H --> N[Backend API]
    I --> N
    J --> N
    
    A --> K
    B --> L
    C --> M
    D --> L
```

### Data Flow Architecture
```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant S as Redux Store
    participant A as API Slice
    participant B as Backend
    participant D as Database
    
    U->>C: User Action
    C->>S: Dispatch Action
    S->>A: RTK Query Call
    A->>B: HTTP Request
    B->>D: Database Query
    D-->>B: Query Result
    B-->>A: API Response
    A-->>S: Update Cache
    S-->>C: State Update
    C-->>U: UI Update
```

## API Endpoints

### Meeting Management Endpoints

#### 1. Create Meeting
```http
POST /api/meetings
Authorization: Bearer <token>
Content-Type: application/json

{
  "supervisorId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "projectId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "scheduledDate": "2024-09-15T10:00:00.000Z",
  "duration": 60,
  "meetingType": "proposal",
  "location": "Room 101",
  "description": "Project proposal discussion"
}
```

#### 2. Get Available Slots
```http
GET /api/meetings/available-slots?supervisorId=64f1a2b3c4d5e6f7g8h9i0j1&projectId=64f1a2b3c4d5e6f7g8h9i0j2&date=2024-09-15&duration=60
Authorization: Bearer <token>
```

#### 3. Update Meeting
```http
PUT /api/meetings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduledDate": "2024-09-15T11:00:00.000Z",
  "duration": 90,
  "meetingType": "mid-term",
  "location": "Virtual Meeting",
  "description": "Updated meeting details"
}
```

#### 4. Delete Meeting
```http
DELETE /api/meetings/:id
Authorization: Bearer <token>
```

#### 5. Get Meetings
```http
GET /api/meetings?projectId=64f1a2b3c4d5e6f7g8h9i0j2&status=scheduled
Authorization: Bearer <token>
```

#### 6. Approve/Reject Meeting Request
```http
POST /api/meetings/:id/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approve", // or "reject"
  "comments": "Meeting approved for the requested time"
}
```

### Response Formats

#### Success Response
```json
{
  "status": "success",
  "message": "Meeting created successfully",
  "data": {
    "meeting": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "supervisor": "64f1a2b3c4d5e6f7g8h9i0j1",
      "student": ["64f1a2b3c4d5e6f7g8h9i0j4"],
      "projectId": "64f1a2b3c4d5e6f7g8h9i0j2",
      "scheduledDate": "2024-09-15T10:00:00.000Z",
      "duration": 60,
      "meetingType": "proposal",
      "location": "Room 101",
      "status": "scheduled",
      "history": [...],
      "actionItems": [...]
    }
  }
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Meeting conflict detected",
  "error": {
    "code": "CONFLICT_ERROR",
    "details": "Time slot already occupied"
  }
}
```

## Database Schema

### Meeting Model
```javascript
const meetingSchema = new Schema({
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'Supervisor',
    required: true
  },
  student: [{
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  }],
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  meetingType: {
    type: String,
    enum: ['proposal', 'mid-term', 'final', 'progress', 'other'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  meetingRequest: {
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Student'
    },
    requestedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    supervisorComments: String,
    respondedAt: Date
  },
  actionItems: [{
    item: {
      type: String,
      required: true
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Student'
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  history: [{
    action: {
      type: String,
      enum: ['created', 'rescheduled', 'cancelled', 'completed', 'notes_updated'],
      required: true
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      refPath: 'history.performedByModel'
    },
    performedByModel: {
      type: String,
      enum: ['Student', 'Supervisor', 'Admin']
    },
    details: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});
```

### Indexes
```javascript
// Compound indexes for efficient queries
meetingSchema.index({ supervisor: 1, scheduledDate: 1 });
meetingSchema.index({ student: 1, scheduledDate: 1 });
meetingSchema.index({ projectId: 1, scheduledDate: 1 });
meetingSchema.index({ status: 1, scheduledDate: 1 });
```

## Frontend Components

### 1. MeetingCalendar Component
**Purpose**: Displays meetings in a calendar format
**Features**:
- Month navigation
- Meeting display with status indicators
- Edit/Delete functionality
- Responsive design

**Props**:
```javascript
{
  meetings: Array,
  onEditMeeting: Function,
  onDeleteMeeting: Function,
  userRole: String,
  isLoading: Boolean
}
```

### 2. MeetingScheduler Component
**Purpose**: Form for creating new meetings
**Features**:
- Meeting type selection
- Date/time picker
- Location input
- Description field
- Validation

**Props**:
```javascript
{
  onSubmit: Function,
  isLoading: Boolean,
  supervisorId: String,
  projectId: String
}
```

### 3. MeetingList Component
**Purpose**: List view of meetings
**Features**:
- Sortable columns
- Filter options
- Pagination
- Bulk actions

**Props**:
```javascript
{
  meetings: Array,
  onEditMeeting: Function,
  onDeleteMeeting: Function,
  userRole: String
}
```

### 4. EditMeetingDialog Component
**Purpose**: Modal for editing meeting details
**Features**:
- Pre-populated form
- Validation
- Save/Cancel actions
- Real-time updates

**Props**:
```javascript
{
  meeting: Object,
  isOpen: Boolean,
  onClose: Function,
  onSave: Function,
  isLoading: Boolean
}
```

## User Roles & Permissions

### User Journey Diagram
```mermaid
journey
    title Meeting Management User Journey
    section Student Journey
      Login to System: 5: Student
      View Calendar: 4: Student
      Create Meeting Request: 3: Student
      Wait for Approval: 2: Student
      Attend Meeting: 5: Student
      Update Meeting: 4: Student
      Delete Meeting: 3: Student
    section Supervisor Journey
      Login to System: 5: Supervisor
      View Student Meetings: 4: Supervisor
      Review Meeting Requests: 3: Supervisor
      Approve/Reject Request: 4: Supervisor
      Create Meeting: 5: Supervisor
      Edit Meeting Details: 4: Supervisor
      Add Action Items: 4: Supervisor
    section Admin Journey
      Login to System: 5: Admin
      View All Meetings: 5: Admin
      Override Conflicts: 4: Admin
      Manage System: 5: Admin
      Access Reports: 4: Admin
```

### Permission Matrix
```mermaid
graph TD
    subgraph "User Roles"
        A[Admin]
        B[Supervisor]
        C[Student]
    end
    
    subgraph "Meeting Actions"
        D[Create Meeting]
        E[View Meeting]
        F[Edit Meeting]
        G[Delete Meeting]
        H[Approve Request]
        I[Add Action Items]
    end
    
    subgraph "Access Levels"
        J[Full Access]
        K[Project Access]
        L[Team Access]
        M[Own Access]
    end
    
    A --> J
    B --> K
    C --> L
    
    J --> D
    J --> E
    J --> F
    J --> G
    J --> H
    J --> I
    
    K --> D
    K --> E
    K --> F
    K --> G
    K --> H
    K --> I
    
    L --> D
    L --> E
    L --> F
    L --> G
    L --> I
```

### Supervisor Permissions
- ✅ Create meetings for their students
- ✅ Edit any meeting they're supervising
- ✅ Delete meetings they're supervising
- ✅ Approve/reject meeting requests
- ✅ View all meetings for their students
- ✅ Add action items to meetings

### Student Permissions
- ✅ Create meetings with their supervisor
- ✅ Edit meetings they're part of (team-based)
- ✅ Delete meetings they're part of (team-based)
- ✅ View all team meetings
- ✅ Request custom meeting times
- ✅ Respond to meeting requests

### Admin Permissions
- ✅ Full access to all meetings
- ✅ Edit/delete any meeting
- ✅ Override meeting conflicts
- ✅ Access to all meeting data
- ✅ System configuration

### Team-Based Permissions
- **Shared Visibility**: All team members can see team meetings
- **Collective Management**: Any team member can edit/delete team meetings
- **Project Integration**: Meetings are linked to project teams
- **Automatic Inclusion**: New meetings include all team members

## Workflow

### 1. Meeting Creation Workflow
```mermaid
flowchart TD
    A[User Initiates Meeting Creation] --> B{Check User Role}
    B -->|Student| C[Select Supervisor & Project]
    B -->|Supervisor| D[Select Student & Project]
    B -->|Admin| E[Select Any User & Project]
    
    C --> F[Fill Meeting Details]
    D --> F
    E --> F
    
    F --> G[Select Date & Time]
    G --> H[Check for Conflicts]
    H --> I{Conflict Detected?}
    
    I -->|Yes| J[Show Available Slots]
    J --> K[User Selects New Time]
    K --> H
    
    I -->|No| L[Validate Meeting Data]
    L --> M{Validation Passed?}
    
    M -->|No| N[Show Error Messages]
    N --> F
    
    M -->|Yes| O[Create Meeting Record]
    O --> P[Add All Team Members]
    P --> Q[Initialize History Log]
    Q --> R[Send Notifications]
    R --> S[Update Calendar Display]
    S --> T[Meeting Created Successfully]
```

### 2. Meeting Request Workflow
```mermaid
flowchart TD
    A[Student Requests Custom Time] --> B[Fill Request Form]
    B --> C[Submit Request]
    C --> D[Save as Pending Request]
    D --> E[Notify Supervisor]
    E --> F[Supervisor Reviews Request]
    F --> G{Supervisor Decision}
    
    G -->|Approve| H[Update Meeting Status]
    G -->|Reject| I[Add Rejection Comments]
    
    H --> J[Notify Student of Approval]
    I --> K[Notify Student of Rejection]
    
    J --> L[Meeting Scheduled]
    K --> M[Student Can Request New Time]
    M --> B
```

### 3. Meeting Update Workflow
```mermaid
flowchart TD
    A[User Clicks Edit Meeting] --> B{Check Permissions}
    B -->|No Permission| C[Show Access Denied]
    B -->|Has Permission| D[Load Meeting Details]
    
    D --> E[Display Edit Form]
    E --> F[User Modifies Details]
    F --> G[Validate New Data]
    G --> H{Validation Passed?}
    
    H -->|No| I[Show Validation Errors]
    I --> E
    
    H -->|Yes| J[Check for New Conflicts]
    J --> K{New Conflict?}
    
    K -->|Yes| L[Show Conflict Warning]
    L --> M{User Confirms Override?}
    M -->|No| E
    M -->|Yes| N[Update Meeting]
    
    K -->|No| N
    N --> O[Update History Log]
    O --> P[Notify All Team Members]
    P --> Q[Refresh Calendar Display]
    Q --> R[Meeting Updated Successfully]
```

### 4. Meeting Deletion Workflow
```mermaid
flowchart TD
    A[User Clicks Delete Meeting] --> B{Check Permissions}
    B -->|No Permission| C[Show Access Denied]
    B -->|Has Permission| D[Show Confirmation Dialog]
    
    D --> E{User Confirms Deletion?}
    E -->|No| F[Cancel Deletion]
    E -->|Yes| G[Check Meeting Status]
    
    G --> H{Can Delete?}
    H -->|No| I[Show Error Message]
    H -->|Yes| J[Soft Delete Meeting]
    
    J --> K[Update History Log]
    K --> L[Notify All Team Members]
    L --> M[Remove from Calendar]
    M --> N[Meeting Deleted Successfully]
```

### 5. Team-Based Permission System
```mermaid
flowchart TD
    A[User Action Request] --> B{Check User Role}
    B -->|Admin| C[Full Access Granted]
    B -->|Supervisor| D[Check if Supervising Project]
    B -->|Student| E[Check Team Membership]
    
    D --> F{Is Project Supervisor?}
    F -->|Yes| G[Supervisor Permissions]
    F -->|No| H[Access Denied]
    
    E --> I{Is Team Member?}
    I -->|Yes| J[Team Member Permissions]
    I -->|No| H
    
    G --> K[Can Create/Edit/Delete Meetings]
    J --> L[Can View/Edit/Delete Team Meetings]
    C --> M[Can Access All Meetings]
    
    K --> N[Execute Action]
    L --> N
    M --> N
```

### 6. Conflict Detection System
```mermaid
flowchart TD
    A[New Meeting Time Proposed] --> B[Get All Existing Meetings]
    B --> C[Filter by Date Range]
    C --> D[Check Supervisor Availability]
    D --> E[Check Team Member Availability]
    
    E --> F{Any Conflicts Found?}
    F -->|No| G[Time Slot Available]
    F -->|Yes| H[Analyze Conflict Details]
    
    H --> I[Check Meeting Duration Overlap]
    I --> J[Check Location Conflicts]
    J --> K[Generate Conflict Report]
    
    K --> L[Show Available Alternative Slots]
    L --> M[User Selects New Time]
    M --> N[Re-run Conflict Check]
    N --> F
    
    G --> O[Proceed with Meeting Creation]
```

### 7. Notification System Flow
```mermaid
flowchart TD
    A[Meeting Action Performed] --> B[Determine Notification Recipients]
    B --> C[Get Team Members]
    C --> D[Get Supervisor]
    D --> E[Get Meeting Creator]
    
    E --> F[Prepare Notification Content]
    F --> G[Generate Email Templates]
    G --> H[Queue Email Notifications]
    
    H --> I[Send to Team Members]
    H --> J[Send to Supervisor]
    H --> K[Send to Meeting Creator]
    
    I --> L[Update Notification Status]
    J --> L
    K --> L
    
    L --> M[Log Notification History]
    M --> N[Notifications Sent Successfully]
```

### 8. Calendar Display Logic
```mermaid
flowchart TD
    A[User Opens Calendar] --> B[Get User Role & Projects]
    B --> C[Fetch Relevant Meetings]
    C --> D[Filter by Date Range]
    D --> E[Group Meetings by Date]
    
    E --> F[Apply User Permissions]
    F --> G[Format Meeting Data]
    G --> H[Render Calendar Grid]
    
    H --> I[Display Meeting Cards]
    I --> J[Add Interactive Elements]
    J --> K[Enable Edit/Delete Actions]
    
    K --> L[Handle User Interactions]
    L --> M{User Action?}
    
    M -->|View Details| N[Show Meeting Modal]
    M -->|Edit Meeting| O[Open Edit Dialog]
    M -->|Delete Meeting| P[Show Delete Confirmation]
    M -->|Navigate Month| Q[Reload Calendar Data]
    
    N --> R[Display Complete Meeting Info]
    O --> S[Load Edit Form]
    P --> T[Confirm Deletion]
    Q --> C
```

## Configuration

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/project-phoenix

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=5000
NODE_ENV=development
```

### Meeting Types Configuration
```javascript
const MEETING_TYPES = [
  { value: 'proposal', label: 'Proposal Meeting', duration: 60 },
  { value: 'mid-term', label: 'Mid-term Review', duration: 90 },
  { value: 'final', label: 'Final Defense', duration: 120 },
  { value: 'progress', label: 'Progress Update', duration: 30 },
  { value: 'other', label: 'Other', duration: 60 }
];
```

### Time Slot Configuration
```javascript
const TIME_SLOTS = {
  startHour: 9,    // 9 AM
  endHour: 17,     // 5 PM
  slotDuration: 30, // 30 minutes
  workingDays: [1, 2, 3, 4, 5] // Monday to Friday
};
```

## Troubleshooting

### Common Issues

#### 1. Meeting Conflict Detection Not Working
**Symptoms**: Meetings can be scheduled at conflicting times
**Solutions**:
- Check if `getAvailableSlots` is being called correctly
- Verify project team members are properly populated
- Ensure time zone handling is correct

#### 2. Permission Denied Errors
**Symptoms**: Users can't edit/delete meetings they should have access to
**Solutions**:
- Verify user role in JWT token
- Check team membership in project
- Ensure proper role-based access control

#### 3. Calendar Not Updating
**Symptoms**: New meetings don't appear in calendar
**Solutions**:
- Check RTK Query cache invalidation
- Verify API response format
- Ensure proper data flow from backend to frontend

#### 4. Email Notifications Not Sending
**Symptoms**: No email notifications for meeting changes
**Solutions**:
- Check email service configuration
- Verify SMTP credentials
- Check email service status

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=meeting:*
```

### Logging
The system logs all meeting operations:
```javascript
console.log('Meeting created:', meetingId);
console.log('Conflict detected:', conflictDetails);
console.log('Permission check:', { userId, role, allowed });
```

## Best Practices

### 1. Performance Optimization
- Use database indexes for frequent queries
- Implement pagination for large meeting lists
- Cache frequently accessed data
- Optimize calendar rendering

### 2. Security
- Validate all input data
- Use proper authentication/authorization
- Sanitize user inputs
- Implement rate limiting

### 3. User Experience
- Provide clear error messages
- Implement loading states
- Use optimistic updates
- Ensure responsive design

### 4. Data Integrity
- Use database transactions
- Implement proper validation
- Maintain audit trails
- Handle edge cases

## System Integration

### Integration Architecture
```mermaid
graph TB
    subgraph "Project Phoenix Application"
        A[Meeting Management]
        B[User Management]
        C[Project Management]
        D[Report Review]
        E[Defense Management]
        F[Notification System]
    end
    
    subgraph "External Systems"
        G[Email Service]
        H[Calendar APIs]
        I[File Storage]
        J[Authentication Service]
    end
    
    subgraph "Database Layer"
        K[MongoDB]
        L[Meeting Collection]
        M[User Collection]
        N[Project Collection]
        O[Report Collection]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    
    A --> G
    A --> H
    A --> I
    A --> J
    
    A --> K
    B --> K
    C --> K
    D --> K
    E --> K
    
    K --> L
    K --> M
    K --> N
    K --> O
```

### Data Relationships
```mermaid
erDiagram
    MEETING ||--o{ USER : "supervisor/student"
    MEETING ||--|| PROJECT : "belongs to"
    MEETING ||--o{ ACTION_ITEM : "has"
    MEETING ||--o{ HISTORY : "tracks"
    
    PROJECT ||--o{ USER : "team members"
    PROJECT ||--o{ REPORT : "has"
    
    USER ||--o{ MEETING : "participates"
    USER ||--o{ PROJECT : "member of"
    USER ||--o{ REPORT : "submits"
    
    MEETING {
        ObjectId _id
        ObjectId supervisor
        ObjectId[] student
        ObjectId projectId
        Date scheduledDate
        Number duration
        String meetingType
        String location
        String status
        ObjectId[] actionItems
        ObjectId[] history
    }
    
    PROJECT {
        ObjectId _id
        String projectName
        String projectCode
        ObjectId[] teamMembers
        ObjectId supervisor
        String status
    }
    
    USER {
        ObjectId _id
        String firstName
        String lastName
        String email
        String role
        String status
    }
```

## Future Enhancements

### Planned Features
1. **Recurring Meetings**: Support for weekly/monthly recurring meetings
2. **Meeting Templates**: Pre-defined meeting structures
3. **Integration**: Calendar sync with external systems (Google Calendar, Outlook)
4. **Advanced Notifications**: SMS, push notifications
5. **Meeting Analytics**: Reports on meeting patterns and productivity
6. **Video Integration**: Built-in video conferencing
7. **Document Sharing**: Meeting-related document management
8. **Mobile App**: Native mobile application

### Technical Improvements
1. **Real-time Updates**: WebSocket integration for live updates
2. **Offline Support**: PWA capabilities for offline meeting management
3. **Advanced Search**: Full-text search across meeting content
4. **Bulk Operations**: Mass meeting management features
5. **API Versioning**: Proper API versioning strategy
6. **Performance Monitoring**: Application performance monitoring
7. **Automated Testing**: Comprehensive test coverage
8. **Documentation**: API documentation with Swagger/OpenAPI

### Integration Roadmap
```mermaid
gantt
    title Meeting Management Integration Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Basic Integration    :done,    basic, 2024-01-01, 2024-02-15
    User Management      :done,    user,  2024-01-15, 2024-02-28
    Project Integration  :done,    proj,  2024-02-01, 2024-03-15
    
    section Phase 2
    Report Integration   :done,    report, 2024-03-01, 2024-04-15
    Notification System  :done,    notify, 2024-03-15, 2024-04-30
    Team Collaboration   :done,    team,   2024-04-01, 2024-05-15
    
    section Phase 3
    External Calendar    :active,  extcal, 2024-05-01, 2024-06-30
    Video Integration    :         video,  2024-06-01, 2024-07-31
    Mobile App          :         mobile, 2024-07-01, 2024-08-31
    
    section Phase 4
    Analytics Dashboard  :         analytics, 2024-08-01, 2024-09-30
    Advanced Features    :         advanced,  2024-09-01, 2024-10-31
    Performance Optimization :     perf,      2024-10-01, 2024-11-30
```

---

*This documentation is maintained and updated regularly. For questions or contributions, please contact the development team.*
