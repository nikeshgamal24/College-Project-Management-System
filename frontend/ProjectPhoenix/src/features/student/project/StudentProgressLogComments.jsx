import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { MessageSquare, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const StudentProgressLogComments = ({ progressLog }) => {
  const comments = progressLog.supervisorComments || [];

  if (comments.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Supervisor Comments
          <Badge variant="outline" className="text-xs">
            {comments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
};

export default StudentProgressLogComments;
