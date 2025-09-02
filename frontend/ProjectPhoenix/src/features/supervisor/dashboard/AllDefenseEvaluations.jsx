import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, 
  BookCheck, 
  Calendar, 
  User, 
  ChevronDown, 
  Eye,
  Filter,
  Search
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useState } from "react";

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

const groupDefenses = (data) => {
  const groupedByDefense = data.reduce((acc, evaluation) => {
    const defenseId = evaluation.defense;
    if (!acc[defenseId]) {
      acc[defenseId] = [];
    }
    acc[defenseId].push(evaluation);
    return acc;
  }, {});

  Object.keys(groupedByDefense).forEach((defenseId) => {
    groupedByDefense[defenseId].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  });

  const groupedAndSortedEvaluations = Object.values(groupedByDefense);
  return groupedAndSortedEvaluations;
};

function AllDefenseEvaluations({ projects = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Flatten all evaluations from all projects
  const allEvaluations = projects.reduce((acc, project) => {
    const projectEvaluations = [];
    
    // Proposal evaluations
    if (project.data?.proposal?.evaluations) {
      const proposal = groupDefenses(project.data.proposal.evaluations);
      proposal.forEach(evaluation => {
        projectEvaluations.push({
          ...evaluation[0],
          projectName: project.data.projectName,
          projectId: project._id,
          type: 'proposal',
          evaluationGroup: evaluation
        });
      });
    }
    
    // Mid term evaluations
    if (project.data?.mid?.evaluations) {
      const mid = groupDefenses(project.data.mid.evaluations);
      mid.forEach(evaluation => {
        projectEvaluations.push({
          ...evaluation[0],
          projectName: project.data.projectName,
          projectId: project._id,
          type: 'mid',
          evaluationGroup: evaluation
        });
      });
    }
    
    // Final evaluations
    if (project.data?.final?.evaluations) {
      const final = groupDefenses(project.data.final.evaluations);
      final.forEach(evaluation => {
        projectEvaluations.push({
          ...evaluation[0],
          projectName: project.data.projectName,
          projectId: project._id,
          type: 'final',
          evaluationGroup: evaluation
        });
      });
    }
    
    return [...acc, ...projectEvaluations];
  }, []);

  // Filter evaluations
  const filteredEvaluations = allEvaluations.filter(evaluation => {
    const matchesSearch = evaluation.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.evaluator?.fullname?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || evaluation.type === typeFilter;
    
    let matchesStatus = true;
    if (statusFilter !== "all") {
      const judgement = evaluation.projectEvaluation?.judgement;
      let status;
      
      if (evaluation.type === 'proposal') {
        status = proposalJudgementConfig[judgement];
      } else if (evaluation.type === 'mid') {
        status = midJudgementConfig[judgement];
      } else {
        status = finalJudgementConfig[judgement];
      }
      
      matchesStatus = status === statusFilter;
    }
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Accepted": { variant: "default", className: "bg-green-100 text-green-800 border-green-200" },
      "Accepted Conditionally": { variant: "default", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      "Progress Satisfactory": { variant: "default", className: "bg-green-100 text-green-800 border-green-200" },
      "Progress Seen": { variant: "default", className: "bg-gray-100 text-gray-800 border-gray-200" },
      "Progress Not Satisfactory": { variant: "default", className: "bg-red-100 text-red-800 border-red-200" },
      "Re-Defense": { variant: "default", className: "bg-orange-100 text-orange-800 border-orange-200" },
      "Re-Demo": { variant: "default", className: "bg-orange-100 text-orange-800 border-orange-200" },
      "Re-Defend": { variant: "default", className: "bg-orange-100 text-orange-800 border-orange-200" },
      "Rejected": { variant: "default", className: "bg-red-100 text-red-800 border-red-200" },
      "Absent": { variant: "default", className: "bg-gray-100 text-gray-800 border-gray-200" },
    };
    
    const config = statusConfig[status] || statusConfig["Absent"];
    return (
      <Badge variant="outline" className={config.className}>
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      "proposal": { className: "bg-blue-100 text-blue-800 border-blue-200" },
      "mid": { className: "bg-purple-100 text-purple-800 border-purple-200" },
      "final": { className: "bg-green-100 text-green-800 border-green-200" },
    };
    
    const config = typeConfig[type] || typeConfig["proposal"];
    return (
      <Badge variant="outline" className={config.className}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const EvaluationCard = ({ evaluation }) => {
    const judgement = evaluation.projectEvaluation?.judgement;
    let status;
    
    if (evaluation.type === 'proposal') {
      status = proposalJudgementConfig[judgement];
    } else if (evaluation.type === 'mid') {
      status = midJudgementConfig[judgement];
    } else {
      status = finalJudgementConfig[judgement];
    }

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    {getTypeBadge(evaluation.type)}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{evaluation.projectName}</h4>
                  <p className="text-xs text-gray-500">Project Defense</p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{format(evaluation.createdAt, "MMMM do, yyyy")}</span>
                </div>
                
                <div className="space-y-2">
                  {evaluation.evaluationGroup.map((evalItem, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={evalItem.evaluator?.photo} />
                        <AvatarFallback className="text-xs">
                          {getInitials(evalItem.evaluator?.fullname || 'Unknown')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {evalItem.evaluator?.fullname || 'Unknown Evaluator'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {evalItem.evaluator?.designation || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evaluation Details - {evaluation.type.charAt(0).toUpperCase() + evaluation.type.slice(1)} Defense</DialogTitle>
            <DialogDescription>
              {evaluation.projectName} - Detailed feedback and comments from evaluators
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {evaluation.evaluationGroup.map((evalItem, index) => (
              <div key={evalItem._id} className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={evalItem.evaluator?.photo} />
                    <AvatarFallback>
                      {getInitials(evalItem.evaluator?.fullname || 'Unknown')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{evalItem.evaluator?.fullname || 'Unknown Evaluator'}</p>
                    <p className="text-sm text-gray-600">
                      {evalItem.evaluator?.designation || 'Unknown'}, {evalItem.evaluator?.institution || 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div
                    className="prose max-w-none text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: evalItem.projectEvaluation?.feedback || 'No feedback available',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Get unique statuses for filter
  const allStatuses = [...new Set(allEvaluations.map(evaluationItem => {
    const judgement = evaluationItem.projectEvaluation?.judgement;
    if (evaluationItem.type === 'proposal') return proposalJudgementConfig[judgement];
    if (evaluationItem.type === 'mid') return midJudgementConfig[judgement];
    return finalJudgementConfig[judgement];
  }))];

  return (
    <Card>
      <CardHeader className="flex flex-row rounded-t-md border-b py-4 bg-slate-100 justify-between items-center">
        <div>
          <CardTitle className="text-lg">Defense Evaluations</CardTitle>
          <CardDescription className="text-xs">
            All project evaluations from defenses across your assigned projects
          </CardDescription>
        </div>
        <BookCheck className="text-slate-500" />
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by project name or evaluator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Defense Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="mid">Mid Term</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {allStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredEvaluations.length} of {allEvaluations.length} evaluations
            </p>
            {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Evaluations Grid */}
        {filteredEvaluations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvaluations.map((evaluation, index) => (
              <EvaluationCard key={`${evaluation.projectId}-${evaluation.type}-${index}`} evaluation={evaluation} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Evaluations Found</h3>
            <p className="text-gray-500">
              {allEvaluations.length === 0 
                ? "No defense evaluations have been conducted yet for your assigned projects."
                : "No evaluations match your current search criteria. Try adjusting your filters."
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AllDefenseEvaluations;
