'use client';

import { ResumeBuilder } from './ResumeBuilder';
import { useState, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import DocumentUploader from './DocumentUploader';
import DocumentsList from './DocumentsList';
import DocumentViewer from './DocumentViewer';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

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

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  // Add other profile fields as needed
}

export function DashboardDocuments() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<string | undefined>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch documents on mount
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Handle document deletion
  const handleDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete document');
      
      // Refresh documents list
      fetchDocuments();
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Analyzed
          </Badge>
        );
      case 'analyzing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Analyzing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Pending
          </Badge>
        );
    }
  };

  // Get selected document
  const selectedDoc = documents.find(doc => doc.id === selectedDocument);

  // Fetch documents
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await fetch('/api/users/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const profileData = await response.json();
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Some features may be limited.",
          variant: "destructive"
        });
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [toast]);

  if (loading || profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="space-y-6">
          <DocumentUploader onUploadComplete={fetchDocuments} />
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-3">Your Documents</h3>
            <DocumentsList
              documents={documents}
              loading={loading}
              onSelect={(doc) => setSelectedDocument(doc.id)}
              onDelete={handleDelete}
              renderStatusBadge={renderStatusBadge}
              selectedDocumentId={selectedDocument}
            />
          </div>
        </div>
        {profile && <ResumeBuilder documents={documents} profile={profile} />}
      </div>
      <div>
        {selectedDoc ? (
          <Card className="h-full">
            <DocumentViewer document={selectedDoc} />
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center p-6 text-center">
            <div className="space-y-2">
              <h3 className="font-medium">No Document Selected</h3>
              <p className="text-sm text-muted-foreground">
                Select a document from the list to view its details and analysis
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}