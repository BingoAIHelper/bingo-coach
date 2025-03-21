import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { 
  getCoachMatchesBySeekerId, 
  getCoachMatchesByCoachId,
  getConversationsByUserId 
} from "@/lib/database";
import { Message } from "@prisma/client";

// Store active connections
const clients = new Map<string, ReadableStreamController<Uint8Array>>();

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;

  // Create a new stream for this client
  const stream = new ReadableStream({
    start(controller) {
      clients.set(userId, controller);

      // Send initial heartbeat
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode('data: {"type":"heartbeat"}\n\n'));
    },
    cancel() {
      clients.delete(userId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

// Helper function to send notifications to a specific user
export async function sendNotification(userId: string, notification: {
  type: 'match' | 'message';
  data: any;
}) {
  const controller = clients.get(userId);
  if (controller) {
    const encoder = new TextEncoder();
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`));
  }
}

// Helper function to check for new notifications
export async function checkForNewNotifications(userId: string, isCoach: boolean) {
  try {
    // Get matches
    const matches = isCoach 
      ? await getCoachMatchesByCoachId(userId)
      : await getCoachMatchesBySeekerId(userId);

    // Get conversations
    const conversations = await getConversationsByUserId(userId);

    // Check for pending matches
    const pendingMatches = matches.filter(match => match.status === 'pending');
    for (const match of pendingMatches) {
      await sendNotification(userId, {
        type: 'match',
        data: {
          matchId: match.id,
          status: match.status,
          otherUser: isCoach ? match.seeker : match.coach
        }
      });
    }

    // Check for unread messages
    for (const conversation of conversations) {
      const unreadMessages = conversation.messages.filter((msg: Message) => 
        msg.senderId !== userId && 
        new Date(msg.createdAt) > new Date(Date.now() - 5000) // Messages in last 5 seconds
      );

      for (const message of unreadMessages) {
        await sendNotification(userId, {
          type: 'message',
          data: {
            conversationId: conversation.id,
            message: {
              id: message.id,
              content: message.content,
              sender: message.sender
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error checking for notifications:', error);
  }
} 