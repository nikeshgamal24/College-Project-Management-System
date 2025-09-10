import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Calendar, User, AlertCircle, Clock, X, Download, ExternalLink, Image, FileText } from 'lucide-react';

const NoticeDetailsModal = ({ notice, isOpen, onClose }) => {
  if (!notice) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4" />;
      case 'normal':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = notice.expiresAt && new Date(notice.expiresAt) < new Date();
  const isExpiringSoon = notice.expiresAt && 
    new Date(notice.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && 
    !isExpired;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900 pr-4">
              {notice.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Priority and Category Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={getPriorityColor(notice.priority)}>
              <div className="flex items-center gap-1">
                {getPriorityIcon(notice.priority)}
                {notice.priority}
              </div>
            </Badge>
            {notice.category && (
              <Badge variant="outline" className="text-sm">
                {notice.category}
              </Badge>
            )}
            {notice.tags && notice.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {notice.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Expiry Warning */}
          {isExpired && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">This notice has expired</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Expired on {formatDateShort(notice.expiresAt)}
              </p>
            </div>
          )}

          {isExpiringSoon && !isExpired && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-800">
                <Clock className="h-4 w-4" />
                <span className="font-medium">This notice expires soon</span>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                Expires on {formatDateShort(notice.expiresAt)}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {notice.content}
            </div>
          </div>

          {/* Attachment */}
          {notice.attachment && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Attachment</h4>
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

          {/* Metadata */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Published by: <span className="font-medium text-gray-900">Admin</span></span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Published: <span className="font-medium text-gray-900">{formatDate(notice.publishedAt)}</span></span>
                </div>
              </div>
              <div className="space-y-2">
                {notice.expiresAt && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Expires: <span className="font-medium text-gray-900">{formatDate(notice.expiresAt)}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <span>Target Audience: <span className="font-medium text-gray-900">
                    {notice.targetAudience?.join(', ') || 'All Users'}
                  </span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {notice.attachment && (
              <Button
                onClick={() => window.open(notice.attachment.url, '_blank')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Attachment
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoticeDetailsModal;
