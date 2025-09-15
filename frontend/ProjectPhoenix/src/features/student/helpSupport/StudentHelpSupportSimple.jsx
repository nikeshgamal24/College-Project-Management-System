import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, MessageSquare, Clock, CheckCircle, AlertCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { ROLES_LIST } from "@/lib/config";
import { toast } from "sonner";

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

function StudentHelpSupportSimple() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  // Mock tickets data for testing
  const [tickets, setTickets] = useState([
    {
      _id: "1",
      ticketNumber: "TKT-001",
      title: "Login Issue",
      description: "Cannot login to the system",
      status: "new",
      priority: "high",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2", 
      ticketNumber: "TKT-002",
      title: "Password Reset",
      description: "Need help resetting password",
      status: "resolved",
      priority: "medium",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
    });
    setIsEditing(true);
    setActiveTab("create");
  };

  const handleDeleteTicket = (ticketId) => {
    setTickets(prev => prev.filter(ticket => ticket._id !== ticketId));
    toast.success("Ticket deleted successfully!");
  };

  const handleCancelEdit = () => {
    setEditingTicket(null);
    setIsEditing(false);
    setFormData({
      title: "",
      description: "",
      priority: "medium",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (isEditing && editingTicket) {
        // Update existing ticket
        setTickets(prev => prev.map(ticket => 
          ticket._id === editingTicket._id 
            ? { ...ticket, title: formData.title, description: formData.description, priority: formData.priority }
            : ticket
        ));
        toast.success("Ticket updated successfully!");
        handleCancelEdit();
      } else {
        // Create new ticket
        const newTicket = {
          _id: Date.now().toString(),
          ticketNumber: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
          title: formData.title,
          description: formData.description,
          status: "new",
          priority: formData.priority,
          createdAt: new Date().toISOString(),
        };
        
        setTickets(prev => [newTicket, ...prev]);
        toast.success("Ticket created successfully!");
      }
      
      setFormData({
        title: "",
        description: "",
        priority: "medium",
      });
      
      setActiveTab("my-tickets");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/${ROLES_LIST.student}/dashboard`)}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">
            Get help with technical issues, account problems, or submit feature requests
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Ticket
          </TabsTrigger>
          <TabsTrigger value="my-tickets" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            My Tickets ({tickets.length})
          </TabsTrigger>
        </TabsList>

        {/* Create Ticket Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? "Edit Support Ticket" : "Create Support Ticket"}
              </CardTitle>
              <CardDescription>
                {isEditing 
                  ? "Update your ticket details below"
                  : "Describe your issue and we'll help you resolve it as quickly as possible"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of your issue"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
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
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting 
                      ? (isEditing ? "Updating Ticket..." : "Creating Ticket...") 
                      : (isEditing ? "Update Ticket" : "Create Ticket")
                    }
                  </Button>
                  {isEditing && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                    >
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
              <CardTitle>My Support Tickets</CardTitle>
              <CardDescription>
                Track the status of your submitted tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tickets yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any support tickets yet.
                  </p>
                  <Button onClick={() => setActiveTab("create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket._id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{ticket.title}</h3>
                            <Badge className={getStatusColor(ticket.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(ticket.status)}
                                {ticket.status.replace("_", " ").toUpperCase()}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>#{ticket.ticketNumber}</span>
                            <span>•</span>
                            <span>{ticket.priority.toUpperCase()}</span>
                            <span>•</span>
                            <span>
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {ticket.status === "new" && (
                                <DropdownMenuItem 
                                  onClick={() => handleEditTicket(ticket)}
                                  className="flex items-center gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {ticket.status === "new" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem 
                                      className="flex items-center gap-2 text-red-600"
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
                                    >
                                      Delete
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
    </div>
  );
}

export default StudentHelpSupportSimple;
