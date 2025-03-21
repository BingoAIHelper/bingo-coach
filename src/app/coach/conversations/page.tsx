import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getConversationsByUserId } from "@/lib/database";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CoachConversationsPage from "./client";

export default async function CoachConversationsPageServer() {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Redirect if user is not a coach
  if (session.user.role !== "coach") {
    redirect("/seeker/conversations");
  }

  // Fetch conversations on the server
  const conversations = await getConversationsByUserId(session.user.id);

  return <CoachConversationsPage initialConversations={conversations} />;
}