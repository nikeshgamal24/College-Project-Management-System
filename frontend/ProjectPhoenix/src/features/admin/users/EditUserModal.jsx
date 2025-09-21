import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Loader2, User, Mail, Phone, GraduationCap, Building, Key } from "lucide-react";
import { useUpdateUserMutation } from "@/api/adminUserApiSlice";

const EditUserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullname: "",
      email: "",
      phoneNumber: "",
      status: "",
      program: "",
      designation: "",
      institution: "",
      evaluatorType: "",
      contact: "",
    },
  });

  const watchedStatus = watch("status");

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      const roles = user.role || [];
      const primaryRole = roles[0];
      
      reset({
        fullname: user.fullname || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        status: user.status || "",
        program: user.program || "",
        designation: user.designation || "",
        institution: user.institution || "",
        evaluatorType: user.evaluatorType || "",
        contact: user.contact || "",
      });
    }
  }, [user, reset]);

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

  const programOptions = [
    { value: "700", label: "Computer Engineering" },
    { value: "701", label: "Electronics Engineering" },
    { value: "702", label: "Civil Engineering" },
    { value: "703", label: "Mechanical Engineering" },
  ];

  const evaluatorTypeOptions = [
    { value: "internal", label: "Internal Evaluator" },
    { value: "external", label: "External Evaluator" },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "PENDING_ACTIVATION", label: "Pending Activation" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "SUSPENDED", label: "Suspended" },
  ];

  const onSubmit = async (data) => {
    try {
      const roles = user.role || [];
      const primaryRole = roles[0];
      
      // Prepare data based on role - only include relevant fields
      const submitData = {
        fullname: data.fullname,
        email: data.email,
        phoneNumber: data.phoneNumber,
        status: data.status,
      };

      // Add role-specific fields
      if (primaryRole === 2001) {
        // Student
        if (data.program) submitData.program = parseInt(data.program);
      } else if (primaryRole === 1984) {
        // Supervisor
        if (data.designation) submitData.designation = data.designation;
        if (data.institution) submitData.institution = data.institution;
      } else if (primaryRole === 4334) {
        // Evaluator
        if (data.designation) submitData.designation = data.designation;
        if (data.institution) submitData.institution = data.institution;
        if (data.evaluatorType) submitData.evaluatorType = data.evaluatorType;
        if (data.contact) submitData.contact = data.contact;
      }
      // Admin - no additional fields needed
      
      const response = await updateUser({
        userId: user._id,
        userData: submitData,
        role: primaryRole
      }).unwrap();
      
      toast({
        title: "✅ Success",
        description: "User updated successfully!",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!user) return null;

  const roles = user.role || [];
  const primaryRole = roles[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user.fullname?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <div className="text-lg font-semibold">Edit User</div>
              <div className="text-sm text-muted-foreground">
                {user.fullname} - {getRoleName(primaryRole)}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Update user information and account settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  <Label>Full Name *</Label>
                  <Controller
                    name="fullname"
                    control={control}
                    rules={{ required: "Full name is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter full name"
                        className={errors.fullname ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.fullname && (
                    <p className="text-sm text-red-600">{errors.fullname.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Controller
                    name="email"
                    control={control}
                    rules={{ 
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email format"
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter email address"
                        className={errors.email ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Controller
                    name="phoneNumber"
                    control={control}
                    rules={{ 
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10,15}$/,
                        message: "Phone number must be 10-15 digits"
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter phone number"
                        className={errors.phoneNumber ? "border-red-500" : ""}
                      />
                    )}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Account Status *</Label>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: "Status is required" }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-Specific Fields */}
          {primaryRole === 2001 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Program *</Label>
                  <Controller
                    name="program"
                    control={control}
                    rules={{ required: "Program is required for students" }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                        <SelectContent>
                          {programOptions.map((program) => (
                            <SelectItem key={program.value} value={program.value}>
                              {program.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.program && (
                    <p className="text-sm text-red-600">{errors.program.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {primaryRole === 1984 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Supervisor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Controller
                      name="designation"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="e.g., Professor, Lecturer"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Controller
                      name="institution"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="e.g., NCIT, TU"
                        />
                      )}
                    />
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
                  Evaluator Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Evaluator Type</Label>
                  <Controller
                    name="evaluatorType"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select evaluator type" />
                        </SelectTrigger>
                        <SelectContent>
                          {evaluatorTypeOptions.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Controller
                      name="designation"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="e.g., Professor, Lecturer"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Controller
                      name="institution"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="e.g., NCIT, TU"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Contact Information</Label>
                  <Controller
                    name="contact"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Additional contact information, address, etc."
                        rows={3}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
