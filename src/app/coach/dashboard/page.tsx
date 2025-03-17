"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Users, Calendar, MessageSquare, Award, User, BookOpen, CheckCircle, BarChart } from "lucide-react";

export default function CoachDashboardPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">Coach Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || "Coach"}! Manage your coaching activities.
            </p>
          </div>
          
          {/* Dashboard Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Seekers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">
                  3 new this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  Next session in 3 hours
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">84%</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  5 unread messages
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Upcoming Session Alert */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Upcoming Session in 3 Hours</h3>
                  <p className="text-sm text-muted-foreground">Resume review with Alex Johnson (Communication: Video call with captions)</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm">Prepare Session</Button>
                    <Button variant="outline" size="sm">Reschedule</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="seekers" className="space-y-4">
            <TabsList>
              <TabsTrigger value="seekers">My Seekers</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="materials">Coaching Materials</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="seekers" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Job Seekers</h2>
                <Button variant="outline" asChild>
                  <Link href="/coach/seekers">View All</Link>
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Seekers</CardTitle>
                  <CardDescription>
                    Manage your assigned job seekers and their progress.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Alex Johnson",
                        goal: "Career transition to UX design",
                        disabilities: ["Anxiety", "ADHD"],
                        communication: "Video call with captions",
                        nextSession: "Today at 2:00 PM",
                        progress: "Resume Review",
                        priority: "high"
                      },
                      {
                        name: "Jamie Smith",
                        goal: "Find remote technical writing position",
                        disabilities: ["Visual impairment"],
                        communication: "Phone call",
                        nextSession: "July 15, 2023",
                        progress: "Job Search",
                        priority: "medium"
                      },
                      {
                        name: "Taylor Williams",
                        goal: "Prepare for technical interviews",
                        disabilities: ["Hearing impairment"],
                        communication: "Text-based chat",
                        nextSession: "July 18, 2023",
                        progress: "Interview Prep",
                        priority: "medium"
                      },
                    ].map((seeker, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{seeker.name}</h3>
                            {seeker.priority === "high" && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                High Priority
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Goal: {seeker.goal}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <p className="text-xs text-muted-foreground">Accommodations:</p>
                            {seeker.disabilities.map((item, i) => (
                              <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Communication: {seeker.communication}
                          </p>
                        </div>
                        <div className="flex flex-col justify-between min-w-[150px]">
                          <div>
                            <p className="text-sm">Next Session</p>
                            <p className="text-xs text-muted-foreground">{seeker.nextSession}</p>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm">Current Focus</p>
                            <p className="text-xs text-muted-foreground">{seeker.progress}</p>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button size="sm">View Profile</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="schedule" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Schedule</h2>
                <Button asChild>
                  <Link href="/calendar">Open Calendar</Link>
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>
                    Your scheduled coaching sessions for the next 7 days.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        seeker: "Alex Johnson",
                        type: "Resume Review",
                        date: "Today",
                        time: "2:00 PM - 3:00 PM",
                        communication: "Video call with captions",
                        notes: "Review third draft of UX resume"
                      },
                      {
                        seeker: "Morgan Lee",
                        type: "Mock Interview",
                        date: "Tomorrow",
                        time: "10:00 AM - 11:30 AM",
                        communication: "Video call with ASL interpreter",
                        notes: "Behavioral interview practice"
                      },
                      {
                        seeker: "Jamie Smith",
                        type: "Job Search Strategy",
                        date: "July 15, 2023",
                        time: "1:00 PM - 2:00 PM",
                        communication: "Phone call",
                        notes: "Discuss remote work opportunities"
                      },
                    ].map((session, index) => (
                      <div key={index} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{session.seeker}</h3>
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                              {session.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.date} • {session.time}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {session.communication}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Notes: {session.notes}
                          </p>
                        </div>
                        <div className="mt-3 md:mt-0 flex flex-col md:flex-row gap-2 items-end md:items-center">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm">Prepare</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Availability Management</CardTitle>
                  <CardDescription>
                    Your current availability for coaching sessions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-medium">Current Availability</h3>
                      <p className="text-sm text-muted-foreground">You're available for 20 hours per week</p>
                    </div>
                    <Button size="sm">Update Availability</Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { day: "Monday", hours: "9:00 AM - 3:00 PM" },
                      { day: "Tuesday", hours: "10:00 AM - 4:00 PM" },
                      { day: "Wednesday", hours: "9:00 AM - 3:00 PM" },
                      { day: "Thursday", hours: "10:00 AM - 4:00 PM" },
                    ].map((day, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <p className="font-medium text-sm">{day.day}</p>
                        <p className="text-xs text-muted-foreground">{day.hours}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="materials" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Coaching Materials</h2>
                <Button asChild>
                  <Link href="/coach/materials/new">Create New Material</Link>
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Your Resources Library</CardTitle>
                  <CardDescription>
                    Training materials, templates, and guides for your job seekers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Resume Templates for Various Disabilities",
                        type: "Templates",
                        created: "2023-06-15",
                        shared: 12,
                        accessibility: ["Screen reader optimized", "High contrast option"]
                      },
                      {
                        title: "Interview Preparation Guide",
                        type: "Guide",
                        created: "2023-05-20",
                        shared: 18,
                        accessibility: ["Text-to-speech compatible", "Audio version available"]
                      },
                      {
                        title: "Workplace Accommodations Request Templates",
                        type: "Templates",
                        created: "2023-04-10",
                        shared: 8,
                        accessibility: ["Plain language", "Multiple formats"]
                      },
                    ].map((material, index) => (
                      <div key={index} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{material.title}</h3>
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">
                              {material.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">Created: {material.created}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Shared with {material.shared} seekers
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {material.accessibility.map((item, i) => (
                              <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-3 md:mt-0 flex flex-col md:flex-row gap-2 items-end md:items-center">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button size="sm">Share</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Performance Analytics</h2>
                <Button variant="outline" asChild>
                  <Link href="/coach/analytics">Detailed Reports</Link>
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Coaching Impact Metrics</CardTitle>
                  <CardDescription>
                    Track your effectiveness and seeker outcomes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 border rounded-lg text-center">
                      <h3 className="text-sm font-medium text-muted-foreground">Job Placement Rate</h3>
                      <p className="text-3xl font-bold mt-2">76%</p>
                      <p className="text-xs text-muted-foreground mt-1">+4% from last quarter</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <h3 className="text-sm font-medium text-muted-foreground">Average Satisfaction</h3>
                      <p className="text-3xl font-bold mt-2">4.8/5</p>
                      <p className="text-xs text-muted-foreground mt-1">Based on 24 reviews</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <h3 className="text-sm font-medium text-muted-foreground">Avg. Time to Placement</h3>
                      <p className="text-3xl font-bold mt-2">8.2 weeks</p>
                      <p className="text-xs text-muted-foreground mt-1">-0.5 weeks from average</p>
                    </div>
                  </div>
                  
                  <h3 className="font-medium mb-3">Recent Seeker Outcomes</h3>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Chris Taylor",
                        outcome: "Job Offer Accepted",
                        company: "TechAccess Inc.",
                        position: "Frontend Developer",
                        timeToPlace: "6 weeks"
                      },
                      {
                        name: "Jordan Patel",
                        outcome: "Final Interview",
                        company: "Inclusive Design Group",
                        position: "UX Researcher",
                        timeToPlace: "In Progress (5 weeks)"
                      },
                      {
                        name: "Sam Rodriguez",
                        outcome: "Job Offer Accepted",
                        company: "Digital Accessibility Solutions",
                        position: "Content Strategist",
                        timeToPlace: "10 weeks"
                      },
                    ].map((outcome, index) => (
                      <div key={index} className="flex flex-col md:flex-row justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{outcome.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              outcome.outcome === "Job Offer Accepted" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {outcome.outcome}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <p className="text-sm">{outcome.position}</p>
                          <p className="text-xs text-muted-foreground">{outcome.company}</p>
                          <p className="text-xs text-muted-foreground">Time: {outcome.timeToPlace}</p>
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
                    Stay in touch with your job seekers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        sender: "Alex Johnson",
                        message: "I've updated my resume based on your feedback. Could you take a look before our session today?",
                        time: "30 minutes ago",
                        unread: true,
                      },
                      {
                        sender: "Taylor Williams",
                        message: "Thank you for the interview preparation materials. I have some additional questions about behavioral interviews.",
                        time: "2 hours ago",
                        unread: true,
                      },
                      {
                        sender: "Jamie Smith",
                        message: "I found a job posting that matches what we discussed. Could you help me tailor my application?",
                        time: "Yesterday",
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
                        <div className="text-right ml-2 flex-shrink-0">
                          <p className="text-xs text-muted-foreground mb-2">{message.time}</p>
                          <Button variant="outline" size="sm">Reply</Button>
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