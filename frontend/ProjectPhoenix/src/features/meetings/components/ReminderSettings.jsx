/**
 * Reminder Settings Component
 * Allows users to set general and personal reminders for meetings
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Bell, Users, User, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/config';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '@/features/auth/authSlice';

const ReminderSettings = ({ meeting, userRole, onReminderUpdate }) => {
  const token = useSelector(selectCurrentToken);
  const [generalReminder, setGeneralReminder] = useState({
    enabled: false,
    timeBefore: 30
  });
  const [personalReminder, setPersonalReminder] = useState({
    enabled: false,
    timeBefore: 15
  });
  const [isGeneralLoading, setIsGeneralLoading] = useState(false);
  const [isPersonalLoading, setIsPersonalLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Debug token
  console.log('ReminderSettings - Token from Redux:', token);
  console.log('ReminderSettings - Token type:', typeof token);

  // Load existing reminder settings
  useEffect(() => {
    if (meeting?.reminders) {
      setGeneralReminder({
        enabled: meeting.reminders.general?.enabled || false,
        timeBefore: meeting.reminders.general?.timeBefore || 30
      });
      setPersonalReminder({
        enabled: meeting.reminders.personal?.enabled || false,
        timeBefore: meeting.reminders.personal?.timeBefore || 15
      });
    }
  }, [meeting]);

  // Time options for reminders
  const timeOptions = [
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
    { value: 480, label: '8 hours' },
    { value: 1440, label: '24 hours' }
  ];

  // Set general reminder
  const handleSetGeneralReminder = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    console.log('🔔 General reminder button clicked');
    console.log('General reminder state:', generalReminder);
    
    if (!generalReminder.enabled) {
      toast.error('Please enable general reminder first');
      return;
    }

    setIsGeneralLoading(true);
    try {
      console.log('Setting general reminder with token:', token);

      const response = await fetch(`${API_BASE_URL}/reminders/general/${meeting._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          timeBefore: generalReminder.timeBefore
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('General reminder set successfully');
        setHasUnsavedChanges(false);
        onReminderUpdate && onReminderUpdate();
      } else {
        toast.error(data.message || 'Failed to set general reminder');
      }
    } catch (error) {
      console.error('Error setting general reminder:', error);
      if (error.message.includes('Unexpected token')) {
        toast.error('Authentication error - please log in again');
      } else {
        toast.error('Failed to set general reminder');
      }
    } finally {
      setIsGeneralLoading(false);
    }
  };

  // Set personal reminder
  const handleSetPersonalReminder = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    console.log('👤 Personal reminder button clicked');
    console.log('Personal reminder state:', personalReminder);
    
    if (!personalReminder.enabled) {
      toast.error('Please enable personal reminder first');
      return;
    }

    setIsPersonalLoading(true);
    try {
      console.log('Setting personal reminder with token:', token);
      const response = await fetch(`${API_BASE_URL}/reminders/personal/${meeting._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          timeBefore: personalReminder.timeBefore
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Personal reminder set successfully');
        setHasUnsavedChanges(false);
        onReminderUpdate && onReminderUpdate();
      } else {
        toast.error(data.message || 'Failed to set personal reminder');
      }
    } catch (error) {
      console.error('Error setting personal reminder:', error);
      if (error.message.includes('Unexpected token')) {
        toast.error('Authentication error - please log in again');
      } else {
        toast.error('Failed to set personal reminder');
      }
    } finally {
      setIsPersonalLoading(false);
    }
  };

  // Test reminder
  const handleTestReminder = async (type) => {
    setIsTesting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reminders/test/${meeting._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reminderType: type
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${type} reminder test sent successfully`);
      } else {
        toast.error(data.message || `Failed to send ${type} reminder test`);
      }
    } catch (error) {
      console.error(`Error testing ${type} reminder:`, error);
      if (error.message.includes('Unexpected token')) {
        toast.error('Authentication error - please log in again');
      } else {
        toast.error(`Failed to send ${type} reminder test`);
      }
    } finally {
      setIsTesting(false);
    }
  };

  // Update reminder settings
  const handleUpdateReminder = async (type, updates) => {
    const loadingSetter = type === 'general' ? setIsGeneralLoading : setIsPersonalLoading;
    loadingSetter(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reminders/${meeting._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reminderType: type,
          ...updates
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${type} reminder updated successfully`);
        setHasUnsavedChanges(false);
        onReminderUpdate && onReminderUpdate();
      } else {
        toast.error(data.message || `Failed to update ${type} reminder`);
      }
    } catch (error) {
      console.error(`Error updating ${type} reminder:`, error);
      if (error.message.includes('Unexpected token')) {
        toast.error('Authentication error - please log in again');
      } else {
        toast.error(`Failed to update ${type} reminder`);
      }
    } finally {
      const loadingSetter = type === 'general' ? setIsGeneralLoading : setIsPersonalLoading;
      loadingSetter(false);
    }
  };

  return (
    <div className="space-y-6">
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ You have unsaved changes. Click "Set Reminder" to save your settings.
          </p>
        </div>
      )}
      {/* General Reminder Settings */}
      <Card className="border border-blue-200 shadow-sm">
        <CardHeader className="pb-3 bg-blue-50/50 border-b border-blue-100">
          <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2">
            <Users className="w-4 h-4" />
            General Reminder
          </CardTitle>
          <p className="text-xs text-blue-600 mt-1">
            Sends reminder to all team members and supervisor
          </p>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="general-enabled" className="text-sm font-medium">
                Enable General Reminder
              </Label>
              <p className="text-xs text-gray-500">
                Notify all team members and supervisor
              </p>
            </div>
            <Switch
              id="general-enabled"
              checked={generalReminder.enabled}
              onCheckedChange={(checked) => {
                setGeneralReminder(prev => ({ ...prev, enabled: checked }));
                setHasUnsavedChanges(true);
                // Don't call API immediately - let user set time first
              }}
            />
          </div>

          {generalReminder.enabled && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="general-time" className="text-sm font-medium">
                  Remind Before Meeting
                </Label>
                <Select
                  value={generalReminder.timeBefore.toString()}
                  onValueChange={(value) => {
                    const timeBefore = parseInt(value);
                    setGeneralReminder(prev => ({ ...prev, timeBefore }));
                    setHasUnsavedChanges(true);
                    // Don't call API immediately - let user click "Set Reminder" button
                    console.log('General reminder time changed to:', timeBefore, 'minutes');
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSetGeneralReminder}
                  disabled={isGeneralLoading || isPersonalLoading}
                  className="flex-1"
                  size="sm"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {isGeneralLoading ? 'Setting...' : 'Set Reminder'}
                </Button>
                <Button
                  onClick={() => handleTestReminder('general')}
                  disabled={isTesting || isGeneralLoading || isPersonalLoading}
                  variant="outline"
                  size="sm"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isTesting ? 'Testing...' : 'Test'}
                </Button>
              </div>
              
              <Button
                onClick={() => handleUpdateReminder('general', { enabled: false })}
                disabled={isGeneralLoading || isPersonalLoading}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Disable General Reminder
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal Reminder Settings */}
      <Card className="border border-green-200 shadow-sm">
        <CardHeader className="pb-3 bg-green-50/50 border-b border-green-100">
          <CardTitle className="text-sm font-semibold text-green-800 flex items-center gap-2">
            <User className="w-4 h-4" />
            Personal Reminder
          </CardTitle>
          <p className="text-xs text-green-600 mt-1">
            {userRole === 'student' 
              ? 'Sends reminder to all students only' 
              : 'Sends reminder to you only'
            }
          </p>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="personal-enabled" className="text-sm font-medium">
                Enable Personal Reminder
              </Label>
              <p className="text-xs text-gray-500">
                {userRole === 'student' 
                  ? 'Notify all students in the team' 
                  : 'Notify only yourself'
                }
              </p>
            </div>
            <Switch
              id="personal-enabled"
              checked={personalReminder.enabled}
              onCheckedChange={(checked) => {
                setPersonalReminder(prev => ({ ...prev, enabled: checked }));
                setHasUnsavedChanges(true);
                // Don't call API immediately - let user set time first
              }}
            />
          </div>

          {personalReminder.enabled && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="personal-time" className="text-sm font-medium">
                  Remind Before Meeting
                </Label>
                <Select
                  value={personalReminder.timeBefore.toString()}
                  onValueChange={(value) => {
                    const timeBefore = parseInt(value);
                    setPersonalReminder(prev => ({ ...prev, timeBefore }));
                    setHasUnsavedChanges(true);
                    // Don't call API immediately - let user click "Set Reminder" button
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSetPersonalReminder}
                  disabled={isGeneralLoading || isPersonalLoading}
                  className="flex-1"
                  size="sm"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {isPersonalLoading ? 'Setting...' : 'Set Reminder'}
                </Button>
                <Button
                  onClick={() => handleTestReminder('personal')}
                  disabled={isTesting || isGeneralLoading || isPersonalLoading}
                  variant="outline"
                  size="sm"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isTesting ? 'Testing...' : 'Test'}
                </Button>
              </div>
              
              <Button
                onClick={() => handleUpdateReminder('personal', { enabled: false })}
                disabled={isGeneralLoading || isPersonalLoading}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                Disable Personal Reminder
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Status */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Current Reminder Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={generalReminder.enabled ? 'default' : 'secondary'}>
                  {generalReminder.enabled ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-sm font-medium">General</span>
              </div>
              {generalReminder.enabled && (
                <p className="text-xs text-gray-500">
                  {timeOptions.find(opt => opt.value === generalReminder.timeBefore)?.label} before meeting
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={personalReminder.enabled ? 'default' : 'secondary'}>
                  {personalReminder.enabled ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-sm font-medium">Personal</span>
              </div>
              {personalReminder.enabled && (
                <p className="text-xs text-gray-500">
                  {timeOptions.find(opt => opt.value === personalReminder.timeBefore)?.label} before meeting
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReminderSettings;

