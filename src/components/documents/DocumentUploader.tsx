'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DocumentUploaderProps {
  onUploadComplete: () => void;
}

export default function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type (PDF, DOCX, etc.)
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload a PDF, DOCX, JPEG, or PNG file.');
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        return;
      }
      
      setFile(selectedFile);
      // Auto-populate title with filename (without extension)
      const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
      setTitle(fileName);
      setError('');
    }
  };

  const clearFile = () => {
    setFile(null);
    setTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title.trim()) {
      setError('Please provide both a title and a file.');
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }
      
      // Reset form
      clearFile();
      setError('');
      
      // Notify parent component
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Document Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter document title"
          disabled={uploading}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="file">Document File</Label>
        {!file ? (
          <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50"
               onClick={() => fileInputRef.current?.click()}>
            <input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.docx,.jpeg,.jpg,.png"
              disabled={uploading}
              required
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500">PDF, DOCX, JPEG, or PNG (max 10MB)</p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-500" />
              <div className="text-sm truncate max-w-[180px]">{file.name}</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="p-1 text-gray-500 hover:text-red-500"
              onClick={clearFile}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
      
      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-gray-500 text-center">{uploadProgress}% uploaded</p>
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full"
        disabled={!file || !title || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </Button>
    </form>
  );
}