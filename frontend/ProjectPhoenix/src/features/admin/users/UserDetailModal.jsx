import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Key,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  GraduationCap,
  Building,
} from "lucide-react";
import { format } from "date-fns";

const UserDetailModal = ({ isOpen, onClose, user, onEdit }) => {
  if (!user) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-50 text-green-700 border border-green-200";
      case "PENDING_ACTIVATION":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "INACTIVE":
        return "bg-gray-50 text-gray-700 border border-gray-200";
      case "SUSPENDED":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <UserCheck className="h-4 w-4" />;
      case "PENDING_ACTIVATION":
        return <Clock className="h-4 w-4" />;
      case "INACTIVE":
        return <UserX className="h-4 w-4" />;
      case "SUSPENDED":
        return <UserX className="h-4 w-4" />;
      default:
        return <UserX className="h-4 w-4" />;
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
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case 1984:
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case 5150:
        return "bg-red-50 text-red-700 border border-red-200";
      case 4334:
        return "bg-orange-50 text-orange-700 border border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 2001:
        return <GraduationCap className="h-4 w-4" />;
      case 1984:
        return <User className="h-4 w-4" />;
      case 5150:
        return <Key className="h-4 w-4" />;
      case 4334:
        return <Building className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const roles = user.role || [];
  const primaryRole = roles[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-lg font-medium text-gray-600">
                {user.fullname?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <div className="text-xl font-semibold">{user.fullname}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            View detailed information about this user account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="text-sm">{user.fullname || "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </label>
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {user.phoneNumber || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Account Status
                  </label>
                  <Badge className={`${getStatusColor(user.status)} text-xs`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(user.status)}
                      {user.status?.replace("_", " ") || "Unknown"}
                    </div>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {getRoleIcon(primaryRole)}
                Role Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  User Role
                </label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role, index) => (
                    <Badge
                      key={index}
                      className={`${getRoleColor(role)} text-xs`}
                    >
                      <div className="flex items-center gap-1">
                        {getRoleIcon(role)}
                        {getRoleName(role)}
                      </div>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-Specific Details */}
          {primaryRole === 2001 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Roll Number
                    </label>
                    <p className="text-sm">{user.rollNumber || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Batch Number
                    </label>
                    <p className="text-sm">{user.batchNumber || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Program
                    </label>
                    <p className="text-sm">{user.program || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {primaryRole === 1984 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Supervisor Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Designation
                    </label>
                    <p className="text-sm">{user.designation || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Institution
                    </label>
                    <p className="text-sm">{user.institution || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {primaryRole === 4334 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Evaluator Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Designation
                    </label>
                    <p className="text-sm">{user.designation || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Institution
                    </label>
                    <p className="text-sm">{user.institution || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Evaluator Type
                    </label>
                    <p className="text-sm">{user.evaluatorType || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Contact Information
                    </label>
                    <p className="text-sm">{user.contact || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Password Status
                  </label>
                  <div className="flex items-center gap-2">
                    {user.isTemporaryPassword ? (
                      <>
                        <Key className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-600">Temporary Password</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Password Set</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Login
                  </label>
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {user.lastLogin ? format(new Date(user.lastLogin), "MMM dd, yyyy 'at' h:mm a") : "Never"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Account Created
                  </label>
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy 'at' h:mm a") : "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {user.updatedAt ? format(new Date(user.updatedAt), "MMM dd, yyyy 'at' h:mm a") : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(user)}>
            Edit User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;

