import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetArchiveProjectQuery } from "../studentApiSlice";
import Loader from "@/components/Loader";
import ApiError from "@/components/error/ApiError";
import StudentProgressLogComments from "../project/StudentProgressLogComments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  Award,
  Download,
  User,
  BookOpen,
  TrendingUp,
  FileCheck,
  Star,
  ArrowUpRight,
  GitGraph,
  ThumbsUp,
  BookCheck,
  Info,
  CircleCheck,
  CircleAlert,
  MessageSquare
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { getEventStatusByCode, getEventTypeByCode, getProgramByCode } from "@/lib/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Helper function to safely format dates
const safeFormatDate = (dateValue, formatString = "PPP") => {
  if (!dateValue) return "Not available";
  
  try {
    let date;
    if (typeof dateValue === 'string') {
      date = parseISO(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      date = new Date(dateValue);
    }
    
    if (isValid(date)) {
      return format(date, formatString);
    } else {
      return "Invalid date";
    }
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

// Judgment configurations for different defense types
const proposalJudgementConfig = {
  "00": "Accepted",
  "01": "Accepted Conditionally",
  "02": "Re-Defense",
  "03": "Rejected",
  "-1": "Absent",
};

const midJudgementConfig = {
  10: "Progress Satisfactory",
  11: "Progress Seen",
  12: "Progress Not Satisfactory",
  "-1": "Absent",
};

const finalJudgementConfig = {
  20: "Accepted",
  21: "Accepted Conditionally",
  22: "Re-Demo",
  23: "Re-Defend",
  "-1": "Absent",
};

// Helper components
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

const ProgressLogItem = ({ progress }) => {
  return (
    <Card>
      <CardHeader className="p-4 pb-1">
        <div className="text-slate-800 font-semibold flex items-center justify-between">
          <span>{progress.title}</span>
          <div className="flex items-center gap-2">
            <Badge
              className="flex items-center gap-1 py-1"
              variant={progress.approved ? "" : "secondary"}
            >
              {progress.approved ? "Verified" : "Unverified"}
              {progress.approved && (
                <TooltipProvider delayDuration="50">
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{safeFormatDate(progress.approvedDate, "PPP")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-1 text-slate-600">
        {progress.description}
      </CardContent>
      <div className="text-slate-500 border-t text-xs p-4 py-2 flex items-center justify-between">
        <span>{progress.author?.fullname || "Unknown"}</span>
        <span>
          {safeFormatDate(progress.logDate, "PP")},{" "}
          {safeFormatDate(progress.logDate, "hh:mm aa")}
        </span>
      </div>
      
      {/* Supervisor Comments Section */}
      <StudentProgressLogComments progressLog={progress} />
    </Card>
  );
};

const DefenseEvaluationCard = ({ projectData }) => {
  const proposalEvaluations = projectData.proposal?.evaluations || [];
  const midEvaluations = projectData.mid?.evaluations || [];
  const finalEvaluations = projectData.final?.evaluations || [];

  const getStatusColor = (judgement, defenseType) => {
    if (defenseType === 'proposal') {
      switch (judgement) {
        case "00": return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200";
        case "01": return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800 hover:border-yellow-200";
        case "02": return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-200";
        case "03": return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800 hover:border-red-200";
        default: return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-200";
      }
    } else if (defenseType === 'mid') {
      switch (judgement) {
        case 10: return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200";
        case 11: return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-200";
        case 12: return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800 hover:border-red-200";
        default: return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-200";
      }
    } else if (defenseType === 'final') {
      switch (judgement) {
        case 20: return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200";
        case 21: return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800 hover:border-green-200";
        case 22: return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-200";
        case 23: return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800 hover:border-red-200";
        default: return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-200";
      }
    }
    return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-200";
  };

  const getColumnIcon = (defenseType) => {
    switch (defenseType) {
      case 'proposal': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'mid': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'final': return <Award className="w-5 h-5 text-green-600" />;
      default: return <BookCheck className="w-5 h-5 text-slate-600" />;
    }
  };

  const renderEvaluationCard = (evaluation, judgementConfig, defenseType, index) => {
    const judgement = evaluation.projectEvaluation?.judgement || evaluation.judgement;
    const judgementText = judgementConfig[judgement] || "Evaluation Complete";
    const statusColor = getStatusColor(judgement, defenseType);
    
    return (
      <Dialog key={index}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-slate-200 shadow-md bg-white hover:border-slate-400 hover:bg-slate-50">
            <CardContent className="p-4">
              <div className="group flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`text-xs font-semibold px-3 py-1 border-2 ${statusColor}`}>
                    {judgementText}
                  </Badge>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-slate-600 mb-3 bg-slate-100 px-2 py-1 rounded-full w-fit border border-slate-200">
                  <Calendar className="w-3 h-3 mr-1 text-slate-500" />
                  {safeFormatDate(evaluation.createdAt)}
                </div>
                
                {evaluation.evaluator && (
                  <div className="mt-auto">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border-2 border-blue-200">
                      <User className="w-3 h-3 text-blue-600" />
                      <div className="text-xs">
                        <div className="font-medium text-blue-800">{evaluation.evaluator.fullname}</div>
                        {evaluation.evaluator.designation && (
                          <div className="text-blue-600 text-xs">{evaluation.evaluator.designation}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookCheck className="w-5 h-5 text-blue-600" />
              Evaluation Details
            </DialogTitle>
          </DialogHeader>
          <div className="text-slate-700 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div>
                  <h4 className="font-semibold text-lg text-blue-900">
                    {evaluation.evaluator?.fullname || "Evaluator"}
                  </h4>
                  {evaluation.evaluator?.designation && (
                    <p className="text-sm text-blue-700">
                      {evaluation.evaluator.designation}
                      {evaluation.evaluator.institution && `, ${evaluation.evaluator.institution}`}
                    </p>
                  )}
                </div>
                <Badge className={`px-4 py-2 text-sm font-semibold ${statusColor}`}>
                  {judgementText}
                </Badge>
              </div>
              
              {evaluation.projectEvaluation?.feedback && (
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <h5 className="font-medium mb-3 text-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-600" />
                    Feedback & Comments
                  </h5>
                  <div
                    className="no-tailwind prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: evaluation.projectEvaluation.feedback,
                    }}
                  ></div>
                </div>
              )}
              
              {evaluation.individualEvaluation && evaluation.individualEvaluation.length > 0 && (
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <h5 className="font-medium mb-3 text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    Individual Student Evaluations
                  </h5>
                  <div className="space-y-4">
                    {evaluation.individualEvaluation.map((individual, idx) => {
                      const student = projectData.teamMembers?.find(m => m._id === individual.student);
                      return (
                        <div key={idx} className="border-l-4 border-blue-300 pl-4 bg-white p-3 rounded-lg">
                          <h6 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            {student?.fullname || `Student ${idx + 1}`}
                          </h6>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            {Object.entries(individual).map(([key, value]) => {
                              if (key === '_id' || key === 'student' || key === 'absent') return null;
                              return (
                                <div key={key} className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                                  <span className="text-slate-600 capitalize font-medium">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="font-bold text-slate-800">{value}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row rounded-t-md border-b py-4 bg-slate-100 justify-between items-center">
        <div>
          <CardTitle className="text-lg text-slate-800">Defense Evaluations</CardTitle>
          <CardDescription className="text-slate-600">
            Project evaluations from defenses
          </CardDescription>
        </div>
        <BookCheck className="text-slate-500" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Proposal Column */}
          <div className="space-y-3">
            <h6 className="text-slate-700 font-semibold text-center text-sm">Proposal</h6>
            {proposalEvaluations.length > 0 ? (
              proposalEvaluations.map((evaluation, index) => 
                renderEvaluationCard(evaluation, proposalJudgementConfig, 'proposal', index)
              )
            ) : (
              <div className="text-center text-xs text-slate-500 p-4 border rounded-lg">
                No Evaluations
              </div>
            )}
          </div>

          {/* Mid Term Column */}
          <div className="space-y-3">
            <h6 className="text-slate-700 font-semibold text-center text-sm">Mid Term</h6>
            {midEvaluations.map((evaluation, index) => 
              renderEvaluationCard(evaluation, midJudgementConfig, 'mid', index)
            )}
          </div>

          {/* Final Column */}
          <div className="space-y-3">
            <h6 className="text-slate-700 font-semibold text-center text-sm">Final</h6>
            {finalEvaluations.map((evaluation, index) => 
              renderEvaluationCard(evaluation, finalJudgementConfig, 'final', index)
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    data: project,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetArchiveProjectQuery(id);

  let content;

  if (isLoading) {
    content = <Loader />;
  } else if (isSuccess && project?.data) {
    const projectData = project.data;
    
    content = (
      <>
        <main className="grid items-start gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* Left Column - Main Project Info and Progress */}
          <div className="grid auto-rows-max items-start gap-4 md:gap-6 lg:col-span-2">
            {/* Project Overview Card */}
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
                      {projectData.projectName}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {projectData.projectDescription || "Project details and information"}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="font-semibold text-sm bg-white md:text-lg px-4"
                >
                  {projectData.projectCode}
                </Badge>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-4 gap-4 md:gap-8">
                  <div className="mt-4 col-span-4 lg:col-span-2">
                    <div className="grid gap-2">
                      {/* Project Type, Status and Categories */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">
                          {getEventTypeByCode(projectData.projectType)}
                        </Badge>
                        <Badge variant={projectData.status === "105" ? "default" : "secondary"}>
                          {getEventStatusByCode(projectData.status)}
                        </Badge>
                      </div>
                      
                      {/* Project Categories */}
                      {projectData.categories && projectData.categories.length > 0 && (
                        <div className="mb-3">
                          <h6 className="font-medium text-sm text-slate-600 mb-2">Project Categories</h6>
                          <div className="flex flex-wrap gap-1">
                            {projectData.categories.map((category, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Program and Batch */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500">Program</div>
                        <div className="text-sm font-bold">
                          {projectData.teamMembers?.[0]?.program ? 
                            getProgramByCode(projectData.teamMembers[0].program.toString()) : 
                            "N/A"
                          }
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500">Batch</div>
                        <div className="text-sm">
                          {projectData.teamMembers?.[0]?.batchNumber || "N/A"}
                        </div>
                      </div>

                      <Separator className="my-2" />
                      
                      {/* Reports Section */}
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-slate-700">Project Reports</h5>
                        
                        {projectData.proposal && (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-500">Proposal Report</div>
                            <div className="font-semibold text-sm">
                              {projectData.proposal.report?.filePath ? (
                                <div className="flex items-center group transition-all">
                                  <a
                                    href={projectData.proposal.report.filePath}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <Button variant="outline" size="sm">
                                      <Download className="mr-1 w-4 h-4" />
                                      Download
                                    </Button>
                                  </a>
                                </div>
                              ) : (
                                <Badge variant="outline">Not Available</Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {projectData.mid && (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-500">Mid Term Report</div>
                            <div className="font-semibold text-sm">
                              {projectData.mid.report?.filePath ? (
                                <div className="flex items-center group transition-all">
                                  <a
                                    href={projectData.mid.report.filePath}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <Button variant="outline" size="sm">
                                      <Download className="mr-1 w-4 h-4" />
                                      Download
                                    </Button>
                                  </a>
                                </div>
                              ) : (
                                <Badge variant="outline">Not Available</Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {projectData.final && (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-500">Final Report</div>
                            <div className="font-semibold text-sm">
                              {projectData.final.report?.filePath ? (
                                <div className="flex items-center group transition-all">
                                  <a
                                    href={projectData.final.report.filePath}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <Button variant="outline" size="sm">
                                      <Download className="mr-1 w-4 h-4" />
                                      Download
                                    </Button>
                                  </a>
                                </div>
                              ) : (
                                <Badge variant="outline">Not Available</Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Team Members Section */}
                  <div className="grid gap-3 mt-4 col-span-4 lg:col-span-2">
                    <div className="flex flex-col gap-3">
                      <h5 className="font-medium text-sm text-slate-700">Team Members</h5>
                      {projectData.teamMembers?.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex">
                            <div className="flex flex-row items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.photo} />
                                <AvatarFallback className="bg-slate-200">
                                  {getInitials(member.fullname)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm text-slate-500">
                                <div className="text-slate-950 font-medium">
                                  {member.fullname}
                                </div>
                                <div className="text-xs">{member.email}</div>
                                <div className="text-xs">Roll: {member.rollNumber || member.roll || "N/A"}</div>
                                <div className="text-xs">Batch: {member.batchNumber || "N/A"}</div>
                                <div className="text-xs">Program: {member.program ? getProgramByCode(member.program.toString()) : "N/A"}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              {member.phoneNumber || member.phone || "N/A"}
                            </Badge>
                            <Badge
                              variant={member.progressStatus === "3000" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {member.progressStatus === "3000" ? "Completed" : member.progressStatus || "Active"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                    </div>
                </CardContent>
            </Card>

            {/* Progress Log Card */}
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
              <CardContent className="text-sm pl-8 pt-4 mt-6">
                {projectData.progressLogs && projectData.progressLogs.length > 0 ? (
                  <div className="space-y-4">
                    {projectData.progressLogs.map((log, index) => (
                      <div key={index} className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                        <div className="relative left-8">
                          <DotSymbol approved={log.approved} />
                          <div className="ml-6">
                            <ProgressLogItem progress={log} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[140px] flex items-center justify-center font-semibold text-slate-700 text-lg">
                    No Progress Logged!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Timeline, Supervisor, and Evaluations */}
          <div className="grid auto-rows-max items-start gap-4 md:gap-6 lg:col-span-2 xl:col-span-1">
            {/* Project Timeline Card - Compact */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Calendar className="h-5 w-5" />
                  Project Timeline
                </CardTitle>
                <CardDescription>Key milestones and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-200"></div>
                  <div className="space-y-4">
                    <div className="relative flex items-start gap-3">
                      <div className="relative z-10 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 pt-1">
                        <h6 className="font-medium text-sm text-gray-800">Project Created</h6>
                        <p className="text-xs text-gray-600">{safeFormatDate(projectData.createdAt)}</p>
                      </div>
                    </div>

                    {projectData.proposal && (
                      <div className="relative flex items-start gap-3">
                        <div className="relative z-10 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 pt-1">
                          <h6 className="font-medium text-sm text-gray-800">Proposal Phase</h6>
                          <p className="text-xs text-gray-600">
                            {projectData.proposal.report?.submittedOn ? 
                              safeFormatDate(projectData.proposal.report.submittedOn) : 
                              "Not submitted"
                            }
                          </p>
                          {projectData.proposal.report?.submittedBy && (
                            <p className="text-xs text-gray-500">
                              By: {projectData.proposal.report.submittedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {projectData.mid && (
                      <div className="relative flex items-start gap-3">
                        <div className="relative z-10 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="flex-1 pt-1">
                          <h6 className="font-medium text-sm text-gray-800">Mid Defense</h6>
                          <p className="text-xs text-gray-600">
                            {projectData.mid.report?.submittedOn ? 
                              safeFormatDate(projectData.mid.report.submittedOn) : 
                              "Not submitted"
                            }
                          </p>
                          {projectData.mid.report?.submittedBy && (
                            <p className="text-xs text-gray-500">
                              By: {projectData.mid.report.submittedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {projectData.final && (
                      <div className="relative flex items-start gap-3">
                        <div className="relative z-10 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <Award className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 pt-1">
                          <h6 className="font-medium text-sm text-gray-800">Final Defense</h6>
                          <p className="text-xs text-gray-600">
                            {projectData.final.report?.submittedOn ? 
                              safeFormatDate(projectData.final.report.submittedOn) : 
                              "Not submitted"
                            }
                          </p>
                          {projectData.final.report?.submittedBy && (
                            <p className="text-xs text-gray-500">
                              By: {projectData.final.report.submittedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="relative flex items-start gap-3">
                      <div className="relative z-10 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <CheckCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1 pt-1">
                        <h6 className="font-medium text-sm text-gray-800">Project Completed</h6>
                        <p className="text-xs text-gray-600">
                          {projectData.status === "105" ? 
                            safeFormatDate(projectData.updatedAt) : 
                            "In Progress"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supervisor Information Card */}
            {projectData.supervisor?.supervisorId && (
              <Card>
                <CardHeader className="flex flex-row bg-slate-100 rounded-t-md border-b py-4 justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Supervisor</CardTitle>
                    <CardDescription className="text-xs">
                      Project supervisor information and permissions
                    </CardDescription>
                  </div>
                  <ThumbsUp className="text-slate-500" />
                </CardHeader>
                <CardContent className="text-sm mt-6">
                  <div className="grid gap-2 border rounded-md p-4 mb-4">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex">
                          <div className="flex flex-row items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={projectData.supervisor.supervisorId.photo} />
                              <AvatarFallback className="bg-slate-200">
                                {getInitials(projectData.supervisor.supervisorId.fullname)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-sm text-slate-500">
                              <div className="text-slate-950 flex items-center font-medium">
                                <span>{projectData.supervisor.supervisorId.fullname}</span>
                              </div>
                              <div className="text-xs">
                                {projectData.supervisor.supervisorId.email}
                              </div>
                              <div className="text-xs">
                                {projectData.supervisor.supervisorId.phoneNumber}
                              </div>
                              <div className="text-xs">
                                {projectData.supervisor.supervisorId.designation}, {projectData.supervisor.supervisorId.institution}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {projectData.supervisor.supervisorId.skillSet && (
                        <div className="mb-4">
                          <h6 className="font-medium text-sm text-slate-600 mb-2">Skills & Expertise</h6>
                          <div className="flex flex-wrap gap-1">
                            {projectData.supervisor.supervisorId.skillSet.map((skill, index) => (
                              <Badge
                                className="mr-1 mb-1 font-normal bg-slate-900 text-white border-slate-900 hover:bg-slate-700 transition-colors"
                                variant="outline"
                                key={index}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-sm font-medium text-slate-600">Mid Term Defense</div>
                      <Separator className="my-2" />
                      <div className="flex mt-1 items-center justify-between">
                        <div className="text-slate-500">Permission</div>
                        <Badge
                          variant={projectData.supervisor.mid?.approved ? "" : "secondary"}
                        >
                          {projectData.supervisor.mid?.approved ? "Granted" : "Not Granted"}
                        </Badge>
                      </div>
                      {projectData.supervisor.mid?.approved && (
                        <div className="flex mt-1 items-center justify-between">
                          <div className="text-slate-500">Permission On</div>
                          <Badge variant="outline">
                            {safeFormatDate(projectData.supervisor.mid.approvedDate, "PPP")}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2 border rounded-md p-4">
                    <div className="text-sm font-medium text-slate-600">Final Defense</div>
                    <Separator className="my-2" />
                    <div className="flex mt-1 items-center justify-between">
                      <div className="text-slate-500">Permission</div>
                      <Badge
                        variant={projectData.supervisor.final?.approved ? "" : "secondary"}
                      >
                        {projectData.supervisor.final?.approved ? "Granted" : "Not Granted"}
                      </Badge>
                    </div>
                    {projectData.supervisor.final?.approved && (
                      <div className="flex mt-1 items-center justify-between">
                        <div className="text-slate-500">Permission On</div>
                        <Badge variant="outline">
                          {safeFormatDate(projectData.supervisor.final.approvedDate, "PPP")}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </main>

        {/* Defense Evaluations Card - Full Width */}
        <div className="mt-6">
          <DefenseEvaluationCard projectData={projectData} />
        </div>
      </>
    );
  } else if (isError) {
    content = <ApiError error={error} />;
  } else if (project && !project.data) {
    content = (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold tracking-tight">Access Denied</h3>
          <p className="text-sm text-muted-foreground">
            You don't have access to this project or it doesn't exist.
          </p>
          <Button 
            onClick={() => navigate(-1)} 
            className="mt-4"
            variant="outline"
          >
            Go Back to Archive
          </Button>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold tracking-tight">Project Not Found</h3>
          <p className="text-sm text-muted-foreground">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {content}
    </div>
  );
}

export default ProjectDetails;
