"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bell, Briefcase, Award, Calendar, MessageSquare, FileText, CheckCircle } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardDocuments } from "@/components/documents/DashboardDocuments";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Progress } from "@/components/ui/progress";
import { AIRecommendations } from "@/components/AIRecommendations";
import { useEffect } from "react";

// Import section components
import AssessmentSection from "@/components/dashboard/AssessmentSection";
import CoachesSection from "@/components/dashboard/CoachesSection";
import JobsSection from "@/components/dashboard/JobsSection";
import ResourcesSection from "@/components/dashboard/ResourcesSection";

export default function SeekerDashboardPage() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get("section");
  const router = useRouter();

  // Check if assessment is completed
  useEffect(() => {
    const checkAssessmentStatus = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/seekers?userId=${session.user.id}`);
        const data = await response.json();
        
        // If assessment is not completed and we're not already on the assessment section,
        // redirect to the assessment section
        if (!data?.seeker?.assessmentCompleted && currentSection !== "assessment") {
          router.push("/seeker/dashboard?section=assessment");
        }
      } catch (error) {
        console.error("Error checking assessment status:", error);
      }
    };

    if (status === "authenticated") {
      checkAssessmentStatus();
    }
  }, [session, status, currentSection, router]);

  const getSectionTitle = () => {
    switch (currentSection) {
      case "documents":
        return { title: "Documents", description: "Manage your documents and resumes" };
      case "jobs":
        return { title: "Jobs", description: "Find and apply for jobs" };
      case "assessment":
        return { title: "Assessment", description: "Complete your skills assessment" };
      case "coaches":
        return { title: "Coaches", description: "Find and connect with career coaches" };
      case "resources":
        return { title: "Resources", description: "Access career development resources" };
      default:
        return { title: "Dashboard", description: "Track your job search progress" };
    }
  };

  const { title, description } = getSectionTitle();
  
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
  
  const renderDashboardContent = () => {
    return (
      <div className="flex flex-col gap-8">
        {/* Profile Completion Banner */}
        <div className="card-gradient rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="p-6">
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
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="stats-card group">
            <div className="stats-card-header">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-500/10 p-2.5 group-hover:bg-blue-500/20 transition-colors">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-medium">Applications</h3>
              </div>
            </div>
            <div className="stats-card-content">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight">8</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    2 new this week
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">+25%</div>
                  <p className="text-xs text-muted-foreground">vs last week</p>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-card group">
            <div className="stats-card-header">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-500/10 p-2.5 group-hover:bg-purple-500/20 transition-colors">
                  <Award className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-medium">Job Matches</h3>
              </div>
            </div>
            <div className="stats-card-content">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight">14</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    5 new matches
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">+40%</div>
                  <p className="text-xs text-muted-foreground">vs last week</p>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-card group">
            <div className="stats-card-header">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-500/10 p-2.5 group-hover:bg-amber-500/20 transition-colors">
                  <Calendar className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="font-medium">Interviews</h3>
              </div>
            </div>
            <div className="stats-card-content">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight">3</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Next in 2 days
                  </p>
                </div>
                <div className="text-right">
                  <Button variant="ghost" size="sm" className="text-xs">Schedule</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-card group">
            <div className="stats-card-header">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-2.5 group-hover:bg-green-500/20 transition-colors">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="font-medium">Messages</h3>
              </div>
            </div>
            <div className="stats-card-content">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight">5</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    2 unread
                  </p>
                </div>
                <div className="text-right">
                  <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <AIRecommendations />

        {/* Job Matches Section */}
        <div className="card-gradient rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Recommended Jobs</h3>
                  <p className="text-sm text-muted-foreground">Based on your profile and preferences</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                View All Jobs
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                {
                  title: "Senior UX Designer",
                  company: "TechCorp Solutions",
                  location: "Remote",
                  salary: "$120k - $150k",
                  matchScore: 95,
                  tags: ["Remote", "Full-time", "Senior Level"]
                },
                {
                  title: "Product Designer",
                  company: "Design Studio Inc.",
                  location: "New York, NY",
                  salary: "$90k - $120k",
                  matchScore: 88,
                  tags: ["Hybrid", "Full-time", "Healthcare"]
                },
                {
                  title: "UI/UX Designer",
                  company: "Creative Agency",
                  location: "San Francisco, CA",
                  salary: "$100k - $130k",
                  matchScore: 82,
                  tags: ["On-site", "Full-time", "401k"]
                }
              ].map((job, index) => (
                <div key={index} className="group p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:bg-primary/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg">{job.title}</h3>
                        <div className={`px-2 py-1 rounded-full text-sm font-medium
                          ${job.matchScore >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          job.matchScore >= 80 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {job.matchScore}% Match
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{job.company} • {job.location}</p>
                      <p className="text-sm font-medium text-primary mb-3">{job.salary}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[120px] opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button size="sm" className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentSection) {
      case "documents":
        return <DashboardDocuments />;
      case "jobs":
        return <JobsSection />;
      case "assessment":
        return <AssessmentSection />;
      case "coaches":
        return <CoachesSection />;
      case "resources":
        return <ResourcesSection />;
      default:
        return renderDashboardContent();
    }
  };
  
  return (
    <MainLayout>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar />
        <div className="flex-1 overflow-auto">
          <div className="container max-w-6xl mx-auto p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
              </div>
              <div className="flex items-center gap-4">
                {!currentSection && (
                  <div className="relative">
                    <input
                      type="search"
                      placeholder="Search jobs..."
                      className="w-64 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                  </div>
                )}
                <Button variant="outline" size="icon" className="rounded-xl">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}