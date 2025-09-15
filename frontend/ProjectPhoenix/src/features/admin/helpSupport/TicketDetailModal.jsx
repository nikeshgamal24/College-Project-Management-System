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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { 
  useUpdateTicketMutation, 
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useGetTicketByIdQuery
} from "@/api/ticketApiSlice";

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

export default function TicketDetailModal({ ticket, isOpen, onClose }) {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const [updateTicket] = useUpdateTicketMutation();
  const [addComment] = useAddCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  // Fetch fresh ticket data when modal is open
  const { data: freshTicketData, isLoading: ticketLoading } = useGetTicketByIdQuery(
    ticket?._id,
    {
      skip: !ticket?._id || !isOpen,
    }
  );

  const currentTicket = freshTicketData?.data || ticket;

  if (!currentTicket) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      setIsSubmitting(true);
      await updateTicket({
        id: currentTicket._id,
        status: newStatus,
      }).unwrap();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      setIsSubmitting(true);
      await updateTicket({
        id: currentTicket._id,
        priority: newPriority,
      }).unwrap();
    } catch (error) {
      console.error("Failed to update priority:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      await addComment({
        id: currentTicket._id,
        message: commentText.trim(),
      }).unwrap();
      setCommentText("");
      // Comment will be refreshed automatically via the fresh data fetch
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditCommentText(comment.message);
  };

  const handleSaveEdit = async () => {
    if (!editCommentText.trim() || !editingComment) return;

    try {
      setIsSubmitting(true);
      await updateComment({
        ticketId: currentTicket._id,
        commentId: editingComment._id,
        message: editCommentText.trim(),
      }).unwrap();
      setEditingComment(null);
      setEditCommentText("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setIsSubmitting(true);
      await deleteComment({
        ticketId: currentTicket._id,
        commentId: commentId,
      }).unwrap();
    } catch (error) {
      console.error("Failed to delete comment:", error);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl font-semibold truncate">
                Ticket #{currentTicket.ticketId || currentTicket._id}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm sm:text-base line-clamp-2">
                {currentTicket.title}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="ml-2 flex-shrink-0">
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
                      <Select
                        value={currentTicket.status}
                        onValueChange={handleStatusChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            <Badge className={`${getStatusColor(currentTicket.status)} flex items-center gap-1 w-fit`}>
                              {getStatusIcon(currentTicket.status)}
                              {currentTicket.status.charAt(0).toUpperCase() + currentTicket.status.slice(1).replace('_', ' ')}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Priority</Label>
                    <div className="mt-1">
                      <Select
                        value={currentTicket.priority}
                        onValueChange={handlePriorityChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            <Badge className={`${getPriorityColor(currentTicket.priority)} flex items-center gap-1 w-fit`}>
                              {currentTicket.priority.charAt(0).toUpperCase() + currentTicket.priority.slice(1)}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
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
                              {comment.authorName || "Admin"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          {/* Admin actions for comments */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleEditComment(comment)}
                                className="flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    className="flex items-center gap-2 text-red-600"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this comment? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteComment(comment._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {editingComment && editingComment._id === comment._id ? (
                          <div className="mt-2 space-y-2">
                            <Textarea
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="w-full"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={handleSaveEdit}
                                size="sm"
                                disabled={!editCommentText.trim() || isSubmitting}
                              >
                                Save
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">
                            {comment.message}
                          </p>
                        )}
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