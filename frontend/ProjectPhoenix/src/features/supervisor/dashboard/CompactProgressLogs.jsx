import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  GitGraph,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { getInitials } from "@/lib/utils";
import ProgressLogComments from "./ProgressLogComments";

const CompactProgressLogs = ({ progressLogs, onVerify, isLoading }) => {
  const [showAll, setShowAll] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  
  const ITEMS_PER_PAGE = 3;
  const displayedLogs = showAll ? progressLogs : progressLogs.slice(0, ITEMS_PER_PAGE);
  const hasMore = progressLogs.length > ITEMS_PER_PAGE;

  const toggleCardExpansion = (logId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (approved) => {
    if (approved) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (!progressLogs || progressLogs.length === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center font-semibold text-slate-700 text-lg">
        No Progress Logged!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayedLogs.map((log, index) => {
        const hasComments = log.supervisorComments && log.supervisorComments.length > 0;
        
        const isExpanded = expandedCards.has(log._id);
        
        return (
          <Card key={log._id} className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-all duration-300 ease-in-out">
            <CardContent 
              className="p-4 transition-all duration-300 ease-in-out"
              onClick={() => toggleCardExpansion(log._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <GitGraph className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-sm truncate">{log.title}</h4>
                    </div>
                    {getStatusBadge(log.approved)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={log.author?.photo} />
                        <AvatarFallback className="text-xs">
                          {getInitials(log.author?.fullname || 'Unknown')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{log.author?.fullname || 'Unknown'}</span>
                    </div>
                    <span>•</span>
                    <span>
                      {log.logDate && !isNaN(new Date(log.logDate).getTime()) 
                        ? format(new Date(log.logDate), "MMM dd, yyyy")
                        : "Unknown date"
                      }
                    </span>
                    {hasComments && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-blue-600">
                          <MessageSquare className="w-3 h-3" />
                          <span>{log.supervisorComments.length} comment(s)</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Expandable Description */}
                  <div className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 transition-colors duration-200">
                    <Eye className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    <span className="transition-all duration-200">{isExpanded ? 'Hide Details' : 'Show Details'}</span>
                  </div>
                </div>

                {/* Action Button */}
                {!log.approved && (
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card expansion when clicking verify
                      onVerify(log._id);
                    }}
                    disabled={isLoading}
                    className="ml-3 h-8 px-3 text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verify
                  </Button>
                )}
              </div>
              
              {/* Expanded Content */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isExpanded 
                    ? 'max-h-[2000px] opacity-100 mt-4 pt-4 border-t border-gray-200' 
                    : 'max-h-0 opacity-0 mt-0 pt-0'
                }`}
              >
                <div className="space-y-4">
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    <p className="whitespace-pre-wrap">{log.description}</p>
                  </div>
                  
                  {/* Comments Section - Inside expanded content for verified logs */}
                  {log.approved && (
                    <div className="border-t border-gray-200 pt-4">
                      <ProgressLogComments 
                        progressLog={log}
                        showInputField={false}
                        onCommentAdded={() => {
                          // RTK Query will automatically refetch due to invalidatesTags
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Comments Section - Outside expanded content for pending logs */}
              {!log.approved && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <ProgressLogComments 
                    progressLog={log}
                    showInputField={true}
                    onCommentAdded={() => {
                      // RTK Query will automatically refetch due to invalidatesTags
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Show More/Less Button */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAll(!showAll)}
            className="text-xs"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show All ({progressLogs.length - ITEMS_PER_PAGE} more)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CompactProgressLogs;
