import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfigProvider, Steps } from "antd";
import {
  ArchiveRestore,
  BookCheck,
  ExternalLink,
  FileText,
  Footprints,
  Loader2,
  Edit,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import ProjectInfo from "./ProjectInfo";
import { useGetProjectQuery } from "../studentApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";
import { useGetStudentReportsQuery } from "../../reportReview/reportReviewApiSlice";
import UploadReport from "./UploadReport";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { daysFromToday } from "@/lib/utils";
import { Link } from "react-router-dom";
import NotificationBadge from "../../../components/ui/notification-badge";
import { useNotifications } from "../../../hooks/useNotifications";
import EditReportSubmission from "../../reportReview/EditReportSubmission";
import {
  EVENT_TYPE,
  PROGRESS_STATUS,
  ROLES_LIST,
  animationProps,
  getRankbyStatus,
} from "@/lib/config";
import Countdown from "react-countdown";
import { useState } from "react";
import { motion } from "framer-motion";
import ProjectEvaluations from "./ProjectEvaluations";
import Loader from "@/components/Loader";
import ApiError from "@/components/error/ApiError";
import { StudentReportDashboard } from "../../reportReview";

const renderer = ({ hours, minutes, seconds, completed }) => {
  const formatTime = (time) => time.toString().padStart(2, "0");

  if (completed) {
    return <Badge>Deadline Missed</Badge>;
  } else {
    return (
      <>
        <span className="text-slate-500">Time Remaining &nbsp;</span>
        <Badge>
          {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
        </Badge>
      </>
    );
  }
};

function StudentProject() {
  const [disableUpload, setDisableUpload] = useState({
    proposal: false,
    mid: false,
    final: false,
  });
  const [editingReport, setEditingReport] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const user = useSelector(selectCurrentUser);
  const { notifications } = useNotifications();

  const handleEditReport = (reportType, reportData) => {
    // Find the actual report from the fetched report data
    let actualReport = actualReports.find(report => 
      report.reportType === reportType
    );

    if (!actualReport) {
      console.warn(`No ${reportType} report found in actualReports, using fallback approach`);
      // Create a fallback report object using the project data
      actualReport = {
        _id: `${reportType}_fallback_${Date.now()}`, // Temporary ID for fallback
        reportType: reportType,
        version: 1,
        reportFile: {
          fileName: reportData?.fileName || `${reportType}_report.pdf`,
          filePath: reportData?.filePath,
          fileSize: reportData?.fileSize || 0
        },
        projectId: {
          projectName: project.data.projectName,
          projectCode: project.data.projectCode,
          _id: project.data._id
        },
        status: 'submitted' // Assume submitted since it's showing in the UI
      };
    }

    console.log(`Using ${reportType} report:`, actualReport);
    console.log(`Report status: ${actualReport.status}`);

    // Use the report object (either actual or fallback)
    setEditingReport(actualReport);
    setIsEditModalOpen(true);
  };

  const handleEditComplete = () => {
    setIsEditModalOpen(false);
    setEditingReport(null);
  };
  const {
    data: project,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetProjectQuery(user.project, { skip: !user.isAssociated });

  // Fetch actual report data with real ObjectIds
  const { data: reportsData } = useGetStudentReportsQuery({
    projectId: project?.data?._id
  }, {
    skip: !project?.data?._id
  });

  const actualReports = reportsData?.data?.reports || [];

  console.log(user);
  console.log(project);
  console.log("Actual reports:", actualReports);
  console.log("Actual reports length:", actualReports.length);
  actualReports.forEach((report, index) => {
    console.log(`Report ${index}:`, {
      type: report.reportType,
      status: report.status,
      id: report._id
    });
  });

  let content;

  if (user.isAssociated === false) {
    content = (
      <div className="flex flex-1 items-center justify-center bg-slate-50 ">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            You have no Active Project
          </h3>

          <p className="text-sm text-gray-500">
            You can start as soon as you enroll in an event.
          </p>

          <Button className="mt-4" asChild>
            <Link to={`/${ROLES_LIST.student}/dashboard`}>Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    content = <Loader />;
  } else if (isSuccess) {
    const rank = getRankbyStatus(user.progressStatus);
    const proposalReportDeadlineDays = daysFromToday(
      project.data.event.proposal.reportDeadline
    );

    let midReportDeadlineDays;

    if (project.data.event.mid.defense) {
      midReportDeadlineDays = daysFromToday(
        project.data.event.mid.reportDeadline
      );
    }

    const finalReportDeadlineDays = daysFromToday(
      project.data.event.final?.reportDeadline
    );

    content = (
      <motion.main
        {...animationProps()}
        className="grid flex-1 items-start gap-4  md:gap-6 lg:grid-cols-2 xl:grid-cols-3"
      >
        <div className="grid auto-rows-max items-start gap-4 md:gap-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
            <ProjectInfo
              user={user}
              project={project}
              isLoading={isLoading}
              isSuccess={isSuccess}
            />
          </div>

          {/* Report Review Section */}
          <Card>
            <CardHeader className="flex flex-row bg-slate-100 rounded-t-md border-b py-4 justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Report Review</CardTitle>
                  <NotificationBadge 
                    count={notifications.newFeedback || 0} 
                    variant="info"
                    size="sm"
                  >
                    <div></div>
                  </NotificationBadge>
                </div>
                <CardDescription className="text-xs">
                  Submit reports for supervisor review and track feedback
                </CardDescription>
              </div>
              <BookCheck className="text-slate-500" />
            </CardHeader>
            <CardContent className="p-6">
              <StudentReportDashboard project={project.data} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row bg-slate-100 rounded-t-md border-b py-4 justify-between items-center">
              <div>
                <CardTitle className="text-xl">Report Submission</CardTitle>

                <CardDescription className="text-xs">
                  Submmit your report within deadline
                </CardDescription>
              </div>
              <ArchiveRestore className="text-slate-500" />
            </CardHeader>

            <CardContent className="px-6 pb-6  mt-6">
              <div>
                {project.data.event.proposal.defense && (
                  <div className="grid gap-6 mb-4">
                    <div className="flex flex-col gap-2 sm:flex-row justify-between items-center">
                      <div className="text-md font-semibold">
                        Proposal Report
                      </div>

                      {project.data.proposal.report?.filePath ? (
                        <Badge>
                          Submitted on &nbsp;
                          {format(
                            project.data.proposal.report?.submittedOn,
                            "PPP"
                          )}
                        </Badge>
                      ) : (
                        <div className="text-xs font-semibold">
                          {proposalReportDeadlineDays >= 1 && (
                            <Badge>
                              {`Submit Before 
                              ${format(
                                project.data.event.proposal.reportDeadline,
                                "PPP"
                              )} (${proposalReportDeadlineDays}d)`}
                            </Badge>
                          )}

                          {proposalReportDeadlineDays < 0 && (
                            <Badge>
                              {`Deadline Missed  (${Math.abs(
                                proposalReportDeadlineDays
                              )}d ago)`}
                            </Badge>
                          )}
                          {proposalReportDeadlineDays === 0 ? (
                            <Countdown
                              renderer={renderer}
                              date={project.data.event.proposal.reportDeadline}
                              onComplete={() =>
                                setDisableUpload((prev) => {
                                  return {
                                    ...prev,
                                    proposal: true,
                                  };
                                })
                              }
                            />
                          ) : null}
                        </div>
                      )}
                    </div>

                    {project.data.proposal.report?.filePath ? (
                      <div className="w-full flex flex-col gap-3 items-center justify-center">
                        <div className="flex gap-2">
                          <Button variant="secondary" asChild>
                            <a
                              target="blank"
                              href={project.data.proposal.report?.filePath}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Proposal Report
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                          {(actualReports.find(report => 
                            report.reportType === 'proposal'
                          ) || project.data.proposal.report?.filePath) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditReport('proposal', project.data.proposal.report)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          Submitted By{" "}
                          {project.data.proposal.report?.submittedBy}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-5">
                        <UploadReport
                          disabled={
                            PROGRESS_STATUS()[project.data.projectType]
                              .ELIGIBLE_FOR_PROPOSAL_REPORT_SUBMISSION[1] !==
                              user.progressStatus ||
                            proposalReportDeadlineDays < 0 ||
                            disableUpload.proposal
                          }
                        />
                        {PROGRESS_STATUS()[project.data.projectType]
                          .ELIGIBLE_FOR_PROPOSAL_REPORT_SUBMISSION[1] !==
                          user.progressStatus && (
                          <div className="mt-2 text-center text-xs text-slate-500">
                            Not Eligible
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <Separator className="my-6" />
              </div>
              <div className="mt-6">
                {project.data.event.mid.defense && (
                  <div className="grid gap-6 mb-4">
                    <div className="flex flex-col gap-2 sm:flex-row justify-between items-center">
                      <div className="text-md font-semibold">Mid Report</div>

                      {project.data.mid.report?.filePath ? (
                        <Badge>
                          Submitted on &nbsp;
                          {format(project.data.mid.report?.submittedOn, "PPP")}
                        </Badge>
                      ) : (
                        <div className="text-xs font-semibold">
                          {midReportDeadlineDays >= 1 && (
                            <Badge>
                              {`Submit Before 
                              ${format(
                                project.data.event.mid.reportDeadline,
                                "PPP"
                              )} (${midReportDeadlineDays}d)`}
                            </Badge>
                          )}
                          {midReportDeadlineDays < 0 && (
                            <Badge>
                              {`Deadline Missed  (${Math.abs(
                                midReportDeadlineDays
                              )}d ago)`}
                            </Badge>
                          )}
                          {midReportDeadlineDays === 0 ? (
                            <Countdown
                              renderer={renderer}
                              date={project.data.event.mid.reportDeadline}
                              onComplete={() =>
                                setDisableUpload((prev) => {
                                  return {
                                    ...prev,
                                    mid: true,
                                  };
                                })
                              }
                            />
                          ) : null}
                        </div>
                      )}
                    </div>

                    {project.data.mid.report?.filePath ? (
                      <div className="w-full flex flex-col gap-3 items-center justify-center">
                        <div className="flex gap-2">
                          <Button variant="secondary" asChild>
                            <a
                              target="blank"
                              href={project.data.mid.report?.filePath}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Mid Report
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                          {(actualReports.find(report => 
                            report.reportType === 'mid'
                          ) || project.data.mid.report?.filePath) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditReport('mid', project.data.mid.report)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          Submitted By {project.data.mid.report?.submittedBy}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-5">
                        <UploadReport
                          disabled={
                            PROGRESS_STATUS()[project.data.projectType]
                              .ELIGIBLE_FOR_MID_REPORT_SUBMISSION[1] !==
                              user.progressStatus ||
                            daysFromToday(
                              project.data.event.mid.reportDeadline
                            ) < 0 ||
                            disableUpload.mid
                          }
                        />
                        {PROGRESS_STATUS()[project.data.projectType]
                          .ELIGIBLE_FOR_MID_REPORT_SUBMISSION[1] !==
                          user.progressStatus && (
                          <div className="mt-2 text-center text-xs text-slate-500">
                            Not Eligible
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <Separator className="my-6" />
              </div>
              <div className="my-6">
                {project.data.event.final.defense && (
                  <div className="grid gap-6 mb-4">
                    <div className="flex flex-col gap-2 sm:flex-row justify-between items-center">
                      <div className="text-md font-semibold">Final Report</div>

                      {project.data.final.report?.filePath ? (
                        <Badge>
                          Submitted on &nbsp;
                          {format(
                            project.data.final.report?.submittedOn,
                            "PPP"
                          )}
                        </Badge>
                      ) : (
                        <div className="text-xs font-semibold">
                          {finalReportDeadlineDays >= 1 && (
                            <Badge>
                              {`Submit Before 
                              ${format(
                                project.data.event.final.reportDeadline,
                                "PPP"
                              )} (${finalReportDeadlineDays}d)`}
                            </Badge>
                          )}
                          {finalReportDeadlineDays < 0 && (
                            <Badge>
                              {`Deadline Missed  (${Math.abs(
                                finalReportDeadlineDays
                              )}d ago)`}
                            </Badge>
                          )}
                          {finalReportDeadlineDays === 0 ? (
                            <Countdown
                              renderer={renderer}
                              date={project.data.event.final.reportDeadline}
                              onComplete={() =>
                                setDisableUpload((prev) => {
                                  return {
                                    ...prev,
                                    final: true,
                                  };
                                })
                              }
                            />
                          ) : null}
                        </div>
                      )}
                    </div>

                    {project.data.final.report?.filePath ? (
                      <div className="w-full flex flex-col gap-3 items-center justify-center">
                        <div className="flex gap-2">
                          <Button variant="secondary" asChild>
                            <a
                              target="blank"
                              href={project.data.final.report?.filePath}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Final Report
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                          {(actualReports.find(report => 
                            report.reportType === 'final'
                          ) || project.data.final.report?.filePath) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditReport('final', project.data.final.report)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          Submitted By {project.data.final.report?.submittedBy}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-5">
                        <UploadReport
                          disabled={
                            PROGRESS_STATUS()[project.data.projectType]
                              .ELIGIBLE_FOR_FINAL_REPORT_SUBMISSION[1] !==
                              user.progressStatus ||
                            daysFromToday(
                              project.data.event.final.reportDeadline
                            ) < 0
                          }
                        />
                        {PROGRESS_STATUS()[project.data.projectType]
                          .ELIGIBLE_FOR_FINAL_REPORT_SUBMISSION[1] !==
                          user.progressStatus && (
                          <div className="mt-2 text-center text-xs text-slate-500">
                            Not Eligible
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 md:gap-6 lg:col-span-2 xl:col-span-1">
          <Card>
            <CardHeader className="flex flex-row bg-slate-100 rounded-t-md border-b py-4 justify-between items-center">
              <div>
                <CardTitle className="text-lg">Project Progress</CardTitle>

                <CardDescription className="text-xs">
                  Track the progress your project has made
                </CardDescription>
              </div>
              <Footprints className="text-slate-500" />
            </CardHeader>

            <CardContent className="text-sm px-12 mt-6">
              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: "black",
                  },
                  components: {
                    Steps: {
                      dotSize: 10,
                      dotCurrentSize: 14,
                    },
                  },
                }}
              >
                {project.data.projectType == EVENT_TYPE.FIRST && (
                  <Steps
                    progressDot
                    current={rank}
                    direction="vertical"
                    items={[
                      {
                        title: "Create a Team",
                        description:
                          rank === 0
                            ? "In Progress"
                            : rank < 0
                            ? "Next Step."
                            : "Completed.",
                      },
                      {
                        title: "Submit Proposal Report",
                        description:
                          rank === 1
                            ? "In Progress"
                            : rank < 1
                            ? "Next Step."
                            : "Submitted.",
                      },
                      {
                        title: "Proposal Defense",
                        description:
                          rank === 2
                            ? "In Progress"
                            : rank < 2
                            ? "Next Step."
                            : "Completed.",
                      },

                      {
                        title: "Submit Final Report",
                        description:
                          rank === 3
                            ? "In Progress"
                            : rank < 3
                            ? "Next Step."
                            : "Submitted.",
                      },
                      {
                        title: "Final Defense",
                        description:
                          rank === 4
                            ? "In Progress"
                            : rank < 4
                            ? "Next Step."
                            : "Completed.",
                      },
                    ]}
                  />
                )}
                {project.data.projectType > EVENT_TYPE.FIRST && (
                  <Steps
                    progressDot
                    current={rank}
                    direction="vertical"
                    items={[
                      {
                        title: "Create a Team",
                        description:
                          rank === 0
                            ? "In Progress"
                            : rank < 0
                            ? "Next Step."
                            : "Completed.",
                      },
                      {
                        title: "Submit Proposal Report",
                        description:
                          rank === 1
                            ? "In Progress"
                            : rank < 1
                            ? "Next Step."
                            : "Submitted.",
                      },
                      {
                        title: "Proposal Defense",
                        description:
                          rank === 2
                            ? "In Progress"
                            : rank < 2
                            ? "Next Step."
                            : "Completed.",
                      },
                      {
                        title: "Supervisor Approval for Mid",
                        description:
                          rank === 3
                            ? "In Progress"
                            : rank < 3
                            ? "Next Step."
                            : "Approved.",
                      },
                      {
                        title: "Submit Mid Report",
                        description:
                          rank === 4
                            ? "In Progress"
                            : rank < 4
                            ? "Next Step."
                            : "Submitted.",
                      },
                      {
                        title: "Mid Defense",
                        description:
                          rank === 5
                            ? "In Progress"
                            : rank < 5
                            ? "Next Step."
                            : "Completed.",
                      },
                      {
                        title: "Supervisor Approval for Final",
                        description:
                          rank === 6
                            ? "In Progress"
                            : rank < 6
                            ? "Next Step."
                            : "Approved.",
                      },
                      {
                        title: "Submit Final Report",
                        description:
                          rank === 7
                            ? "In Progress"
                            : rank < 7
                            ? "Next Step."
                            : "Submitted.",
                      },
                      {
                        title: "Final Defense",
                        description:
                          rank === 8
                            ? "In Progress"
                            : rank < 8
                            ? "Next Step."
                            : "Completed.",
                      },
                    ]}
                  />
                )}
              </ConfigProvider>
            </CardContent>
          </Card>
          <ProjectEvaluations project={project} />
        </div>

        {/* Edit Report Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                Edit Report - {editingReport?.projectId?.projectName}
              </DialogTitle>
            </DialogHeader>
            {editingReport && (
              <EditReportSubmission 
                report={editingReport}
                onEditComplete={handleEditComplete}
              />
            )}
          </DialogContent>
        </Dialog>
      </motion.main>
    );
  } else if (isError) {
    content = <ApiError error={error} />;
  }
  return content;
}

export default StudentProject;
