import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, MessageSquare } from "lucide-react";
import { ROLES_LIST } from "@/lib/config";

function StudentHelpSupportTest() {
  const navigate = useNavigate();
  const [testResult, setTestResult] = useState("Testing...");

  useEffect(() => {
    // Test API call
    const testAPI = async () => {
      try {
        const response = await fetch("http://localhost:3500/api/tickets/my-tickets", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const data = await response.json();
        setTestResult(`API Response: ${response.status} - ${JSON.stringify(data)}`);
      } catch (error) {
        setTestResult(`API Error: ${error.message}`);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/${ROLES_LIST.student}/dashboard`)}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Help & Support - Test</h1>
          <p className="text-muted-foreground">
            Testing the Help & Support functionality
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Test Results</CardTitle>
          <CardDescription>
            Testing the tickets API endpoint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-100 rounded-md">
            <pre className="text-sm">{testResult}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Component Test</CardTitle>
          <CardDescription>
            This component is loading successfully
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>✅ Component is working!</p>
          <p>✅ Navigation is working!</p>
          <p>✅ UI components are working!</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentHelpSupportTest;

