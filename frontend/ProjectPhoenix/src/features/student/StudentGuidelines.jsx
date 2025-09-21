import React from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/lib/config';

function StudentGuidelines() {
  const { toast } = useToast();

  // Dynamic URLs that work in all environments
  const baseUrl = API_BASE_URL.replace('/api', '');
  const pdfUrl = `${baseUrl}/api/guidelines/pdf`;
  const dedicatedViewerUrl = `${baseUrl}/public/pdf-viewer.html`;

  // Fallback URLs for edge cases
  const fallbackPdfUrl = pdfUrl.includes('localhost') 
    ? 'http://localhost:3500/api/guidelines/pdf'
    : 'https://college-project-management-backend-system.vercel.app/api/guidelines/pdf';
  
  const fallbackViewerUrl = dedicatedViewerUrl.includes('localhost')
    ? 'http://localhost:3500/public/pdf-viewer.html'
    : 'https://college-project-management-backend-system.vercel.app/public/pdf-viewer.html';

  // Log URLs for debugging (only in development)
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔗 PDF Guidelines URLs:', {
        environment: import.meta.env.MODE,
        baseUrl,
        pdfUrl,
        dedicatedViewerUrl,
        configuredApiUrl: API_BASE_URL
      });
    }
  }, [baseUrl, pdfUrl, dedicatedViewerUrl]);

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Project_Guidelines.pdf';
    link.target = '_blank';
    
    // Add error handling for download
    link.onerror = () => {
      console.warn('Primary PDF URL failed, trying fallback...');
      link.href = fallbackPdfUrl;
      toast({
        title: "Retrying Download",
        description: "Trying alternative server...",
      });
    };
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openPDFInNewTab = (useFallback = false) => {
    const url = useFallback ? fallbackPdfUrl : pdfUrl;
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site and try again",
        variant: "destructive",
      });
      return;
    }
    
    // Check if the window loaded successfully after a short delay
    setTimeout(() => {
      try {
        if (newWindow.closed) {
          console.log('PDF opened successfully');
        }
      } catch (error) {
        console.warn('Could not verify PDF load, but window was opened');
      }
    }, 1000);
  };

  const openDedicatedViewer = (useFallback = false) => {
    const url = useFallback ? fallbackViewerUrl : dedicatedViewerUrl;
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col rounded-lg border bg-white shadow-sm">
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Project Guidelines
            </CardTitle>
            <div className="flex items-center space-x-2">
              {/* Download */}
              <Button
                variant="outline"
                size="sm"
                onClick={downloadPDF}
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
              </Button>

              {/* Open in New Tab */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => openPDFInNewTab()}
                title="Open in New Tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center overflow-auto bg-gray-50 rounded-lg p-4">
            
            {/* Main PDF Access Interface */}
            <div className="w-full h-full flex flex-col space-y-6">
              
              {/* Info Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Project Guidelines</h3>
                    <p className="text-gray-600">Complete guidelines for your project work</p>
                  </div>
                </div>
                
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => openPDFInNewTab()}
                      className="bg-blue-600 hover:bg-blue-700 h-12"
                      size="lg"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      View in New Tab
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadPDF}
                      className="h-12 border-blue-300 hover:bg-blue-50"
                      size="lg"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openDedicatedViewer()}
                      className="h-12 border-green-300 hover:bg-green-50"
                      size="lg"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Full Screen Viewer
                    </Button>
                  </div>
              </div>
              
              {/* Quick Access Links */}
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Quick Access Options:</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <ExternalLink className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium">View in Browser</p>
                        <p className="text-sm text-gray-600">Opens PDF directly in your browser</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openPDFInNewTab()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Open
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Download className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <p className="font-medium">Download for Offline</p>
                        <p className="text-sm text-gray-600">Save PDF to your device</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadPDF}
                      className="border-green-300 hover:bg-green-50"
                    >
                      Download
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-purple-500 mr-3" />
                      <div>
                        <p className="font-medium">Dedicated Viewer</p>
                        <p className="text-sm text-gray-600">Full-screen PDF viewer with controls</p>
                      </div>
                    </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDedicatedViewer()}
                        className="border-purple-300 hover:bg-purple-50"
                      >
                        View
                      </Button>
                  </div>
                </div>
              </div>
              
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentGuidelines;
