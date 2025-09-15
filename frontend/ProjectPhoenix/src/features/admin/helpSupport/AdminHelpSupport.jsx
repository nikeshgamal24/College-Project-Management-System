import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, File, Plus, Search, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { HelpSupportDataTable } from "./HelpSupportDataTable";
import { HelpSupportColumns } from "./HelpSupportColumns";
import TicketDetailModal from "./TicketDetailModal.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Users,
  Zap,
} from "lucide-react";
import { 
  useGetAllTicketsQuery, 
  useGetTicketStatisticsQuery,
  useUpdateTicketMutation,
  useAddCommentMutation
} from "@/api/ticketApiSlice";
import Loader from "@/components/Loader";
import ApiError from "@/components/error/ApiError";

// Helper functions for colors and formatting

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
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getCategoryIcon = (category) => {
  switch (category) {
    case "technical":
      return <Zap className="h-4 w-4" />;
    case "account":
      return <Users className="h-4 w-4" />;
    case "academic":
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

function AdminHelpSupport() {
  const navigate = useNavigate();
  const tableRef = useRef();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API queries
  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    isError: ticketsError,
    error: ticketsErrorData,
  } = useGetAllTicketsQuery({
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    page: 1,
    limit: 1000, // Get all tickets for now
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetTicketStatisticsQuery();


  // Handle loading and error states
  if (ticketsLoading || statsLoading) {
    return <Loader />;
  }

  if (ticketsError || statsError) {
    return <ApiError error={ticketsErrorData || statsError} />;
  }

  const tickets = ticketsData?.data?.tickets || [];
  const rawStats = ticketsData?.data?.statistics || statsData?.data || {
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
    urgent: 0,
  };
  
  const stats = {
    total: rawStats.total || 0,
    active: (rawStats.new || 0) + (rawStats.inProgress || 0),
    resolved: rawStats.resolved || 0,
    urgent: rawStats.urgent || 0,
  };

  // Separate tickets by status
  const activeTickets = tickets.filter(ticket => 
    ticket.status === "new" || ticket.status === "in_progress"
  );
  const completedTickets = tickets.filter(ticket => 
    ticket.status === "resolved" || ticket.status === "closed"
  );
  const filteredTickets = tickets; // All tickets for the "All" tab

  // Handler functions
  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const closeTicketModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
  };

  const handleTicketUpdate = () => {
    // Refresh tickets data when ticket is updated
    window.location.reload();
  };

  return (
    <div>
      <div className="text-xl font-semibold tracking-tight flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        Help & Support
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 grid-cols-2 sm:gap-4 md:gap-6 lg:gap-8 xl:grid-cols-4 mb-4 md:mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 text-right">all tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-gray-500 text-right">pending resolution</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-gray-500 text-right">successfully resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{stats.urgent}</div>
            <p className="text-xs text-gray-500 text-right">urgent priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs className="mt-4" defaultValue="active">
        <div className="flex flex-col space-y-4 mb-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger value="active" className="text-xs sm:text-sm">Active ({activeTickets.length})</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed ({completedTickets.length})</TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">All ({filteredTickets.length})</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:gap-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 lg:w-64"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                className="h-10 gap-1 text-sm w-full sm:w-auto"
                onClick={() => tableRef.current?.exportCSV()}
              >
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Export</span>
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Tickets</CardTitle>
              <CardDescription>
                New and in-progress support tickets requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HelpSupportDataTable
                ref={tableRef}
                columns={HelpSupportColumns({
                  openTicketModal,
                })}
                data={activeTickets}
                onRowClick={openTicketModal}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tickets</CardTitle>
              <CardDescription>
                Resolved and closed support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HelpSupportDataTable
                ref={tableRef}
                columns={HelpSupportColumns({
                  openTicketModal,
                })}
                data={completedTickets}
                onRowClick={openTicketModal}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Tickets</CardTitle>
              <CardDescription>
                Complete overview of all support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HelpSupportDataTable
                ref={tableRef}
                columns={HelpSupportColumns({
                  openTicketModal,
                })}
                data={tickets}
                onRowClick={openTicketModal}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={closeTicketModal}
      />
    </div>
  );
}

export default AdminHelpSupport;
