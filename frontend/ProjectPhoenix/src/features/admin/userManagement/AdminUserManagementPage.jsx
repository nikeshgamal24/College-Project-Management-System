import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Download } from "lucide-react";
import AdminUserManagement from "../users/AdminUserManagement";
import CreateUserModal from "../users/CreateUserModal";
import EnhancedBulkCreateModal from "../users/EnhancedBulkCreateModal";
import UserDetailModal from "../users/UserDetailModal";
import EditUserModal from "../users/EditUserModal";
import { toast } from "@/components/ui/use-toast";
import { useDeleteUserMutation } from "@/api/adminUserApiSlice";

const AdminUserManagementPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const userManagementRef = useRef();
  
  const [deleteUser] = useDeleteUserMutation();

  const handleUserCreated = () => {
    setIsCreateModalOpen(false);
    // Trigger refetch in AdminUserManagement component
    if (userManagementRef.current?.refetch) {
      userManagementRef.current.refetch();
    }
    toast({
      title: "✅ Success",
      description: "User created successfully!",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  const handleBulkCreated = () => {
    setIsBulkModalOpen(false);
    // Trigger refetch in AdminUserManagement component
    if (userManagementRef.current?.refetch) {
      userManagementRef.current.refetch();
    }
    toast({
      title: "✅ Success",
      description: "Bulk user creation completed!",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUserUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    if (userManagementRef.current?.refetch) {
      userManagementRef.current.refetch();
    }
    toast({
      title: "✅ Success",
      description: "User updated successfully!",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async (user) => {
    try {
      const roles = user.role || [];
      const primaryRole = roles[0];
      
      await deleteUser({
        userId: user._id,
        role: primaryRole
      }).unwrap();
      
      // Trigger refetch in AdminUserManagement component
      if (userManagementRef.current?.refetch) {
        userManagementRef.current.refetch();
      }
      
      toast({
        title: "✅ Success",
        description: "User deleted successfully!",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users including students, supervisors, evaluators, and admins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsBulkModalOpen(true)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Bulk Create
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* User Management Component */}
      <AdminUserManagement 
        ref={userManagementRef}
        onUserCreated={handleUserCreated}
        onBulkCreated={handleBulkCreated}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleUserCreated}
      />
      
      <EnhancedBulkCreateModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={handleBulkCreated}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        user={selectedUser}
        onEdit={handleEditUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={selectedUser}
        onSuccess={handleUserUpdated}
      />
    </div>
  );
};

export default AdminUserManagementPage;
