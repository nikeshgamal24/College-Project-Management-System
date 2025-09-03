import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Video, Users, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateMeetingMutation } from '../meetingApiSlice';
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

const EditMeetingDialog = ({ meeting, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingType: '',
    duration: 60,
    meetingLocation: 'virtual_meeting',
    scheduledDate: '',
    scheduledTime: '',
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

  const [updateMeeting, { isLoading: isUpdating }] = useUpdateMeetingMutation();

  // Initialize form data when meeting changes
  useEffect(() => {
    if (meeting) {
      const meetingDate = new Date(meeting.scheduledDate);
      setFormData({
        title: meeting.title || '',
        description: meeting.description || '',
        meetingType: meeting.meetingType || '',
        duration: meeting.duration || 60,
        meetingLocation: meeting.meetingLocation || 'virtual_meeting',
        scheduledDate: meetingDate.toISOString().split('T')[0],
        scheduledTime: meetingDate.toTimeString().slice(0, 5),
        roomDetails: meeting.roomDetails || { roomNumber: '', building: '', floor: '' },
        virtualMeetingLink: meeting.virtualMeetingLink || { platform: 'zoom', link: '', meetingId: '', password: '' },
        agenda: meeting.agenda || []
      });
    }
  }, [meeting]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.meetingType || !formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        meetingType: formData.meetingType,
        duration: formData.duration,
        meetingLocation: formData.meetingLocation,
        scheduledDate: scheduledDateTime.toISOString(),
        roomDetails: formData.meetingLocation === 'physical_room' ? formData.roomDetails : undefined,
        virtualMeetingLink: formData.meetingLocation === 'virtual_meeting' ? formData.virtualMeetingLink : undefined,
        agenda: formData.agenda.filter(item => item.item && item.item.trim() !== '')
      };

      await updateMeeting({ id: meeting._id, ...updateData }).unwrap();
      
      toast.success('Meeting updated successfully!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update meeting');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Edit Meeting
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="scheduledDate">Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Time *</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    required
                  />
                </div>
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

          {/* Agenda */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Meeting Agenda</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addAgendaItem}>
                  <Calendar className="w-4 h-4 mr-2" />
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="min-w-[140px]"
            >
              {isUpdating ? 'Updating...' : 'Update Meeting'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMeetingDialog;
