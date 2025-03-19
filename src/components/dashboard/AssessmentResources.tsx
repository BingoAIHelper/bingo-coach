"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

interface AssessmentResource {
  id: string;
  title: string;
  type: string;
  uploadedAt: string;
  size: string;
}

export default function AssessmentResources() {
  const [resources, setResources] = useState<AssessmentResource[]>([
    {
      id: "1",
      title: "Web Accessibility Guidelines",
      type: "PDF",
      uploadedAt: "2025-03-17",
      size: "2.4 MB"
    }
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newResource = {
        id: Date.now().toString(),
        title: file.name,
        type: file.type.split("/")[1].toUpperCase(),
        uploadedAt: new Date().toISOString().split("T")[0],
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      };

      setResources(prev => [...prev, newResource]);
      toast.success("Resource uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload resource");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Assessment Resources</h2>
          <p className="text-muted-foreground">Upload and manage assessment resources</p>
        </div>
        <Input
          type="file"
          className="hidden"
          id="resource-upload"
          onChange={handleFileUpload}
        />
        <Button variant="outline" asChild>
          <label htmlFor="resource-upload" className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Upload Resource
          </label>
        </Button>
      </div>

      <div className="grid gap-4">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {resource.type} • {resource.size} • Uploaded {resource.uploadedAt}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Download</Button>
                <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}