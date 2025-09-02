import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileUp, Loader2, Upload, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSubmitReportForReviewMutation } from "./reportReviewApiSlice";

const StudentReportSubmission = ({ project, onSubmissionComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportType, setReportType] = useState("");
  const [version, setVersion] = useState(1);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submitReportForReview, { isLoading }] = useSubmitReportForReviewMutation();

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length > 1) {
      toast({
        variant: "destructive",
        title: "Multiple Files Detected",
        description: "Please upload only one file",
      });
      return;
    }

    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error) => {
        if (error.code === "file-invalid-type") {
          toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Only PDF files are allowed",
          });
        } else if (error.code === "file-too-large") {
          toast({
            variant: "destructive",
            title: "File Too Large",
            description: "File must be smaller than 25MB",
          });
        }
      });
    });

    acceptedFiles.forEach((file) => {
      setSelectedFile(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!selectedFile || !reportType) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a file and report type",
      });
      return;
    }

    try {
      const result = await submitReportForReview({
        reportFile: selectedFile,
        projectId: project._id,
        reportType,
        version,
      }).unwrap();

      toast({
        title: "Report Submitted Successfully",
        description: "Your report has been submitted for supervisor review",
      });

      // Reset form
      setSelectedFile(null);
      setReportType("");
      setVersion(1);
      setSubmissionNotes("");
      
      onSubmissionComplete?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error?.data?.message || "Failed to submit report. Please try again.",
      });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Submit Report for Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="reportType">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proposal">Proposal Report</SelectItem>
              <SelectItem value="mid">Mid-Term Report</SelectItem>
              <SelectItem value="final">Final Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Version Selection */}
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            type="number"
            min="1"
            value={version}
            onChange={(e) => setVersion(parseInt(e.target.value) || 1)}
            placeholder="Version number"
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Report File</Label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <FileUp className="w-8 h-8 text-primary" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <FileUp className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? "Drop the file here" : "Click or drag to upload"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Only PDF files, max 25MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submission Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Submission Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes about this submission..."
            value={submissionNotes}
            onChange={(e) => setSubmissionNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Separator />

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedFile || !reportType}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Submit for Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentReportSubmission;
