import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, BookCheck, Calendar, User, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

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

function DefenseEvaluation({ project }) {
  const proposalEvaluations = project.data.proposal.evaluations || [];
  const midEvaluations = project.data.mid?.evaluations || [];
  const finalEvaluations = project.data.final.evaluations || [];

  const proposal = groupDefenses(proposalEvaluations);
  const mid = groupDefenses(midEvaluations);
  const final = groupDefenses(finalEvaluations);


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

  const EvaluationCard = ({ evaluation, type }) => {
    const judgement = evaluation[0].projectEvaluation.judgement;
    let status;
    
    if (type === 'proposal') {
      status = proposalJudgementConfig[judgement];
    } else if (type === 'mid') {
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
                  {getStatusBadge(status)}
                  <ArrowUpRight className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{format(evaluation[0].createdAt, "MMMM do, yyyy")}</span>
                </div>
                
                <div className="space-y-2">
                  {evaluation.map((evaluationItem, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={evaluationItem.evaluator.photo} />
                        <AvatarFallback className="text-xs">
                          {getInitials(evaluationItem.evaluator.fullname)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {evaluationItem.evaluator.fullname}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {evaluationItem.evaluator.designation}
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
            <DialogTitle>Evaluation Details - {type.charAt(0).toUpperCase() + type.slice(1)} Defense</DialogTitle>
            <DialogDescription>
              Detailed feedback and comments from evaluators
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {evaluation.map((evaluationItem, index) => (
              <div key={evaluationItem._id} className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={evaluationItem.evaluator.photo} />
                    <AvatarFallback>
                      {getInitials(evaluationItem.evaluator.fullname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{evaluationItem.evaluator.fullname}</p>
                    <p className="text-sm text-gray-600">
                      {evaluationItem.evaluator.designation}, {evaluationItem.evaluator.institution}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div
                    className="prose max-w-none text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: evaluationItem.projectEvaluation.feedback,
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

  return (
    <Card>
      <CardHeader className="flex flex-row rounded-t-md border-b py-4 bg-slate-100 justify-between items-center">
        <div>
          <CardTitle className="text-lg">Defense Evaluations</CardTitle>
          <CardDescription className="text-xs">
            Project evaluations from defenses
          </CardDescription>
        </div>
        <BookCheck className="text-slate-500" />
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Proposal Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Proposal</h3>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {proposal.length > 0 ? (
                proposal.map((evaluation, index) => (
                  <EvaluationCard key={index} evaluation={evaluation} type="proposal" />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No evaluations yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Mid Term Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Mid Term</h3>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {project.data.event.mid.defense && mid.length > 0 ? (
                mid.map((evaluation, index) => (
                  <EvaluationCard key={index} evaluation={evaluation} type="mid" />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No evaluations yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Final Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Final</h3>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {final.length > 0 ? (
                final.map((evaluation, index) => (
                  <EvaluationCard key={index} evaluation={evaluation} type="final" />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No evaluations yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DefenseEvaluation;
