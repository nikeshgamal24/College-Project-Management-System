import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileUp, Loader2, Upload, X, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useUpdateReportMutation } from "./reportReviewApiSlice";

const EditReportSubmission = ({ report, onEditComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [updateReport, { isLoading }] = useUpdateReportMutation();

  const onDrop = (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
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
            description: "File must be smaller than 20MB",
          });
        }
      });
    });

    // Handle accepted files
    acceptedFiles.forEach((file) => {
      setSelectedFile(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 20971520, // 20MB
    multiple: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a new report file to upload",
      });
      return;
    }

    try {
      await updateReport({
        id: report._id,
        reportFile: selectedFile,
      }).unwrap();

      toast({
        title: "Report Updated Successfully",
        description: "Your report has been updated with the new file",
      });

      onEditComplete();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error?.data?.message || "Failed to update report. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onEditComplete();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Update Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Report Info */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Current Report</h4>
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <FileUp className="w-4 h-4" />
            <span>{report.reportFile?.fileName}</span>
            <Badge variant="outline" className="text-xs">
              v{report.version}
            </Badge>
          </div>
        </div>



        {/* File Upload */}
        <div className="space-y-2">
          <Label>New Report File</Label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <div className="mx-auto w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FileUp className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile ? selectedFile.name : "Click or drag new report file here"}
                </p>
                <p className="text-xs text-gray-500">
                  Only PDF files, MAX SIZE: 20MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileUp className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-800">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-green-600">
                  ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                className="text-green-600 hover:text-green-700 h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Update Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditReportSubmission;
