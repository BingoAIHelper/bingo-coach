"use client";

import { Button } from "@/components/ui/button";

interface AssessmentResponse {
  seeker: string;
  assessment: string;
  completedAt: string;
  score: string;
}

export default function AssessmentResponses() {
  const responses: AssessmentResponse[] = [
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
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Assessment Responses</h2>
          <p className="text-muted-foreground">View and manage seeker assessment responses</p>
        </div>
      </div>

      <div className="space-y-4">
        {responses.map((response, index) => (
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
    </div>
  );
}