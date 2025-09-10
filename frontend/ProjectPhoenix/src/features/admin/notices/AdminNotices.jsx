import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter, MoreHorizontal, Eye, Edit, Trash2, Archive, Send } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useGetNoticesQuery, useDeleteNoticeMutation, usePublishNoticeMutation, useArchiveNoticeMutation } from '@/api/noticeApiSlice';
import { toast } from '@/components/ui/use-toast';
import CreateNoticeModal from './CreateNoticeModal';
import EditNoticeModal from './EditNoticeModal';
import NoticeDetailsModal from './NoticeDetailsModal';

const AdminNotices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleteNoticeId, setDeleteNoticeId] = useState(null);

  // API calls
  const { data: noticesData, isLoading, error, refetch } = useGetNoticesQuery({
    page: currentPage,
    limit: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    targetAudience: audienceFilter === 'all' ? undefined : audienceFilter,
    search: searchTerm || undefined,
  });

  const [deleteNotice] = useDeleteNoticeMutation();
  const [publishNotice] = usePublishNoticeMutation();
  const [archiveNotice] = useArchiveNoticeMutation();

  // Debug logging
  console.log('Admin Notices Debug:', { noticesData, isLoading, error });

  const notices = noticesData?.data?.notices || [];
  const pagination = noticesData?.data?.pagination || {};

  // Filter notices by status
  const activeNotices = notices.filter(notice => notice.status === 'published');
  const archivedNotices = notices.filter(notice => notice.status === 'archived');
  const draftNotices = notices.filter(notice => notice.status === 'draft');

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'priority':
        setPriorityFilter(value);
        break;
      case 'category':
        setCategoryFilter(value);
        break;
      case 'audience':
        setAudienceFilter(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:text-red-900';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 hover:text-orange-900';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-900';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:text-gray-900';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-900';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:text-gray-900';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:text-gray-900';
    }
  };

  // Helper function to render notice cards
  const renderNoticeCard = (notice) => (
    <div key={notice._id} className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-xl">{notice.title}</h3>
            <Badge className={getPriorityColor(notice.priority)}>
              {notice.priority}
            </Badge>
            <Badge className={getStatusColor(notice.status)}>
              {notice.status}
            </Badge>
          </div>
          <p className="text-gray-600 mb-2 line-clamp-2">{notice.content}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Category: {notice.category}</span>
            <span>Audience: {notice.targetAudience.join(', ')}</span>
            <span>Created: {new Date(notice.createdAt).toLocaleDateString()}</span>
            {notice.publishedAt && (
              <span>Published: {new Date(notice.publishedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleView(notice)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(notice)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {notice.status === 'draft' && (
              <DropdownMenuItem onClick={() => handlePublish(notice._id)}>
                <Send className="h-4 w-4 mr-2" />
                Publish
              </DropdownMenuItem>
            )}
            {notice.status === 'published' && (
              <DropdownMenuItem onClick={() => handleArchive(notice._id)}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => setDeleteNoticeId(notice._id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const handleDelete = async (id) => {
    try {
      await deleteNotice(id).unwrap();
      toast({
        title: "Success",
        description: "Notice deleted successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      setDeleteNoticeId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to delete notice",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishNotice(id).unwrap();
      toast({
        title: "Success",
        description: "Notice published successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to publish notice",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (id) => {
    try {
      await archiveNotice(id).unwrap();
      toast({
        title: "Success",
        description: "Notice archived successfully",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to archive notice",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (notice) => {
    setSelectedNotice(notice);
    setShowEditModal(true);
  };

  const handleView = (notice) => {
    setSelectedNotice(notice);
    setShowDetailsModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading notices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Error loading notices</p>
          <Button onClick={() => refetch()} className="mt-2">
          Try Again
        </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notice Management</h1>
          <p className="text-muted-foreground">
            Create and manage notices for students, supervisors, and evaluators
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Notice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notices..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            
              <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(value) => handleFilterChange('priority', value)}>
              <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>

            <Select value={audienceFilter} onValueChange={(value) => handleFilterChange('audience', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="All">All Users</SelectItem>
                <SelectItem value="Student">Students</SelectItem>
                <SelectItem value="Supervisor">Supervisors</SelectItem>
                <SelectItem value="Evaluator">Evaluators</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notices List with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Notices ({pagination.totalItems || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Notices ({notices.length})</TabsTrigger>
              <TabsTrigger value="published">Published ({activeNotices.length})</TabsTrigger>
              <TabsTrigger value="draft">Draft ({draftNotices.length})</TabsTrigger>
              <TabsTrigger value="archived">Archive ({archivedNotices.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
        {notices.length === 0 ? (
                <div className="text-center py-8">
              <p className="text-gray-500">No notices found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notices.map((notice) => renderNoticeCard(notice))}
                    </div>
              )}
            </TabsContent>
            
            <TabsContent value="published" className="mt-6">
              {activeNotices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No published notices found</p>
                    </div>
              ) : (
                <div className="space-y-4">
                  {activeNotices.map((notice) => renderNoticeCard(notice))}
                  </div>
              )}
            </TabsContent>
            
            <TabsContent value="draft" className="mt-6">
              {draftNotices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No draft notices found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {draftNotices.map((notice) => renderNoticeCard(notice))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="archived" className="mt-6">
              {archivedNotices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No archived notices found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {archivedNotices.map((notice) => renderNoticeCard(notice))}
                </div>
        )}
            </TabsContent>
          </Tabs>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
                size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
                Page {currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
                size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
        </CardContent>
      </Card>

      {/* Modals */}
        <CreateNoticeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />

        <EditNoticeModal
          isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
          notice={selectedNotice}
          onSuccess={() => {
            setShowEditModal(false);
            refetch();
          }}
        />

        <NoticeDetailsModal
          isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
          notice={selectedNotice}
        />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteNoticeId} onOpenChange={() => setDeleteNoticeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteNoticeId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminNotices;
