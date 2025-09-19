import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  Plus,
  Users,
  UserCheck,
  UserX,
  Clock,
  File,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Key,
  Mail,
} from "lucide-react";
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
import { UserDataTable } from "./UserDataTable";
import { UserColumns } from "./UserColumns";
// Modals handled by parent component
import { useGetAllUsersQuery, useResetUserPasswordMutation } from "@/api/adminUserApiSlice";
import Loader from "@/components/Loader";
import ApiError from "@/components/error/ApiError";

const AdminUserManagement = forwardRef(({ onUserCreated, onBulkCreated, onViewUser, onEditUser, onDeleteUser }, ref) => {
  const navigate = useNavigate();
  const tableRef = useRef();
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  // Modal state handled by parent component
  const [selectedUser, setSelectedUser] = useState(null);

  // API query with filters
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllUsersQuery({
    role: selectedRole !== "all" ? selectedRole : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchTerm || undefined,
    page: 1,
    limit: 50,
  });

  // Reset password mutation
  const [resetUserPassword, { isLoading: isResettingPassword }] = useResetUserPasswordMutation();

  // Expose refetch function to parent component
  useImperativeHandle(ref, () => ({
    refetch,
  }));

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination || {};

  // Filter users based on role
  const filteredUsers = users.filter((user) => {
    if (selectedRole === "all") return true;
    return user.role.includes(parseInt(selectedRole));
  });

  // Calculate statistics
  const stats = {
    total: users.length,
    students: users.filter((user) => user.role.includes(2001)).length,
    supervisors: users.filter((user) => user.role.includes(1984)).length,
    admins: users.filter((user) => user.role.includes(5150)).length,
    active: users.filter((user) => user.status === "ACTIVE").length,
    pending: users.filter((user) => user.status === "PENDING_ACTIVATION").length,
    inactive: users.filter((user) => user.status === "INACTIVE").length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING_ACTIVATION":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "SUSPENDED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <UserCheck className="h-3 w-3" />;
      case "PENDING_ACTIVATION":
        return <Clock className="h-3 w-3" />;
      case "INACTIVE":
        return <UserX className="h-3 w-3" />;
      case "SUSPENDED":
        return <UserX className="h-3 w-3" />;
      default:
        return <UserX className="h-3 w-3" />;
    }
  };


  // Handle reset password
  const handleResetPassword = async (user) => {
    try {
      const primaryRole = user.role[0];
      
      console.log('🔍 Frontend Debug - Resetting password for user:', user);
      console.log('🔍 Frontend Debug - Request payload:', {
        userId: user._id,
        role: primaryRole
      });
      
      await resetUserPassword({
        userId: user._id,
        role: primaryRole
      }).unwrap();

      toast({
        title: "Password Reset Successfully",
        description: `Temporary password has been sent to ${user.email}`,
        variant: "default",
        className: "bg-green-50 text-green-700 border-green-200",
      });

      // Refetch data to update the UI (in case isTemporaryPassword status changes)
      refetch();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  const handlers = {
    viewUser: (user) => {
      onViewUser?.(user);
    },
    editUser: (user) => {
      onEditUser?.(user);
    },
    resetPassword: handleResetPassword,
    deleteUser: (user) => {
      onDeleteUser?.(user);
    },
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action}`);
    // Handle bulk actions
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <ApiError error={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Header removed - handled by parent component */}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
            <p className="text-xs text-muted-foreground">
              Active students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supervisors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.supervisors}</div>
            <p className="text-xs text-muted-foreground">
              Available supervisors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Activation</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting password change
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Manage and monitor all user accounts
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-[200px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING_ACTIVATION">Pending</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => tableRef.current?.exportCSV()}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedRole} onValueChange={setSelectedRole}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="2001">Students</TabsTrigger>
              <TabsTrigger value="1984">Supervisors</TabsTrigger>
              <TabsTrigger value="4334">Evaluators</TabsTrigger>
              <TabsTrigger value="5150">Admins</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedRole} className="mt-4">
              <UserDataTable
                ref={tableRef}
                columns={UserColumns(handlers)}
                data={filteredUsers}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals handled by parent component */}
    </div>
  );
});

AdminUserManagement.displayName = "AdminUserManagement";

export default AdminUserManagement;
