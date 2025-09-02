import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";
import {
  useGetSupervisorAssignedProjectDetailsQuery,
  useGrantDefensePermissionMutation,
  useVerifyProgressLogMutation,
} from "../supervisorApiSlice";
import ApiError from "@/components/error/ApiError";
import Loader from "@/components/Loader";
import BulkProgressLogOperations from "./BulkProgressLogOperations";
import ProgressLogComments from "./ProgressLogComments";
import CompactProgressLogs from "./CompactProgressLogs";
import { SupervisorReportDashboard } from "../../reportReview";
import NotificationBadge from "../../../components/ui/notification-badge";
import { useNotifications } from "../../../hooks/useNotifications";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  Cctv,
  CheckCheck,
  ChevronLeft,
  CircleAlert,
  CircleCheck,
  FileText,
  GitGraph,
  Info,
  Loader2,
  ThumbsUp,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { PROGRESS_STATUS, getProgramByCode } from "@/lib/config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Timeline } from "antd";
import DefenseEvaluation from "./DefenseEvaluations";

import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
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

function SupervisorProjectDetails() {
  const { id } = useParams();
  const user = useSelector(selectCurrentUser);
  const { notifications } = useNotifications();
  const {
    data: project,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetSupervisorAssignedProjectDetailsQuery(id);
  const [verifyProgressLog, { isLoading: isVerifying }] = useVerifyProgressLogMutation();
  const navigate = useNavigate();

  const handleVerifyProgressLog = async (logId) => {
    try {
      await verifyProgressLog({
        id: logId,
        approvedDate: new Date(),
      }).unwrap();
      
      toast({
        title: "Log Verified",
        description: "Progress log has been verified successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error?.data?.message || "Could not verify progress log",
      });
    }
  };

  let content, logItems, unverifiedLogs;

  console.log(project);
  if (project?.data.progressLogs) {
    unverifiedLogs = project.data.progressLogs.filter(
      (log) => log.approved === false
    );
  }

  if (project?.data.progressLogs) {
    logItems = project.data.progressLogs.map((log) => {
      return {
        dot: <DotSymbol approved={log.approved} />,
        children: <Children progress={log} />,
      };
    });
  }

  if (isLoading) {
    content = <Loader />;
  } else if (isSuccess) {
    content = (
      <>
        <main className="grid  items-start gap-4  md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-6 lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row gap-4 bg-slate-100 rounded-t-md border-b py-4 justify-between items-center">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigate(-1)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-lg">
                      {project.data.projectName}
                    </CardTitle>

                    <CardDescription className="text-xs">
                      {project.data.projectDescription
                        ? project.data.projectDescription
                        : "Details of you current project"}
                    </CardDescription>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="font-semibold text-sm bg-white md:text-lg px-4 "
                >
                  {project.data.projectCode}
                </Badge>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-4 gap-4 md:gap-8">
                  <div className="mt-4 col-span-4 lg:col-span-2 ">
                    <div className="grid gap-2">
                      <div className="flex flex-wrap gap-1">
                        {project.data.categories.map((category, index) => (
                          <Badge className="font-medium" key={index}>
                            {category}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500">Program</div>
                        <div className="text-sm font-bold">
                          {getProgramByCode(
                            project.data.teamMembers[0].program.toString()
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500">Batch</div>
                        <div className="text-sm">
                          {project.data.teamMembers[0].batchNumber}
                        </div>
                      </div>

                      <Separator className="my-2" />
                      {project.data.event.proposal.defense && (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-500">
                            Proposal Report
                          </div>
                          <div className="font-semibold text-sm">
                            {project.data.proposal.report ? (
                              <div className="flex items-center group transition-all">
                                <a
                                  href={project.data.proposal.report.filePath}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Report
                                </a>
                                <ArrowUpRight className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]" />
                              </div>
                            ) : (
                              <Badge variant="outline">Not Available</Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {project.data.event.mid.defense && (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-500">
                            Mid Term Report
                          </div>
                          <div className="font-semibold text-sm">
                            {project.data.mid.report ? (
                              <div className="flex items-center group transition-all">
                                <a
                                  href={project.data.mid.report.filePath}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Report
                                </a>
                                <ArrowUpRight className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]" />
                              </div>
                            ) : (
                              <Badge variant="outline">Not Available</Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {project.data.event.final.defense && (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-500">
                            Final Report
                          </div>
                          <div className="font-semibold text-sm">
                            {project.data.final.report ? (
                              <div className="flex items-center group transition-all">
                                <a
                                  href={project.data.final.report.filePath}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Report
                                </a>
                                <ArrowUpRight className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]" />
                              </div>
                            ) : (
                              <Badge variant="outline">Not Available</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 mt-4  col-span-4 lg:col-span-2">
                    <div className="flex flex-col gap-4">
                      {project.data.teamMembers.map((member) => {
                        return (
                          <div
                            key={member._id}
                            className="border rounded-lg p-4 bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={member.photo} />
                                  <AvatarFallback className="bg-slate-200">
                                    {getInitials(member.fullname)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="text-slate-950 font-semibold text-base">
                                    {member.fullname}
                                  </div>
                                  <div className="text-sm text-slate-600 mb-2">
                                    {member.email}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-500">Roll:</span>
                                      <span className="font-medium">{member.rollNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-500">Batch:</span>
                                      <span className="font-medium">{member.batchNumber || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-500">Program:</span>
                                      <span className="font-medium">
                                        {member.program ? getProgramByCode(member.program.toString()) : 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-500">Status:</span>
                                      <Badge 
                                        variant={member.isAssociated ? "default" : "secondary"}
                                        className="text-xs px-2 py-0"
                                      >
                                        {member.isAssociated ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant="outline"
                                  className="text-xs font-normal"
                                >
                                  {member.phoneNumber || 'No Phone'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Bulk Operations */}
            {unverifiedLogs && unverifiedLogs.length > 0 && (
              <BulkProgressLogOperations 
                unverifiedLogs={unverifiedLogs}
                onOperationComplete={() => {
                  // RTK Query will automatically refetch due to invalidatesTags
                }}
              />
            )}

            <Card>
              <CardHeader className="flex flex-row bg-slate-100 rounded-t-md border-b py-4 justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Progress Log</CardTitle>

                  <CardDescription className="text-xs">
                    Log of the progress achieved by the members
                  </CardDescription>
                </div>
                <GitGraph className="text-slate-500" />
              </CardHeader>

              <CardContent className="p-4">
                <CompactProgressLogs 
                  progressLogs={project?.data?.progressLogs || []}
                  onVerify={handleVerifyProgressLog}
                  isLoading={isVerifying}
                  user={user}
                />
              </CardContent>
            </Card>

            {/* Defense Evaluations Section - Below Progress Log */}
            <DefenseEvaluation project={project} />
          </div>
          <div className="grid  auto-rows-max items-start gap-4 md:gap-6 lg:col-span-2 xl:col-span-1">
            <Card>
              <CardHeader className="flex flex-row bg-slate-100 rounded-t-md border-b py-4 justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Defense Permission</CardTitle>

                  <CardDescription className="text-xs">
                    Permission to eligible projects to attend defense
                  </CardDescription>
                </div>
                <ThumbsUp className="text-slate-500" />
              </CardHeader>

              <CardContent className="text-sm mt-6">
                <div className="grid gap-2 border rounded-md p-4 mb-4">
                  {!project.data.supervisor.mid.approved && (
                    <GrantPermission
                      forEvent={"Mid"}
                      project={project}
                      disabled={
                        PROGRESS_STATUS()[project.data.projectType]
                          .ELIGIBLE_FOR_SUPERVISOR_APPROVAL_FOR_MID[1] !==
                          project.data.teamMembers[0].progressStatus ||
                        unverifiedLogs.length > 0
                      }
                    />
                  )}
                  {project.data.supervisor.mid.approved && (
                    <>
                      <div className="text-sm font-medium text-slate-600">
                        Mid Term Defense
                      </div>
                      <Separator />
                      <div className="flex mt-1 items-center justify-between">
                        <div className=" text-slate-500">Permission</div>
                        <Badge
                          variant={
                            project.data.supervisor.mid.approved
                              ? ""
                              : "secondary"
                          }
                        >
                          {project.data.supervisor.mid.approved
                            ? "Granted"
                            : "Not Granted"}
                        </Badge>
                      </div>
                      {project.data.supervisor.mid.approved && (
                        <div className="flex mt-1 items-center justify-between">
                          <div className=" text-slate-500">Permission On</div>
                          <Badge variant="outline">
                            {format(
                              project.data.supervisor.mid.approvedDate,
                              "PPP"
                            )}
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="grid gap-2 border rounded-md p-4">
                  {!project.data.supervisor.final.approved && (
                    <GrantPermission
                      forEvent={"Final"}
                      project={project}
                      disabled={
                        PROGRESS_STATUS()[project.data.projectType]
                          .ELIGIBLE_FOR_SUPERVISOR_APPROVAL_FOR_FINAL[1] !==
                          project.data.teamMembers[0].progressStatus ||
                        unverifiedLogs.length > 0
                      }
                    />
                  )}
                  {project.data.supervisor.final.approved && (
                    <>
                      <div className="text-sm font-medium text-slate-600">
                        Final Defense
                      </div>

                      <Separator />
                      <div className="flex mt-1 items-center justify-between">
                        <div className=" text-slate-500">Permission</div>
                        <Badge
                          variant={
                            project.data.supervisor.final.approved
                              ? ""
                              : "secondary"
                          }
                        >
                          {project.data.supervisor.final.approved
                            ? "Granted"
                            : "Not Granted"}
                        </Badge>
                      </div>
                      {project.data.supervisor.final.approved && (
                        <div className="flex mt-1 items-center justify-between">
                          <div className=" text-slate-500">Permission On</div>
                          <Badge variant="outline">
                            {format(
                              project.data.supervisor.final.approvedDate,
                              "PPP"
                            )}
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Report Review Section */}
            <Card>
              <CardHeader className="flex flex-row bg-slate-100 rounded-t-md border-b py-4 justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Report Review</CardTitle>
                    <NotificationBadge 
                      count={(notifications.newStudentResponses || 0) + (notifications.newReports || 0)} 
                      variant="default"
                      size="sm"
                    >
                      <div></div>
                    </NotificationBadge>
                  </div>
                  <CardDescription className="text-xs">
                    Review and provide feedback on student reports
                  </CardDescription>
                </div>
                <FileText className="text-slate-500" />
              </CardHeader>
              <CardContent className="p-6">
                <SupervisorReportDashboard />
              </CardContent>
            </Card>


          </div>
        </main>
      </>
    );
  } else if (isError) {
    content = <ApiError error={error} />;
  }

  return content;
}

const Children = ({ progress }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verifyProgressLog, { isLoading }] = useVerifyProgressLogMutation();

  async function handleVerify() {
    try {
      const res = await verifyProgressLog({
        id: progress._id,
        approvedDate: new Date(),
      });
      if (res.error) {
        throw new Error("Could not verify");
      }
      if (!res.error) {
        toast({
          title: "Log Verified",
          description: "Successfully",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something Went Wrong!!",
        description: error.message,
      });
    }
  }
  const handleConfirm = () => {
    setIsDialogOpen(false);
    handleVerify();
  };

  return (
    <Card>
      <CardHeader className=" p-4 pb-1">
        <div className="text-slate-800 font-semibold flex items-center justify-between">
          <span>{progress.title}</span>
          <div className="flex items-center gap-2">
            {!progress.approved && !isLoading && (
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button size="sm" classNname="text-xs">
                    Verifiy <CheckCheck className="w-4 h-4 ml-1" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Verification</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to verify this log?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {!progress.approved && isLoading && (
              <Button size="sm" classNname="text-xs" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifiying..
              </Button>
            )}

            {progress.approved && (
              <Badge
                className="flex items-center gap-1 py-1"
                variant="secondary"
              >
                Verified
                {progress.approved && (
                  <TooltipProvider delayDuration="50">
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {progress.approvedDate && !isNaN(new Date(progress.approvedDate).getTime()) 
                            ? format(progress.approvedDate, "PPP")
                            : "Not approved"
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-1 text-slate-600">
        {progress.description}
      </CardContent>
      <CardFooter className="text-slate-500 border-t text-xs p-4 py-2 flex items-center justify-between">
        <span>{progress.author.fullname}</span>
        <span>
          {progress.logDate && !isNaN(new Date(progress.logDate).getTime()) 
            ? `${format(progress.logDate, "PP")}, ${format(progress.logDate, "hh:mm aa")}`
            : "Invalid date"
          }
        </span>
      </CardFooter>
      
      {/* Comments Section - Show for all logs but hide input for verified ones */}
      <ProgressLogComments 
        progressLog={progress}
        showInputField={!progress.approved}
        user={user}
        onCommentAdded={() => {
          // RTK Query will automatically refetch due to invalidatesTags
        }}
      />
    </Card>
  );
};

const DotSymbol = ({ approved }) => {
  if (approved) {
    return (
      <div className="text-green-500">
        <CircleCheck strokeWidth={2} />
      </div>
    );
  } else {
    return (
      <div className="text-slate-500">
        <CircleAlert strokeWidth={2} />
      </div>
    );
  }
};

const GrantPermission = ({ project, forEvent, disabled }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [grantDefensePermission, { isLoading }] =
    useGrantDefensePermissionMutation();

  async function handleVerify() {
    try {
      const res = await grantDefensePermission({
        id: project.data._id,
        defenseType: forEvent.toLowerCase(),
        approvedDate: new Date(),
      });
      if (res.error) {
        throw new Error("Could not grant");
      }
      if (!res.error) {
        toast({
          title: "Permission Granted",
          description: "Successfully",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something Went Wrong!!",
        description: error.message,
      });
    }
  }
  const handleConfirm = () => {
    setIsDialogOpen(false);
    handleVerify();
  };
  return (
    <div className="text-sm flex items-center justify-between font-medium text-slate-600">
      <span className="font-semibold">{forEvent} Defense</span>
      {isLoading ? (
        <Button size="sm" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Granting..
        </Button>
      ) : (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button size="sm" disabled={disabled}>
              Grant
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Permission Grant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to grant permission?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default SupervisorProjectDetails;
