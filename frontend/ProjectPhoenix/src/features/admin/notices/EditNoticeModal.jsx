import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateNoticeMutation, useUploadNoticeAttachmentMutation } from '@/api/noticeApiSlice';
import { toast } from '@/components/ui/use-toast';
import { Upload, X, FileText, Image, Download, ExternalLink } from 'lucide-react';

const EditNoticeModal = ({ isOpen, onClose, notice, onSuccess }) => {
  const [updateNotice, { isLoading }] = useUpdateNoticeMutation();
  const [uploadAttachment, { isLoading: isUploading }] = useUploadNoticeAttachmentMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: [],
    priority: 'medium',
    category: 'general',
    tags: [],
    expiresAt: '',
    status: 'draft',
    attachment: null,
  });

  const [tagInput, setTagInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title || '',
        content: notice.content || '',
        targetAudience: notice.targetAudience || [],
        priority: notice.priority || 'medium',
        category: notice.category || 'general',
        tags: notice.tags || [],
        expiresAt: notice.expiresAt ? new Date(notice.expiresAt).toISOString().slice(0, 16) : '',
        status: notice.status || 'draft',
        attachment: notice.attachment || null,
      });
      setSelectedFile(null); // Reset selected file when notice changes
    }
  }, [notice]);

  const handleInputChange = (field, value) => {
    // No real-time trimming - let user type freely
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JPG, PNG, JPEG, or PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const removeAttachment = () => {
    setFormData(prev => ({
      ...prev,
      attachment: null
    }));
  };

  const uploadFile = async (file) => {
    try {
      console.log('📎 uploadFile called with file:', file);
      console.log('📎 Calling uploadAttachment mutation...');
      const result = await uploadAttachment(file).unwrap();
      console.log('✅ uploadAttachment completed successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ uploadAttachment failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.targetAudience.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one target audience",
        variant: "destructive",
      });
      return;
    }

    try {
      let attachment = formData.attachment;

      // Upload new file if selected
      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile);
        attachment = uploadResult.data.attachment;
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

      await updateNotice({ id: notice._id, ...noticeData }).unwrap();
      
      toast({
        title: "Success",
        description: "Notice updated successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to update notice",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!notice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Notice</DialogTitle>
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

          {/* Priority, Category, and Status */}
          <div className="grid grid-cols-3 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
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
            <Label>Attachment (Optional)</Label>
            
            {/* Current Attachment Display */}
            {formData.attachment && !selectedFile && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0">
                    {formData.attachment.fileType?.startsWith('image/') ? (
                      <Image className="h-5 w-5 text-blue-500" />
                    ) : formData.attachment.fileType === 'application/pdf' ? (
                      <FileText className="h-5 w-5 text-red-500" />
                    ) : (
                      <Download className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formData.attachment.originalName || formData.attachment.fileName || 'Current Attachment'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.attachment.fileSize && `${(formData.attachment.fileSize / 1024).toFixed(1)} KB`}
                      {formData.attachment.fileType && ` • ${formData.attachment.fileType.split('/')[1].toUpperCase()}`}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(formData.attachment.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeAttachment}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* New File Selection */}
            {!formData.attachment && (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop a file here, or click to select
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  JPG, PNG, JPEG, PDF (max 5MB)
                </p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  Choose File
                </Button>
              </div>
            )}

            {/* Selected File Display */}
            {selectedFile && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0">
                    {selectedFile.type.startsWith('image/') ? (
                      <Image className="h-5 w-5 text-blue-500" />
                    ) : selectedFile.type === 'application/pdf' ? (
                      <FileText className="h-5 w-5 text-red-500" />
                    ) : (
                      <Download className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            )}

            {/* Replace File Button (when current attachment exists) */}
            {formData.attachment && !selectedFile && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload-replace').click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Replace File
                </Button>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload-replace"
                />
              </div>
            )}

            <p className="text-sm text-gray-500">
              Supported formats: JPG, PNG, JPEG, PDF (max 5MB)
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isUploading ? 'Uploading...' : isLoading ? 'Updating...' : 'Update Notice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditNoticeModal;
