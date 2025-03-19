"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, FileText, Upload, BookOpen, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AssessmentCreator from "./AssessmentCreator";
import { toast } from "sonner";

type ResourceCategory = "template" | "resource" | "material";

interface Resource {
  id: string;
  title: string;
  type: string;
  category: ResourceCategory;
  created: string;
  shared?: number;
  accessibility?: string[];
}

export default function CoachResources() {
  const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
  const [resources, setResources] = useState<Resource[]>([
    {
      id: "1",
      title: "Frontend Development Assessment",
      type: "Assessment Template",
      category: "template",
      created: "2025-03-17"
    },
    {
      id: "2",
      title: "Web Accessibility Guidelines",
      type: "PDF",
      category: "resource",
      created: "2025-03-17"
    },
    {
      id: "3",
      title: "Interview Preparation Guide",
      type: "Guide",
      category: "material",
      created: "2025-03-15",
      shared: 18,
      accessibility: ["Text-to-speech compatible", "Audio version available"]
    }
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newResource: Resource = {
        id: Date.now().toString(),
        title: file.name,
        type: file.type.split("/")[1].toUpperCase(),
        category: "resource",
        created: new Date().toISOString().split("T")[0]
      };

      setResources(prev => [...prev, newResource]);
      toast.success("Resource uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload resource");
    }
  };

  const renderResourceCard = (resource: Resource) => (
    <Card key={resource.id} className="overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            {resource.category === "template" ? (
              <FileText className="h-5 w-5 text-primary" />
            ) : resource.category === "material" ? (
              <BookOpen className="h-5 w-5 text-primary" />
            ) : (
              <FileText className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-medium">{resource.title}</h3>
            <p className="text-sm text-muted-foreground">
              {resource.type} • Created {resource.created}
              {resource.shared && ` • Shared with ${resource.shared} seekers`}
            </p>
            {resource.accessibility && (
              <div className="flex flex-wrap gap-1 mt-1">
                {resource.accessibility.map((item, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Coaching Resources</h2>
          <p className="text-muted-foreground">Manage your assessment templates, resources, and materials</p>
        </div>
        <div className="flex gap-2">
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
          <Button onClick={() => setIsCreatingAssessment(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assessment
          </Button>
        </div>
      </div>

      <Dialog open={isCreatingAssessment} onOpenChange={setIsCreatingAssessment}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Assessment</DialogTitle>
          </DialogHeader>
          <AssessmentCreator />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Templates</CardTitle>
          <CardDescription>
            Manage your assessment templates for evaluating job seekers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources
              .filter(resource => resource.category === "template")
              .map(renderResourceCard)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning Resources</CardTitle>
          <CardDescription>
            Educational materials and guides for job seekers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources
              .filter(resource => resource.category === "resource")
              .map(renderResourceCard)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coaching Materials</CardTitle>
          <CardDescription>
            Supporting materials for your coaching sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources
              .filter(resource => resource.category === "material")
              .map(renderResourceCard)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}