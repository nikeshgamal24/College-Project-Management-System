import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateTicketMutation, useGetMyTicketsQuery, useUpdateTicketMutation, useDeleteTicketMutation } from "@/api/ticketApiSlice";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, MessageSquare, Clock, CheckCircle, AlertCircle, Edit, Trash2, MoreHorizontal, Eye } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ROLES_LIST } from "@/lib/config";
import Loader from "@/components/Loader";
import ApiError from "@/components/error/ApiError";
import { toast } from "sonner";
import SupervisorTicketDetailModal from "./SupervisorTicketDetailModal";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "bg-blue-100 text-blue-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
];

// Removed category options - keeping it simple

const getStatusColor = (status) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    case "on_hold":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "new":
      return <AlertCircle className="h-4 w-4" />;
    case "in_progress":
      return <Clock className="h-4 w-4" />;
    case "resolved":
    case "closed":
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

function SupervisorHelpSupport() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");
  const [editingTicket, setEditingTicket] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  // API hooks
  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
  const [deleteTicket, { isLoading: isDeleting }] = useDeleteTicketMutation();
  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    isError: ticketsError,
    error: ticketsErrorData,
    refetch: refetchTickets,
  } = useGetMyTicketsQuery();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (isEditing && editingTicket) {
        await updateTicket({ id: editingTicket._id, ...formData }).unwrap();
        toast.success("Ticket updated successfully!");
        setIsEditing(false);
        setEditingTicket(null);
      } else {
        await createTicket(formData).unwrap();
        toast.success("Ticket created successfully!");
      }
      
      setFormData({
        title: "",
        description: "",
        priority: "medium",
      });
      refetchTickets();
      setActiveTab("my-tickets");
    } catch (error) {
      console.error("Error creating/updating ticket:", error);
      toast.error(error?.data?.message || "Failed to create/update ticket");
    }
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setIsEditing(true);
    setFormData({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
    });
    setActiveTab("create");
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await deleteTicket(ticketId).unwrap();
      toast.success("Ticket deleted successfully!");
      refetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error(error?.data?.message || "Failed to delete ticket");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTicket(null);
    setFormData({
      title: "",
      description: "",
      priority: "medium",
    });
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const closeTicketModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
  };

  const tickets = ticketsData?.data?.tickets || [];

  if (ticketsLoading) {
    return <Loader />;
  }

  if (ticketsError) {
    return <ApiError error={ticketsErrorData} />;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/${ROLES_LIST.supervisor}/dashboard`)}
          className="w-fit"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Help & Support</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Get help with technical issues, account problems, or submit feature requests
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Create Ticket</span>
            <span className="sm:hidden">Create</span>
          </TabsTrigger>
          <TabsTrigger value="my-tickets" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">My Tickets ({tickets.length})</span>
            <span className="sm:hidden">Tickets ({tickets.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Create Ticket Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">{isEditing ? "Edit Support Ticket" : "Create Support Ticket"}</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {isEditing ? "Update your ticket details" : "Describe your issue and we'll help you resolve it as quickly as possible"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of your issue"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    className="text-sm sm:text-base"
                  />
                </div>


                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={option.color}>
                              {option.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your issue..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={6}
                    required
                    className="text-sm sm:text-base resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" disabled={isCreating || isUpdating} className="flex-1 text-sm sm:text-base">
                    {isCreating || isUpdating ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Ticket" : "Create Ticket")}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit} className="text-sm sm:text-base">
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Tickets Tab */}
        <TabsContent value="my-tickets">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">My Support Tickets</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Track the status of your submitted tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tickets yet</h3>
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                    You haven't submitted any support tickets yet.
                  </p>
                  <Button onClick={() => setActiveTab("create")} className="text-sm sm:text-base">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card 
                      key={ticket._id} 
                      className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => openTicketModal(ticket)}
                    >
                      <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:gap-2">
                            <h3 className="font-medium text-sm sm:text-base truncate">{ticket.title}</h3>
                            <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(ticket.status)}
                                {ticket.status.replace("_", " ").toUpperCase()}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {ticket.description}
                          </p>
                          <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:gap-4 text-xs text-muted-foreground">
                            <span>#{ticket.ticketNumber}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{ticket.priority.toUpperCase()}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>
                              {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div 
                          className="flex items-center gap-2 sm:ml-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => openTicketModal(ticket)}
                                className="flex items-center gap-2 text-xs sm:text-sm"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {ticket.status === "new" && (
                                <DropdownMenuItem 
                                  onClick={() => handleEditTicket(ticket)}
                                  className="flex items-center gap-2 text-xs sm:text-sm"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {ticket.status === "new" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem 
                                      className="flex items-center gap-2 text-red-600 text-xs sm:text-sm"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this ticket? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteTicket(ticket._id)}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={isDeleting}
                                      >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Modal */}
      <SupervisorTicketDetailModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={closeTicketModal}
      />
    </div>
  );
}

export default SupervisorHelpSupport;
