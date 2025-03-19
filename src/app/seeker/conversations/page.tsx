"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import ConversationSidebar from "@/components/messaging/ConversationSidebar";
import ConversationView from "@/components/messaging/ConversationView";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MainLayout } from "@/components/MainLayout";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function SeekerConversationsPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  // Redirect if user is not a seeker
  if (session?.user?.role === "coach") {
    redirect("/coach/conversations");
  }

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setSelectedId(id);
    }
  }, [searchParams]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <MainLayout>
        <div className="container py-10">
          <div className="flex justify-center items-center min-h-[50vh]">
            <p className="text-lg">Loading your messages...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar />
        <div className="flex-1 overflow-auto">
          <div className="container max-w-7xl mx-auto p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold">Messages</h1>
                <p className="text-muted-foreground">
                  Chat with your coaches and get career advice
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Conversations Sidebar */}
              <div className="md:col-span-4 lg:col-span-3">
                <ConversationSidebar />
              </div>

              {/* Main Conversation View */}
              <div className="md:col-span-8 lg:col-span-9">
                {selectedId ? (
                  <ConversationView conversationId={selectedId} />
                ) : (
                  <Card className="h-[600px] flex items-center justify-center text-center p-6">
                    <div>
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
                      <p className="text-muted-foreground">
                        Choose a conversation from the sidebar to start messaging
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}