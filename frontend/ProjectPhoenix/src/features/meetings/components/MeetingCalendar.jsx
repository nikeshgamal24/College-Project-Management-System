import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Video, Users, MoreHorizontal, Edit, Trash2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useGetMeetingsQuery, useDeleteMeetingMutation } from '../meetingApiSlice';
import { toast } from 'sonner';
import EditMeetingDialog from './EditMeetingDialog';
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

const MeetingCalendar = ({ userId, userRole }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isChangingMonth, setIsChangingMonth] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [deletingMeeting, setDeletingMeeting] = useState(null);
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [selectedMeetingForReminder, setSelectedMeetingForReminder] = useState(null);

  // Helper function to safely convert date strings to Date objects
  const safeDate = (dateString) => {
    if (!dateString) return new Date();
    return new Date(dateString);
  };

  const [deleteMeeting, { isLoading: isDeleting }] = useDeleteMeetingMutation();

  const handleDeleteMeeting = async (meetingId) => {
    try {
      await deleteMeeting(meetingId).unwrap();
      toast.success('Meeting deleted successfully!');
      setDeletingMeeting(null);
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete meeting');
    }
  };

  // Get meetings for the current month
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  const { data: meetings, isLoading, error } = useGetMeetingsQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });

  // Debug API response
  useEffect(() => {
    console.log('MeetingCalendar - meetings data:', meetings);
    console.log('MeetingCalendar - isLoading:', isLoading);
    console.log('MeetingCalendar - error:', error);
  }, [meetings, isLoading, error]);

  const meetingsList = meetings?.data || [];

  // Calendar days are now handled by the CalendarComponent

  // Get meetings for a specific date
  const getMeetingsForDate = (date) => {
    return meetingsList.filter(meeting => 
      isSameDay(safeDate(meeting.scheduledDate), date)
    );
  };

  // Get meetings for selected date
  const selectedDateMeetings = getMeetingsForDate(selectedDate);

  // Month navigation is now handled by the CalendarComponent

  // Day classes are now handled by the CalendarComponent

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

  if (isLoading && !isChangingMonth) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" />
            Meeting Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Calendar Header */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Calendar className="w-4 h-4 text-blue-600" />
              Meeting Calendar
            </CardTitle>
            <div className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-md border border-gray-200">
              {format(currentDate, 'MMMM yyyy')}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Improved Calendar Component */}
          <div className="relative w-full">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentDate}
              onMonthChange={(newDate) => {
                setIsChangingMonth(true);
                setCurrentDate(newDate);
                setTimeout(() => setIsChangingMonth(false), 150);
              }}
              className="rounded-lg border border-gray-200 bg-white shadow-sm w-full"
              classNames={{
                months: "flex flex-col space-y-3",
                month: "space-y-2",
                caption: "flex justify-center pt-2 relative items-center mb-3",
                caption_label: "text-sm font-semibold text-gray-800",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-gray-50 hover:bg-gray-100 p-0 rounded-md transition-colors duration-200 border border-gray-200",
                nav_button_previous: "absolute left-2",
                nav_button_next: "absolute right-2",
                table: "w-full border-collapse",
                head_row: "flex mb-2",
                head_cell: "text-gray-600 rounded-md flex-1 font-semibold text-xs flex items-center justify-center py-2 min-h-[32px]",
                row: "flex w-full mb-1 min-h-[40px]",
                cell: "text-center text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-10 w-full p-0 font-medium text-black aria-selected:opacity-100 rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-black flex items-center justify-center",
                day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white font-semibold shadow-md",
                day_today: "bg-blue-100 text-black font-bold border-2 border-blue-300 hover:bg-blue-200 hover:text-black",
                day_outside: "text-gray-400 opacity-60 hover:bg-gray-50 hover:text-gray-600",
                day_disabled: "text-gray-400 opacity-50 hover:bg-transparent hover:text-gray-400",
                day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-blue-900",
                day_hidden: "invisible",
              }}
              components={{
                IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 text-gray-600" />,
                IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 text-gray-600" />,
              }}
            />
            {/* Smooth transition overlay */}
            {isChangingMonth && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-md transition-opacity duration-150" />
            )}
          </div>
        </CardContent>
      </Card>

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
                Set reminders for your meetings to stay organized
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedDateMeetings.length > 0 && (
                <Button
                  onClick={() => {
                    if (selectedDateMeetings.length === 1) {
                      setSelectedMeetingForReminder(selectedDateMeetings[0]);
                      setShowReminderSettings(true);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  disabled={selectedDateMeetings.length === 0}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {selectedDateMeetings.length === 1 ? 'Set Reminder' : 'Select Meeting First'}
                </Button>
              )}
              {selectedDateMeetings.length === 0 && (
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
                  No meetings on this date
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {selectedDateMeetings.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                You have {selectedDateMeetings.length} meeting{selectedDateMeetings.length > 1 ? 's' : ''} on {format(selectedDate, 'EEEE, MMMM do')}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedDateMeetings.map(meeting => (
                  <div key={meeting._id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-gray-900">{meeting.title}</span>
                    <span className="text-xs text-gray-500">
                      {format(safeDate(meeting.scheduledDate), 'h:mm a')}
                    </span>
                    <Button
                      onClick={() => {
                        setSelectedMeetingForReminder(meeting);
                        setShowReminderSettings(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Bell className="w-3 h-3 mr-1" />
                      Remind
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Select a date with meetings to set reminders</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Selected Date Meetings */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Meetings for {format(selectedDate, 'EEEE, MMMM do, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {selectedDateMeetings.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-medium">No meetings scheduled</p>
              <p className="text-xs text-gray-400 mt-1">for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateMeetings.map(meeting => (
                <div key={meeting._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {MEETING_TYPE_ICONS[meeting.meetingType] || '📅'}
                        </span>
                        <h4 className="font-medium text-sm text-gray-900">{meeting.title}</h4>
                      </div>
                      
                      {/* Optimized meeting details layout */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="flex flex-col items-center text-center">
                            <Clock className="w-4 h-4 text-blue-600 mb-1" />
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
                            <div className="text-gray-500 text-xs">Meeting</div>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mb-1">
                              <span className="text-green-600 text-xs font-bold">⏱</span>
                            </div>
                            <div className="font-medium text-gray-700">{meeting.duration}</div>
                            <div className="text-gray-500 text-xs">minutes</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`${getMeetingStatusColor(meeting.status)} px-2 py-1 rounded-full text-xs font-medium hover:shadow-sm transition-all duration-200`}>
                        {meeting.status}
                      </div>
                      {userRole === 'supervisor' && (
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingMeeting(meeting)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                            title="Edit Meeting"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                                title="Delete Meeting"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this meeting? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteMeeting(meeting._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Meeting Dialog */}
      <EditMeetingDialog
        meeting={editingMeeting}
        isOpen={!!editingMeeting}
        onClose={() => setEditingMeeting(null)}
        onSuccess={() => {
          setEditingMeeting(null);
          // The query will automatically refetch due to invalidatesTags
        }}
      />

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

export default MeetingCalendar;
