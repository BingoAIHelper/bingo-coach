"use client";

import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Video, FileText, Download, ExternalLink } from "lucide-react";

// Mock resource data
const mockResources = {
  articles: [
    {
      id: "article-1",
      title: "Understanding Workplace Accommodations",
      description: "A comprehensive guide to requesting and implementing workplace accommodations for various disabilities.",
      category: "Workplace",
      readTime: "10 min read",
      date: "2023-05-15",
      link: "/resources/articles/workplace-accommodations",
    },
    {
      id: "article-2",
      title: "Resume Building for Neurodivergent Job Seekers",
      description: "Tips and strategies for highlighting your strengths and addressing employment gaps in your resume.",
      category: "Resume",
      readTime: "8 min read",
      date: "2023-06-02",
      link: "/resources/articles/neurodivergent-resume-tips",
    },
    {
      id: "article-3",
      title: "Navigating Job Interviews with Anxiety",
      description: "Practical strategies for managing anxiety before and during job interviews.",
      category: "Interviews",
      readTime: "12 min read",
      date: "2023-06-10",
      link: "/resources/articles/interview-anxiety",
    },
    {
      id: "article-4",
      title: "Disclosing Your Disability: When and How",
      description: "Guidance on when and how to disclose your disability during the job application process.",
      category: "Workplace",
      readTime: "15 min read",
      date: "2023-05-28",
      link: "/resources/articles/disability-disclosure",
    },
  ],
  videos: [
    {
      id: "video-1",
      title: "Interview Preparation Workshop",
      description: "A workshop covering common interview questions and how to prepare effective responses.",
      category: "Interviews",
      duration: "45 minutes",
      date: "2023-06-05",
      thumbnail: "/thumbnails/interview-workshop.jpg",
      link: "/resources/videos/interview-workshop",
    },
    {
      id: "video-2",
      title: "Assistive Technology in the Workplace",
      description: "An overview of various assistive technologies and how they can be implemented in different work environments.",
      category: "Technology",
      duration: "30 minutes",
      date: "2023-05-20",
      thumbnail: "/thumbnails/assistive-tech.jpg",
      link: "/resources/videos/assistive-technology",
    },
    {
      id: "video-3",
      title: "Self-Advocacy Skills for Job Seekers",
      description: "Learn how to effectively advocate for yourself during the job search and in the workplace.",
      category: "Skills",
      duration: "35 minutes",
      date: "2023-06-12",
      thumbnail: "/thumbnails/self-advocacy.jpg",
      link: "/resources/videos/self-advocacy",
    },
  ],
  templates: [
    {
      id: "template-1",
      title: "Accessible Resume Template",
      description: "A screen reader-friendly resume template with clean formatting and structure.",
      category: "Resume",
      format: "DOCX, PDF",
      date: "2023-05-10",
      link: "/resources/templates/accessible-resume",
    },
    {
      id: "template-2",
      title: "Accommodation Request Letter",
      description: "A template for formally requesting workplace accommodations from your employer.",
      category: "Workplace",
      format: "DOCX, PDF",
      date: "2023-05-18",
      link: "/resources/templates/accommodation-request",
    },
    {
      id: "template-3",
      title: "Job Application Tracker",
      description: "A spreadsheet template to help you track your job applications, interviews, and follow-ups.",
      category: "Organization",
      format: "XLSX, Google Sheets",
      date: "2023-06-01",
      link: "/resources/templates/job-tracker",
    },
    {
      id: "template-4",
      title: "Interview Preparation Worksheet",
      description: "A worksheet to help you prepare for job interviews, including space for common questions and your responses.",
      category: "Interviews",
      format: "DOCX, PDF",
      date: "2023-06-08",
      link: "/resources/templates/interview-prep",
    },
  ],
  tools: [
    {
      id: "tool-1",
      title: "Job Description Analyzer",
      description: "A tool that analyzes job descriptions to identify key skills and requirements.",
      category: "Job Search",
      link: "/tools/job-description-analyzer",
    },
    {
      id: "tool-2",
      title: "Accessibility Checker",
      description: "Check your resume and cover letter for accessibility issues.",
      category: "Resume",
      link: "/tools/accessibility-checker",
    },
    {
      id: "tool-3",
      title: "Interview Practice AI",
      description: "Practice interviews with an AI that provides feedback on your responses.",
      category: "Interviews",
      link: "/tools/interview-practice",
    },
    {
      id: "tool-4",
      title: "Workplace Accommodation Finder",
      description: "Find appropriate workplace accommodations based on your specific needs.",
      category: "Workplace",
      link: "/tools/accommodation-finder",
    },
  ],
};

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter resources based on search term
  const filterResources = (resources: any[], term: string) => {
    if (!term) return resources;
    
    return resources.filter(resource => 
      resource.title.toLowerCase().includes(term.toLowerCase()) ||
      resource.description.toLowerCase().includes(term.toLowerCase()) ||
      resource.category.toLowerCase().includes(term.toLowerCase())
    );
  };
  
  const filteredArticles = filterResources(mockResources.articles, searchTerm);
  const filteredVideos = filterResources(mockResources.videos, searchTerm);
  const filteredTemplates = filterResources(mockResources.templates, searchTerm);
  const filteredTools = filterResources(mockResources.tools, searchTerm);
  
  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
            <p className="text-muted-foreground mt-2">
              Educational content and tools to help you in your job search journey.
            </p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources by title, description, or category..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full md:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 gap-8">
                {filteredArticles.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Articles
                      </h2>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/resources/articles">View All</a>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredArticles.slice(0, 2).map((article) => (
                        <Card key={article.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{article.title}</CardTitle>
                                <CardDescription className="mt-1">
                                  {article.category} • {article.readTime}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{article.description}</p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" size="sm" asChild className="w-full">
                              <a href={article.link}>Read Article</a>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {filteredVideos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold flex items-center">
                        <Video className="h-5 w-5 mr-2" />
                        Videos
                      </h2>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/resources/videos">View All</a>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredVideos.slice(0, 2).map((video) => (
                        <Card key={video.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{video.title}</CardTitle>
                                <CardDescription className="mt-1">
                                  {video.category} • {video.duration}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{video.description}</p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" size="sm" asChild className="w-full">
                              <a href={video.link}>Watch Video</a>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {filteredTemplates.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Templates
                      </h2>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/resources/templates">View All</a>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredTemplates.slice(0, 2).map((template) => (
                        <Card key={template.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{template.title}</CardTitle>
                                <CardDescription className="mt-1">
                                  {template.category} • {template.format}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{template.description}</p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" size="sm" asChild className="w-full">
                              <a href={template.link}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Template
                              </a>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {filteredTools.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold">Tools</h2>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/resources/tools">View All</a>
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredTools.slice(0, 2).map((tool) => (
                        <Card key={tool.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{tool.title}</CardTitle>
                                <CardDescription className="mt-1">
                                  {tool.category}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{tool.description}</p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" size="sm" asChild className="w-full">
                              <a href={tool.link}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Use Tool
                              </a>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {filteredArticles.length === 0 && filteredVideos.length === 0 && 
                 filteredTemplates.length === 0 && filteredTools.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No resources found</h3>
                    <p className="text-muted-foreground mt-2">
                      Try adjusting your search to find more resources.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="articles" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <Card key={article.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{article.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {article.category} • {article.readTime}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{article.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <a href={article.link}>Read Article</a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <h3 className="text-lg font-medium">No articles found</h3>
                    <p className="text-muted-foreground mt-2">
                      Try adjusting your search to find more articles.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="videos" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVideos.length > 0 ? (
                  filteredVideos.map((video) => (
                    <Card key={video.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{video.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {video.category} • {video.duration}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{video.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <a href={video.link}>Watch Video</a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <h3 className="text-lg font-medium">No videos found</h3>
                    <p className="text-muted-foreground mt-2">
                      Try adjusting your search to find more videos.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{template.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {template.category} • {template.format}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{template.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <a href={template.link}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Template
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <h3 className="text-lg font-medium">No templates found</h3>
                    <p className="text-muted-foreground mt-2">
                      Try adjusting your search to find more templates.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="tools" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTools.length > 0 ? (
                  filteredTools.map((tool) => (
                    <Card key={tool.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{tool.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {tool.category}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{tool.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <a href={tool.link}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Use Tool
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <h3 className="text-lg font-medium">No tools found</h3>
                    <p className="text-muted-foreground mt-2">
                      Try adjusting your search to find more tools.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
} 