'use client';

import { ResumeBuilder } from './ResumeBuilder';

import { useState, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import DocumentUploader from './DocumentUploader';
import DocumentsList from './DocumentsList';
import DocumentViewer from './DocumentViewer';
import { Card } from '@/components/ui/card';

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

export function DashboardDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<string | undefined>();

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
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle document deletion
  const handleDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete document');
      
      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
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

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const [profile, setProfile] = useState<any>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const profileData = await response.json();
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    fetchProfile();
  }, []);

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
        <ResumeBuilder documents={documents} profile={profile} />
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