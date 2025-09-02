import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Loader2,
  Eye,
  Download,
  Clock,
  Reply,
  X
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  useGetReportForReviewQuery,
  useAddSectionFeedbackMutation,
  useAddOverallCommentsMutation,
  useUpdateReportStatusMutation,
} from "./reportReviewApiSlice";

const SupervisorReportReview = ({ reportId, onClose }) => {
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newPageNumber, setNewPageNumber] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newFeedbackType, setNewFeedbackType] = useState("suggestion");
  const [newPriority, setNewPriority] = useState("medium");
  const [overallComments, setOverallComments] = useState("");

  const { data: reportData, isLoading, error } = useGetReportForReviewQuery(reportId);
  const [addSectionFeedback, { isLoading: isAddingFeedback }] = useAddSectionFeedbackMutation();
  const [addOverallComments, { isLoading: isAddingComments }] = useAddOverallCommentsMutation();
  const [updateReportStatus, { isLoading: isUpdatingStatus }] = useUpdateReportStatusMutation();

  const report = reportData?.data?.report;

  const handleAddSectionFeedback = async () => {
    if (!newSectionTitle || !newPageNumber || !newComment) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      await addSectionFeedback({
        id: reportId,
        sectionTitle: newSectionTitle,
        pageNumber: parseInt(newPageNumber),
        comment: newComment,
        feedbackType: newFeedbackType,
        priority: newPriority,
      }).unwrap();

      toast({
        title: "Section Feedback Added",
        description: "Your feedback has been added successfully",
      });

      // Reset form
      setNewSectionTitle("");
      setNewPageNumber("");
      setNewComment("");
      setNewFeedbackType("suggestion");
      setNewPriority("medium");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Add Feedback",
        description: error?.data?.message || "Please try again",
      });
    }
  };

  const handleAddOverallComments = async () => {
    if (!overallComments.trim()) {
      toast({
        variant: "destructive",
        title: "Comments Required",
        description: "Please enter your overall comments",
      });
      return;
    }

    try {
      await addOverallComments({
        id: reportId,
        overallComments: overallComments.trim(),
      }).unwrap();

      toast({
        title: "Overall Comments Added",
        description: "Your comments have been saved successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Add Comments",
        description: error?.data?.message || "Please try again",
      });
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await updateReportStatus({
        id: reportId,
        status,
        overallComments: overallComments || report?.supervisorFeedback?.overallComments,
      }).unwrap();

      toast({
        title: `Report ${status.replace('_', ' ')}`,
        description: `Report has been ${status.replace('_', ' ')} successfully`,
      });

      // Close modal after successful status update
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1000); // Small delay to show the success message
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Update Status",
        description: error?.data?.message || "Please try again",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { variant: "secondary", icon: FileText, label: "Submitted" },
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.medium;
  };

  const getFeedbackTypeColor = (type) => {
    const colors = {
      suggestion: "bg-blue-100 text-blue-800",
      correction: "bg-red-100 text-red-800",
      praise: "bg-green-100 text-green-800",
      question: "bg-purple-100 text-purple-800",
    };
    return colors[type] || colors.suggestion;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Failed to load report details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Report Header */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report Review
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {report.projectId?.projectName} • Version {report.version}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(report.status)}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(report.reportFile?.filePath, '_blank')}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={report.submittedBy?.photo} />
                  <AvatarFallback className="text-sm">
                    {getInitials(report.submittedBy?.fullname)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{report.submittedBy?.fullname}</p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-sm">
                    {report.submittedAt && !isNaN(new Date(report.submittedAt).getTime()) 
                      ? format(new Date(report.submittedAt), "MMM dd, yyyy")
                      : "Unknown date"
                    }
                  </p>
                  <p className="text-xs text-gray-500">Submitted</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-sm">{(report.reportFile?.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                  <p className="text-xs text-gray-500">File Size</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Review Interface */}
      <Tabs defaultValue="feedback" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Section Feedback
          </TabsTrigger>
          <TabsTrigger value="overall" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Overall Comments
          </TabsTrigger>
          <TabsTrigger value="student-response" className="flex items-center gap-2">
            <Reply className="w-4 h-4" />
            Student Response
            {report.studentResponse?.responseComments && (
              <Badge variant="secondary" className="ml-1 text-xs">
                New
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Review Status
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Section Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          {/* Quick Feedback Form */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-green-600" />
                Add Section Feedback
              </CardTitle>
              <p className="text-sm text-gray-600">Provide specific feedback on report sections</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sectionTitle" className="text-sm font-medium">Section Title</Label>
                  <Input
                    id="sectionTitle"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="e.g., Introduction, Methodology, Results"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pageNumber" className="text-sm font-medium">Page Number</Label>
                  <Input
                    id="pageNumber"
                    type="number"
                    value={newPageNumber}
                    onChange={(e) => setNewPageNumber(e.target.value)}
                    placeholder="Page number"
                    className="h-10"
                  />
                </div>
              </div>

              {/* Feedback Classification Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feedbackType" className="text-sm font-medium">Feedback Type</Label>
                  <Select value={newFeedbackType} onValueChange={setNewFeedbackType}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suggestion">💡 Suggestion</SelectItem>
                      <SelectItem value="correction">⚠️ Correction</SelectItem>
                      <SelectItem value="praise">👍 Praise</SelectItem>
                      <SelectItem value="question">❓ Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">Priority Level</Label>
                  <Select value={newPriority} onValueChange={setNewPriority}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="high">🟠 High</SelectItem>
                      <SelectItem value="critical">🔴 Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Comment Section */}
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-sm font-medium">Detailed Feedback</Label>
                <Textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Provide specific, actionable feedback for this section. Be clear about what needs to be improved and how..."
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {newComment.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleAddSectionFeedback}
                  disabled={isAddingFeedback || !newSectionTitle.trim() || !newComment.trim()}
                  className="flex items-center gap-2 px-6"
                  size="lg"
                >
                  {isAddingFeedback ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add Section Feedback
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Section Feedback */}
          {report.supervisorFeedback?.sectionFeedback?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Section Feedback ({report.supervisorFeedback.sectionFeedback.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.supervisorFeedback.sectionFeedback.map((feedback, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{feedback.sectionTitle}</h4>
                        <Badge variant="outline">Page {feedback.pageNumber}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getFeedbackTypeColor(feedback.feedbackType)}>
                          {feedback.feedbackType}
                        </Badge>
                        <Badge className={getPriorityColor(feedback.priority)}>
                          {feedback.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{feedback.comment}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={feedback.commentedBy?.photo} />
                        <AvatarFallback className="text-xs">
                          {getInitials(feedback.commentedBy?.fullname)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{feedback.commentedBy?.fullname}</span>
                      <span>•</span>
                      <span>
                        {feedback.commentedAt && !isNaN(new Date(feedback.commentedAt).getTime()) 
                          ? format(new Date(feedback.commentedAt), "PP 'at' p")
                          : "Unknown date"
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Enhanced Overall Comments Tab */}
        <TabsContent value="overall" className="space-y-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-blue-600" />
                Overall Report Comments
              </CardTitle>
              <p className="text-sm text-gray-600">Provide comprehensive feedback on the entire report</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="overallComments" className="text-sm font-medium">Overall Assessment</Label>
                <Textarea
                  id="overallComments"
                  value={overallComments || report.supervisorFeedback?.overallComments || ""}
                  onChange={(e) => setOverallComments(e.target.value)}
                  placeholder="Provide comprehensive feedback about the report including strengths, areas for improvement, and overall assessment..."
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {(overallComments || report.supervisorFeedback?.overallComments || "").length}/1000 characters
                </p>
              </div>
              
              {/* Quick Action Buttons */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOverallComments(prev => prev + "\n\nStrengths:\n• \n\nAreas for Improvement:\n• \n\nOverall Assessment:\n• ")}
                  className="text-xs"
                >
                  📝 Add Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOverallComments(prev => prev + "\n\nPlease address the following points before resubmission:\n1. \n2. \n3. ")}
                  className="text-xs"
                >
                  📋 Revision List
                </Button>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleAddOverallComments}
                  disabled={isAddingComments || !overallComments?.trim()}
                  className="flex items-center gap-2 px-6"
                  size="lg"
                >
                  {isAddingComments ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  Save Overall Comments
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Response Tab */}
        <TabsContent value="student-response" className="space-y-6">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Reply className="w-5 h-5 text-purple-600" />
                Student Response to Feedback
              </CardTitle>
              <p className="text-sm text-gray-600">View the student's response to your feedback</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {report.studentResponse?.responseComments ? (
                <div className="space-y-4">
                  {/* Student Response Content */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={report.submittedBy?.photo} />
                          <AvatarFallback className="text-sm">
                            {getInitials(report.submittedBy?.fullname)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {report.submittedBy?.fullname}
                          </p>
                          <p className="text-xs text-gray-500">Student Response</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Response:</p>
                        <div className="p-3 bg-white rounded-md border">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {report.studentResponse.responseComments}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          Responded on {
                            report.studentResponse.respondedAt && !isNaN(new Date(report.studentResponse.respondedAt).getTime()) 
                              ? format(new Date(report.studentResponse.respondedAt), "MMM dd, yyyy 'at' h:mm a")
                              : "Unknown date"
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Response Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-3">Response Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Response Length:</p>
                        <p className="font-medium">{report.studentResponse.responseComments.length} characters</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Response Time:</p>
                        <p className="font-medium">
                          {report.studentResponse.respondedAt && report.supervisorFeedback?.reviewedAt && 
                           !isNaN(new Date(report.studentResponse.respondedAt).getTime()) &&
                           !isNaN(new Date(report.supervisorFeedback.reviewedAt).getTime()) ? (
                            (() => {
                              const responseTime = new Date(report.studentResponse.respondedAt);
                              const reviewTime = new Date(report.supervisorFeedback.reviewedAt);
                              const diffHours = Math.round((responseTime - reviewTime) / (1000 * 60 * 60));
                              return diffHours > 0 ? `${diffHours} hours after review` : 'Same day';
                            })()
                          ) : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Reply className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 font-medium">No Student Response Yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    The student hasn't responded to your feedback yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Review Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                Final Review Decision
              </CardTitle>
              <p className="text-sm text-gray-600">Make your final decision on this report</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Status Display */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Current Status</p>
                    <div>
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">
                      {report.supervisorFeedback?.reviewedAt && !isNaN(new Date(report.supervisorFeedback.reviewedAt).getTime()) 
                        ? format(new Date(report.supervisorFeedback.reviewedAt), "MMM dd, yyyy")
                        : "Not reviewed yet"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Choose Final Status:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus('approved')}
                    disabled={isUpdatingStatus}
                    className="flex flex-col items-center gap-2 p-4 h-16 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-sm">Accepted</p>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus('needs_revision')}
                    disabled={isUpdatingStatus}
                    className="flex flex-col items-center gap-2 p-4 h-16 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200"
                  >
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="font-semibold text-sm">Needs Improvement</p>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={isUpdatingStatus}
                    className="flex flex-col items-center gap-2 p-4 h-16 border-red-200 hover:border-red-400 hover:bg-red-50 transition-all duration-200"
                  >
                    <XCircle className="w-5 h-5 text-red-600" />
                    <p className="font-semibold text-sm">Rejected</p>
                  </Button>
                </div>
              </div>

              {/* Review Summary */}
              {(report.supervisorFeedback?.overallComments || report.supervisorFeedback?.sectionFeedback?.length > 0) && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800 mb-3">Review Summary</p>
                  <div className="space-y-2">
                    {report.supervisorFeedback?.overallComments && (
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>Overall comments provided</span>
                      </div>
                    )}
                    {report.supervisorFeedback?.sectionFeedback?.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>{report.supervisorFeedback.sectionFeedback.length} section feedback items</span>
                      </div>
                    )}
                    {report.studentResponse?.responseComments && (
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>Student has responded to feedback</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Close Button */}
      {onClose && (
        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Close Review
          </Button>
        </div>
      )}
    </div>
  );
};

export default SupervisorReportReview;
