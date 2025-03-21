"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CoachOnboarding } from "@/components/onboarding/CoachOnboarding";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function CoachOnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated or not a coach
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.role !== "coach") {
      router.push("/");
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1 p-8">
          <CoachOnboarding />
        </div>
      </div>
    </MainLayout>
  );
} 