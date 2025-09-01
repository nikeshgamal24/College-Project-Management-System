# Student Profile Settings

This module provides comprehensive profile management functionality for students in the Project Phoenix system.

## 🚀 Features

### 1. Profile Information Management
- **Edit Personal Details**: Update full name, phone number, roll number, and batch number
- **Program Information**: View current program details (read-only)
- **Real-time Updates**: Changes are immediately reflected in the system

### 2. Profile Photo Management
- **Photo Upload**: Upload new profile pictures (JPG, PNG, GIF)
- **File Validation**: Automatic file type and size validation (max 5MB)
- **Cloud Storage**: Photos are stored securely in cloud storage
- **Preview**: See current photo with fallback initials

### 3. Password Security
- **Current Password Verification**: Must provide current password to change
- **Strong Password Requirements**: Minimum 8 characters with complexity
- **Password Confirmation**: Double-entry to prevent typos
- **Secure Update**: Password changes are handled securely

## 🛠️ Technical Implementation

### Backend Components
- **Routes**: `/student/profile/:id` for profile management
- **Controllers**: Enhanced student controller with profile functions
- **Validation**: Joi schemas for data validation
- **File Upload**: Multer middleware for photo uploads
- **Security**: JWT verification and role-based access control

### Frontend Components
- **React Component**: `StudentProfileSettings.jsx`
- **State Management**: RTK Query for API calls
- **UI Components**: Modern, responsive design with shadcn/ui
- **Form Handling**: Controlled forms with validation
- **Error Handling**: Toast notifications for user feedback

## 📱 User Interface

### Design Features
- **Tabbed Interface**: Organized into Profile Info, Photo, and Password sections
- **Responsive Layout**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional design with consistent styling
- **Visual Feedback**: Loading states, success/error messages
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation

### Navigation
- **Settings Link**: Accessible from student dashboard profile card
- **Route**: `/{student-role}/settings`
- **Breadcrumb**: Clear navigation path

## 🔒 Security Features

### Authentication & Authorization
- **JWT Verification**: All requests require valid authentication
- **Role Verification**: Only students can access their own profiles
- **Self-Update Only**: Students can only modify their own data
- **Session Management**: Secure token handling

### Data Validation
- **Input Sanitization**: Prevents malicious input
- **Schema Validation**: Server-side validation with Joi
- **File Validation**: Secure file upload handling
- **Password Strength**: Enforced password complexity

## 📊 API Endpoints

### GET `/student/profile/:id`
- **Purpose**: Fetch student profile information
- **Response**: Student data with populated project information
- **Access**: Authenticated students only

### PUT `/student/profile/:id`
- **Purpose**: Update profile information
- **Body**: Profile data (fullname, phoneNumber, rollNumber, batchNumber)
- **Validation**: Joi schema validation
- **Access**: Student can only update their own profile

### PUT `/student/profile/:id/photo`
- **Purpose**: Update profile photo
- **Body**: FormData with photo file
- **Validation**: File type and size validation
- **Access**: Student can only update their own photo

### PUT `/student/profile/:id/password`
- **Purpose**: Change password
- **Body**: currentPassword, newPassword
- **Validation**: Password strength and current password verification
- **Access**: Student can only change their own password

## 🎯 Usage Instructions

### For Students
1. **Access Settings**: Click the settings icon (⚙️) in your profile card on the dashboard
2. **Edit Profile**: Go to "Profile Info" tab to update personal details
3. **Change Photo**: Use "Photo" tab to upload a new profile picture
4. **Update Password**: Navigate to "Password" tab for password changes
5. **Save Changes**: Click "Save Changes" button after making modifications

### For Developers
1. **Import Component**: `import StudentProfileSettings from '@/features/student/settings/StudentProfileSettings'`
2. **Add Route**: Include in student routes with path `/settings`
3. **API Integration**: Use provided RTK Query hooks for data management
4. **Styling**: Component uses shadcn/ui components for consistent design

## 🔧 Configuration

### Environment Variables
- **File Upload**: Configure cloud storage credentials
- **API Base URL**: Set in frontend configuration
- **File Size Limits**: Adjustable in backend configuration

### Customization
- **Validation Rules**: Modify Joi schemas for different requirements
- **UI Components**: Customize using shadcn/ui theming
- **File Types**: Adjust allowed file formats in validation
- **Password Policy**: Modify password complexity requirements

## 🐛 Troubleshooting

### Common Issues
1. **Photo Upload Fails**: Check file size (max 5MB) and format
2. **Validation Errors**: Ensure all required fields are filled correctly
3. **Password Change Fails**: Verify current password is correct
4. **Permission Denied**: Ensure user is logged in and has student role

### Debug Information
- **Console Logs**: Check browser console for frontend errors
- **Network Tab**: Monitor API requests and responses
- **Backend Logs**: Check server logs for validation or processing errors

## 📈 Future Enhancements

### Planned Features
- **Two-Factor Authentication**: Enhanced security options
- **Profile Export**: Download profile data
- **Activity History**: Track profile changes
- **Bulk Updates**: Update multiple fields at once
- **Profile Templates**: Predefined profile configurations

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live updates
- **Offline Support**: Service worker for offline functionality
- **Advanced Validation**: Client-side validation with real-time feedback
- **Performance**: Lazy loading and optimization

## 🤝 Contributing

When contributing to this feature:
1. **Follow Patterns**: Maintain existing code structure and naming conventions
2. **Add Tests**: Include unit tests for new functionality
3. **Update Docs**: Keep this README current with changes
4. **Security Review**: Ensure all security measures are maintained
5. **Accessibility**: Maintain WCAG compliance standards

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Project Phoenix Development Team
