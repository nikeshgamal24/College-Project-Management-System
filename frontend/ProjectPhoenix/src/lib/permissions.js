// Permission utility functions for role-based access control

/**
 * Check if user can edit a progress log
 * @param {Object} user - Current user object
 * @param {Object} progressLog - Progress log object
 * @returns {boolean} - Whether user can edit the progress log
 */
export const canEditProgressLog = (user, progressLog) => {
  // Must be a student
  if (!user || user.role !== 'student') {
    return false;
  }

  // Must be the author
  if (!progressLog.author || progressLog.author._id !== user._id) {
    return false;
  }

  // Must be unapproved
  if (progressLog.approved) {
    return false;
  }

  return true;
};

/**
 * Check if user can delete a progress log
 * @param {Object} user - Current user object
 * @param {Object} progressLog - Progress log object
 * @returns {boolean} - Whether user can delete the progress log
 */
export const canDeleteProgressLog = (user, progressLog) => {
  // Same conditions as edit
  return canEditProgressLog(user, progressLog);
};

/**
 * Check if user can edit a supervisor comment
 * @param {Object} user - Current user object
 * @param {Object} comment - Comment object
 * @returns {boolean} - Whether user can edit the comment
 */
export const canEditSupervisorComment = (user, comment) => {
  // Must be a supervisor
  if (!user || user.role !== 'supervisor') {
    return false;
  }

  // Must be the comment author
  if (!comment.commentedBy || comment.commentedBy._id !== user._id) {
    return false;
  }

  return true;
};

/**
 * Check if user can delete a supervisor comment
 * @param {Object} user - Current user object
 * @param {Object} comment - Comment object
 * @returns {boolean} - Whether user can delete the comment
 */
export const canDeleteSupervisorComment = (user, comment) => {
  // Same conditions as edit
  return canEditSupervisorComment(user, comment);
};

/**
 * Check if user can add supervisor comments
 * @param {Object} user - Current user object
 * @param {Object} progressLog - Progress log object
 * @returns {boolean} - Whether user can add comments
 */
export const canAddSupervisorComment = (user, progressLog) => {
  // Must be a supervisor
  if (!user || user.role !== 'supervisor') {
    return false;
  }

  // Progress log must exist
  if (!progressLog) {
    return false;
  }

  return true;
};

/**
 * Check if user can view supervisor comments
 * @param {Object} user - Current user object
 * @param {Object} progressLog - Progress log object
 * @returns {boolean} - Whether user can view comments
 */
export const canViewSupervisorComments = (user, progressLog) => {
  // Must be either student or supervisor
  if (!user || !['student', 'supervisor'].includes(user.role)) {
    return false;
  }

  // Progress log must exist
  if (!progressLog) {
    return false;
  }

  return true;
};
