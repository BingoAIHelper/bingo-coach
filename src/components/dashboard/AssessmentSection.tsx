"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, CheckCircle } from "lucide-react";
import PersonalAssessment from "./PersonalAssessment";

export default function AssessmentSection() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="skills">Skills Assessment</TabsTrigger>
          <TabsTrigger value="personal">Personal Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Technical Skills Assessment</CardTitle>
              <CardDescription>
                Evaluate your technical skills and identify areas for growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Frontend Development Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Test your knowledge of HTML, CSS, JavaScript, and modern frameworks
                    </p>
                  </div>
                  <Button className="ml-auto">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">UI/UX Design Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Evaluate your design skills and understanding of user experience principles
                    </p>
                  </div>
                  <Button className="ml-auto">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Accessibility Knowledge Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Test your understanding of web accessibility standards and best practices
                    </p>
                  </div>
                  <Button className="ml-auto">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Previous Assessments</CardTitle>
              <CardDescription>
                Review your past assessment results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Frontend Development",
                    date: "March 15, 2025",
                    score: "85%",
                    status: "Completed"
                  },
                  {
                    name: "UI/UX Design",
                    date: "March 10, 2025",
                    score: "92%",
                    status: "Completed"
                  }
                ].map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{assessment.name}</h4>
                      <p className="text-sm text-muted-foreground">Taken on {assessment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">{assessment.score}</p>
                      <p className="text-xs text-muted-foreground">{assessment.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <PersonalAssessment />
        </TabsContent>
      </Tabs>
    </div>
  );
}