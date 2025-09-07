import React, { useState } from 'react';
import { format, isToday, isTomorrow, isYesterday, isPast, isFuture } from 'date-fns';
import { Calendar, Clock, MapPin, Video, Users, MoreHorizontal, Edit, Trash2, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetMeetingsQuery, useUpdateMeetingMutation, useCancelMeetingMutation } from '../meetingApiSlice';
import { toast } from 'sonner';
import ReminderSettings from './ReminderSettings';

const MEETING_TYPE_ICONS = {
  progress_review: '📊',
  report_discussion: '📝',
  defense_prep: '🎯',
  general_discussion: '💬',
  emergency_meeting: '🚨',
};

const MEETING_TYPE_COLORS = {
  progress_review: 'bg-blue-100 text-blue-800 border-blue-200',
  report_discussion: 'bg-green-100 text-green-800 border-green-200',
  defense_prep: 'bg-purple-100 text-purple-800 border-purple-200',
  general_discussion: 'bg-gray-100 text-gray-800 border-gray-200',
  emergency_meeting: 'bg-red-100 text-red-800 border-red-200',
};

const MeetingList = ({ userId, userRole, filters = {} }) => {
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [cancellingMeeting, setCancellingMeeting] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [selectedMeetingForReminder, setSelectedMeetingForReminder] = useState(null);

  // Helper function to safely convert date strings to Date objects
  const safeDate = (dateString) => {
    if (!dateString) return new Date();
    return new Date(dateString);
  };

  const { data: meetings, isLoading } = useGetMeetingsQuery(filters);
  const [updateMeeting, { isLoading: isUpdating }] = useUpdateMeetingMutation();
  const [cancelMeeting, { isLoading: isCancelling }] = useCancelMeetingMutation();

  const meetingsList = meetings?.data || [];

  // Get relative date string
  const getRelativeDate = (date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM do, yyyy');
  };

  // Get meeting status color
  const getMeetingStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-medium';
      case 'confirmed':
        return 'bg-green-100 text-green-900 border-green-300 font-medium';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300 font-medium';
      case 'completed':
        return 'bg-gray-100 text-gray-900 border-gray-300 font-medium';
      case 'cancelled':
        return 'bg-red-100 text-red-900 border-red-300 font-medium';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-medium';
      case 'pending_approval':
        return 'bg-orange-100 text-orange-900 border-orange-300 font-medium';
      case 'approved':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-medium';
      case 'rejected':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-medium';
      default:
        return 'bg-gray-100 text-gray-900 border-gray-300 font-medium';
    }
  };

  // Get location icon
  const getLocationIcon = (location) => {
    switch (location) {
      case 'virtual_meeting':
        return <Video className="w-4 h-4" />;
      case 'physical_room':
        return <MapPin className="w-4 h-4" />;
      case 'hybrid':
        return <Users className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  // Handle meeting update
  const handleUpdateMeeting = async (meetingId, updateData) => {
    try {
      await updateMeeting({ id: meetingId, ...updateData }).unwrap();
      toast.success('Meeting updated successfully!');
      setEditingMeeting(null);
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update meeting');
    }
  };

  // Handle meeting cancellation
  const handleCancelMeeting = async () => {
    if (!cancellingMeeting) return;

    try {
      await cancelMeeting({ id: cancellingMeeting._id, reason: cancelReason }).unwrap();
      toast.success('Meeting cancelled successfully!');
      setCancellingMeeting(null);
      setCancelReason('');
    } catch (error) {
      toast.error(error.data?.message || 'Failed to cancel meeting');
    }
  };

  // Check if meeting can be edited
  const canEditMeeting = (meeting) => {
    // Only supervisors and admins can edit meetings after they are created
    if (userRole === 'student') return false;
    if (meeting.status === 'completed' || meeting.status === 'cancelled') return false;
    if (isPast(new Date(meeting.scheduledDate))) return false;
    return true;
  };

  // Check if meeting can be cancelled
  const canCancelMeeting = (meeting) => {
    // Only supervisors and admins can cancel meetings after they are created
    if (userRole === 'student') return false;
    if (meeting.status === 'completed' || meeting.status === 'cancelled') return false;
    return true;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading meetings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Reminder Management Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <Bell className="w-4 h-4 text-green-600" />
                Meeting Reminders
              </CardTitle>
              <p className="text-xs text-gray-600 mt-1">
                Set reminders for your upcoming meetings
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {meetingsList.length} meeting{meetingsList.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {meetingsList.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-3">
                Click on any meeting below to set reminders
              </p>
              <div className="grid gap-2">
                {meetingsList.slice(0, 3).map(meeting => (
                  <div key={meeting._id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">{meeting.title}</span>
                      <span className="text-xs text-gray-500">
                        {format(safeDate(meeting.scheduledDate), 'MMM do, h:mm a')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMeetingStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedMeetingForReminder(meeting);
                        setShowReminderSettings(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs"
                    >
                      <Bell className="w-3 h-3 mr-1" />
                      Set Reminder
                    </Button>
                  </div>
                ))}
                {meetingsList.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    And {meetingsList.length - 3} more meetings...
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No meetings found to set reminders</p>
            </div>
          )}
        </CardContent>
      </Card>

      {meetingsList.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No meetings found</h3>
            <p className="text-gray-500">No meetings match your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        meetingsList.map(meeting => (
          <Card key={meeting._id} className="hover:shadow-md hover:bg-gray-50 transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  {/* Meeting Header */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {MEETING_TYPE_ICONS[meeting.meetingType] || '📅'}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                      
                      {/* Optimized meeting details layout */}
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <div className="grid grid-cols-4 gap-3 text-sm">
                          <div className="flex flex-col items-center text-center">
                            <Calendar className="w-4 h-4 text-blue-600 mb-1" />
                            <div className="font-medium text-gray-700 text-xs">
                              {getRelativeDate(safeDate(meeting.scheduledDate))}
                            </div>
                            <div className="text-gray-500 text-xs">Date</div>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <Clock className="w-4 h-4 text-green-600 mb-1" />
                            <div className="font-medium text-gray-700">
                              {format(safeDate(meeting.scheduledDate), 'h:mm a')}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {format(new Date(safeDate(meeting.scheduledDate).getTime() + meeting.duration * 60000), 'h:mm a')}
                            </div>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            {getLocationIcon(meeting.meetingLocation)}
                            <div className="font-medium text-gray-700 mt-1">
                              {meeting.meetingLocation === 'virtual_meeting' ? 'Virtual' : 
                               meeting.meetingLocation === 'physical_room' ? 'Physical' : 'Hybrid'}
                            </div>
                            <div className="text-gray-500 text-xs">Location</div>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                              <span className="text-orange-600 text-xs font-bold">⏱</span>
                            </div>
                            <div className="font-medium text-gray-700">{meeting.duration}</div>
                            <div className="text-gray-500 text-xs">minutes</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  {meeting.description && (
                    <p className="text-gray-600">{meeting.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <strong>Project:</strong> {meeting.project?.projectName}
                    </div>
                    {userRole === 'student' && (
                      <div>
                        <strong>Supervisor:</strong> {meeting.supervisor?.fullname}
                      </div>
                    )}
                    {userRole === 'supervisor' && (
                      <div>
                        <strong>Student:</strong> {meeting.student?.[0]?.fullname || 'Multiple students'}
                      </div>
                    )}
                    <div>
                      <strong>Duration:</strong> {meeting.duration} minutes
                    </div>
                  </div>

                  {/* Meeting Location Details */}
                  {meeting.meetingLocation === 'physical_room' && meeting.roomDetails && (
                    <div className="text-sm text-gray-600">
                      <strong>Room:</strong> {meeting.roomDetails.roomNumber} 
                      {meeting.roomDetails.building && `, ${meeting.roomDetails.building}`}
                      {meeting.roomDetails.floor && `, ${meeting.roomDetails.floor}`}
                    </div>
                  )}

                  {meeting.meetingLocation === 'virtual_meeting' && meeting.virtualMeetingLink && (
                    <div className="text-sm">
                      <strong>Meeting Link:</strong> 
                      {meeting.virtualMeetingLink.link ? (
                        <a 
                          href={meeting.virtualMeetingLink.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline ml-1"
                        >
                          Join Meeting
                        </a>
                      ) : (
                        <span className="text-gray-500 ml-1">Link not provided</span>
                      )}
                      {meeting.virtualMeetingLink.meetingId && (
                        <span className="ml-2">
                          <strong>ID:</strong> {meeting.virtualMeetingLink.meetingId}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Agenda */}
                  {meeting.agenda && meeting.agenda.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Agenda:</div>
                      <div className="space-y-1">
                        {meeting.agenda.map((item, index) => (
                          <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>{item.item}</span>
                            {item.duration && (
                              <span className="text-xs text-gray-500">({item.duration} min)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  {meeting.actionItems && meeting.actionItems.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Action Items:</div>
                      <div className="space-y-1">
                        {meeting.actionItems.map((item, index) => (
                          <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              item.status === 'completed' ? 'bg-green-500' :
                              item.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}></span>
                            <span>{item.item}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Meeting Actions */}
                <div className="flex items-center gap-2">
                  <div className={`${getMeetingStatusColor(meeting.status)} px-2 py-1 rounded-full text-xs font-medium hover:shadow-sm transition-all duration-200`}>
                    {meeting.status}
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                      <div className="space-y-1">
                        {canEditMeeting(meeting) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setEditingMeeting(meeting)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Meeting
                          </Button>
                        )}
                        {canCancelMeeting(meeting) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-red-600 hover:text-red-700"
                            onClick={() => setCancellingMeeting(meeting)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel Meeting
                          </Button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Edit Meeting Dialog */}
      {editingMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Meeting</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  defaultValue={editingMeeting.title}
                  onChange={(e) => setEditingMeeting({...editingMeeting, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={editingMeeting.description}
                  onChange={(e) => setEditingMeeting({...editingMeeting, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingMeeting.status}
                  onValueChange={(value) => setEditingMeeting({...editingMeeting, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setEditingMeeting(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleUpdateMeeting(editingMeeting._id, {
                  title: editingMeeting.title,
                  description: editingMeeting.description,
                  status: editingMeeting.status
                })}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Meeting Dialog */}
      <AlertDialog open={!!cancellingMeeting} onOpenChange={() => setCancellingMeeting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this meeting? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancelReason">Reason for cancellation (optional)</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Meeting</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelMeeting}
              className="bg-red-600 hover:bg-red-700"
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Meeting'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reminder Settings Dialog */}
      {showReminderSettings && selectedMeetingForReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Set Reminders for "{selectedMeetingForReminder.title}"
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReminderSettings(false);
                    setSelectedMeetingForReminder(null);
                  }}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
              <ReminderSettings
                meeting={selectedMeetingForReminder}
                userRole={userRole}
                onReminderUpdate={() => {
                  setShowReminderSettings(false);
                  setSelectedMeetingForReminder(null);
                  // The query will automatically refetch due to invalidatesTags
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingList;
