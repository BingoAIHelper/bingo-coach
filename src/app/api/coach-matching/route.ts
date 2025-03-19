import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import {
  getAssessmentByUserId,
  getCoaches,
  getUserById,
  createCoachMatch,
  getCoachMatchesBySeekerId,
  getCoachMatchesByCoachId,
  updateCoachMatch,
  createConversation,
  createMessage
} from "@/lib/database";
import { generateCoachMatches } from "@/lib/azure/openai";

// Get matches for the authenticated user (both seeker and coach views)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get matches based on user role
    const matches = user.isCoach
      ? await getCoachMatchesByCoachId(user.id)
      : await getCoachMatchesBySeekerId(user.id);

    // If seeker and no matches exist, generate recommendations
    if (!user.isCoach && (!matches || matches.length === 0)) {
      const assessment = await getAssessmentByUserId(user.id);
      if (!assessment) {
        return NextResponse.json(
          { error: "Assessment required for matching" },
          { status: 400 }
        );
      }

      const coaches = await getCoaches();
      if (!coaches?.length) {
        return NextResponse.json({ error: "No coaches available" }, { status: 404 });
      }

      // Generate AI matches
      const aiMatches = await generateCoachMatches(
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          assessments: [assessment]
        },
        coaches.map(coach => ({
          id: coach.id,
          name: coach.name,
          expertise: coach.expertise || [],
          specialties: coach.specialties || [],
          bio: coach.bio,
          yearsExperience: coach.yearsExperience,
          industries: coach.industries || [],
          coachingStyle: coach.coachingStyle
        }))
      );

      // Create match records for recommendations
      const newMatches = await Promise.all(
        aiMatches.map(match =>
          createCoachMatch({
            coachId: match.coachId,
            seekerId: user.id,
            status: "pending",
            matchScore: match.matchScore,
            matchReason: match.matchReason
          })
        )
      );

      return NextResponse.json({ matches: newMatches });
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Error in coach matching:", error);
    return NextResponse.json(
      { error: "Failed to process coach matches" },
      { status: 500 }
    );
  }
}

// Handle match actions (accept/decline) and create conversations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { matchId, action } = body;

    if (!matchId || !action) {
      return NextResponse.json(
        { error: "Match ID and action required" },
        { status: 400 }
      );
    }

    // Update match status
    const updatedMatch = await updateCoachMatch(matchId, {
      status: action === "accept" ? "matched" : "declined",
    });

    // If both parties accept, create a conversation
    if (action === "accept") {
      const conversation = await createConversation({
        coachId: updatedMatch.coachId,
        seekerId: updatedMatch.seekerId,
        matchId: matchId,
        status: "active"
      });

      // Add initial system message
      await createMessage({
        conversationId: conversation.id,
        senderId: "system",
        content: "Conversation started! You can now discuss your coaching journey."
      });

      return NextResponse.json({
        match: updatedMatch,
        conversation
      });
    }

    return NextResponse.json({ match: updatedMatch });
  } catch (error) {
    console.error("Error processing match action:", error);
    return NextResponse.json(
      { error: "Failed to process match action" },
      { status: 500 }
    );
  }
}