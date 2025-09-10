import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Tag, Target, AlertCircle, Download, Bell, ExternalLink, Image, FileText } from 'lucide-react';
import { format } from 'date-fns';

const NoticeDetailsModal = ({ isOpen, onClose, notice }) => {
  if (!notice) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <Bell className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'PPP p');
  };

  const isExpired = notice.expiresAt && new Date(notice.expiresAt) < new Date();
  const isActive = notice.status === 'published' && !isExpired;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getPriorityIcon(notice.priority)}
            {notice.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority Badges */}
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(notice.priority)}>
              {notice.priority.toUpperCase()}
            </Badge>
            <Badge className={getStatusColor(notice.status)}>
              {notice.status.toUpperCase()}
            </Badge>
            {isExpired && (
              <Badge variant="destructive">EXPIRED</Badge>
            )}
            {isActive && (
              <Badge className="bg-green-100 text-green-800 border-green-200">ACTIVE</Badge>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Content</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{notice.content}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Audience */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Target Audience</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {notice.targetAudience.map((audience, index) => (
                  <Badge key={index} variant="outline">
                    {audience}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Category</span>
              </div>
              <Badge variant="outline">{notice.category}</Badge>
            </div>

            {/* Created By */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Created By</span>
              </div>
              <p className="text-sm text-gray-600">
                {notice.publishedBy?.fullname || 'Unknown'}
              </p>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Created Date</span>
              </div>
              <p className="text-sm text-gray-600">
                {formatDate(notice.createdAt)}
              </p>
            </div>

            {/* Published Date */}
            {notice.publishedAt && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Published Date</span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatDate(notice.publishedAt)}
                </p>
              </div>
            )}

            {/* Expiry Date */}
            {notice.expiresAt && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Expiry Date</span>
                </div>
                <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                  {formatDate(notice.expiresAt)}
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {notice.tags && notice.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {notice.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Attachment */}
          {notice.attachment && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Attachment</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {notice.attachment.fileType?.startsWith('image/') ? (
                    <Image className="h-5 w-5 text-blue-500" />
                  ) : notice.attachment.fileType === 'application/pdf' ? (
                    <FileText className="h-5 w-5 text-red-500" />
                  ) : (
                    <Download className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {notice.attachment.originalName || notice.attachment.fileName || 'Download File'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {notice.attachment.fileSize && `${(notice.attachment.fileSize / 1024).toFixed(1)} KB`}
                    {notice.attachment.fileType && ` • ${notice.attachment.fileType.split('/')[1].toUpperCase()}`}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(notice.attachment.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = notice.attachment.url;
                      link.download = notice.attachment.originalName || notice.attachment.fileName;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Read Statistics */}
          {notice.readBy && notice.readBy.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Read by ({notice.readBy.length} users)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {notice.readBy.reduce((acc, read) => {
                  const type = read.userType;
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {})}
                {Object.entries(
                  notice.readBy.reduce((acc, read) => {
                    const type = read.userType;
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span>{type}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeDetailsModal;
