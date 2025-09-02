import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useUpdateProgressMutation } from "../studentApiSlice";
import { canEditProgressLog } from "@/lib/permissions";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";

const EditProgressLog = ({ progressLog, isOpen, onClose }) => {
  const user = useSelector(selectCurrentUser);
  const [formData, setFormData] = useState({
    title: progressLog?.title || "",
    description: progressLog?.description || "",
    logDate: progressLog?.logDate ? new Date(progressLog.logDate) : new Date(),
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [updateProgress, { isLoading }] = useUpdateProgressMutation();

  // Check if user can edit this progress log
  const canEdit = canEditProgressLog(user, progressLog);

  // If user cannot edit, close the dialog
  if (isOpen && !canEdit) {
    onClose();
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You are not authorized to edit this progress log.",
    });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and description are required",
      });
      return;
    }

    try {
      const result = await updateProgress({
        id: progressLog._id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        logDate: formData.logDate.toISOString(),
      });

      if (result.error) {
        throw new Error(result.error.data?.message || "Failed to update progress log");
      }

      toast({
        title: "Success",
        description: "Progress log updated successfully",
      });

      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update progress log",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Edit Progress Log
          </DialogTitle>
          <DialogDescription>
            Update your progress log details. You can only edit unapproved logs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter progress log title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your progress in detail"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Log Date</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.logDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.logDate ? format(formData.logDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.logDate}
                  onSelect={(date) => {
                    handleInputChange("logDate", date);
                    setIsCalendarOpen(false);
                  }}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Progress Log
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProgressLog;
