import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableHead } from "@/components/ui/table";
import { format } from "date-fns";
import { 
  ArrowUpDown, 
  Eye,
  Users,
  MessageSquare,
  MessageSquare as AcademicIcon,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";

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
      return <AcademicIcon className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "new":
      return <AlertCircle className="h-4 w-4" />;
    case "in_progress":
      return <Clock className="h-4 w-4" />;
    case "resolved":
      return <CheckCircle className="h-4 w-4" />;
    case "closed":
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export const HelpSupportColumns = (handlers = {}) => [
  {
    accessorKey: "ticketId",
    header: ({ column }) => (
      <TableHead
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer"
      >
        <Button variant="ghost" className="p-0 m-0 hover:bg-transparent">
          <span className="hidden sm:inline">Ticket ID</span>
          <span className="sm:hidden">ID</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
    ),
    cell: ({ row }) => {
      const ticketId = row.getValue("ticketId");
      return (
        <TableCell className="font-mono text-xs sm:text-sm font-semibold">
          {ticketId || row.original._id}
        </TableCell>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <TableHead
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer"
      >
        <Button variant="ghost" className="p-0 m-0 hover:bg-transparent">
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
    ),
    cell: ({ row }) => {
      const title = row.getValue("title");
      const description = row.original.description;
      return (
        <TableCell className="max-w-[200px] sm:max-w-[300px]">
          <div className="space-y-1">
            <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">{title}</div>
            <div className="text-xs sm:text-sm text-gray-500 line-clamp-1 sm:line-clamp-2">
              {description}
            </div>
          </div>
        </TableCell>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <TableHead>Status</TableHead>,
    cell: ({ row }) => {
      const status = row.getValue("status");
      const formatted = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
      return (
        <TableCell>
          <Badge className={`${getStatusColor(status)} flex items-center gap-1 w-fit`}>
            {getStatusIcon(status)}
            {formatted}
          </Badge>
        </TableCell>
      );
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <TableHead
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer"
      >
        <Button variant="ghost" className="p-0 m-0 hover:bg-transparent">
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
    ),
    cell: ({ row }) => {
      const priority = row.getValue("priority");
      const formatted = priority.charAt(0).toUpperCase() + priority.slice(1);
      return (
        <TableCell>
          <Badge className={`${getPriorityColor(priority)} w-fit`}>
            {formatted}
          </Badge>
        </TableCell>
      );
    },
  },
  {
    accessorKey: "category",
    header: () => <TableHead className="hidden md:table-cell">Category</TableHead>,
    cell: ({ row }) => {
      const category = row.getValue("category");
      const formatted = category.charAt(0).toUpperCase() + category.slice(1);
      return (
        <TableCell className="hidden md:table-cell">
          <div className="flex items-center gap-2">
            {getCategoryIcon(category)}
            <span className="text-sm font-medium">{formatted}</span>
          </div>
        </TableCell>
      );
    },
  },
  {
    accessorKey: "submittedBy",
    header: ({ column }) => (
      <TableHead
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer hidden lg:table-cell"
      >
        <Button variant="ghost" className="p-0 m-0 hover:bg-transparent">
          Submitted By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
    ),
    cell: ({ row }) => {
      const submittedBy = row.getValue("submittedBy");
      const submittedByRole = row.original.submittedByRole;
      return (
        <TableCell className="hidden lg:table-cell">
          <div className="space-y-1">
            <div className="font-medium">{submittedBy}</div>
            <div className="text-xs text-gray-500 capitalize">
              {submittedByRole}
            </div>
          </div>
        </TableCell>
      );
    },
  },
  {
    accessorKey: "assignedTo",
    header: () => <TableHead className="hidden lg:table-cell">Assigned To</TableHead>,
    cell: ({ row }) => {
      const assignedTo = row.getValue("assignedTo");
      return (
        <TableCell className="hidden lg:table-cell">
          {assignedTo ? (
            <span className="text-sm font-medium">{assignedTo}</span>
          ) : (
            <span className="text-sm text-gray-400">Unassigned</span>
          )}
        </TableCell>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <TableHead
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="cursor-pointer"
      >
        <Button variant="ghost" className="p-0 m-0 hover:bg-transparent">
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt");
      let formatted = "N/A";
      
      if (createdAt) {
        try {
          const date = new Date(createdAt);
          if (!isNaN(date.getTime())) {
            formatted = format(date, "MMM dd, yyyy");
          }
        } catch (error) {
          console.error("Date formatting error:", error);
          formatted = "Invalid Date";
        }
      }
      
      return (
        <TableCell className="text-xs sm:text-sm text-gray-500">
          {formatted}
        </TableCell>
      );
    },
  },
  {
    accessorKey: "comments",
    header: () => <TableHead className="hidden sm:table-cell">Comments</TableHead>,
    cell: ({ row }) => {
      const comments = row.getValue("comments");
      const commentCount = comments.length;
      return (
        <TableCell className="hidden sm:table-cell">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">{commentCount}</span>
          </div>
        </TableCell>
      );
    },
  },
  {
    id: "actions",
    header: () => <TableHead>Actions</TableHead>,
    cell: ({ row }) => {
      const ticket = row.original;

      return (
        <TableCell>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlers.openTicketModal?.(ticket)}
            className="flex items-center gap-1 text-xs sm:text-sm"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">View Details</span>
            <span className="sm:hidden">View</span>
          </Button>
        </TableCell>
      );
    },
  },
];


