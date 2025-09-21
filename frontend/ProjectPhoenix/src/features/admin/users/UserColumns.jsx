// ColumnDef type is inferred from the column definitions
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Key,
  Clock,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 hover:text-green-700";
    case "PENDING_ACTIVATION":
      return "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-50 hover:text-yellow-700";
    case "INACTIVE":
      return "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-700";
    case "SUSPENDED":
      return "bg-red-50 text-red-700 border border-red-200 hover:bg-red-50 hover:text-red-700";
    default:
      return "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-700";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "ACTIVE":
      return <CheckCircle className="h-3 w-3" />;
    case "PENDING_ACTIVATION":
      return <Clock className="h-3 w-3" />;
    case "INACTIVE":
      return <Clock className="h-3 w-3" />;
    case "SUSPENDED":
      return <Clock className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

const getRoleName = (role) => {
  switch (role) {
    case 2001:
      return "Student";
    case 1984:
      return "Supervisor";
    case 5150:
      return "Admin";
    case 4334:
      return "Evaluator";
    default:
      return "Unknown";
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case 2001:
      return "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 hover:text-blue-700";
    case 1984:
      return "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-50 hover:text-purple-700";
    case 5150:
      return "bg-red-50 text-red-700 border border-red-200 hover:bg-red-50 hover:text-red-700";
    case 4334:
      return "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-50 hover:text-orange-700";
    default:
      return "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-700";
  }
};

export const UserColumns = (handlers) => [
  {
    accessorKey: "fullname",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user.fullname?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <div className="font-medium">{user.fullname}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const roles = row.original.role || [];
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role, index) => (
            <Badge
              key={index}
              className={`${getRoleColor(role)} text-xs`}
            >
              {getRoleName(role)}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge className={`${getStatusColor(status)} text-xs`}>
          <div className="flex items-center gap-1">
            {getStatusIcon(status)}
            {status?.replace("_", " ") || "Unknown"}
          </div>
        </Badge>
      );
    },
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.original.phoneNumber;
      return <span className="text-sm">{phone || "N/A"}</span>;
    },
  },
  {
    accessorKey: "roleSpecific",
    header: "Details",
    cell: ({ row }) => {
      const user = row.original;
      const roles = user.role || [];
      const primaryRole = roles[0];
      
      if (primaryRole === 2001) {
        // Student specific fields
        return (
          <div className="text-sm space-y-1">
            {user.rollNumber && (
              <div>Roll: {user.rollNumber}</div>
            )}
            {user.batchNumber && (
              <div>Batch: {user.batchNumber}</div>
            )}
            {user.program && (
              <div>Program: {user.program}</div>
            )}
          </div>
        );
      } else if (primaryRole === 1984) {
        // Supervisor specific fields
        return (
          <div className="text-sm space-y-1">
            {user.designation && (
              <div>Designation: {user.designation}</div>
            )}
            {user.institution && (
              <div>Institution: {user.institution}</div>
            )}
          </div>
        );
      } else if (primaryRole === 4334) {
        // Evaluator specific fields
        return (
          <div className="text-sm space-y-1">
            {user.designation && (
              <div>Designation: {user.designation}</div>
            )}
            {user.institution && (
              <div>Institution: {user.institution}</div>
            )}
          </div>
        );
      }
      
      return <span className="text-sm text-gray-500">-</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <span className="text-sm text-muted-foreground">
          {date ? format(new Date(date), "MMM dd, yyyy") : "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const lastLogin = row.original.lastLogin;
      return (
        <span className="text-sm text-muted-foreground">
          {lastLogin ? format(new Date(lastLogin), "MMM dd, yyyy") : "Never"}
        </span>
      );
    },
  },
  {
    accessorKey: "isTemporaryPassword",
    header: "Password",
    cell: ({ row }) => {
      const isTemp = row.original.isTemporaryPassword;
      return (
        <div className="flex items-center gap-1">
          {isTemp ? (
            <>
              <Key className="h-3 w-3 text-yellow-600" />
              <span className="text-xs text-yellow-600">Temporary</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">Set</span>
            </>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handlers?.viewUser?.(user)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Details
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => handlers?.editUser?.(user)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit User
            </DropdownMenuItem>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Key className="h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset User Password</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reset the password for <strong>{user.fullname}</strong>?
                    <br /><br />
                    This will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Generate a new temporary password</li>
                      <li>Send an email to <strong>{user.email}</strong> with the new credentials</li>
                      <li>Require the user to change their password on next login</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handlers?.resetPassword?.(user)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Reset Password
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>


            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this user? This action cannot be undone.
                    This will permanently remove the user account and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handlers?.deleteUser?.(user)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
