'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  analyzeStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentsListProps {
  documents: Document[];
  loading: boolean;
  onSelect: (document: Document) => void;
  onDelete: (documentId: string) => void;
  renderStatusBadge: (status: string) => React.ReactNode;
  selectedDocumentId?: string;
}

export default function DocumentsList({
  documents,
  loading,
  onSelect,
  onDelete,
  renderStatusBadge,
  selectedDocumentId
}: DocumentsListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
        <p>No documents found</p>
        <p className="text-sm">Upload a document to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {documents.map((document) => (
        <div
          key={document.id}
          className={cn(
            "p-3 border rounded-md cursor-pointer transition-colors",
            selectedDocumentId === document.id
              ? "bg-primary/10 border-primary/30"
              : "hover:bg-gray-50"
          )}
          onClick={() => onSelect(document)}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-2">
              <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none truncate max-w-[160px]">
                  {document.title}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                  {document.fileName}
                </p>
                <div className="flex items-center space-x-2">
                  {renderStatusBadge(document.analyzeStatus)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}