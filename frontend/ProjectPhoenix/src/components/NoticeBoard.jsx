import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Bell, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetNoticesQuery } from "@/api/noticeApiSlice";
import { ROLES_LIST } from "@/lib/config";

const NoticeBoard = ({ 
  userRole = 'Student', 
  limit = 3, 
  showHeader = true,
  className = "" 
}) => {
  // Fetch notices based on user role
  const { data: noticesData, isLoading, error } = useGetNoticesQuery({
    status: 'published',
    targetAudience: userRole,
    limit: limit,
  });

  const notices = noticesData?.data?.notices || [];

  // Helper function to get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get the correct route based on user role
  const getNoticesRoute = () => {
    switch (userRole) {
      case 'Student':
        return `/${ROLES_LIST.student}/notices`;
      case 'Supervisor':
        return `/${ROLES_LIST.supervisor}/notices`;
      case 'Evaluator':
        return `/${ROLES_LIST.evaluator}/notices`;
      default:
        return `/${ROLES_LIST.student}/notices`;
    }
  };

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="flex flex-row bg-slate-100 rounded-t-md border-b py-4 items-center">
          <div>
            <CardTitle className="text-lg">Notice Board</CardTitle>
            <CardDescription className="text-xs">
              Notices from the administrator
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" className="ml-auto text-xs" asChild>
            <Link to={getNoticesRoute()}>
              <Bell className="mr-1 h-4 w-4" />
              View All
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
      )}

      <CardContent className="text-sm mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading notices...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">Failed to load notices</div>
          </div>
        ) : notices.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">No notices available</div>
          </div>
        ) : (
          <div className="grid gap-3">
            {notices.map((notice) => (
              <div key={notice._id} className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-md font-semibold text-gray-900 line-clamp-2">
                    {notice.title}
                  </h3>
                  <Badge className={`ml-2 ${getPriorityColor(notice.priority)}`}>
                    {notice.priority}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  {notice.content}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-slate-700">
                    <time dateTime={notice.createdAt}>
                      {formatDate(notice.createdAt)}
                    </time>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    asChild
                  >
                    <Link to={getNoticesRoute()}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NoticeBoard;

