"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Briefcase, FileText, Calendar, MessageSquare, Award } from "lucide-react";

export default function DashboardPage() {
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
  
  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || "User"}! Manage your job search journey.
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  3 new in the last month
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
                <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
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
                <div className="text-2xl font-bold">28</div>
                <p className="text-xs text-muted-foreground">
                  8 new matches this week
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="applications" className="space-y-4">
            <TabsList>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="resumes">Resumes</TabsTrigger>
              <TabsTrigger value="coaches">Coaches</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            <TabsContent value="applications" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent Applications</h2>
                <Button asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Job Applications</CardTitle>
                  <CardDescription>
                    Track the status of your recent job applications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Software Developer",
                        company: "TechCorp Inc.",
                        date: "2023-06-15",
                        status: "Interview Scheduled",
                      },
                      {
                        title: "UX Designer",
                        company: "Design Solutions",
                        date: "2023-06-10",
                        status: "Application Submitted",
                      },
                      {
                        title: "Project Manager",
                        company: "Global Innovations",
                        date: "2023-06-05",
                        status: "Under Review",
                      },
                    ].map((job, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{job.status}</p>
                          <p className="text-xs text-muted-foreground">Applied on {job.date}</p>
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
                  <Link href="/resumes/new">Create New Resume</Link>
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Resume Management</CardTitle>
                  <CardDescription>
                    Create and manage your resumes for different job types.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Technical Resume",
                        lastUpdated: "2023-06-01",
                        score: 85,
                      },
                      {
                        title: "Creative Portfolio",
                        lastUpdated: "2023-05-15",
                        score: 92,
                      },
                    ].map((resume, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{resume.title}</h3>
                          <p className="text-sm text-muted-foreground">Last updated: {resume.lastUpdated}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">Score: {resume.score}/100</p>
                          </div>
                          <Button variant="outline" size="sm">Edit</Button>
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
                  <CardTitle>Coaching Sessions</CardTitle>
                  <CardDescription>
                    Connect with your job coaches and schedule sessions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Sarah Johnson",
                        specialty: "Career Transitions",
                        nextSession: "2023-06-20 10:00 AM",
                      },
                      {
                        name: "Michael Chen",
                        specialty: "Technical Interviews",
                        nextSession: "2023-06-25 2:00 PM",
                      },
                    ].map((coach, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{coach.name}</h3>
                          <p className="text-sm text-muted-foreground">{coach.specialty}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">Next Session</p>
                            <p className="text-xs text-muted-foreground">{coach.nextSession}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="messages" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Messages</h2>
                <Button variant="outline">Mark All as Read</Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Messages</CardTitle>
                  <CardDescription>
                    Stay in touch with your coaches and potential employers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        sender: "Sarah Johnson",
                        message: "Looking forward to our coaching session tomorrow!",
                        time: "2 hours ago",
                        unread: true,
                      },
                      {
                        sender: "TechCorp Recruiting",
                        message: "We've reviewed your application and would like to schedule an interview.",
                        time: "1 day ago",
                        unread: false,
                      },
                      {
                        sender: "Michael Chen",
                        message: "Here are some resources to prepare for your technical interview.",
                        time: "3 days ago",
                        unread: false,
                      },
                    ].map((message, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start justify-between p-4 border rounded-lg ${
                          message.unread ? "bg-muted/50 border-primary" : ""
                        }`}
                      >
                        <div>
                          <h3 className="font-medium flex items-center">
                            {message.sender}
                            {message.unread && (
                              <span className="ml-2 h-2 w-2 rounded-full bg-primary"></span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">{message.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{message.time}</p>
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