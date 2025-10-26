import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Info,
  Copy,
  Download,
  HelpCircle,
  BookOpen,
  Lightbulb,
  AlertTriangle
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const CSVFormattingGuide = ({ isOpen, onClose, userType, userTypeName }) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Convert userType to number if it's a string
  const numericUserType = typeof userType === 'string' ? parseInt(userType, 10) : userType;

  // Get formatting guide based on user type
  const getFormattingGuide = () => {
    const guides = {
      2001: {
        title: "Student CSV Format Guide",
        description: "Follow this guide to create a properly formatted CSV file for student bulk creation.",
        requiredFields: [
          {
            name: "fullname",
            description: "Student's full name",
            format: "Letters and spaces only, 2-50 characters",
            example: "John Doe",
            required: true
          },
          {
            name: "email",
            description: "Student's email address",
            format: "Valid email format (will be used for login)",
            example: "john.doe@ncit.edu.np",
            required: true
          },
          {
            name: "phoneNumber",
            description: "Student's phone number",
            format: "10-15 digits only, no spaces or special characters",
            example: "9876543210",
            required: true
          },
          {
            name: "program",
            description: "Student's program code",
            format: "Must be one of: 700, 701, 702, 703",
            example: "700",
            required: true,
            validValues: [
              { code: "700", name: "Computer Engineering" },
              { code: "701", name: "Electronics Engineering" },
              { code: "702", name: "Civil Engineering" },
              { code: "703", name: "Mechanical Engineering" }
            ]
          }
        ],
        optionalFields: [
          {
            name: "photo",
            description: "Student's photo URL",
            format: "Valid URL to image file",
            example: "https://example.com/photo.jpg",
            required: false
          }
        ],
        csvExample: `fullname,email,phoneNumber,program
John Doe,john.doe@ncit.edu.np,9876543210,700
Jane Smith,jane.smith@ncit.edu.np,9876543211,701
Bob Wilson,bob.wilson@ncit.edu.np,9876543212,702`,
        commonErrors: [
          "Using invalid program codes (must be 700, 701, 702, or 703)",
          "Including special characters in phone numbers",
          "Using invalid email formats",
          "Missing required fields",
          "Using numbers or special characters in full names"
        ]
      },
      1984: {
        title: "Supervisor CSV Format Guide",
        description: "Follow this guide to create a properly formatted CSV file for supervisor bulk creation.",
        requiredFields: [
          {
            name: "fullname",
            description: "Supervisor's full name",
            format: "Letters and spaces only, 2-50 characters",
            example: "Dr. John Smith",
            required: true
          },
          {
            name: "email",
            description: "Supervisor's email address",
            format: "Valid email format (will be used for login)",
            example: "dr.smith@ncit.edu.np",
            required: true
          },
          {
            name: "phoneNumber",
            description: "Supervisor's phone number",
            format: "10-15 digits only, no spaces or special characters",
            example: "9876543210",
            required: true
          }
        ],
        optionalFields: [
          {
            name: "designation",
            description: "Job title or designation",
            format: "Any text, 1-100 characters",
            example: "Professor",
            required: false
          },
          {
            name: "institution",
            description: "Institution name",
            format: "Any text, 1-100 characters",
            example: "NCIT",
            required: false
          },
          {
            name: "photo",
            description: "Supervisor's photo URL",
            format: "Valid URL to image file",
            example: "https://example.com/photo.jpg",
            required: false
          }
        ],
        csvExample: `fullname,email,phoneNumber,designation,institution
Dr. Smith,dr.smith@ncit.edu.np,9876543210,Professor,NCIT
Prof. Johnson,prof.johnson@ncit.edu.np,9876543211,Associate Professor,TU
Ms. Davis,ms.davis@ncit.edu.np,9876543212,Lecturer,KMC`,
        commonErrors: [
          "Missing required fields (fullname, email, phoneNumber)",
          "Using invalid email formats",
          "Including special characters in phone numbers",
          "Using numbers or special characters in full names"
        ]
      },
      4334: {
        title: "Evaluator CSV Format Guide",
        description: "Follow this guide to create a properly formatted CSV file for evaluator bulk creation.",
        requiredFields: [
          {
            name: "fullname",
            description: "Evaluator's full name",
            format: "Letters and spaces only, 2-50 characters",
            example: "Dr. John Brown",
            required: true
          },
          {
            name: "email",
            description: "Evaluator's email address",
            format: "Valid email format (will be used for login)",
            example: "dr.brown@ncit.edu.np",
            required: true
          },
          {
            name: "phoneNumber",
            description: "Evaluator's phone number",
            format: "10-15 digits only, no spaces or special characters",
            example: "9876543210",
            required: true
          }
        ],
        optionalFields: [
          {
            name: "designation",
            description: "Job title or designation",
            format: "Any text, 1-100 characters",
            example: "Professor",
            required: false
          },
          {
            name: "institution",
            description: "Institution name",
            format: "Any text, 1-100 characters",
            example: "NCIT",
            required: false
          },
          {
            name: "evaluatorType",
            description: "Type of evaluator",
            format: "Must be either 'internal' or 'external'",
            example: "internal",
            required: false,
            validValues: [
              { value: "internal", description: "Internal evaluator from the institution" },
              { value: "external", description: "External evaluator from outside" }
            ]
          },
          {
            name: "contact",
            description: "Additional contact information",
            format: "Any text, 1-200 characters",
            example: "Department of Computer Engineering",
            required: false
          },
          {
            name: "photo",
            description: "Evaluator's photo URL",
            format: "Valid URL to image file",
            example: "https://example.com/photo.jpg",
            required: false
          }
        ],
        csvExample: `fullname,email,phoneNumber,designation,institution,evaluatorType,contact
Dr. Brown,dr.brown@ncit.edu.np,9876543210,Professor,NCIT,internal,Department of Computer Engineering
Prof. Wilson,prof.wilson@tu.edu.np,9876543211,Professor,TU,external,External evaluator contact info
Dr. Lee,dr.lee@kmc.edu.np,9876543212,Associate Professor,KMC,internal,Internal evaluation team`,
        commonErrors: [
          "Using invalid evaluatorType (must be 'internal' or 'external')",
          "Missing required fields (fullname, email, phoneNumber)",
          "Using invalid email formats",
          "Including special characters in phone numbers",
          "Using numbers or special characters in full names"
        ]
      },
      5150: {
        title: "Admin CSV Format Guide",
        description: "Follow this guide to create a properly formatted CSV file for admin bulk creation.",
        requiredFields: [
          {
            name: "fullname",
            description: "Admin's full name",
            format: "Letters and spaces only, 2-50 characters",
            example: "Admin User",
            required: true
          },
          {
            name: "email",
            description: "Admin's email address",
            format: "Valid email format (will be used for login)",
            example: "admin@ncit.edu.np",
            required: true
          },
          {
            name: "phoneNumber",
            description: "Admin's phone number",
            format: "10-15 digits only, no spaces or special characters",
            example: "9876543210",
            required: true
          }
        ],
        optionalFields: [
          {
            name: "photo",
            description: "Admin's photo URL",
            format: "Valid URL to image file",
            example: "https://example.com/photo.jpg",
            required: false
          }
        ],
        csvExample: `fullname,email,phoneNumber
Admin User,admin@ncit.edu.np,9876543210
System Admin,system@ncit.edu.np,9876543211
Super Admin,superadmin@ncit.edu.np,9876543212`,
        commonErrors: [
          "Missing required fields (fullname, email, phoneNumber)",
          "Using invalid email formats",
          "Including special characters in phone numbers",
          "Using numbers or special characters in full names"
        ]
      }
    };
    return guides[numericUserType] || {};
  };

  const guide = getFormattingGuide();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "CSV example copied to clipboard",
    });
  };

  const downloadExample = () => {
    const blob = new Blob([guide.csvExample], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${userTypeName.toLowerCase()}_example.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!guide.title) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {guide.title}
          </DialogTitle>
          <DialogDescription>
            {guide.description}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="fields" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Fields
            </TabsTrigger>
            <TabsTrigger value="example" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Example
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Common Errors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Quick Start Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Before you start:</strong> Make sure you have all the required information for each user. 
                    The system will validate your data before creating users, so it's important to follow the format exactly.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-700 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Required Fields ({guide.requiredFields.length})
                    </h4>
                    <ul className="text-sm space-y-1">
                      {guide.requiredFields.map((field, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                          <span className="font-mono">{field.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Optional Fields ({guide.optionalFields.length})
                    </h4>
                    <ul className="text-sm space-y-1">
                      {guide.optionalFields.map((field, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Optional</Badge>
                          <span className="font-mono">{field.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> All users will receive temporary passwords via email. 
                    Make sure email addresses are valid and accessible.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Required Fields
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {guide.requiredFields.map((field, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">Required</Badge>
                          <code className="font-mono font-semibold">{field.name}</code>
                        </div>
                        <p className="text-sm text-muted-foreground">{field.description}</p>
                        <div className="text-sm">
                          <strong>Format:</strong> {field.format}
                        </div>
                        <div className="text-sm">
                          <strong>Example:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{field.example}</code>
                        </div>
                        {field.validValues && (
                          <div className="text-sm">
                            <strong>Valid Values:</strong>
                            <ul className="mt-1 space-y-1">
                              {field.validValues.map((value, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <code className="bg-blue-100 px-2 py-1 rounded text-xs">{value.code || value.value}</code>
                                  <span className="text-xs text-muted-foreground">{value.name || value.description}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {guide.optionalFields.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-700 flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Optional Fields
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {guide.optionalFields.map((field, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Optional</Badge>
                            <code className="font-mono font-semibold">{field.name}</code>
                          </div>
                          <p className="text-sm text-muted-foreground">{field.description}</p>
                          <div className="text-sm">
                            <strong>Format:</strong> {field.format}
                          </div>
                          <div className="text-sm">
                            <strong>Example:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{field.example}</code>
                          </div>
                          {field.validValues && (
                            <div className="text-sm">
                              <strong>Valid Values:</strong>
                              <ul className="mt-1 space-y-1">
                                {field.validValues.map((value, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">{value.value}</code>
                                    <span className="text-xs text-muted-foreground">{value.description}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="example" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  CSV Example
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Copy this example and replace the sample data with your actual user information. 
                    Make sure to keep the header row exactly as shown.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">CSV Format Example</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(guide.csvExample)}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadExample}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-64 w-full border rounded-md">
                    <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                      {guide.csvExample}
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Common Errors to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>These errors will prevent user creation:</strong>
                    </AlertDescription>
                  </Alert>

                  <ul className="space-y-3">
                    {guide.commonErrors.map((error, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                      </li>
                    ))}
                  </ul>

                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Pro Tip:</strong> Use the validation feature in the bulk creation modal to check your data before creating users. 
                      This will help you identify and fix errors early.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onClose}>
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVFormattingGuide;
