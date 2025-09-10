import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateNoticeMutation, useUploadNoticeAttachmentMutation } from '@/api/noticeApiSlice';
import { toast } from '@/components/ui/use-toast';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { useSelector } from 'react-redux';

const CreateNoticeModal = ({ isOpen, onClose, onSuccess }) => {
  const [createNotice, { isLoading }] = useCreateNoticeMutation();
  const [uploadAttachment, { isLoading: isUploading }] = useUploadNoticeAttachmentMutation();
  
  // Get auth state for debugging
  const authState = useSelector(state => state.auth);
  console.log('🔐 Current auth state in CreateNoticeModal:', authState);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: [],
    priority: 'medium',
    category: 'general',
    tags: [],
    expiresAt: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleInputChange = (field, value) => {
    // No real-time trimming - let user type freely
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a JPG, PNG, JPEG, or PDF file.",
        });
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const uploadFile = async (file) => {
    try {
      console.log('📎 uploadFile called with file:', file);
      console.log('📎 Calling uploadAttachment mutation...');
      const result = await uploadAttachment(file).unwrap();
      console.log('✅ uploadAttachment completed successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  };

  const handleTargetAudienceChange = (audience, checked) => {
    setFormData(prev => {
      if (audience === 'All') {
        // If "All Users" is selected, clear all other selections
        return {
          ...prev,
          targetAudience: checked ? ['All'] : []
        };
      } else {
        // If any other option is selected, remove "All" if it exists
        let newAudience = checked
          ? [...prev.targetAudience, audience]
          : prev.targetAudience.filter(a => a !== audience);
        
        // Remove "All" if any specific audience is selected
        if (checked && newAudience.includes('All')) {
          newAudience = newAudience.filter(a => a !== 'All');
        }
        
        return {
          ...prev,
          targetAudience: newAudience
        };
      }
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    console.log('🚀 handleSubmit called');
    e.preventDefault();
    
    if (formData.targetAudience.length === 0) {
      console.log('❌ Validation error: No target audience selected');
      toast({
        title: "Validation Error",
        description: "Please select at least one target audience",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Validation passed, proceeding with notice creation');

    try {
      let attachment = null;
      
      // Upload file if selected
      if (selectedFile) {
        console.log('📎 File selected, uploading...');
        const uploadResult = await uploadFile(selectedFile);
        attachment = uploadResult.data.attachment;
        console.log('✅ File uploaded successfully:', attachment);
      } else {
        console.log('📎 No file selected');
      }

      const noticeData = {
        ...formData,
        // Trim leading/trailing whitespace only on submission
        title: formData.title.trim(),
        content: formData.content.trim(),
        expiresAt: formData.expiresAt && formData.expiresAt.trim() !== '' 
          ? new Date(formData.expiresAt).toISOString() 
          : null,
        attachment: attachment,
      };

      console.log('📤 Sending notice data:', noticeData);
      console.log('📤 Form data before processing:', formData);
      console.log('📤 Attachment data:', attachment);

      console.log('🔄 Calling createNotice mutation...');
      await createNotice(noticeData).unwrap();
      console.log('✅ createNotice mutation completed successfully');
      
      toast({
        title: "Success",
        description: "Notice created successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      onSuccess();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error.data?.message || error.message || "Failed to create notice",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      targetAudience: [],
      priority: 'medium',
      category: 'general',
      tags: [],
      expiresAt: '',
    });
    setTagInput('');
    setSelectedFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Notice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter notice title"
              required
              maxLength={200}
            />
            <p className="text-sm text-gray-500">{formData.title.length}/200 characters</p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Enter notice content"
              required
              maxLength={2000}
              rows={6}
            />
            <p className="text-sm text-gray-500">{formData.content.length}/2000 characters</p>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label>Target Audience *</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'All', label: 'All Users' },
                { value: 'Student', label: 'Students' },
                { value: 'Supervisor', label: 'Supervisors' },
                { value: 'Evaluator', label: 'Evaluators' },
              ].map((audience) => {
                const isAllSelected = formData.targetAudience.includes('All');
                const isDisabled = isAllSelected && audience.value !== 'All';
                
                return (
                  <div key={audience.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={audience.value}
                      checked={formData.targetAudience.includes(audience.value)}
                      onCheckedChange={(checked) => handleTargetAudienceChange(audience.value, checked)}
                      disabled={isDisabled}
                    />
                    <Label 
                      htmlFor={audience.value}
                      className={isDisabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
                    >
                      {audience.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} disabled={!tagInput.trim() || formData.tags.length >= 10}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500">Maximum 10 tags allowed</p>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => handleInputChange('expiresAt', e.target.value)}
            />
            <p className="text-sm text-gray-500">Leave empty for no expiry</p>
          </div>

          {/* File Attachment */}
          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment (Optional)</Label>
            <div className="space-y-3">
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="attachment"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="attachment" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload a file</p>
                    <p className="text-xs text-gray-500">JPG, PNG, JPEG, or PDF (max 10MB)</p>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {selectedFile.type.startsWith('image/') ? (
                      <Image className="h-5 w-5 text-blue-500" />
                    ) : selectedFile.type === 'application/pdf' ? (
                      <FileText className="h-5 w-5 text-red-500" />
                    ) : (
                      <File className="h-5 w-5 text-gray-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">Supported formats: JPG, PNG, JPEG, PDF (max 10MB)</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isUploading ? 'Uploading...' : isLoading ? 'Creating...' : 'Create Notice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoticeModal;
