import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import {
  ArrowRight,
  ArrowUpRight,
  BookmarkCheck,
  ChevronLeft,
  Loader2,
  MessageSquareCode,
} from "lucide-react";

import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EVENT_TYPE, ROLES_LIST, getEventTypeByCode, getProgramByCode } from "@/lib/config";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function findDefenseInfoByProjectId(defenseArray, projectId) {
  for (const defenseObject of defenseArray) {
    const defense = defenseObject.defense;
    for (const room of defense.rooms) {
      if (room.projects.includes(projectId)) {
        return {
          defenseDate: defense.defenseDate,
          defenseTime: defense.defenseTime,
          room: room.room,
        };
      }
    }
  }
  return null;
}

function ProjectInfo({ project, isLoading, isSuccess, user }) {
  const navigate = useNavigate();
  const [proposalOpen, setProposalOpen] = useState(false);
  const [midOpen, setMidOpen] = useState(false);
  const [finalOpen, setFinalOpen] = useState(false);
  let projectContent, teamContent;

  if (!user.isAssociated) {
    projectContent = (
      <div className="flex flex-col items-center justify-center gap-1  rounded-md h-[150px] text-center">
        <h3 className="text-lg font-bold tracking-tight">No Active Project</h3>
        <p className="text-sm text-slate-500">
          Project details will appear as soon as you create a project
        </p>
      </div>
    );
    teamContent = (
      <div className="flex flex-col items-center justify-center gap-1 rounded-md h-[150px] text-center">
        <h3 className="text-lg font-bold tracking-tight">No Active Team</h3>
        <p className="text-sm text-slate-500">
          Team members will appear as soon as you create a team
        </p>
      </div>
    );
  }

  if (isLoading) {
    projectContent = (
      <CardContent className="flex items-center  rounded-md justify-center h-[150px]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </CardContent>
    );
    teamContent = (
      <CardContent className="flex items-center  rounded-md justify-center h-[150px]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </CardContent>
    );
  } else if (isSuccess) {
    const proposalDefenses = project.data.proposal.defenses || [];
    const midDefenses = project.data.mid.defenses || [];
    const finalDefenses = project.data.final.defenses || [];

    // Check all defenses (both graded and ungraded) to find scheduled defenses
    const proposalSchedule = findDefenseInfoByProjectId(
      proposalDefenses,
      project.data._id
    );

    const midSchedule = findDefenseInfoByProjectId(
      midDefenses,
      project.data._id
    );

    const finalSchedule = findDefenseInfoByProjectId(
      finalDefenses,
      project.data._id
    );

    // Check if defenses are graded for status display
    const notGradedProposal = proposalDefenses.filter(
      (defense) => defense.isGraded === false
    );

    const notGradedMid = midDefenses.filter(
      (defense) => defense.isGraded === false
    );

    const notGradedFinal = finalDefenses.filter(
      (defense) => defense.isGraded === false
    );

    const members = project.data.teamMembers;
    teamContent = members.map((member) => {
      return (
        <div key={member._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.photo} />
              <AvatarFallback className="bg-slate-200">
                {getInitials(member.fullname)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="font-semibold text-slate-900">
                {member.fullname}
              </div>
              <div className="text-sm text-slate-600">{member.email}</div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Roll: {member.rollNumber || member.roll || "N/A"}</span>
                <span>Batch: {member.batchNumber || "N/A"}</span>
                <span>Program: {member.program ? getProgramByCode(member.program.toString()) : "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="bg-blue-600 text-white">
              {user.email === member.email ? "Yourself" : "Active"}
            </Badge>
            <div className="text-sm text-slate-500 bg-gray-200 px-3 py-1 rounded-full">
              {member.phoneNumber || "N/A"}
            </div>
          </div>
        </div>
      );
    });

    projectContent = (
      <>
        <div className=" flex items-center justify-between gap-2 mb-3">
          <div className="font-semibold ">Code: {project.data.projectCode}</div>
          <Badge variant="secondary">
            {getEventTypeByCode(project.data.projectType)}
          </Badge>
        </div>
        <Separator className="mb-3" />

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">Created on</div>
            <div className="text-xs ">
              {format(project.data.createdAt, "PPP")}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">Enrolled on</div>
            <div className="text-xs ">{project.data.event.eventCode}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">Supervisor</div>
            {project.data.supervisor?.supervisorId?.fullname ? (
              <div className="text-sm font-semibold">
                {project.data.supervisor.supervisorId.fullname}
              </div>
            ) : (
              <div className="font-semibold">
                <Badge variant="secondary">Not Assigned</Badge>
              </div>
            )}
          </div>
          <Separator className="my-2" />
          {project.data.event.proposal.defense && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">Proposal Defense</div>
              <div>
                {proposalSchedule ? (
                  <HoverCard
                    openDelay={50}
                    open={proposalOpen}
                    onOpenChange={setProposalOpen}
                    closeDelay={50}
                  >
                    <HoverCardTrigger>
                      <Badge
                        className={`cursor-pointer flex items-center gap-1 hover:bg-opacity-100 ${
                          notGradedProposal.length > 0 
                            ? "bg-blue-500 text-white border-blue-500" 
                            : "bg-green-500 text-white border-green-500"
                        }`}
                        onClick={() => setProposalOpen(!proposalOpen)}
                      >
                        {notGradedProposal.length > 0 
                          ? format(proposalSchedule.defenseDate, "PPP")
                          : `Completed - ${format(proposalSchedule.defenseDate, "PPP")}`
                        }
                        <ArrowUpRight className="w-4 h-4" />
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="text-sm">
                      <div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Room</span>{" "}
                          <span className="text-slate-700 font-semibold">
                            {proposalSchedule.room}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Time</span>{" "}
                          <span className="text-slate-700 font-semibold">
                            {format(proposalSchedule.defenseTime, "hh:mm a")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Date</span>{" "}
                          <span className="text-slate-700 font-semibold">
                            {format(proposalSchedule.defenseDate, "PPP")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Status</span>{" "}
                          <span className="text-slate-700 font-semibold">
                            {notGradedProposal.length > 0 ? "Scheduled" : "Completed"}
                          </span>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <Badge variant="outline">Not Allocated</Badge>
                )}
              </div>
            </div>
          )}
          {project.data.event.mid.defense && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">Mid-Term Defense</div>
              <div>
                {midSchedule ? (
                  <HoverCard
                    openDelay={50}
                    open={midOpen}
                    onOpenChange={setMidOpen}
                    closeDelay={50}
                  >
                    <HoverCardTrigger>
                      <Badge
                        className={`cursor-pointer flex items-center gap-1 hover:bg-opacity-100 ${
                          notGradedMid.length > 0 
                            ? "bg-blue-500 text-white border-blue-500" 
                            : "bg-green-500 text-white border-green-500"
                        }`}
                        onClick={() => setMidOpen(!midOpen)}
                      >
                        {notGradedMid.length > 0 
                          ? format(midSchedule.defenseDate, "PPP")
                          : `Completed - ${format(midSchedule.defenseDate, "PPP")}`
                        }
                        <ArrowUpRight className="w-4 h-4" />
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="text-sm">
                      <div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Room</span>{" "}
                          <span className="text-slate-700 font-semibold">
                            {midSchedule.room}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Time</span>{" "}
                          <span className="text-slate-700 font-semibold">
                            {format(midSchedule.defenseTime, "hh:mm a")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Date</span>{" "}
                          <span className="text-slate-700 font-semibold">
                            {format(midSchedule.defenseDate, "PPP")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Status</span>{" "}
                          <span className="text-slate-700 font-semibold">
                            {notGradedMid.length > 0 ? "Scheduled" : "Completed"}
                          </span>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <Badge variant="outline">Not Allocated</Badge>
                )}
              </div>
            </div>
          )}
          {project.data.event.final.defense && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">Final Defense</div>
              <div>
                {finalSchedule ? (
                  <HoverCard
                    openDelay={50}
                    open={finalOpen}
                    onOpenChange={setFinalOpen}
                    closeDelay={50}
                  >
                    <HoverCardTrigger>
                      <Badge
                        className={`cursor-pointer flex items-center gap-1 hover:bg-opacity-100 ${
                          notGradedFinal.length > 0 
                            ? "bg-blue-500 text-white border-blue-500" 
                            : "bg-green-500 text-white border-green-500"
                        }`}
                        onClick={() => setFinalOpen(!finalOpen)}
                      >
                        {notGradedFinal.length > 0 
                          ? format(finalSchedule.defenseDate, "PPP")
                          : `Completed - ${format(finalSchedule.defenseDate, "PPP")}`
                        }
                        <ArrowUpRight className="w-4 h-4" />
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="text-sm">
                      <div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Room</span>{" "}
                          <span className="text-slate-700 font-semibold">
                            {finalSchedule.room}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Time</span>{" "}
                          <span className="text-slate-700 font-semibold">
                            {format(finalSchedule.defenseTime, "hh:mm a")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Date</span>{" "}
                          <span className="text-slate-700 font-semibold">
                            {format(finalSchedule.defenseDate, "PPP")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Status</span>{" "}
                          <span className="text-slate-700 font-semibold">
                            {notGradedFinal.length > 0 ? "Scheduled" : "Completed"}
                          </span>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  <Badge variant="outline">Not Allocated</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Card className="col-span-4">
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

          <div className="flex gap-4">
            {project.data.projectType >= EVENT_TYPE.MINOR && (
              <>
                {project.data.supervisor.supervisorId ? (
                  <Button size="sm" className="flex items-center gap-1" asChild>
                    <Link to={`/${ROLES_LIST.student}/project/progress`}>
                      <span className="sr-only sm:not-sr-only">Progress</span>
                      <MessageSquareCode className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex items-center gap-1"
                    disabled
                  >
                    <span className="sr-only sm:not-sr-only">Progress</span>
                    <MessageSquareCode className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 md:gap-8">
            <div className="mt-4 col-span-4 lg:col-span-2 ">
              {projectContent}
            </div>

            <div className="grid gap-4 mt-4  col-span-4 lg:col-span-2">
              <div className="flex flex-col gap-4">
                <div className=" flex items-center justify-between gap-2">
                  <div className="font-semibold ">Team Members</div>
                  <Badge variant="outline">
                    {project.data.teamMembers.length}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-3">
                  {teamContent}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default ProjectInfo;
