import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  useGetAllDefensesQuery,
  useRegenerateAccessCodeMutation,
} from "../adminApiSlice";
import {
  Loader2,
  RefreshCw,
  Search,
  Eye,
  AlertCircle,
  Key,
  Building,
  Users,
  FileText,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";

function AdminAccessCodeManagement() {
  const [selectedEvaluator, setSelectedEvaluator] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  const [newAccessCode, setNewAccessCode] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedDefenses, setExpandedDefenses] = useState(new Set());

  const {
    data: defensesData,
    isLoading: isLoadingDefenses,
    isError: isErrorDefenses,
    error: errorDefenses,
  } = useGetAllDefensesQuery();


  const [regenerateAccessCode, { isLoading: isRegenerating }] =
    useRegenerateAccessCodeMutation();

  // Filter defenses based on search term and active tab
  const filteredDefenses = defensesData?.data?.filter((defense) => {
    // Filter by tab
    if (activeTab !== "all" && defense.defenseType !== activeTab) {
      return false;
    }
    
    // Filter by search term
    return defense.defenseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defense.rooms.some(room => 
        room.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.evaluators.some(evaluator => 
          evaluator.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          evaluator.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
  }) || [];

  // Group defenses by type for tab counts
  const proposalDefenses = defensesData?.data?.filter(d => d.defenseType === "proposal") || [];
  const midDefenses = defensesData?.data?.filter(d => d.defenseType === "mid") || [];
  const finalDefenses = defensesData?.data?.filter(d => d.defenseType === "final") || [];

  const handleRegenerateAccessCode = async (evaluator, defense) => {
    try {
      const result = await regenerateAccessCode({
        evaluatorId: evaluator._id,
        defenseId: defense._id,
      }).unwrap();

      setNewAccessCode(result.data.newAccessCode);
      setSelectedEvaluator(evaluator);
      setIsRegenerateDialogOpen(true);

      toast({
        title: "✅ Access Code Regenerated",
        description: `New access code generated and email sent to ${evaluator.fullname}`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.data?.message || "Failed to regenerate access code",
      });
    }
  };

  const toggleDefenseExpansion = (defenseId) => {
    const newExpanded = new Set(expandedDefenses);
    if (newExpanded.has(defenseId)) {
      newExpanded.delete(defenseId);
    } else {
      newExpanded.add(defenseId);
    }
    setExpandedDefenses(newExpanded);
  };


  const getStatusBadge = (hasAccessCode, defenseStatus) => {
    if (!hasAccessCode) {
      return <Badge variant="destructive">No Access Code</Badge>;
    }
    
    switch (defenseStatus) {
      case "101": // Active
        return <Badge variant="default">Active</Badge>;
      case "105": // Complete
        return <Badge variant="secondary">Complete</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDefenseTypeColor = (defenseType) => {
    switch (defenseType) {
      case "proposal":
        return "bg-blue-100 text-blue-900 border border-blue-200 hover:bg-blue-100 hover:text-blue-900";
      case "mid":
        return "bg-orange-100 text-orange-900 border border-orange-200 hover:bg-orange-100 hover:text-orange-900";
      case "final":
        return "bg-green-100 text-green-900 border border-green-200 hover:bg-green-100 hover:text-green-900";
      default:
        return "bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-100 hover:text-gray-900";
    }
  };

  const getDefenseIcon = (defenseType) => {
    switch (defenseType) {
      case "proposal":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "mid":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "final":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Building className="h-5 w-5 text-gray-500" />;
    }
  };

  // Component to render defense list
  const DefenseList = ({ defenses, title, emptyMessage }) => (
    <div className="space-y-6">
      {defenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">{emptyMessage}</p>
          <p className="text-sm">No {title.toLowerCase()} found</p>
        </div>
      ) : (
        defenses.map((defense) => {
          const isExpanded = expandedDefenses.has(defense._id);
          return (
            <div key={defense._id} className="border rounded-lg p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-300 ease-in-out">
              {/* Defense Header - Clickable */}
              <div 
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => toggleDefenseExpansion(defense._id)}
              >
                <div className="flex items-center space-x-3">
                  {getDefenseIcon(defense.defenseType)}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {defense.defenseType.charAt(0).toUpperCase() + defense.defenseType.slice(1)} Defense
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(defense.defenseDate), "PPP 'at' p")}
                    </p>
                  </div>
                  <Badge className={getDefenseTypeColor(defense.defenseType)}>
                    {defense.defenseType}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={defense.status === "101" ? "default" : "secondary"}>
                    {defense.status === "101" ? "Active" : "Complete"}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>

            {/* Rooms */}
            <div className={`space-y-4 transition-all duration-300 ease-in-out overflow-hidden ${
              isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              {defense.rooms.map((room) => (
                <div key={room._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.003] hover:-translate-y-0.5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <h4 className="font-medium">Room: {room.room}</h4>
                      <Badge variant="outline">
                        {room.evaluators.length} Evaluator{room.evaluators.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>

                  {/* Evaluators Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Evaluator</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Access Code Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {room.evaluators.map((evaluator) => {
                        // Find the defense object in evaluator's defense array
                        const evaluatorDefense = evaluator.defense.find(d => d.defenseId.toString() === defense._id);
                        const hasAccessCode = !!evaluatorDefense?.accessCode;
                        
                        return (
                          <TableRow key={evaluator._id} className="hover:bg-gray-50 transition-colors duration-200">
                            <TableCell>
                              <div>
                                <div className="font-medium">{evaluator.fullname}</div>
                                <div className="text-sm text-gray-500">
                                  {evaluator.email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {evaluator.evaluatorType === "88" ? "Internal" : "External"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(hasAccessCode, defense.status)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRegenerateAccessCode(evaluator, defense)}
                                disabled={isRegenerating || defense.status !== "101"}
                                className="w-full transition-all duration-200 hover:scale-102 disabled:hover:scale-100"
                                title={defense.status !== "101" ? "Cannot regenerate access code for completed defense" : "Regenerate access code and send email notification"}
                              >
                                {isRegenerating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                                <span className="ml-1">
                                  {defense.status !== "101" ? "Completed" : "Regenerate & Send"}
                                </span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
            </div>
          );
        })
      )}
    </div>
  );

  // Component to render simplified defense list (for specific defense type tabs)
  const SimplifiedDefenseList = ({ defenses, emptyMessage }) => (
    <div className="space-y-6">
      {defenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      ) : (
        defenses.map((defense) => {
          const isExpanded = expandedDefenses.has(defense._id);
          return (
            <div key={defense._id} className="space-y-4">
              {/* Rooms - Start directly with room details */}
              {defense.rooms.map((room) => (
                <div key={room._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.003] hover:-translate-y-0.5 cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <h4 className="font-medium">Room: {room.room}</h4>
                      <Badge variant="outline">
                        {room.evaluators.length} Evaluator{room.evaluators.length !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant={defense.status === "101" ? "default" : "secondary"}>
                        {defense.status === "101" ? "Active" : "Complete"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {format(new Date(defense.defenseDate), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>

                  {/* Evaluators Table */}
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evaluator</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Access Code Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {room.evaluators.map((evaluator) => {
                      // Find the defense object in evaluator's defense array
                      const evaluatorDefense = evaluator.defense.find(d => d.defenseId.toString() === defense._id);
                      const hasAccessCode = !!evaluatorDefense?.accessCode;
                      
                      return (
                        <TableRow key={evaluator._id} className="hover:bg-gray-50 transition-colors duration-200">
                          <TableCell>
                            <div>
                              <div className="font-medium">{evaluator.fullname}</div>
                              <div className="text-sm text-gray-500">
                                {evaluator.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {evaluator.evaluatorType === "88" ? "Internal" : "External"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(hasAccessCode, defense.status)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegenerateAccessCode(evaluator, defense)}
                              disabled={isRegenerating || defense.status !== "101"}
                              className="w-full transition-all duration-200 hover:scale-102 disabled:hover:scale-100"
                              title={defense.status !== "101" ? "Cannot regenerate access code for completed defense" : "Regenerate access code and send email notification"}
                            >
                              {isRegenerating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                              <span className="ml-1">
                                {defense.status !== "101" ? "Completed" : "Regenerate & Send"}
                              </span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ))}
            </div>
          );
        })
      )}
    </div>
  );

  if (isLoadingDefenses) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-600 bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin mr-4" />
        Loading defense rooms...
      </div>
    );
  }

  if (isErrorDefenses) {
    return (
      <div className="flex flex-1 items-center justify-center text-red-600 bg-slate-50 p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error loading defense rooms</h3>
          <p className="text-sm mb-4">
            {errorDefenses?.data?.message || errorDefenses?.message || "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Access Code Management</h2>
          <p className="text-gray-600">
            Manage evaluator access codes by defense type
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search rooms, evaluators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="all" 
            className="flex items-center space-x-2 hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200 transition-all duration-200 text-base font-medium"
          >
            <Building className="h-5 w-5" />
            <span>All</span>
            <Badge variant="secondary" className="ml-1">
              {defensesData?.data?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="proposal" 
            className="flex items-center space-x-2 hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200 transition-all duration-200 text-base font-medium"
          >
            <FileText className="h-5 w-5" />
            <span>Proposal</span>
            <Badge variant="secondary" className="ml-1">
              {proposalDefenses.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="mid" 
            className="flex items-center space-x-2 hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200 transition-all duration-200 text-base font-medium"
          >
            <Clock className="h-5 w-5" />
            <span>Mid</span>
            <Badge variant="secondary" className="ml-1">
              {midDefenses.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="final" 
            className="flex items-center space-x-2 hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-blue-200 transition-all duration-200 text-base font-medium"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Final</span>
            <Badge variant="secondary" className="ml-1">
              {finalDefenses.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <DefenseList 
            defenses={filteredDefenses} 
            title="All Defenses"
            emptyMessage="No defense rooms found"
          />
        </TabsContent>

        <TabsContent value="proposal" className="mt-6">
          <SimplifiedDefenseList 
            defenses={proposalDefenses} 
            emptyMessage="No proposal defense rooms found"
          />
        </TabsContent>

        <TabsContent value="mid" className="mt-6">
          <SimplifiedDefenseList 
            defenses={midDefenses} 
            emptyMessage="No mid defense rooms found"
          />
        </TabsContent>

        <TabsContent value="final" className="mt-6">
          <SimplifiedDefenseList 
            defenses={finalDefenses} 
            emptyMessage="No final defense rooms found"
          />
        </TabsContent>
      </Tabs>

      {/* Regenerate Access Code Dialog */}
      <Dialog open={isRegenerateDialogOpen} onOpenChange={setIsRegenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Code Regenerated</DialogTitle>
            <DialogDescription>
              A new access code has been generated and sent to the evaluator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newAccessCode">New Access Code</Label>
              <Input
                id="newAccessCode"
                value={newAccessCode}
                readOnly
                className="font-mono text-lg"
              />
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  Please provide this access code to the evaluator if they don't receive the email.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setIsRegenerateDialogOpen(false);
                toast({
                  title: "✅ Access Code Copied",
                  description: "Access code has been generated and is ready to use",
                  className: "bg-green-50 border-green-200 text-green-800",
                });
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminAccessCodeManagement;