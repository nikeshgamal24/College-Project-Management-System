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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Copy,
  Key,
  User,
  GraduationCap,
  Building
} from "lucide-react";
import { useCreateBulkUsersMutation } from "@/api/adminUserApiSlice";

const BulkCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const [createBulkUsers, { isLoading }] = useCreateBulkUsersMutation();
  const [bulkResults, setBulkResults] = useState(null);
  const [csvTemplate, setCsvTemplate] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      users: "",
    },
  });

  const watchedUsers = watch("users");

  // User type options
  const userTypeOptions = [
    { value: "2001", label: "Students", icon: GraduationCap },
    { value: "1984", label: "Supervisors", icon: User },
    { value: "4334", label: "Evaluators", icon: Building },
    { value: "5150", label: "Admins", icon: Key },
  ];

  // Generate CSV template based on selected user type
  const generateCSVTemplate = () => {
    if (!selectedUserType) {
      toast({
        title: "Selection Required",
        description: "Please select a user type first",
        variant: "destructive",
      });
      return;
    }

    let headers, sampleData;

    if (selectedUserType === "2001") {
      // Student template
      headers = ["fullname", "email", "phoneNumber", "program"];
      sampleData = [
        "John Doe,john.doe@ncit.edu.np,9876543210,700",
        "Jane Smith,jane.smith@ncit.edu.np,9876543211,701",
        "Bob Wilson,bob.wilson@ncit.edu.np,9876543212,702"
      ];
    } else if (selectedUserType === "1984") {
      // Supervisor template
      headers = ["fullname", "email", "phoneNumber", "designation", "institution"];
      sampleData = [
        "Dr. Smith,dr.smith@ncit.edu.np,9876543210,Professor,NCIT",
        "Prof. Johnson,prof.johnson@ncit.edu.np,9876543211,Associate Professor,TU",
        "Ms. Davis,ms.davis@ncit.edu.np,9876543212,Lecturer,KMC"
      ];
    } else if (selectedUserType === "4334") {
      // Evaluator template
      headers = ["fullname", "email", "phoneNumber", "designation", "institution", "evaluatorType", "contact"];
      sampleData = [
        "Dr. Brown,dr.brown@ncit.edu.np,9876543210,Professor,NCIT,internal,Department of Computer Engineering",
        "Prof. Wilson,prof.wilson@tu.edu.np,9876543211,Professor,TU,external,External evaluator contact info",
        "Dr. Lee,dr.lee@kmc.edu.np,9876543212,Associate Professor,KMC,internal,Internal evaluation team"
      ];
    } else if (selectedUserType === "5150") {
      // Admin template
      headers = ["fullname", "email", "phoneNumber"];
      sampleData = [
        "Admin User,admin@ncit.edu.np,9876543210",
        "System Admin,system@ncit.edu.np,9876543211",
        "Super Admin,superadmin@ncit.edu.np,9876543212"
      ];
    }

    const csvContent = [headers.join(","), ...sampleData].join("\n");
    setCsvTemplate(csvContent);
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSVData = (csvText) => {
    if (!selectedUserType) {
      return [];
    }

    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    
    const users = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      if (values.length >= 3) { // Minimum required fields: fullname, email, phoneNumber
        let user = {
          fullname: values[0] || "",
          email: values[1] || "",
          phoneNumber: values[2] || "",
          role: parseInt(selectedUserType), // Always use the selected user type
        };
        
        if (selectedUserType === "2001") {
          // Student format: fullname, email, phoneNumber, program
          if (values[3]) user.program = parseInt(values[3]);
        } else if (selectedUserType === "1984") {
          // Supervisor format: fullname, email, phoneNumber, designation, institution
          if (values[3]) user.designation = values[3];
          if (values[4]) user.institution = values[4];
        } else if (selectedUserType === "4334") {
          // Evaluator format: fullname, email, phoneNumber, designation, institution, evaluatorType, contact
          if (values[3]) user.designation = values[3];
          if (values[4]) user.institution = values[4];
          if (values[5]) user.evaluatorType = values[5];
          if (values[6]) user.contact = values[6];
        }
        // Admin format: only fullname, email, phoneNumber (no additional fields)
        
        users.push(user);
      }
    }
    
    return users;
  };

  const onSubmit = async (data) => {
    try {
      // Check if user type is selected
      if (!selectedUserType) {
        toast({
          title: "Selection Required",
          description: "Please select a user type before creating users",
          variant: "destructive",
        });
        return;
      }

      const users = parseCSVData(data.users);
      
      if (users.length === 0) {
        toast({
          title: "Error",
          description: "No valid users found in the CSV data",
          variant: "destructive",
        });
        return;
      }

      if (users.length > 100) {
        toast({
          title: "Error",
          description: "Cannot create more than 100 users at once",
          variant: "destructive",
        });
        return;
      }

      const response = await createBulkUsers({ users }).unwrap();
      setBulkResults(response.data);
      
      toast({
        title: "✅ Bulk Creation Completed",
        description: `${response.data.successful.length} users created successfully, ${response.data.failed.length} failed.`,
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to create users",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    reset();
    setBulkResults(null);
    setCsvTemplate("");
    setSelectedUserType("");
    onClose();
  };

  const copyPasswords = () => {
    if (!bulkResults) return;
    
    const passwords = bulkResults.successful
      .map(user => `${user.user.email}: ${user.temporaryPassword}`)
      .join("\n");
    
    navigator.clipboard.writeText(passwords);
    toast({
      title: "Copied",
      description: "All temporary passwords copied to clipboard",
    });
  };

  const downloadPasswords = () => {
    if (!bulkResults) return;
    
    const csvContent = [
      "Email,Temporary Password",
      ...bulkResults.successful.map(user => 
        `${user.user.email},${user.temporaryPassword}`
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_passwords.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Create Users</DialogTitle>
          <DialogDescription>
            Create multiple users at once by uploading a CSV file or pasting CSV data.
            Users will receive temporary passwords that they must change on first login.
          </DialogDescription>
        </DialogHeader>

        {bulkResults ? (
          <div className="space-y-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Bulk Creation Completed!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {bulkResults.successful.length}
                    </div>
                    <div className="text-sm text-green-700">Successful</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {bulkResults.failed.length}
                    </div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {bulkResults.total}
                    </div>
                    <div className="text-sm text-blue-700">Total</div>
                  </div>
                </div>

                {bulkResults.successful.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Temporary Passwords
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={copyPasswords}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy All
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={downloadPasswords}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto border rounded p-2 bg-white">
                      {bulkResults.successful.map((user, index) => (
                        <div key={index} className="flex justify-between items-center py-1 text-sm">
                          <span className="font-mono">{user.user.email}</span>
                          <span className="font-mono text-green-600">
                            {user.temporaryPassword}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bulkResults.failed.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-red-700">
                      Failed Creations
                    </Label>
                    <div className="max-h-40 overflow-y-auto border rounded p-2 bg-red-50">
                      {bulkResults.failed.map((failure, index) => (
                        <div key={index} className="py-1 text-sm text-red-700">
                          <span className="font-mono">{failure.email}</span>
                          <span className="ml-2">- {failure.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleClose} className="flex-1">
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setBulkResults(null);
                      reset();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Create More
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* User Type Selection */}
            <div className="space-y-2">
              <Label>Select User Type *</Label>
              <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                <SelectTrigger>
                  <SelectValue placeholder="Please select a user type for CSV template" />
                </SelectTrigger>
                <SelectContent>
                  {userTypeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Please select a specific user type to get a simplified CSV template with only relevant fields for that user type.
              </p>
            </div>

            {/* CSV Template Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  CSV Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {!selectedUserType ? (
                      <>
                        Please select a user type above to see the appropriate CSV template and instructions.
                      </>
                    ) : selectedUserType === "2001" ? (
                      <>
                        Download the CSV template for students. 
                        Required fields: fullname, email, phoneNumber, program.
                        Program values: 700 (Computer Engineering), 701 (Electronics Engineering), 702 (Civil Engineering), 703 (Mechanical Engineering).
                      </>
                    ) : selectedUserType === "1984" ? (
                      <>
                        Download the CSV template for supervisors. 
                        Required fields: fullname, email, phoneNumber.
                        Optional fields: designation, institution.
                      </>
                    ) : selectedUserType === "4334" ? (
                      <>
                        Download the CSV template for evaluators. 
                        Required fields: fullname, email, phoneNumber.
                        Optional fields: designation, institution, evaluatorType, contact.
                        Evaluator types: internal, external.
                      </>
                    ) : selectedUserType === "5150" ? (
                      <>
                        Download the CSV template for admins. 
                        Required fields: fullname, email, phoneNumber.
                      </>
                    ) : null}
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateCSVTemplate}
                    className="gap-2"
                    disabled={!selectedUserType}
                  >
                    <FileText className="h-4 w-4" />
                    Generate Template
                  </Button>
                  {csvTemplate && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={downloadTemplate}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Template
                    </Button>
                  )}
                </div>

                {csvTemplate && (
                  <div className="space-y-2">
                    <Label>Template Preview</Label>
                    <Textarea
                      value={csvTemplate}
                      readOnly
                      className="font-mono text-xs"
                      rows={4}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CSV Data Input */}
            <div className="space-y-2">
              <Label>CSV Data *</Label>
              <Controller
                name="users"
                control={control}
                rules={{ required: "CSV data is required" }}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Paste your CSV data here or upload a file..."
                    className={`min-h-[200px] font-mono text-sm ${errors.users ? "border-red-500" : ""}`}
                  />
                )}
              />
              {errors.users && (
                <p className="text-sm text-red-600">{errors.users.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {!selectedUserType ? (
                  "Please select a user type above to see the required CSV headers"
                ) : selectedUserType === "2001" ? (
                  "Paste CSV data with headers: fullname, email, phoneNumber, program"
                ) : selectedUserType === "1984" ? (
                  "Paste CSV data with headers: fullname, email, phoneNumber, designation, institution"
                ) : selectedUserType === "4334" ? (
                  "Paste CSV data with headers: fullname, email, phoneNumber, designation, institution, evaluatorType, contact"
                ) : selectedUserType === "5150" ? (
                  "Paste CSV data with headers: fullname, email, phoneNumber"
                ) : (
                  "Paste CSV data with the appropriate headers for the selected user type"
                )}
              </p>
            </div>

            {/* Preview */}
            {watchedUsers && watchedUsers.trim() && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Preview ({parseCSVData(watchedUsers).length} users)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-40 overflow-y-auto">
                    {parseCSVData(watchedUsers).slice(0, 5).map((user, index) => (
                      <div key={index} className="flex items-center gap-2 py-1 text-sm border-b">
                        <Badge variant="outline">{user.role}</Badge>
                        <span>{user.fullname}</span>
                        <span className="text-muted-foreground">{user.email}</span>
                      </div>
                    ))}
                    {parseCSVData(watchedUsers).length > 5 && (
                      <div className="text-sm text-muted-foreground py-2">
                        ... and {parseCSVData(watchedUsers).length - 5} more
                      </div>
                    )}
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
              <Button type="submit" disabled={isLoading || !watchedUsers?.trim() || !selectedUserType}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Users
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkCreateModal;

