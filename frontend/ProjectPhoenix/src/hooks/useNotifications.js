import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/features/auth/authSlice';

// Mock notification data - in real app, this would come from API
const mockNotifications = {
  supervisor: {
    newStudentResponses: 2,
    newReports: 1,
    pendingEvaluations: 0,
    newProgressLogs: 3
  },
  student: {
    newFeedback: 1,
    projectUpdates: 2,
    newComments: 1,
    reportStatusUpdates: 1
  }
};

export const useNotifications = () => {
  const user = useSelector(selectCurrentUser);
  const [notifications, setNotifications] = useState({});

  // Load notifications based on user role
  useEffect(() => {
    if (user?.role) {
      const userNotifications = mockNotifications[user.role] || {};
      setNotifications(userNotifications);
    }
  }, [user?.role]);

  // Function to mark notification as read
  const markAsRead = useCallback((notificationType) => {
    setNotifications(prev => ({
      ...prev,
      [notificationType]: 0
    }));
  }, []);

  // Function to update notification count
  const updateNotification = useCallback((notificationType, count) => {
    setNotifications(prev => ({
      ...prev,
      [notificationType]: count
    }));
  }, []);

  // Get total notification count
  const getTotalCount = useCallback(() => {
    return Object.values(notifications).reduce((total, count) => total + count, 0);
  }, [notifications]);

  return {
    notifications,
    markAsRead,
    updateNotification,
    getTotalCount
  };
};
