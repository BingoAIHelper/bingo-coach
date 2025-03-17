"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Briefcase, FileText, Calendar, MessageSquare, Award, User, GraduationCap, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function SeekerDashboardPage() {
  const { data: session, status } = useSession();
  
  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }
  
  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <MainLayout>
        <div className="container py-10">
          <div className="flex justify-center items-center min-h-[50vh]">
            <p className="text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Note: We don't need to check role here as the middleware will handle that
  // Any unauthorized access will be redirected by middleware before this component renders
  
  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Seeker Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || "User"}! Track your job search journey.
            </p>
          </div>
          
          {/* Profile Completion Banner */}
          <Card className="bg-muted">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Complete Your Profile</h3>
                  <p className="text-muted-foreground">A complete profile increases your chances of finding the right job match.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex-1 md:w-40">
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-right mt-1">65% complete</p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/profile">Complete Profile</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Dashboard Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  2 new in the last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resumes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Last updated 2 weeks ago
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coaching Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Next session in 2 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Job Matches</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">14</div>
                <p className="text-xs text-muted-foreground">
                  5 new matches this week
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Accessibility Reminder */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Accessibility Settings</h3>
                  <p className="text-sm text-muted-foreground">Customize your experience to match your preferences. We've detected you might benefit from text-to-speech features.</p>
                  <Button variant="link" size="sm" className="p-0 h-auto mt-2" asChild>
                    <Link href="/accessibility">Adjust Accessibility Settings</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="jobMatches" className="space-y-4">
            <TabsList>
              <TabsTrigger value="jobMatches">Job Matches</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="resumes">Resumes</TabsTrigger>
              <TabsTrigger value="coaches">My Coaches</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jobMatches" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recommended Jobs</h2>
                <Button asChild>
                  <Link href="/jobs">Browse All Jobs</Link>
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>AI-Matched Job Opportunities</CardTitle>
                  <CardDescription>
                    Based on your skills, experience, and accessibility needs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Accessibility Specialist",
                        company: "Inclusive Tech",
                        location: "Remote",
                        matchScore: 95,
                        accommodations: ["Flexible hours", "Remote work", "Assistive tech provided"]
                      },
                      {
                        title: "Customer Support Representative",
                        company: "ServiceFirst Inc.",
                        location: "Chicago, IL (Hybrid)",
                        matchScore: 88,
                        accommodations: ["Accessible workplace", "Flexible schedule"]
                      },
                      {
                        title: "Content Writer",
                        company: "Digital Media Group",
                        location: "Remote",
                        matchScore: 82,
                        accommodations: ["Work from home", "Flexible deadlines"]
                      },
                    ].map((job, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{job.title}</h3>
                            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                              {job.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {job.accommodations.map((item, i) => (
                              <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col gap-2 justify-end">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button size="sm">Apply Now</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="applications" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Applications</h2>
                <Button variant="outline" asChild>
                  <Link href="/applications">View All</Link>
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>
                    Track the progress of your job applications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "UX Designer",
                        company: "AccessTech Solutions",
                        date: "2023-07-10",
                        status: "Interview Scheduled",
                        nextStep: "Video interview on July 15, 2023"
                      },
                      {
                        title: "Content Manager",
                        company: "Digital Media Group",
                        date: "2023-07-05",
                        status: "Application Submitted",
                        nextStep: "Waiting for review"
                      },
                      {
                        title: "Customer Support Specialist",
                        company: "TechHelp Inc.",
                        date: "2023-07-01",
                        status: "Under Review",
                        nextStep: "Assessment test to be sent"
                      },
                    ].map((app, index) => (
                      <div key={index} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{app.title}</h3>
                          <p className="text-sm text-muted-foreground">{app.company}</p>
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground">Applied on {app.date}</p>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 text-right">
                          <p className="text-sm font-medium">{app.status}</p>
                          <p className="text-xs text-muted-foreground">Next: {app.nextStep}</p>
                          <Button variant="link" size="sm" className="h-auto p-0 mt-1">View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="resumes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Resumes</h2>
                <Button asChild>
                  <Link href="/resume/new">Create New Resume</Link>
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Resume Management</CardTitle>
                  <CardDescription>
                    Create and manage tailored resumes for different job types.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Accessibility Specialist Resume",
                        lastUpdated: "2023-07-01",
                        score: 85,
                        feedback: "Add more quantifiable achievements"
                      },
                      {
                        title: "General Professional Resume",
                        lastUpdated: "2023-06-15",
                        score: 92,
                        feedback: "Great overall content and structure"
                      },
                    ].map((resume, index) => (
                      <div key={index} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{resume.title}</h3>
                          <p className="text-sm text-muted-foreground">Last updated: {resume.lastUpdated}</p>
                          <p className="text-xs text-muted-foreground mt-1">Feedback: {resume.feedback}</p>
                        </div>
                        <div className="mt-2 md:mt-0 flex flex-col md:flex-row items-end md:items-center gap-2">
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className={`text-sm font-medium ${resume.score >= 90 ? "text-green-600" : "text-amber-600"}`}>
                                Score: {resume.score}/100
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="coaches" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Coaches</h2>
                <Button asChild>
                  <Link href="/coaches">Find Coaches</Link>
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Coaching Support</CardTitle>
                  <CardDescription>
                    Your matched coaches and upcoming sessions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Sarah Johnson",
                        specialty: "Career Transitions",
                        matchScore: 95,
                        nextSession: "July 15, 2023 • 10:00 AM",
                        communication: "Video call with captions"
                      },
                      {
                        name: "Michael Chen",
                        specialty: "Technical Interview Prep",
                        matchScore: 88,
                        nextSession: "July 22, 2023 • 2:00 PM",
                        communication: "Chat-based coaching"
                      },
                    ].map((coach, index) => (
                      <div key={index} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{coach.name}</h3>
                            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                              {coach.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{coach.specialty}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Communication: {coach.communication}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 text-right">
                          <p className="text-sm font-medium">Next Session</p>
                          <p className="text-xs text-muted-foreground">{coach.nextSession}</p>
                          <div className="flex gap-2 mt-2 justify-end">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                            <Button size="sm">Schedule</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="training" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Training Resources</h2>
                <Button variant="outline" asChild>
                  <Link href="/training">View All Training</Link>
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Personalized Learning Path</CardTitle>
                  <CardDescription>
                    Recommended training based on your profile and goals.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Interview Skills for Anxiety Management",
                        type: "Video Course",
                        duration: "45 minutes",
                        progress: 65,
                        accessibility: ["Captions", "Transcript"]
                      },
                      {
                        title: "Resume Writing Masterclass",
                        type: "Interactive Workshop",
                        duration: "1.5 hours",
                        progress: 30,
                        accessibility: ["Screen reader compatible", "Text-based alternatives"]
                      },
                      {
                        title: "Workplace Accommodations: Know Your Rights",
                        type: "Webinar",
                        duration: "60 minutes",
                        progress: 0,
                        accessibility: ["ASL interpretation", "Captions"]
                      },
                    ].map((course, index) => (
                      <div key={index} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{course.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">{course.type} • {course.duration}</p>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {course.accessibility.map((item, i) => (
                              <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3 md:mt-0 flex flex-col items-end justify-center min-w-[120px]">
                          <div className="w-full md:w-24">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Progress</span>
                              <span className="text-xs">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                          <Button variant="link" size="sm" className="mt-2">
                            {course.progress === 0 ? "Start" : "Continue"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
} 