import React, { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Loader2, User, Mail, Phone, GraduationCap, Building, Key } from "lucide-react";
import { useCreateUserMutation } from "@/api/adminUserApiSlice";

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [selectedRole, setSelectedRole] = useState("2001");
  const [generatedPassword, setGeneratedPassword] = useState("");

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
      role: "2001",
      program: "",
      designation: "",
      institution: "",
      evaluatorType: "",
      contact: "",
    },
  });

  const watchedRole = watch("role");

  const roleOptions = [
    { value: "2001", label: "Student", icon: GraduationCap },
    { value: "1984", label: "Supervisor", icon: User },
    { value: "5150", label: "Admin", icon: Key },
    { value: "4334", label: "Evaluator", icon: User },
  ];

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

  const onSubmit = async (data) => {
    try {
      // Prepare data based on role - only include relevant fields
      const submitData = {
        fullname: data.fullname,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: parseInt(data.role),
      };

      // Add role-specific fields
      if (data.role === "2001") {
        // Student
        submitData.program = parseInt(data.program);
      } else if (data.role === "1984") {
        // Supervisor
        if (data.designation) submitData.designation = data.designation;
        if (data.institution) submitData.institution = data.institution;
      } else if (data.role === "4334") {
        // Evaluator
        if (data.designation) submitData.designation = data.designation;
        if (data.institution) submitData.institution = data.institution;
        if (data.evaluatorType) submitData.evaluatorType = data.evaluatorType;
        if (data.contact) submitData.contact = data.contact;
      }
      // Admin - no additional fields needed

      const response = await createUser(submitData).unwrap();
      
      // Show the generated temporary password
      setGeneratedPassword(response.data.temporaryPassword);
      
      toast({
        title: "✅ Success",
        description: "User created successfully!",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      // Don't close modal yet, show the password
    } catch (error) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    setGeneratedPassword("");
    setSelectedRole("2001");
    onClose();
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast({
      title: "Copied",
      description: "Temporary password copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account with a temporary password. The user will be required to change their password on first login.
          </DialogDescription>
        </DialogHeader>

        {generatedPassword ? (
          <div className="space-y-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  User Created Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-green-700">
                    Temporary Password
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={generatedPassword}
                      readOnly
                      className="font-mono text-sm bg-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyPassword}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Save this password securely. The user will need it to log in for the first time.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleClose} className="flex-1">
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setGeneratedPassword("");
                      reset();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Create Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>User Role *</Label>
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedRole(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => {
                        const Icon = role.icon;
                        return (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {role.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Controller
                  name="fullname"
                  control={control}
                  rules={{ 
                    required: "Full name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" }
                  }}
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

            {/* Role-specific fields */}
            {selectedRole === "2001" && (
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
            )}

            {selectedRole === "1984" && (
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
            )}

            {selectedRole === "4334" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Evaluator Type *</Label>
                  <Controller
                    name="evaluatorType"
                    control={control}
                    rules={{ required: "Evaluator type is required" }}
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
                  {errors.evaluatorType && (
                    <p className="text-sm text-red-600">{errors.evaluatorType.message}</p>
                  )}
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
              </div>
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
                Create User
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;

