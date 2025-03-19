'use client';

import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  analyzeStatus: string;
  analyzeResults: string | null;
  analyzeError: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentViewerProps {
  document: Document;
}

export default function DocumentViewer({ document }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState('preview');
  const [parsedResults, setParsedResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Parse analysis results when document changes
  useEffect(() => {
    if (document.analyzeResults && document.analyzeStatus === 'completed') {
      try {
        const results = JSON.parse(document.analyzeResults);
        setParsedResults(results);
        
        // Check if AI analysis is already available
        if (results.aiAnalysis) {
          setAiAnalysis(results.aiAnalysis);
        } else {
          setAiAnalysis(null);
        }
      } catch (error) {
        console.error('Error parsing analysis results:', error);
      }
    } else {
      setParsedResults(null);
      setAiAnalysis(null);
    }
  }, [document]);

  // Function to request AI analysis of the document
  const requestAiAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      
      // Determine document type from file name
      let documentType = 'general';
      if (document.fileName.toLowerCase().includes('resume')) {
        documentType = 'resume';
      } else if (document.fileName.toLowerCase().includes('cover')) {
        documentType = 'cover letter';
      }
      
      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          documentType,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze document with AI');
      }
      
      const data = await response.json();
      
      if (data.error && data.rawResponse) {
        // Try to parse the raw response which contains the JSON string
        try {
          const parsedRawResponse = JSON.parse(data.rawResponse.trim().replace(/^```json\n|\n```$/g, ''));
          setAiAnalysis(parsedRawResponse);
        } catch (parseError) {
          console.error('Error parsing raw response:', parseError);
          throw new Error('Failed to parse AI analysis response');
        }
      } else if (data.aiAnalysis) {
        setAiAnalysis(data.aiAnalysis);
      }
    } catch (error) {
      console.error('Error requesting AI analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to format the file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Determine if the file is viewable in browser
  const isViewableInBrowser = (): boolean => {
    const viewableTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    return viewableTypes.includes(document.fileType);
  };

  // Determine file icon based on type
  const getFileIcon = (): React.ReactNode => {
    // For simplicity using FileText for all types
    return <FileText className="h-8 w-8" />;
  };

  // Render different content based on document status
  const renderContent = () => {
    switch (document.analyzeStatus) {
      case 'pending':
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Badge variant="outline" className="mb-4 bg-yellow-50 text-yellow-700">Pending Analysis</Badge>
            <p className="text-muted-foreground">Document is queued for analysis</p>
          </div>
        );
      
      case 'analyzing':
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Loader className="h-12 w-12 mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing document using AI</p>
            <p className="text-xs text-muted-foreground mt-2">This may take a few minutes</p>
          </div>
        );
      
      case 'failed':
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-12 w-12 mb-4 text-destructive" />
            <p className="text-destructive font-medium">Analysis Failed</p>
            {document.analyzeError && (
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {document.analyzeError}
              </p>
            )}
          </div>
        );
      
      case 'completed':
        return (
          <Tabs defaultValue="preview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="text">Extracted Text</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="min-h-[400px]">
              {isViewableInBrowser() ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button size="sm" asChild variant="outline">
                      <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" /> Download Original
                      </a>
                    </Button>
                  </div>
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(document.fileUrl)}&embedded=true`}
                    className="w-full h-[500px] border rounded-md"
                    title={document.title}
                    frameBorder="0"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  {getFileIcon()}
                  <p className="mt-4 text-muted-foreground">Preview not available for this file type</p>
                  <Button className="mt-4" size="sm" asChild>
                    <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" /> Download File
                    </a>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="text" className="min-h-[400px]">
              {parsedResults?.content ? (
                <Card className="p-4 overflow-auto h-[400px] text-sm whitespace-pre-wrap">
                  {parsedResults.content}
                </Card>
              ) : (
                <div className="flex items-center justify-center h-64 text-center">
                  <p className="text-muted-foreground">No text content extracted</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analysis" className="min-h-[400px]">
              {parsedResults ? (
                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Document Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Document Type:</div>
                      <div>{parsedResults.docType || 'Unknown'}</div>
                      
                      <div className="text-muted-foreground">Pages:</div>
                      <div>{parsedResults.pages?.length || 1}</div>
                      
                      <div className="text-muted-foreground">Language:</div>
                      <div>{parsedResults.languages?.[0]?.locale || 'Unknown'}</div>
                    </div>
                  </Card>
                  
                  {parsedResults.documents && parsedResults.documents.length > 0 && (
                    <Card className="p-4">
                      <h3 className="font-medium mb-2">Extracted Fields</h3>
                      <div className="space-y-2">
                        {Object.entries(parsedResults.documents[0].fields || {}).map(([key, value]: [string, any]) => (
                          <div key={key} className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</div>
                            <div>{value.content || value.value || 'N/A'}</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  
                  {parsedResults.tables && parsedResults.tables.length > 0 && (
                    <Card className="p-4">
                      <h3 className="font-medium mb-2">Detected Tables</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {parsedResults.tables.length} table(s) found in document
                      </p>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab('text')}>
                        View in extracted text
                      </Button>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-center">
                  <p className="text-muted-foreground">No analysis results available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="ai-insights" className="min-h-[400px]">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Loader className="h-12 w-12 mb-4 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing document with AI</p>
                  <p className="text-xs text-muted-foreground mt-2">This may take a moment...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  {/* Show a notification if using fallback analysis */}
                  {aiAnalysis.note && (
                    <div className="rounded-md bg-blue-50 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-blue-700">{aiAnalysis.note}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Resume specific view */}
                  {aiAnalysis.skills && (
                    <>
                      <Card className="p-4">
                        <h3 className="font-medium mb-2">Skills Analysis</h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {aiAnalysis.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="font-medium mb-2">Strengths</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {aiAnalysis.strengths.map((strength: string, index: number) => (
                            <li key={index} className="text-sm">{strength}</li>
                          ))}
                        </ul>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="font-medium mb-2 text-amber-700">Areas for Improvement</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {aiAnalysis.areasForImprovement?.map((area: string, index: number) => (
                            <li key={index} className="text-sm">{area}</li>
                          ))}
                        </ul>
                      </Card>
                      
                      {aiAnalysis.improvementSuggestions && (
                        <Card className="p-4 border-primary/30">
                          <h3 className="font-medium mb-2 text-primary">Detailed Improvement Suggestions</h3>
                          <div className="space-y-3">
                            {Object.entries(aiAnalysis.improvementSuggestions).map(([section, suggestions]: [string, any]) => (
                              <div key={section}>
                                <h4 className="text-sm font-medium capitalize">{section.replace(/([A-Z])/g, ' $1').trim()}</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  {Array.isArray(suggestions) ?
                                    suggestions.map((suggestion: string, i: number) => (
                                      <li key={i} className="text-sm">{suggestion}</li>
                                    )) :
                                    <li className="text-sm">{suggestions}</li>
                                  }
                                </ul>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}
                      
                      {aiAnalysis.suggestedRoles && (
                        <Card className="p-4">
                          <h3 className="font-medium mb-2 text-green-700">Suggested Roles</h3>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {aiAnalysis.suggestedRoles.map((role: string, index: number) => (
                              <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </Card>
                      )}
                    </>
                  )}
                  
                  {/* Cover letter specific view */}
                  {aiAnalysis.overallImpression && (
                    <>
                      <Card className="p-4">
                        <h3 className="font-medium mb-2">Overall Impression</h3>
                        <p className="text-sm">{aiAnalysis.overallImpression}</p>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="font-medium mb-2">Strengths</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {aiAnalysis.strengths.map((strength: string, index: number) => (
                            <li key={index} className="text-sm">{strength}</li>
                          ))}
                        </ul>
                      </Card>
                      
                      <Card className="p-4 border-primary/30">
                        <h3 className="font-medium mb-2 text-primary">Improvement Suggestions</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {aiAnalysis.improvementSuggestions && Object.entries(aiAnalysis.improvementSuggestions).map(([key, value]: [string, any], index: number) => (
                            <li key={index} className="text-sm">
                              <span className="font-medium">{key}: </span>
                              {value}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </>
                  )}
                  
                  {/* General document view - fallback if no specific type detected */}
                  {!aiAnalysis.skills && !aiAnalysis.overallImpression && (
                    <Card className="p-4">
                      <h3 className="font-medium mb-2">AI Analysis</h3>
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(aiAnalysis, null, 2)}
                      </pre>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-muted-foreground mb-4">Get AI-powered improvement suggestions for this document</p>
                  <Button onClick={requestAiAnalysis} className="mb-4">
                    Analyze with AI
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 max-w-md">
                    Note: Analysis uses Azure AI services which have rate limits. If analysis fails, please wait a minute before trying again.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-64 text-center">
            <p className="text-muted-foreground">Status: {document.analyzeStatus}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {getFileIcon()}
          <div>
            <p className="text-sm text-muted-foreground">
              {document.fileName} ({formatFileSize(document.fileSize)})
            </p>
          </div>
        </div>
        
        {/* Remove the download button from the header since it's now in the preview section */}
      </div>
      
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
}