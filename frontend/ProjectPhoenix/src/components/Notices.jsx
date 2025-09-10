import React, { useState } from 'react';
import { useGetNoticesQuery } from '../api/noticeApiSlice';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Calendar, User, AlertCircle, Clock, Eye } from 'lucide-react';
import NoticeDetailsModal from '../features/student/notices/NoticeDetailsModal';

const Notices = ({ userRole = 'Student' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch notices with role-specific filtering
  const { data: noticesData, isLoading, error } = useGetNoticesQuery({
    status: 'published', // Only show published notices
    targetAudience: userRole, // Only notices targeted to the specific role
    search: searchTerm,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
  });

  // Debug logging
  console.log(`${userRole} Notices Debug:`, { noticesData, isLoading, error });

  const notices = noticesData?.data?.notices || [];

  // Filter notices by search term
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = !searchTerm || 
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || notice.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || notice.category === categoryFilter;
    
    return matchesSearch && matchesPriority && matchesCategory;
  });

  // Group notices by priority for better organization
  const urgentNotices = filteredNotices.filter(notice => notice.priority === 'urgent');
  const highNotices = filteredNotices.filter(notice => notice.priority === 'high');
  const mediumNotices = filteredNotices.filter(notice => notice.priority === 'medium');
  const lowNotices = filteredNotices.filter(notice => notice.priority === 'low');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900';
      case 'high':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200 hover:text-orange-900';
      case 'medium':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900';
      case 'low':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };

  const renderNoticeCard = (notice) => (
    <Card 
      key={notice._id} 
      className="mb-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={() => handleNoticeClick(notice)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {notice.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getPriorityColor(notice.priority)}>
                <div className="flex items-center gap-1">
                  {getPriorityIcon(notice.priority)}
                  {notice.priority}
                </div>
              </Badge>
              {notice.category && (
                <Badge variant="outline" className="text-xs">
                  {notice.category}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {notice.content}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>Admin</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(notice.publishedAt)}</span>
            </div>
          </div>
          {notice.expiresAt && (
            <div className="text-orange-600 font-medium">
              Expires: {formatDate(notice.expiresAt)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Notices</h3>
        <p className="text-gray-600">Unable to load notices. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Notices</h1>
        <p className="text-gray-600">Stay updated with important announcements and information</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="announcement">Announcement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notices Content */}
      {filteredNotices.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notices Found</h3>
          <p className="text-gray-600">
            {searchTerm || (priorityFilter !== 'all') || (categoryFilter !== 'all')
              ? "No notices match your current filters." 
              : "No notices have been published yet."}
          </p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({filteredNotices.length})</TabsTrigger>
            <TabsTrigger value="urgent">Urgent ({urgentNotices.length})</TabsTrigger>
            <TabsTrigger value="high">High ({highNotices.length})</TabsTrigger>
            <TabsTrigger value="medium">Medium ({mediumNotices.length})</TabsTrigger>
            <TabsTrigger value="low">Low ({lowNotices.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {filteredNotices.map(renderNoticeCard)}
            </div>
          </TabsContent>
          
          <TabsContent value="urgent" className="mt-6">
            <div className="space-y-4">
              {urgentNotices.map(renderNoticeCard)}
            </div>
          </TabsContent>
          
          <TabsContent value="high" className="mt-6">
            <div className="space-y-4">
              {highNotices.map(renderNoticeCard)}
            </div>
          </TabsContent>
          
          <TabsContent value="medium" className="mt-6">
            <div className="space-y-4">
              {mediumNotices.map(renderNoticeCard)}
            </div>
          </TabsContent>
          
          <TabsContent value="low" className="mt-6">
            <div className="space-y-4">
              {lowNotices.map(renderNoticeCard)}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Notice Details Modal */}
      {isModalOpen && selectedNotice && (
        <NoticeDetailsModal
          notice={selectedNotice}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedNotice(null);
          }}
        />
      )}
    </div>
  );
};

export default Notices;
