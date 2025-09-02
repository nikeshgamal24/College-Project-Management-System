import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { MessageSquare, Send, Loader2, User, Edit, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { 
  useAddProgressLogCommentMutation,
  useUpdateProgressLogCommentMutation,
  useDeleteProgressLogCommentMutation 
} from "../supervisorApiSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

import { 
  canEditSupervisorComment, 
  canDeleteSupervisorComment, 
  canAddSupervisorComment,
  canViewSupervisorComments 
} from "@/lib/permissions";
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

const ProgressLogComments = ({ progressLog, showInputField = true, user }) => {
  const [comment, setComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isDeletingComment, setIsDeletingComment] = useState(null);
  
  const [addProgressLogComment, { isLoading }] = useAddProgressLogCommentMutation();
  const [updateProgressLogComment, { isLoading: isUpdating }] = useUpdateProgressLogCommentMutation();
  const [deleteProgressLogComment, { isLoading: isDeleting }] = useDeleteProgressLogCommentMutation();

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Comment Required",
        description: "Please enter a comment before submitting.",
      });
      return;
    }

    setIsAddingComment(true);
    try {
      const res = await addProgressLogComment({
        id: progressLog._id,
        comment: comment.trim(),
      });

      if (res.error) {
        throw new Error("Could not add comment");
      }

      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });

      setComment("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something Went Wrong!!",
        description: error.message,
      });
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditCommentText(comment.comment);
  };

  const handleUpdateComment = async () => {
    if (!editCommentText.trim()) {
      toast({
        variant: "destructive",
        title: "Comment Required",
        description: "Please enter a comment before updating.",
      });
      return;
    }

    try {
      const res = await updateProgressLogComment({
        id: progressLog._id,
        commentId: editingComment._id,
        comment: editCommentText.trim(),
      });

      if (res.error) {
        throw new Error("Could not update comment");
      }

      toast({
        title: "Comment Updated",
        description: "Your comment has been updated successfully.",
      });

      setEditingComment(null);
      setEditCommentText("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something Went Wrong!!",
        description: error.message,
      });
    }
  };

  const handleDeleteComment = async (comment) => {
    try {
      const res = await deleteProgressLogComment({
        id: progressLog._id,
        commentId: comment._id,
      });

      if (res.error) {
        throw new Error("Could not delete comment");
      }

      toast({
        title: "Comment Deleted",
        description: "Your comment has been deleted successfully.",
      });

      setIsDeletingComment(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something Went Wrong!!",
        description: error.message,
      });
    }
  };

  const isCommentOwner = (comment) => {
    return canEditSupervisorComment(user, comment);
  };

  const comments = progressLog.supervisorComments || [];
  
  // Temporary debug to see what's happening
  console.log('ProgressLogComments Debug:', {
    progressLogId: progressLog._id,
    progressLogTitle: progressLog.title,
    commentsCount: comments.length,
    comments: comments,
    user: user?.fullname,
    canView: canViewSupervisorComments(user, progressLog)
  });



  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Supervisor Comments
          {comments.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {comments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Section - Only show if showInputField is true and user can add comments */}
        {showInputField && canAddSupervisorComment(user, progressLog) && (
          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment about this progress log..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={isLoading || !comment.trim() || isAddingComment}
                className="flex items-center gap-2"
              >
                {isLoading || isAddingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Add Comment
              </Button>
            </div>
          </div>
        )}



        {/* Comments List - Show if there are comments */}
        {comments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              {comments
                .sort((a, b) => new Date(b.commentedAt) - new Date(a.commentedAt))
                .map((comment, index) => (
                  <div key={comment._id || index} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.commentedBy?.photo} />
                      <AvatarFallback className="bg-slate-200 text-xs">
                        {comment.commentedBy?.fullname ? 
                          getInitials(comment.commentedBy.fullname) : 
                          <User className="w-4 h-4" />
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.commentedBy?.fullname || 'Supervisor'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {comment.commentedAt && !isNaN(new Date(comment.commentedAt).getTime()) 
                              ? format(new Date(comment.commentedAt), "PP 'at' p")
                              : "Unknown date"
                            }
                          </span>
                        </div>
                        {/* Edit and Delete buttons for comment owner */}
                        {canEditSupervisorComment(user, comment) && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditComment(comment)}
                              className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-slate-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
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
                                    onClick={() => handleDeleteComment(comment)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      'Delete'
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                      {editingComment && editingComment._id === comment._id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="min-h-[60px] resize-none"
                            disabled={isUpdating}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingComment(null);
                                setEditCommentText("");
                              }}
                              disabled={isUpdating}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleUpdateComment}
                              disabled={isUpdating || !editCommentText.trim()}
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                'Update'
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {/* Show "No comments yet" only when there are actually no comments */}
        {comments.length === 0 && (
          <div className="text-center py-6 text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
            {showInputField && canAddSupervisorComment(user, progressLog) && (
              <p className="text-xs">Add the first comment to provide feedback</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressLogComments;
