"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ConversationSidebar from "@/components/messaging/ConversationSidebar";
import ConversationView from "@/components/messaging/ConversationView";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  status: string;
  updatedAt: string;
  coach: {
    id: string;
    name: string;
    profileImage?: string;
  };
  seeker: {
    id: string;
    name: string;
    profileImage?: string;
  };
  messages: Array<{
    id: string;
    content: string;
    type: string;
    createdAt: string;
    sender: {
      id: string;
      name: string;
    };
  }>;
}

interface ClientConversationsPageProps {
  initialConversations: Conversation[];
}

export default function ClientConversationsPage({ initialConversations }: ClientConversationsPageProps) {
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setSelectedId(id);
    }
  }, [searchParams]);

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
                <ConversationSidebar initialConversations={initialConversations} />
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