'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react';
import DocumentUploader from '@/components/documents/DocumentUploader';
import DocumentsList from '@/components/documents/DocumentsList';
import DocumentViewer from '@/components/documents/DocumentViewer';

export default function DocumentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch documents
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDocuments();
    }
  }, [status]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      const data = await response.json();
      
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async () => {
    await fetchDocuments();
  };

  const handleDocumentSelect = (document: any) => {
    setSelectedDocument(document);
  };

  const handleDocumentDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove the document from the state
        setDocuments(documents.filter(doc => doc.id !== documentId));
        
        // Clear selected document if it was the one deleted
        if (selectedDocument && selectedDocument.id === documentId) {
          setSelectedDocument(null);
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const filterDocumentsByStatus = (status: string) => {
    if (status === 'all') {
      return documents;
    }
    return documents.filter(doc => doc.analyzeStatus === status);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'analyzing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700"><Loader className="w-3 h-3 mr-1 animate-spin" /> Analyzing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // If loading or not authenticated yet
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Documents</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Upload and document list */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" /> 
                Upload Document
              </CardTitle>
              <CardDescription>
                Upload documents to analyze with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUploader onUploadComplete={handleDocumentUpload} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" /> 
                Your Documents
              </CardTitle>
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="analyzing">Analyzing</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <DocumentsList 
                documents={filterDocumentsByStatus(activeTab)}
                loading={loading}
                onSelect={handleDocumentSelect}
                onDelete={handleDocumentDelete}
                renderStatusBadge={renderStatusBadge}
                selectedDocumentId={selectedDocument?.id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right content area - Document viewer */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {selectedDocument ? (
                  <div className="flex justify-between items-center">
                    <span>{selectedDocument.title}</span>
                    {renderStatusBadge(selectedDocument.analyzeStatus)}
                  </div>
                ) : 'Document Viewer'}
              </CardTitle>
              {selectedDocument && (
                <CardDescription>
                  Uploaded on {new Date(selectedDocument.createdAt).toLocaleString()}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {selectedDocument ? (
                <DocumentViewer document={selectedDocument} />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground">
                  <FileText className="w-16 h-16 mb-4 opacity-20" />
                  <p>Select a document to view its analysis results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}