"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, FileText, Upload } from "lucide-react";
import { toast } from "sonner";

interface AssessmentTemplate {
  id: string;
  title: string;
  description: string;
  type: "skills" | "personal";
  questions: {
    id: string;
    type: "multiple_choice" | "text" | "checkbox";
    question: string;
    options?: string[];
  }[];
}

interface AssessmentResource {
  id: string;
  title: string;
  type: string;
  uploadedAt: string;
  size: string;
}

export default function CoachAssessmentManager() {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([
    {
      id: "1",
      title: "Frontend Development Skills",
      description: "Assess frontend development knowledge and skills",
      type: "skills",
      questions: [
        {
          id: "q1",
          type: "multiple_choice",
          question: "What is your experience level with React?",
          options: ["Beginner", "Intermediate", "Advanced", "Expert"]
        }
      ]
    }
  ]);

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
          <h2 className="text-2xl font-bold">Assessment Management</h2>
          <p className="text-muted-foreground">Create and manage assessments and resources</p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList className="w-full border-b">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{template.title}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Type:</span>
                        <span className="text-sm text-muted-foreground capitalize">{template.type}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Questions: </span>
                        <span className="text-sm text-muted-foreground">{template.questions.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="space-y-4">
            <div className="flex justify-end">
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
        </TabsContent>

        <TabsContent value="responses">
          <div className="space-y-4">
            {[
              {
                seeker: "Alex Johnson",
                assessment: "Frontend Development Skills",
                completedAt: "2025-03-17",
                score: "85%"
              },
              {
                seeker: "Sarah Chen",
                assessment: "Personal Assessment",
                completedAt: "2025-03-16",
                score: "Completed"
              }
            ].map((response, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
                <div>
                  <h4 className="font-medium">{response.seeker}</h4>
                  <p className="text-sm text-muted-foreground">
                    {response.assessment} • Completed {response.completedAt}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{response.score}</span>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}