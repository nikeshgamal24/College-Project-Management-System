import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useDeleteProgressMutation } from "../studentApiSlice";
import { canDeleteProgressLog } from "@/lib/permissions";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";

const DeleteProgressLog = ({ progressLog, onDeleted }) => {
  const user = useSelector(selectCurrentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteProgress, { isLoading }] = useDeleteProgressMutation();

  // Check if user can delete this progress log
  const canDelete = canDeleteProgressLog(user, progressLog);

  const handleDelete = async () => {
    try {
      const result = await deleteProgress(progressLog._id);

      if (result.error) {
        throw new Error(result.error.data?.message || "Failed to delete progress log");
      }

      toast({
        title: "Success",
        description: "Progress log deleted successfully",
      });

      setIsOpen(false);
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete progress log",
      });
    }
  };

  // Don't render if user cannot delete
  if (!canDelete) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={progressLog.approved}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            Delete Progress Log
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this progress log? This action cannot be undone.
            <br />
            <br />
            <strong>Title:</strong> {progressLog.title}
            <br />
            <strong>Date:</strong> {new Date(progressLog.logDate).toLocaleDateString()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProgressLog;
