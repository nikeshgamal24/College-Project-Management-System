import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Reply,
  Send
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useRespondToFeedbackMutation } from "./reportReviewApiSlice";

const StudentReportFeedback = ({ report }) => {
  const [responseComments, setResponseComments] = useState("");
  const [respondToFeedback, { isLoading: isResponding }] = useRespondToFeedbackMutation();

  const handleRespondToFeedback = async () => {
    if (!responseComments.trim()) {
      toast({
        variant: "destructive",
        title: "Response Required",
        description: "Please enter your response to the feedback",
      });
      return;
    }

    try {
      await respondToFeedback({
        id: report._id,
        responseComments: responseComments.trim(),
      }).unwrap();

      toast({
        title: "Response Submitted",
        description: "Your response has been submitted successfully",
      });

      setResponseComments("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to Submit Response",
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

  return (
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
                  {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report Feedback
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Version {report.version} • Submitted {
                    report.submittedAt && !isNaN(new Date(report.submittedAt).getTime()) 
                      ? format(new Date(report.submittedAt), "MMM dd, yyyy 'at' h:mm a")
                      : "Unknown date"
                  }
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
      <CardContent className="space-y-6">
        {/* Report File */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-gray-500" />
            <div>
              <p className="font-medium">{report.reportFile?.fileName}</p>
              <p className="text-sm text-gray-500">
                {(report.reportFile?.fileSize / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(report.reportFile?.filePath, '_blank')}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Enhanced Feedback Tabs */}
        <Tabs defaultValue="overall" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overall" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Overall Comments
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Section Feedback
              {report.supervisorFeedback?.sectionFeedback?.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {report.supervisorFeedback.sectionFeedback.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="response" className="flex items-center gap-2">
              <Reply className="w-4 h-4" />
              Your Response
            </TabsTrigger>
          </TabsList>

          {/* Overall Comments */}
          <TabsContent value="overall" className="space-y-4">
            {report.supervisorFeedback?.overallComments ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Overall Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{report.supervisorFeedback.overallComments}</p>
                  </div>
                  {report.supervisorFeedback.reviewedBy && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t text-sm text-gray-500">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={report.supervisorFeedback.reviewedBy?.photo} />
                        <AvatarFallback className="text-xs">
                          {getInitials(report.supervisorFeedback.reviewedBy?.fullname)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{report.supervisorFeedback.reviewedBy?.fullname}</span>
                      <span>•</span>
                      <span>
                        {report.supervisorFeedback.reviewedAt && !isNaN(new Date(report.supervisorFeedback.reviewedAt).getTime()) 
                          ? format(new Date(report.supervisorFeedback.reviewedAt), "PP 'at' p")
                          : "Unknown date"
                        }
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No overall comments yet</p>
                <p className="text-sm">Your supervisor hasn't provided overall feedback yet</p>
              </div>
            )}
          </TabsContent>

          {/* Section Feedback */}
          <TabsContent value="sections" className="space-y-4">
            {report.supervisorFeedback?.sectionFeedback?.length > 0 ? (
              <div className="space-y-4">
                {report.supervisorFeedback.sectionFeedback.map((feedback, index) => (
                  <Card key={index}>
                    <CardHeader>
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
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{feedback.comment}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No section feedback yet</p>
                <p className="text-sm">Your supervisor hasn't provided section-specific feedback yet</p>
              </div>
            )}
          </TabsContent>

          {/* Student Response */}
          <TabsContent value="response" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Reply className="w-5 h-5" />
                  Respond to Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.studentResponse?.responseComments ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2">Your Previous Response:</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {report.studentResponse.responseComments}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Responded on {
                          report.studentResponse.respondedAt && !isNaN(new Date(report.studentResponse.respondedAt).getTime()) 
                            ? format(new Date(report.studentResponse.respondedAt), "PP 'at' p")
                            : "Unknown date"
                        }
                      </p>
                    </div>
                    <Separator />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {report.studentResponse?.responseComments ? "Update Your Response:" : "Your Response:"}
                  </label>
                  <Textarea
                    value={responseComments}
                    onChange={(e) => setResponseComments(e.target.value)}
                    placeholder="Respond to the feedback provided by your supervisor..."
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleRespondToFeedback}
                  disabled={isResponding || !responseComments.trim()}
                  className="flex items-center gap-2"
                >
                  {isResponding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {report.studentResponse?.responseComments ? "Update Response" : "Submit Response"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StudentReportFeedback;
