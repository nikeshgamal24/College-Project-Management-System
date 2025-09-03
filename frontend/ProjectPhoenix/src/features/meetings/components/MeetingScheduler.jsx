import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { Calendar, Clock, MapPin, Video, Users, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useCreateMeetingMutation, useGetAvailableSlotsQuery } from '../meetingApiSlice';
import { toast } from 'sonner';

const MEETING_TYPES = [
  { value: 'progress_review', label: 'Progress Review', icon: '📊', duration: 30 },
  { value: 'report_discussion', label: 'Report Discussion', icon: '📝', duration: 45 },
  { value: 'defense_prep', label: 'Defense Preparation', icon: '🎯', duration: 60 },
  { value: 'general_discussion', label: 'General Discussion', icon: '💬', duration: 30 },
  { value: 'emergency_meeting', label: 'Emergency Meeting', icon: '🚨', duration: 15 },
];

const MEETING_LOCATIONS = [
  { value: 'virtual_meeting', label: 'Virtual Meeting', icon: Video },
  { value: 'physical_room', label: 'Physical Room', icon: MapPin },
  { value: 'hybrid', label: 'Hybrid', icon: Users },
];

const VIRTUAL_PLATFORMS = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'other', label: 'Other' },
];

const MeetingScheduler = ({ 
  supervisorId, 
  studentId, 
  projectId, 
  trigger, 
  onMeetingCreated 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showCustomTimeRequest, setShowCustomTimeRequest] = useState(false);
  const [customTimeRequest, setCustomTimeRequest] = useState({
    preferredStartTime: '',
    preferredEndTime: '',
    reason: '',
    isFlexible: false
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingType: '',
    duration: 60,
    meetingLocation: 'virtual_meeting',
    roomDetails: {
      roomNumber: '',
      building: '',
      floor: ''
    },
    virtualMeetingLink: {
      platform: 'zoom',
      link: '',
      meetingId: '',
      password: ''
    },
    agenda: []
  });

  const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();

  // Debug authentication
  useEffect(() => {
    console.log('MeetingScheduler - supervisorId:', supervisorId);
    console.log('MeetingScheduler - studentId:', studentId);
    console.log('MeetingScheduler - projectId:', projectId);
  }, [supervisorId, studentId, projectId]);

  // Get available slots for selected date
  const { data: availableSlots, isLoading: isLoadingSlots } = useGetAvailableSlotsQuery({
    supervisorId,
    studentId,
    projectId,
    date: selectedDate.toISOString().split('T')[0],
    duration: formData.duration
  }, {
    skip: !supervisorId || !studentId || !projectId || !selectedDate
  });

  // Update duration when meeting type changes
  useEffect(() => {
    const meetingType = MEETING_TYPES.find(type => type.value === formData.meetingType);
    if (meetingType) {
      setFormData(prev => ({ ...prev, duration: meetingType.duration }));
    }
  }, [formData.meetingType]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleCustomTimeRequest = async () => {
    try {
      // Create a custom time slot for the request
      const startTime = new Date(selectedDate);
      const [hours, minutes] = customTimeRequest.preferredStartTime.split(':');
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endTime = new Date(selectedDate);
      const [endHours, endMinutes] = customTimeRequest.preferredEndTime.split(':');
      endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      // Create a custom slot object
      const customSlot = {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: Math.round((endTime - startTime) / (1000 * 60)), // duration in minutes
        isCustomRequest: true,
        reason: customTimeRequest.reason,
        isFlexible: customTimeRequest.isFlexible
      };

      setSelectedSlot(customSlot);
      setShowCustomTimeRequest(false);
      
      toast.success('Custom time request added! You can now complete the meeting details.');
    } catch (error) {
      toast.error('Failed to create custom time request');
    }
  };

  const addAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, { item: '', description: '', duration: 5 }]
    }));
  };

  const removeAgendaItem = (index) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const updateAgendaItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    if (!formData.title || !formData.meetingType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const meetingData = {
        title: formData.title,
        description: formData.description,
        meetingType: formData.meetingType,
        studentId,
        projectId,
        scheduledDate: selectedSlot.startTime,
        duration: selectedSlot.isCustomRequest ? selectedSlot.duration : formData.duration,
        meetingLocation: formData.meetingLocation,
        roomDetails: formData.meetingLocation === 'physical_room' ? formData.roomDetails : undefined,
        virtualMeetingLink: formData.meetingLocation === 'virtual_meeting' ? formData.virtualMeetingLink : undefined,
        agenda: formData.agenda.filter(item => item.item.trim() !== ''),
        // Add custom request details if it's a custom time request
        ...(selectedSlot.isCustomRequest && {
          isCustomRequest: true,
          customRequestReason: selectedSlot.reason,
          isFlexible: selectedSlot.isFlexible,
          status: 'pending_approval'
        })
      };

      const result = await createMeeting(meetingData).unwrap();
      
      if (selectedSlot.isCustomRequest) {
        toast.success('Meeting request submitted! Your supervisor will review and approve the time slot.');
      } else {
        toast.success('Meeting scheduled successfully!');
      }
      setIsOpen(false);
      setFormData({
        title: '',
        description: '',
        meetingType: '',
        duration: 60,
        meetingLocation: 'virtual_meeting',
        roomDetails: { roomNumber: '', building: '', floor: '' },
        virtualMeetingLink: { platform: 'zoom', link: '', meetingId: '', password: '' },
        agenda: []
      });
      setSelectedSlot(null);
      
      if (onMeetingCreated && result) {
        onMeetingCreated(result.data || result);
      }
    } catch (error) {
      toast.error(error.data?.message || 'Failed to schedule meeting');
    }
  };

  const generateTimeSlots = () => {
    if (!availableSlots?.data?.availableSlots) return [];
    
    return availableSlots.data.availableSlots.map(slot => ({
      ...slot,
      formatted: `${format(new Date(slot.startTime), 'h:mm a')} - ${format(new Date(slot.endTime), 'h:mm a')}`
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Meeting
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule New Meeting
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter meeting title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meetingType">Meeting Type *</Label>
                  <Select value={formData.meetingType} onValueChange={(value) => handleInputChange('meetingType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meeting type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEETING_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter meeting description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="240"
                    step="15"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetingLocation">Meeting Location</Label>
                  <Select value={formData.meetingLocation} onValueChange={(value) => handleInputChange('meetingLocation', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEETING_LOCATIONS.map(location => (
                        <SelectItem key={location.value} value={location.value}>
                          <div className="flex items-center gap-2">
                            <location.icon className="w-4 h-4" />
                            <span>{location.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          {formData.meetingLocation === 'physical_room' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Room Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      value={formData.roomDetails.roomNumber}
                      onChange={(e) => handleInputChange('roomDetails.roomNumber', e.target.value)}
                      placeholder="e.g., 101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="building">Building</Label>
                    <Input
                      id="building"
                      value={formData.roomDetails.building}
                      onChange={(e) => handleInputChange('roomDetails.building', e.target.value)}
                      placeholder="e.g., Engineering Block"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Input
                      id="floor"
                      value={formData.roomDetails.floor}
                      onChange={(e) => handleInputChange('roomDetails.floor', e.target.value)}
                      placeholder="e.g., 2nd Floor"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {formData.meetingLocation === 'virtual_meeting' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Virtual Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={formData.virtualMeetingLink.platform} onValueChange={(value) => handleInputChange('virtualMeetingLink.platform', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VIRTUAL_PLATFORMS.map(platform => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meetingId">Meeting ID</Label>
                    <Input
                      id="meetingId"
                      value={formData.virtualMeetingLink.meetingId}
                      onChange={(e) => handleInputChange('virtualMeetingLink.meetingId', e.target.value)}
                      placeholder="Meeting ID"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meetingLink">Meeting Link</Label>
                    <Input
                      id="meetingLink"
                      value={formData.virtualMeetingLink.link}
                      onChange={(e) => handleInputChange('virtualMeetingLink.link', e.target.value)}
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      value={formData.virtualMeetingLink.password}
                      onChange={(e) => handleInputChange('virtualMeetingLink.password', e.target.value)}
                      placeholder="Meeting password"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date and Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => handleDateChange(new Date(e.target.value))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                {selectedSlot && selectedSlot.isCustomRequest && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Custom Time Request Selected</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      {format(new Date(selectedSlot.startTime), 'h:mm a')} - {format(new Date(selectedSlot.endTime), 'h:mm a')}
                    </p>
                    {selectedSlot.reason && (
                      <p className="text-xs text-blue-500 mt-1">Reason: {selectedSlot.reason}</p>
                    )}
                  </div>
                )}
                {isLoadingSlots ? (
                  <div className="text-center py-4 text-gray-500">Loading available slots...</div>
                ) : generateTimeSlots().length === 0 ? (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">No available slots</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">Try selecting a different date or request a custom time</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCustomTimeRequest(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Request Custom Time
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {generateTimeSlots().map((slot, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={selectedSlot?.startTime === slot.startTime ? "default" : "outline"}
                        onClick={() => handleSlotSelect(slot)}
                        className="h-auto p-3 flex flex-col items-center gap-1"
                      >
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{slot.formatted}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Custom Time Request */}
          {showCustomTimeRequest && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">Request Custom Meeting Time</CardTitle>
                <p className="text-sm text-blue-600">Request a specific time slot for your meeting</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredStartTime">Preferred Start Time</Label>
                    <Input
                      id="preferredStartTime"
                      type="time"
                      value={customTimeRequest.preferredStartTime}
                      onChange={(e) => setCustomTimeRequest(prev => ({ ...prev, preferredStartTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredEndTime">Preferred End Time</Label>
                    <Input
                      id="preferredEndTime"
                      type="time"
                      value={customTimeRequest.preferredEndTime}
                      onChange={(e) => setCustomTimeRequest(prev => ({ ...prev, preferredEndTime: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Custom Time</Label>
                  <Textarea
                    id="reason"
                    value={customTimeRequest.reason}
                    onChange={(e) => setCustomTimeRequest(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Explain why you need this specific time slot..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFlexible"
                    checked={customTimeRequest.isFlexible}
                    onChange={(e) => setCustomTimeRequest(prev => ({ ...prev, isFlexible: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="isFlexible" className="text-sm">
                    I'm flexible with alternative times if this slot isn't available
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCustomTimeRequest(false)}
                  >
                    Cancel Request
                  </Button>
                  <Button 
                    type="button" 
                    size="sm"
                    onClick={handleCustomTimeRequest}
                    disabled={!customTimeRequest.preferredStartTime || !customTimeRequest.preferredEndTime}
                  >
                    Submit Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agenda */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Meeting Agenda</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addAgendaItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.agenda.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="Agenda item"
                      value={item.item}
                      onChange={(e) => updateAgendaItem(index, 'item', e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateAgendaItem(index, 'description', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Duration (min)"
                      value={item.duration}
                      onChange={(e) => updateAgendaItem(index, 'duration', parseInt(e.target.value))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAgendaItem(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {formData.agenda.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No agenda items added yet. Click "Add Item" to create an agenda.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col gap-3">
            {/* Requirements Status */}
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${formData.title ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Meeting title {formData.title ? '✓' : '(required)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${formData.meetingType ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Meeting type {formData.meetingType ? '✓' : '(required)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedSlot ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span>Time slot {selectedSlot ? '✓' : '(required)'}</span>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating || !selectedSlot || !formData.title || !formData.meetingType}
                className="min-w-[140px]"
              >
                {isCreating ? 'Scheduling...' : 'Schedule Meeting'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingScheduler;
