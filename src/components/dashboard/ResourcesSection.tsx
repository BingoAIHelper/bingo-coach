"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video, Download, ExternalLink } from "lucide-react";

export default function ResourcesSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Career Development Resources</CardTitle>
          <CardDescription>
            Access curated resources to help you advance in your career
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Learning Paths</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      title: "Frontend Development Fundamentals",
                      duration: "8 hours",
                      level: "Beginner"
                    },
                    {
                      title: "Advanced React Patterns",
                      duration: "6 hours",
                      level: "Advanced"
                    }
                  ].map((path, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{path.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {path.duration} • {path.level}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Start</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Video className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Video Tutorials</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      title: "Interview Success Strategies",
                      duration: "45 mins",
                      type: "Workshop Recording"
                    },
                    {
                      title: "Portfolio Building Guide",
                      duration: "30 mins",
                      type: "Tutorial"
                    }
                  ].map((video, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{video.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {video.duration} • {video.type}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Watch</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Downloadable Templates</CardTitle>
          <CardDescription>
            Professional templates to help you present your best self
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: "Modern Resume Template",
                type: "DOCX",
                size: "245 KB",
                description: "Clean and accessible resume template with ATS-friendly formatting"
              },
              {
                title: "Cover Letter Guide",
                type: "PDF",
                size: "180 KB",
                description: "Template and writing tips for compelling cover letters"
              },
              {
                title: "Portfolio Website Template",
                type: "HTML/CSS",
                size: "1.2 MB",
                description: "Accessible and responsive portfolio template with WCAG compliance"
              }
            ].map((template, index) => (
              <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="rounded bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{template.title}</h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      {template.type} • {template.size}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>External Resources</CardTitle>
          <CardDescription>
            Curated links to valuable career development resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Web Accessibility Guidelines",
                source: "W3C",
                category: "Accessibility"
              },
              {
                title: "Frontend Developer Roadmap",
                source: "roadmap.sh",
                category: "Career Path"
              },
              {
                title: "Tech Interview Handbook",
                source: "GitHub",
                category: "Interview Prep"
              },
              {
                title: "Design Systems Gallery",
                source: "Design Systems",
                category: "UI/UX"
              }
            ].map((resource, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {resource.source} • {resource.category}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}