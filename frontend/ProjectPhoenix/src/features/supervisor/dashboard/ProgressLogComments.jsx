import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { MessageSquare, Send, Loader2, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAddProgressLogCommentMutation } from "../supervisorApiSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const ProgressLogComments = ({ progressLog }) => {
  const [comment, setComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [addProgressLogComment, { isLoading }] = useAddProgressLogCommentMutation();

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

  const comments = progressLog.supervisorComments || [];

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
        {/* Add Comment Section */}
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

        {/* Comments List */}
        {comments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              {comments
                .sort((a, b) => new Date(b.commentedAt) - new Date(a.commentedAt))
                .map((comment, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.commentedBy?.fullname || 'Supervisor'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(comment.commentedAt), "PP 'at' p")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {comment.comment}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {comments.length === 0 && (
          <div className="text-center py-6 text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Add the first comment to provide feedback</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressLogComments;
