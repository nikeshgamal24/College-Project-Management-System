import React, { useState } from "react";
import { useUpdateDefenseTimeMutation } from "../adminApiSlice";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

// Utility function to create a date in local timezone
const createLocalDateTime = (dateString, timeString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create date in local timezone
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return localDate;
};

const UpdateDefenseTimeDialog = ({ 
  isOpen, 
  onClose, 
  defense 
}) => {
  const [defenseDate, setDefenseDate] = useState("");
  const [defenseTime, setDefenseTime] = useState("");
  const [reason, setReason] = useState("");
  const [updateDefenseTime, { isLoading }] = useUpdateDefenseTimeMutation();
  const { toast } = useToast();

  // Initialize form with current defense data when dialog opens
  React.useEffect(() => {
    if (isOpen && defense) {
      // Convert defense date/time to local timezone for display
      const currentDate = new Date(defense.defenseDate);
      const currentTime = new Date(defense.defenseTime);
      
      // Use local timezone for display
      setDefenseDate(format(currentDate, "yyyy-MM-dd"));
      setDefenseTime(format(currentTime, "HH:mm"));
      setReason("");
    }
  }, [isOpen, defense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!defenseDate || !defenseTime) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both date and time",
      });
      return;
    }

    try {
      // Create date in local timezone using our utility function
      const combinedDateTime = createLocalDateTime(defenseDate, defenseTime);
      
      // Debug logging
      console.log('Selected date:', defenseDate);
      console.log('Selected time:', defenseTime);
      console.log('Combined datetime (local):', combinedDateTime);
      console.log('Combined datetime (ISO):', combinedDateTime.toISOString());
      console.log('Local timezone offset (minutes):', combinedDateTime.getTimezoneOffset());
      console.log('Local timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
      
      const result = await updateDefenseTime({
        defenseId: defense._id,
        defenseDate: combinedDateTime.toISOString(),
        defenseTime: combinedDateTime.toISOString(),
        reason: reason || "Defense time updated"
      }).unwrap();

      toast({
        title: "✅ Defense Time Updated",
        description: `Defense time has been successfully updated`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.data?.message || "Failed to update defense time",
      });
    }
  };

  const handleClose = () => {
    setDefenseDate("");
    setDefenseTime("");
    setReason("");
    onClose();
  };

  if (!defense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Update Defense Time
          </DialogTitle>
          <DialogDescription>
            Update the scheduled time for this defense. This will notify all evaluators about the change.
            <br />
            <span className="text-sm text-gray-500">
              Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defense-info" className="text-sm font-medium">
              Defense Information
            </Label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">{defense.event?.eventName}</p>
              <p className="text-xs text-gray-500">
                {defense.defenseType?.charAt(0).toUpperCase() + defense.defenseType?.slice(1)} Defense
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defense-date" className="text-sm font-medium">
                Defense Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="defense-date"
                  type="date"
                  value={defenseDate}
                  onChange={(e) => setDefenseDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defense-time" className="text-sm font-medium">
                Defense Time
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="defense-time"
                  type="time"
                  value={defenseTime}
                  onChange={(e) => setDefenseTime(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason for Change (Optional)
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g., Postponed due to technical issues, Rescheduled for better availability..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Defense Time"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDefenseTimeDialog;
