"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Building2, CheckCircle, Filter } from "lucide-react";

export default function JobsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="search"
              placeholder="Search jobs..."
              className="w-[300px] px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Save Search</Button>
          <Button>Create Alert</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Jobs</CardTitle>
          <CardDescription>
            Personalized job matches based on your skills and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: "Senior Frontend Developer",
                company: "TechCorp Solutions",
                location: "Remote",
                salary: "$120k - $150k",
                type: "Full-time",
                posted: "2 days ago",
                matchScore: 95,
                tags: ["React", "TypeScript", "Accessibility"]
              },
              {
                title: "UI/UX Developer",
                company: "Design Studio Inc.",
                location: "New York, NY (Hybrid)",
                salary: "$100k - $130k",
                type: "Full-time",
                posted: "1 day ago",
                matchScore: 92,
                tags: ["UI/UX", "Design Systems", "Frontend"]
              },
              {
                title: "Frontend Engineer",
                company: "Accessibility First",
                location: "Remote",
                salary: "$110k - $140k",
                type: "Full-time",
                posted: "3 days ago",
                matchScore: 88,
                tags: ["JavaScript", "WCAG", "React"]
              }
            ].map((job, index) => (
              <div key={index} className="p-4 border rounded-lg hover:border-primary/20 hover:bg-primary/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">{job.title}</h3>
                      <div className={`px-2 py-1 rounded-full text-sm font-medium
                        ${job.matchScore >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {job.matchScore}% Match
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.type}
                      </div>
                    </div>

                    <p className="text-sm font-medium text-primary mb-3">{job.salary}</p>

                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">Posted {job.posted}</p>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <Button size="sm" className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}