import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, 
  Search, 
  Filter,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Download,
  X,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import SupervisorReportReview from "./SupervisorReportReview";
import StudentReportFeedback from "./StudentReportFeedback";
import EditReportSubmission from "./EditReportSubmission";
import NotificationBadge from "../../components/ui/notification-badge";

const ReportList = ({ reports, userType, onViewReport }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { variant: "secondary", icon: Clock, label: "Submitted" },
      under_review: { variant: "default", icon: Eye, label: "Under Review" },
      approved: { variant: "default", icon: CheckCircle, label: "Approved" },
      needs_revision: { variant: "destructive", icon: AlertCircle, label: "Needs Revision" },
      rejected: { variant: "destructive", icon: XCircle, label: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.submitted;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      proposal: { variant: "outline", label: "Proposal" },
      mid: { variant: "outline", label: "Mid-Term" },
      final: { variant: "outline", label: "Final" },
    };

    const config = typeConfig[type] || typeConfig.proposal;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredReports = reports?.filter(report => {
    const matchesSearch = 
      report.projectId?.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.submittedBy?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportFile?.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.reportType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const handleReviewReport = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setIsEditModalOpen(true);
  };

  const handleEditComplete = () => {
    setIsEditModalOpen(false);
    setEditingReport(null);
  };

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
        <p className="text-gray-500">
          {userType === 'student' 
            ? "You haven't submitted any reports for review yet."
            : "No reports have been submitted for your review yet."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filter Section */}
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5 text-indigo-600" />
            Search & Filter Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by project name, student name, or report type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
          
          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filter by Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📊 All Status</SelectItem>
                  <SelectItem value="submitted">⏰ Submitted</SelectItem>
                  <SelectItem value="under_review">👁️ Under Review</SelectItem>
                  <SelectItem value="approved">✅ Approved</SelectItem>
                  <SelectItem value="needs_revision">⚠️ Needs Revision</SelectItem>
                  <SelectItem value="rejected">❌ Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filter by Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📄 All Types</SelectItem>
                  <SelectItem value="proposal">📋 Proposal</SelectItem>
                  <SelectItem value="mid">📊 Mid-Term</SelectItem>
                  <SelectItem value="final">📑 Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">{filteredReports.length}</span> of <span className="font-medium text-gray-900">{reports.length}</span> reports
            </p>
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="text-xs"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report._id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500 group">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                        {report.projectId?.projectName}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(report.reportType)}
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                          v{report.version}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(report.status)}
                    <div className="flex gap-2">
                      {userType === 'student' && report.status === 'submitted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReport(report)}
                          className="flex items-center gap-2 px-3 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => userType === 'supervisor' ? handleReviewReport(report) : handleViewReport(report)}
                        className="flex items-center gap-2 px-4 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                        {userType === 'supervisor' ? 'Review' : 'View'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Student Information Section */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 ring-1 ring-white shadow-sm">
                      <AvatarImage src={report.submittedBy?.photo} />
                      <AvatarFallback className="text-xs font-medium">
                        {getInitials(report.submittedBy?.fullname || 'Unknown User')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{report.submittedBy?.fullname || 'Unknown User'}</p>
                      <p className="text-xs text-gray-600">Student</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-900">
                        {report.submittedAt && !isNaN(new Date(report.submittedAt).getTime()) 
                          ? format(new Date(report.submittedAt), "MMM dd, yyyy")
                          : "Unknown date"
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {report.submittedAt && !isNaN(new Date(report.submittedAt).getTime()) 
                          ? format(new Date(report.submittedAt), "h:mm a")
                          : "Unknown time"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* File Information Section */}
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-md">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{report.reportFile?.fileName}</p>
                      <p className="text-xs text-gray-600">
                        {(report.reportFile?.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(report.reportFile?.filePath, '_blank')}
                    className="flex items-center gap-1 px-2 py-1 text-xs h-7"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </div>

                {/* Feedback Summary Section */}
                {report.supervisorFeedback && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Feedback Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {report.supervisorFeedback.overallComments && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-800">Overall Comments</span>
                        </div>
                      )}
                      {report.supervisorFeedback.sectionFeedback?.length > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm font-medium text-orange-800">
                            {report.supervisorFeedback.sectionFeedback.length} Section Feedback
                          </span>
                        </div>
                      )}
                      {report.studentResponse?.responseComments && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <NotificationBadge 
                            count={userType === 'supervisor' && report.studentResponse?.isNew ? 1 : 0}
                            variant="success"
                            size="sm"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </NotificationBadge>
                          <span className="text-sm font-medium text-green-800">Student Response</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-8">
          <Filter className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No reports match your current filters</p>
        </div>
      )}

      {/* Report Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {userType === 'supervisor' 
                ? `Report Review - ${selectedReport?.projectId?.projectName}`
                : `Report Feedback - ${selectedReport?.projectId?.projectName}`
              }
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseModal}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          {selectedReport && (
            <>
              {userType === 'supervisor' ? (
                <SupervisorReportReview 
                  reportId={selectedReport._id} 
                  onClose={handleCloseModal}
                />
              ) : (
                <StudentReportFeedback 
                  report={selectedReport}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Report Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Edit Report - {editingReport?.projectId?.projectName}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditComplete}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          {editingReport && (
            <EditReportSubmission 
              report={editingReport}
              onEditComplete={handleEditComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportList;
