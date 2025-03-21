import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ConversationSidebar from "@/components/messaging/ConversationSidebar";
import ConversationView from "@/components/messaging/ConversationView";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { getConversationsByUserId } from "@/lib/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ClientConversationsPage from "./client";

export default async function SeekerConversationsPage() {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Redirect if user is not a seeker
  if (session.user.role === "coach") {
    redirect("/coach/conversations");
  }

  // Fetch conversations on the server
  const conversations = await getConversationsByUserId(session.user.id);

  return <ClientConversationsPage initialConversations={conversations} />;
}