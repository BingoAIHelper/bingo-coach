import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { createMessage, getConversationById } from "@/lib/database";
import { checkForNewNotifications } from "../notifications/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { conversationId, content } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the conversation to find the other user
    const conversation = await getConversationById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create the message
    const message = await createMessage({
      conversationId,
      senderId: session.user.id,
      content
    });

    // Notify the recipient
    const recipientId = conversation.coachId === session.user.id
      ? conversation.seekerId
      : conversation.coachId;
    const isRecipientCoach = conversation.coachId === recipientId;
    await checkForNewNotifications(recipientId, isRecipientCoach);

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
} 