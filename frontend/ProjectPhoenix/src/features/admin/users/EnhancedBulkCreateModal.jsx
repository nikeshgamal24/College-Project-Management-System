import React, { useState, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Building,
  FileUp,
  Eye,
  EyeOff,
  RefreshCw,
  HelpCircle
} from "lucide-react";
import { useCreateBulkUsersMutation } from "@/api/adminUserApiSlice";
import CSVFormattingGuide from "./CSVFormattingGuide";

const EnhancedBulkCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const [createBulkUsers, { isLoading }] = useCreateBulkUsersMutation();
  const [bulkResults, setBulkResults] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const fileInputRef = useRef(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      csvText: "",
    },
  });

  const watchedCsvText = watch("csvText");

  // User type options
  const userTypeOptions = [
    { value: 2001, label: "Students", icon: GraduationCap, description: "Students enrolled in programs" },
    { value: 1984, label: "Supervisors", icon: User, description: "Academic supervisors for student projects" },
    { value: 4334, label: "Evaluators", icon: Building, description: "Internal and external project evaluators" },
    { value: 5150, label: "Admins", icon: Key, description: "System administrators" },
  ];

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setValue("csvText", content);
      setCsvPreview(content);
    };
    reader.readAsText(file);
  };

  // Generate CSV template
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

    if (selectedUserType === 2001) {
      // Student template
      headers = ["fullname", "email", "phoneNumber", "program"];
      sampleData = [
        "John Doe,john.doe@ncit.edu.np,9876543210,700",
        "Jane Smith,jane.smith@ncit.edu.np,9876543211,701",
        "Bob Wilson,bob.wilson@ncit.edu.np,9876543212,702"
      ];
    } else if (selectedUserType === 1984) {
      // Supervisor template
      headers = ["fullname", "email", "phoneNumber", "designation", "institution"];
      sampleData = [
        "Dr. Smith,dr.smith@ncit.edu.np,9876543210,Professor,NCIT",
        "Prof. Johnson,prof.johnson@ncit.edu.np,9876543211,Associate Professor,TU",
        "Ms. Davis,ms.davis@ncit.edu.np,9876543212,Lecturer,KMC"
      ];
    } else if (selectedUserType === 4334) {
      // Evaluator template
      headers = ["fullname", "email", "phoneNumber", "designation", "institution", "evaluatorType", "contact"];
      sampleData = [
        "Dr. Brown,dr.brown@ncit.edu.np,9876543210,Professor,NCIT,internal,Department of Computer Engineering",
        "Prof. Wilson,prof.wilson@tu.edu.np,9876543211,Professor,TU,external,External evaluator contact info",
        "Dr. Lee,dr.lee@kmc.edu.np,9876543212,Associate Professor,KMC,internal,Internal evaluation team"
      ];
    } else if (selectedUserType === 5150) {
      // Admin template
      headers = ["fullname", "email", "phoneNumber"];
      sampleData = [
        "Admin User,admin@ncit.edu.np,9876543210",
        "System Admin,system@ncit.edu.np,9876543211",
        "Super Admin,superadmin@ncit.edu.np,9876543212"
      ];
    }

    const csvContent = [headers.join(","), ...sampleData].join("\n");
    setValue("csvText", csvContent);
    setCsvPreview(csvContent);
  };

  // Download template
  const downloadTemplate = () => {
    if (!csvPreview) return;
    
    const blob = new Blob([csvPreview], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${userTypeOptions.find(opt => opt.value === selectedUserType)?.label.toLowerCase()}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Parse CSV data
  const parseCSVData = (csvText) => {
    if (!selectedUserType || !csvText) return [];

    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    
    const users = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      if (values.length >= 3) {
        let user = {
          fullname: values[0] || "",
          email: values[1] || "",
          phoneNumber: values[2] || "",
          role: parseInt(selectedUserType),
        };
        
        if (selectedUserType === 2001) {
          if (values[3]) user.program = parseInt(values[3]);
        } else if (selectedUserType === 1984) {
          if (values[3]) user.designation = values[3];
          if (values[4]) user.institution = values[4];
        } else if (selectedUserType === 4334) {
          if (values[3]) user.designation = values[3];
          if (values[4]) user.institution = values[4];
          if (values[5]) user.evaluatorType = values[5];
          if (values[6]) user.contact = values[6];
        }
        
        users.push(user);
      }
    }
    
    return users;
  };

  // Validate CSV data
  const validateCSVData = async () => {
    if (!selectedUserType || !watchedCsvText) {
      toast({
        title: "Missing Data",
        description: "Please select a user type and provide CSV data",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would call your validation API
      // For now, we'll do basic validation
      const users = parseCSVData(watchedCsvText);
      
      if (users.length === 0) {
        toast({
          title: "No Valid Data",
          description: "No valid users found in the CSV data",
          variant: "destructive",
        });
        return;
      }

      // Check for duplicates
      const emails = users.map(u => u.email.toLowerCase());
      const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
      
      setValidationResults({
        totalRows: users.length,
        validRows: users.length,
        invalidRows: 0,
        duplicates: [...new Set(duplicates)],
        users: users
      });

      toast({
        title: "Validation Complete",
        description: `Found ${users.length} valid users`,
        variant: "default",
      });

    } catch (error) {
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate CSV data",
        variant: "destructive",
      });
    }
  };

  // Submit form
  const onSubmit = async (data) => {
    try {
      if (!selectedUserType) {
        toast({
          title: "Selection Required",
          description: "Please select a user type before creating users",
          variant: "destructive",
        });
        return;
      }

      const users = parseCSVData(data.csvText);
      
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

  // Handle close
  const handleClose = () => {
    reset();
    setBulkResults(null);
    setSelectedUserType("");
    setUploadedFile(null);
    setCsvPreview(null);
    setValidationResults(null);
    setShowPasswords(false);
    setActiveTab("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  // Copy passwords
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

  // Download passwords
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

  // Get field descriptions
  const getFieldDescriptions = (userType) => {
    const descriptions = {
      2001: {
        fullname: "Full name of the student (letters and spaces only)",
        email: "Valid email address (will be used for login)",
        phoneNumber: "Phone number (10-15 digits)",
        program: "Program code (700=Computer Engineering, 701=Electronics, 702=Civil, 703=Mechanical)"
      },
      1984: {
        fullname: "Full name of the supervisor (letters and spaces only)",
        email: "Valid email address (will be used for login)",
        phoneNumber: "Phone number (10-15 digits)",
        designation: "Job title or designation (optional)",
        institution: "Institution name (optional)"
      },
      4334: {
        fullname: "Full name of the evaluator (letters and spaces only)",
        email: "Valid email address (will be used for login)",
        phoneNumber: "Phone number (10-15 digits)",
        designation: "Job title or designation (optional)",
        institution: "Institution name (optional)",
        evaluatorType: "Type of evaluator: internal or external (optional)",
        contact: "Additional contact information (optional)"
      },
      5150: {
        fullname: "Full name of the admin (letters and spaces only)",
        email: "Valid email address (will be used for login)",
        phoneNumber: "Phone number (10-15 digits)"
      }
    };
    return descriptions[userType] || {};
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk User Creation</DialogTitle>
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
                <div className="grid grid-cols-4 gap-4 text-center">
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
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {bulkResults.total > 0 ? ((bulkResults.successful.length / bulkResults.total) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-sm text-purple-700">Success Rate</div>
                  </div>
                </div>

                <Progress 
                  value={bulkResults.total > 0 ? (bulkResults.successful.length / bulkResults.total) * 100 : 0} 
                  className="w-full"
                />

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
                          onClick={() => setShowPasswords(!showPasswords)}
                        >
                          {showPasswords ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                          {showPasswords ? "Hide" : "Show"}
                        </Button>
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
                            {showPasswords ? user.temporaryPassword : "••••••••"}
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
                      setActiveTab("upload");
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
          <div className="space-y-6">
            {/* User Type Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select User Type *</Label>
                {selectedUserType && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsGuideOpen(true)}
                    className="gap-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Formatting Guide
                  </Button>
                )}
              </div>
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
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Tabs for different input methods */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <FileUp className="h-4 w-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="paste" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Paste Text
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload CSV File
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                      >
                        <FileUp className="h-4 w-4" />
                        Choose CSV File
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        Maximum file size: 5MB
                      </p>
                    </div>
                    
                    {uploadedFile && (
                      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">{uploadedFile.name}</span>
                        <span className="text-xs text-green-600">
                          ({(uploadedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="paste" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      CSV Template & Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {!selectedUserType ? (
                          "Please select a user type above to see the appropriate CSV template and instructions."
                        ) : (
                          <>
                            Download the CSV template for {userTypeOptions.find(opt => opt.value === selectedUserType)?.label.toLowerCase()}. 
                            Required fields: {Object.keys(getFieldDescriptions(selectedUserType)).join(', ')}.
                          </>
                        )}
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
                      {csvPreview && (
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

                    <div className="space-y-2">
                      <Label>CSV Data *</Label>
                      <Controller
                        name="csvText"
                        control={control}
                        rules={{ required: "CSV data is required" }}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Paste your CSV data here..."
                            className={`min-h-[200px] font-mono text-sm ${errors.csvText ? "border-red-500" : ""}`}
                          />
                        )}
                      />
                      {errors.csvText && (
                        <p className="text-sm text-red-600">{errors.csvText.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Validation Results */}
            {validationResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Validation Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {validationResults.totalRows}
                      </div>
                      <div className="text-sm text-blue-700">Total Rows</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {validationResults.validRows}
                      </div>
                      <div className="text-sm text-green-700">Valid Rows</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {validationResults.invalidRows}
                      </div>
                      <div className="text-sm text-red-700">Invalid Rows</div>
                    </div>
                  </div>

                  {validationResults.duplicates.length > 0 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        Found duplicate emails: {validationResults.duplicates.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Preview */}
            {watchedCsvText && watchedCsvText.trim() && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Preview ({parseCSVData(watchedCsvText).length} users)</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={validateCSVData}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Validate
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-40 overflow-y-auto">
                    {parseCSVData(watchedCsvText).slice(0, 5).map((user, index) => (
                      <div key={index} className="flex items-center gap-2 py-1 text-sm border-b">
                        <Badge variant="outline">{user.role}</Badge>
                        <span>{user.fullname}</span>
                        <span className="text-muted-foreground">{user.email}</span>
                      </div>
                    ))}
                    {parseCSVData(watchedCsvText).length > 5 && (
                      <div className="text-sm text-muted-foreground py-2">
                        ... and {parseCSVData(watchedCsvText).length - 5} more
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
              <Button 
                onClick={handleSubmit(onSubmit)} 
                disabled={isLoading || !watchedCsvText?.trim() || !selectedUserType}
                className="gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Users
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* CSV Formatting Guide Modal */}
      <CSVFormattingGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        userType={selectedUserType}
        userTypeName={userTypeOptions.find(opt => opt.value === selectedUserType)?.label || ''}
      />
    </Dialog>
  );
};

export default EnhancedBulkCreateModal;
