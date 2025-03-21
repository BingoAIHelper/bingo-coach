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
  AlertCircle,
  Loader2,
  Plus
} from "lucide-react";
import CoachResources from "@/components/dashboard/CoachResources";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AddSeekerForm from "@/components/dashboard/AddSeekerForm";

interface AIInsight {
  title: string;
  description: string;
  action: string;
}

interface AIInsights {
  progressPatterns: AIInsight[];
  assessmentRecommendations: AIInsight[];
}

export default function CoachDashboardPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/coach/insights');
        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }
        const data = await response.json();
        setInsights(data);
      } catch (error) {
        console.error('Error fetching insights:', error);
        toast.error('Failed to load AI insights');
      } finally {
        setIsLoadingInsights(false);
      }
    };

    if (status === "authenticated") {
      fetchInsights();
    }
  }, [status]);

  // Handle authentication redirects
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
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-xl">
            <Bell className="h-5 w-5" />
          </Button>
          <Button 
            variant="default" 
            className="rounded-xl"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("section", "add-seeker");
              window.history.pushState({}, "", url.toString());
              window.location.reload();
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Seeker
          </Button>
        </div>
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
          {isLoadingInsights ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : insights ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Seeker Progress Patterns</h4>
                <div className="space-y-3">
                  {insights.progressPatterns.map((pattern, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-1">
                        <h5 className="font-medium">{pattern.title}</h5>
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      </div>
                      <Button size="sm" variant="outline">{pattern.action}</Button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Assessment Recommendations</h4>
                <div className="space-y-3">
                  {insights.assessmentRecommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-1">
                        <h5 className="font-medium">{recommendation.title}</h5>
                        <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                      </div>
                      <Button size="sm" variant="outline">{recommendation.action}</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No insights available at the moment.
            </div>
          )}
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
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === "high" ? "bg-red-500" :
                    task.priority === "medium" ? "bg-yellow-500" :
                    "bg-green-500"
                  }`} />
                  <div>
                    <h4 className="font-medium">{task.task}</h4>
                    <p className="text-sm text-muted-foreground">
                      Due {task.due} • {task.type}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
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
            {searchParams.get("section") === "add-seeker" && (
              <AddSeekerForm 
                onSuccess={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("section");
                  window.history.pushState({}, "", url.toString());
                  window.location.reload();
                }}
              />
            )}
            {!searchParams.get("section") && renderDashboard()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}