"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Briefcase, FileText, Calendar, MessageSquare, Award, User } from "lucide-react";

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
  
  // If user has role and is in the right role-specific dashboard, the middleware will have redirected already
  // This page serves as a fallback for users without a specific role or for system admins
  
  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session?.user?.name || "User"}!
            </p>
          </div>
          
          {/* Role-based navigation */}
          <Card className="bg-muted">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Go to your dashboard</h3>
                  <p className="text-muted-foreground">Visit your role-specific dashboard to access all features.</p>
                </div>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/seeker/dashboard">Seeker Dashboard</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/coach/dashboard">Coach Dashboard</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Basic stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Settings</div>
                <p className="text-xs text-muted-foreground">
                  Manage your account preferences
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Unread messages
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Upcoming</div>
                <p className="text-xs text-muted-foreground">
                  View your scheduled sessions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 