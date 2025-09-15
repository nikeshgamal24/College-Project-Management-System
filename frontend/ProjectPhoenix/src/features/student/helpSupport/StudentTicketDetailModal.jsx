import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  User,
  Calendar,
  Tag,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  Send,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { useAddCommentMutation, useGetTicketByIdQuery } from "@/api/ticketApiSlice";

const getStatusColor = (status) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "new":
      return <AlertCircle className="h-4 w-4" />;
    case "in_progress":
      return <Clock className="h-4 w-4" />;
    case "resolved":
      return <CheckCircle className="h-4 w-4" />;
    case "closed":
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function StudentTicketDetailModal({ ticket, isOpen, onClose }) {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addComment] = useAddCommentMutation();
  
  // Fetch fresh ticket data to get latest comments
  const { data: freshTicketData, isLoading: isTicketLoading } = useGetTicketByIdQuery(
    ticket?._id,
    {
      skip: !isOpen || !ticket?._id,
    }
  );

  const currentTicket = freshTicketData?.data || ticket;

  if (!ticket) return null;

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      await addComment({
        id: currentTicket._id,
        message: commentText.trim(),
      }).unwrap();
      setCommentText("");
      // Close modal after successful comment
      onClose();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Ticket #{currentTicket.ticketId || currentTicket._id}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {currentTicket.title}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      <Badge className={`${getStatusColor(currentTicket.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(currentTicket.status)}
                        {currentTicket.status.charAt(0).toUpperCase() + currentTicket.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Priority</Label>
                    <div className="mt-1">
                      <Badge className={`${getPriorityColor(currentTicket.priority)} flex items-center gap-1 w-fit`}>
                        {currentTicket.priority.charAt(0).toUpperCase() + currentTicket.priority.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {currentTicket.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Submitted By</p>
                      <p className="text-sm text-gray-500">
                        {currentTicket.submittedByName} ({currentTicket.submittedByRole})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(currentTicket.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {currentTicket.assignedTo && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Assigned To</p>
                      <p className="text-sm text-gray-500">
                        {currentTicket.assignedToName || "Unassigned"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({currentTicket.comments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <div className="space-y-2">
                  <Label htmlFor="comment">Add a comment</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="comment"
                      placeholder="Write your comment here..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1"
                      rows={3}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || isSubmitting}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Comments List */}
                <div className="space-y-3">
                  {currentTicket.comments && currentTicket.comments.length > 0 ? (
                    currentTicket.comments.map((comment, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {comment.authorName || "Unknown"}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({comment.authorRole})
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">
                          {comment.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
