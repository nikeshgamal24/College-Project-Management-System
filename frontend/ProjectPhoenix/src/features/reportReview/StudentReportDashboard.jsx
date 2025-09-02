import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText } from "lucide-react";
import { useGetStudentReportsQuery } from "./reportReviewApiSlice";
import StudentReportSubmission from "./StudentReportSubmission";
import ReportList from "./ReportList";

const StudentReportDashboard = ({ project }) => {
  const [activeTab, setActiveTab] = useState("list");
  const [showSubmission, setShowSubmission] = useState(false);

  const { data: reportsData, isLoading, error } = useGetStudentReportsQuery({
    projectId: project?._id
  }, {
    skip: !project?._id // Skip the query if no project ID
  });

  // Debug logging
  console.log("StudentReportDashboard - project:", project);
  console.log("StudentReportDashboard - reportsData:", reportsData);
  console.log("StudentReportDashboard - error:", error);

  const reports = reportsData?.data?.reports || [];
  
  // Safety check to prevent undefined errors
  if (reportsData && !reportsData.data) {
    console.warn("Unexpected API response structure:", reportsData);
  }

  const handleSubmissionComplete = () => {
    setShowSubmission(false);
    setActiveTab("list");
  };

  if (!project?._id) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No project selected</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading reports:", error);
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Failed to load reports</p>
        <p className="text-sm text-gray-500 mt-2">
          {error?.data?.message || error?.message || "Please try again later"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Review</h2>
          <p className="text-gray-600">Submit and track your project reports</p>
        </div>
        <Button
          onClick={() => setShowSubmission(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Submit Report
        </Button>
      </div>

      {/* Submission Modal */}
      {showSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <StudentReportSubmission
                project={project}
                onSubmissionComplete={handleSubmissionComplete}
              />
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmission(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            My Reports ({reports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <ReportList
            reports={reports}
            userType="student"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentReportDashboard;
