import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { 
  getUserById,
  createCoachMatch,
  createConversation,
  createMessage,
  updateCoachMatch,
  getConversationByMatchId,
  getCoachMatchById
} from "@/lib/database";
import { checkForNewNotifications } from "../notifications/route";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { coachId, seekerId, matchScore, matchReason } = body;

    // Validate request
    if (!coachId || !seekerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get both users
    const [coach, seeker] = await Promise.all([
      getUserById(coachId),
      getUserById(seekerId)
    ]);

    // Validate users exist and have correct roles
    if (!coach || !coach.isCoach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    if (!seeker || seeker.isCoach) {
      return NextResponse.json(
        { error: "Seeker not found" },
        { status: 404 }
      );
    }

    // Create the match
    const match = await createCoachMatch({
      coachId: coach.id,
      seekerId: seeker.id,
      status: "pending",
      matchScore: matchScore || 0,
      matchReason: matchReason || "Manual match request"
    });

    // Create a conversation for the match
    const conversation = await createConversation({
      coachId: coach.id,
      seekerId: seeker.id,
      matchId: match.id
    });

    // Send initial message
    if (session.user.id === seekerId) {
      await createMessage({
        conversationId: conversation.id,
        senderId: seekerId,
        content: "Hi! I'm interested in working with you as my career coach. Would you be available to discuss how we could work together?",
        type: "text"
      });

      // Notify coach of new match request
      await checkForNewNotifications(coachId, true);
    } else {
      await createMessage({
        conversationId: conversation.id,
        senderId: coachId,
        content: "Hi! I'd be happy to work with you as your career coach. When would be a good time to discuss your goals and how I can help?",
        type: "text"
      });

      // Notify seeker of new match request
      await checkForNewNotifications(seekerId, false);
    }

    return NextResponse.json({
      match,
      conversation
    });
  } catch (error) {
    console.error("Error creating match:", error);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { matchId, status } = body;

    if (!matchId || !status) {
      return NextResponse.json(
        { error: "Match ID and status are required" },
        { status: 400 }
      );
    }

    // Get the match to verify it exists
    const match = await getCoachMatchById(matchId);
    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    // Verify the user has permission to update this match
    if (match.coachId !== session.user.id && match.seekerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update match status
    const updatedMatch = await updateCoachMatch(matchId, { status });

    // If match is accepted, ensure conversation exists and send welcome message
    if (status === "matched") {
      let conversation = await getConversationByMatchId(matchId);
      
      // Create conversation if it doesn't exist
      if (!conversation) {
        conversation = await createConversation({
          coachId: match.coachId,
          seekerId: match.seekerId,
          matchId: matchId
        });
      }

      if (!conversation) {
        return NextResponse.json(
          { error: "Failed to create or retrieve conversation" },
          { status: 500 }
        );
      }

      // Send acceptance message
      await createMessage({
        conversationId: conversation.id,
        senderId: session.user.id,
        content: session.user.id === match.coachId
          ? "I'm excited to work with you as your career coach! Let's start by discussing your career goals and how I can help you achieve them."
          : "Thank you for accepting! I'm looking forward to working with you. I'd love to share my career goals and hear how you can help me achieve them.",
        type: "text"
      });

      // Send system message about the match
      await createMessage({
        conversationId: conversation.id,
        senderId: session.user.id,
        content: "🎉 You're now connected! You can freely message each other and schedule coaching sessions.",
        type: "system"
      });

      // Notify the other user
      if (session.user.id === match.coachId) {
        await checkForNewNotifications(match.seekerId, false);
      } else {
        await checkForNewNotifications(match.coachId, true);
      }
    }

    return NextResponse.json({ 
      match: updatedMatch,
      message: status === "matched" 
        ? "Match accepted! You can now start messaging each other."
        : "Match status updated successfully."
    });
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
} 