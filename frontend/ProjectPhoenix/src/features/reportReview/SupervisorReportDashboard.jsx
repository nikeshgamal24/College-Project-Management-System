import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, MessageSquare, CheckCircle, AlertCircle, Eye, Clock, Filter, Search } from "lucide-react";
import { useGetReportsForReviewQuery } from "./reportReviewApiSlice";
import SupervisorReportReview from "./SupervisorReportReview";
import ReportList from "./ReportList";

const SupervisorReportDashboard = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: reportsData, isLoading, error } = useGetReportsForReviewQuery({
    status: statusFilter === "all" ? undefined : statusFilter
  });

  // Debug logging
  console.log("SupervisorReportDashboard - reportsData:", reportsData);
  console.log("SupervisorReportDashboard - error:", error);
  console.log("SupervisorReportDashboard - isLoading:", isLoading);

  const reports = reportsData?.data?.reports || [];

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setActiveTab("review");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading supervisor reports:", error);
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Failed to load reports</p>
        <p className="text-sm text-gray-500 mt-2">
          {error?.data?.message || error?.message || "Please try again later"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Error status: {error?.status}
        </p>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: reports.length,
    submitted: reports.filter(r => r.status === 'submitted').length,
    underReview: reports.filter(r => r.status === 'under_review').length,
    approved: reports.filter(r => r.status === 'approved').length,
    needsRevision: reports.filter(r => r.status === 'needs_revision').length,
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Report Review Dashboard</h3>
          <p className="text-sm text-gray-600 mt-1">Review and provide feedback on student reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {stats.total} Reports
          </Badge>
        </div>
      </div>

      {/* Fixed Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-gray-100 rounded-full">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-600 font-medium">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">{stats.submitted}</p>
                <p className="text-xs text-gray-600 font-medium">Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-600">{stats.underReview}</p>
                <p className="text-xs text-gray-600 font-medium">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-xs text-gray-600 font-medium">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{stats.needsRevision}</p>
                <p className="text-xs text-gray-600 font-medium">Needs Revision</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reports for Review ({reports.length})
          </TabsTrigger>
          {selectedReport && (
            <TabsTrigger value="review" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Review Report
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <ReportList
            reports={reports}
            userType="supervisor"
            onViewReport={handleViewReport}
          />
        </TabsContent>

        {selectedReport && (
          <TabsContent value="review" className="space-y-4">
            <SupervisorReportReview
              reportId={selectedReport._id}
            />
            <div className="flex justify-end">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => {
                  setSelectedReport(null);
                  setActiveTab("list");
                }}
              >
                Back to Reports
              </button>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SupervisorReportDashboard;
