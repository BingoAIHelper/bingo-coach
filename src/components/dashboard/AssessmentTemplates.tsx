"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

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

export default function AssessmentTemplates() {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Assessment Templates</h2>
          <p className="text-muted-foreground">Create and manage assessment templates</p>
        </div>
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
  );
}