import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CheckCheck, Loader2, MessageSquare } from "lucide-react";
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
import { toast } from "@/components/ui/use-toast";
import { useBulkVerifyProgressLogsMutation } from "../supervisorApiSlice";

const BulkProgressLogOperations = ({ unverifiedLogs }) => {
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [bulkVerifyProgressLogs, { isLoading }] = useBulkVerifyProgressLogsMutation();

  const handleSelectAll = () => {
    if (selectedLogs.length === unverifiedLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(unverifiedLogs.map(log => log._id));
    }
  };

  const handleSelectLog = (logId) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const handleBulkVerify = async () => {
    try {
      const res = await bulkVerifyProgressLogs({
        progressLogIds: selectedLogs,
        approvedDate: new Date(),
      });

      if (res.error) {
        throw new Error("Could not verify progress logs");
      }

      toast({
        title: "Progress Logs Verified",
        description: `${selectedLogs.length} progress logs verified successfully`,
      });

      setSelectedLogs([]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something Went Wrong!!",
        description: error.message,
      });
    }
  };

  if (unverifiedLogs.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCheck className="w-5 h-5" />
            Bulk Operations
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {unverifiedLogs.length} unverified logs
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={selectedLogs.length === unverifiedLogs.length}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            Select All ({unverifiedLogs.length})
          </label>
        </div>

        <Separator />

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {unverifiedLogs.map((log) => (
            <div
              key={log._id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Checkbox
                id={log._id}
                checked={selectedLogs.includes(log._id)}
                onCheckedChange={() => handleSelectLog(log._id)}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{log.title}</div>
                <div className="text-xs text-slate-500 truncate">
                  {log.description}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {log.author.fullname} • {format(log.logDate, "PP")}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedLogs.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                {selectedLogs.length} log{selectedLogs.length !== 1 ? 's' : ''} selected
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm" 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCheck className="w-4 h-4" />
                    )}
                    Verify Selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Bulk Verification</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to verify {selectedLogs.length} progress log{selectedLogs.length !== 1 ? 's' : ''}? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkVerify}>
                      Verify {selectedLogs.length} Log{selectedLogs.length !== 1 ? 's' : ''}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkProgressLogOperations;
