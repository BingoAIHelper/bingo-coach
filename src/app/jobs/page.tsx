"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, Building, Clock, MapPin, Filter, Search } from "lucide-react";

// Mock job data
const mockJobs = [
  {
    id: "job-1",
    title: "Software Developer",
    company: "TechCorp Inc.",
    location: "Remote",
    type: "Full-time",
    salary: "$80,000 - $120,000",
    postedDate: "2023-06-15",
    description: "We're looking for a software developer with experience in React, Node.js, and TypeScript. This role is fully remote and offers flexible hours.",
    requirements: ["3+ years of experience with React", "Experience with Node.js", "TypeScript knowledge", "Good communication skills"],
    accessibility: ["Remote work", "Flexible hours", "Screen reader compatible", "Assistive technology support"],
    inclusivity: ["Disability-friendly", "Inclusive hiring practices", "Accommodations available"],
  },
  {
    id: "job-2",
    title: "UX Designer",
    company: "Design Solutions",
    location: "Hybrid",
    type: "Full-time",
    salary: "$70,000 - $100,000",
    postedDate: "2023-06-10",
    description: "Join our team as a UX Designer to create accessible and intuitive user experiences. This role offers hybrid work options with 2 days in office per week.",
    requirements: ["3+ years of UX design experience", "Portfolio showcasing accessible design", "User research experience", "Figma proficiency"],
    accessibility: ["Hybrid work", "Flexible hours", "Accessible office", "Assistive technology support"],
    inclusivity: ["Disability-friendly", "Inclusive hiring practices", "Accommodations available"],
  },
  {
    id: "job-3",
    title: "Customer Support Specialist",
    company: "Global Services",
    location: "On-site",
    type: "Part-time",
    salary: "$25 - $30 per hour",
    postedDate: "2023-06-05",
    description: "We're seeking a part-time customer support specialist to assist our clients. This role requires excellent communication skills and problem-solving abilities.",
    requirements: ["Customer service experience", "Good communication skills", "Problem-solving abilities", "Basic computer skills"],
    accessibility: ["Accessible office", "Flexible schedule", "Assistive technology support"],
    inclusivity: ["Disability-friendly", "Inclusive hiring practices", "Accommodations available"],
  },
  {
    id: "job-4",
    title: "Data Analyst",
    company: "Data Insights",
    location: "Remote",
    type: "Contract",
    salary: "$50 - $60 per hour",
    postedDate: "2023-06-01",
    description: "Work as a data analyst on a 6-month contract with possibility of extension. Analyze data and create reports to help drive business decisions.",
    requirements: ["SQL experience", "Data visualization skills", "Statistical analysis", "Report writing"],
    accessibility: ["Remote work", "Flexible hours", "Screen reader compatible"],
    inclusivity: ["Disability-friendly", "Inclusive hiring practices", "Accommodations available"],
  },
  {
    id: "job-5",
    title: "Administrative Assistant",
    company: "Business Solutions",
    location: "Hybrid",
    type: "Full-time",
    salary: "$45,000 - $55,000",
    postedDate: "2023-05-28",
    description: "Support our executive team with administrative tasks, scheduling, and correspondence. This role offers hybrid work options with flexible hours.",
    requirements: ["Administrative experience", "Organizational skills", "Communication skills", "Microsoft Office proficiency"],
    accessibility: ["Hybrid work", "Flexible hours", "Accessible office", "Assistive technology support"],
    inclusivity: ["Disability-friendly", "Inclusive hiring practices", "Accommodations available"],
  },
];

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    accessibility: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter jobs based on search term and filters
  const filteredJobs = mockJobs.filter((job) => {
    // Search term filter
    const searchMatch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Location filter
    const locationMatch = !filters.location || job.location === filters.location;
    
    // Job type filter
    const typeMatch = !filters.type || job.type === filters.type;
    
    // Accessibility features filter
    const accessibilityMatch = 
      filters.accessibility.length === 0 || 
      filters.accessibility.some(feature => 
        job.accessibility.some(jobFeature => 
          jobFeature.toLowerCase().includes(feature.toLowerCase())
        )
      );
    
    return searchMatch && locationMatch && typeMatch && accessibilityMatch;
  });
  
  const handleAccessibilityFilterChange = (feature: string) => {
    setFilters(prev => {
      const currentFeatures = [...prev.accessibility];
      
      if (currentFeatures.includes(feature)) {
        return {
          ...prev,
          accessibility: currentFeatures.filter(f => f !== feature),
        };
      } else {
        return {
          ...prev,
          accessibility: [...currentFeatures, feature],
        };
      }
    });
  };
  
  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
            <p className="text-muted-foreground mt-2">
              Find accessible job opportunities matched to your skills and preferences.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, company, or keywords..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
          
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle>Filter Jobs</CardTitle>
                <CardDescription>
                  Narrow down job listings based on your preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select 
                      value={filters.location} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Locations</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="On-site">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Job Type</Label>
                    <Select 
                      value={filters.type} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Accessibility Features</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {["Remote work", "Flexible hours", "Accessible office", "Assistive technology"].map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`feature-${feature}`} 
                            checked={filters.accessibility.includes(feature)}
                            onCheckedChange={() => handleAccessibilityFilterChange(feature)}
                          />
                          <Label htmlFor={`feature-${feature}`}>{feature}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ location: "", type: "", accessibility: [] })}
                >
                  Reset Filters
                </Button>
                <Button onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </CardFooter>
            </Card>
          )}
          
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <Building className="h-4 w-4 mr-1" />
                          {job.company}
                        </CardDescription>
                      </div>
                      <Button variant="outline" asChild>
                        <a href={`/jobs/${job.id}`}>View Details</a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.type}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        Posted {new Date(job.postedDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <p className="text-sm mb-4">{job.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Accessibility Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.accessibility.map((feature, index) => (
                          <span key={index} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 flex justify-between">
                    <div>
                      <p className="text-sm font-medium">Salary Range:</p>
                      <p className="text-sm">{job.salary}</p>
                    </div>
                    <Button>Apply Now</Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No jobs found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search or filters to find more opportunities.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 