"use client";

import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  Users,
  Calendar,
  MessageSquare,
  Award,
  CheckCircle,
  Bell,
  Brain,
  ClipboardList,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import CoachResources from "@/components/dashboard/CoachResources";

export default function CoachDashboardPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }
  
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

  const renderDashboard = () => (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Coach Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "Coach"}! Here's your overview.
          </p>
        </div>
        <Button variant="outline" size="icon" className="rounded-xl">
          <Bell className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Seekers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">3 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assessments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">5 need review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Next in 2 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h4 className="font-medium">Seeker Progress Patterns</h4>
                <p className="text-sm text-muted-foreground">
                  3 seekers showing strong progress in technical interviews. Consider increasing challenge level.
                </p>
              </div>
              <Button size="sm">View Details</Button>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h4 className="font-medium">Assessment Recommendations</h4>
                <p className="text-sm text-muted-foreground">
                  Frontend development assessments have 90% completion rate. Consider adding advanced modules.
                </p>
              </div>
              <Button size="sm">Review</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <CardTitle>Priority Tasks</CardTitle>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                task: "Review Alex's Technical Assessment",
                due: "Today",
                priority: "high",
                type: "Assessment"
              },
              {
                task: "Prepare Interview Feedback for Sarah",
                due: "Tomorrow",
                priority: "medium",
                type: "Feedback"
              },
              {
                task: "Update Frontend Assessment Template",
                due: "This Week",
                priority: "medium",
                type: "Template"
              }
            ].map((task, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{task.task}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === "high" 
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Due: {task.due}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                      {task.type}
                    </span>
                  </div>
                </div>
                <Button size="sm">Start</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Assessment Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle>Recent Assessment Activity</CardTitle>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                seeker: "Alex Johnson",
                assessment: "Frontend Development Skills",
                score: "85%",
                status: "Needs Review",
                completed: "2 hours ago"
              },
              {
                seeker: "Sarah Chen",
                assessment: "React Advanced Concepts",
                score: "92%",
                status: "Reviewed",
                completed: "Yesterday"
              },
              {
                seeker: "Mike Wilson",
                assessment: "Technical Interview Prep",
                score: "In Progress",
                status: "Active",
                completed: "Started 1 hour ago"
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{activity.seeker}</h4>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{activity.assessment}</p>
                  <p className="text-xs text-muted-foreground">{activity.completed}</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">{activity.score}</div>
                  <Button variant="outline" size="sm" className="mt-2">Review</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  return (
    <MainLayout>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar />
        <div className="flex-1 overflow-auto">
          <div className="container max-w-6xl mx-auto p-8">
            {searchParams.get("section") === "resources" && (
              <CoachResources />
            )}
            {!searchParams.get("section") && renderDashboard()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}