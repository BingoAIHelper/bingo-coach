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
  createMessage,
  getSeekers
} from "@/lib/database";
import { generateCoachMatches } from "@/lib/azure/openai";
import { calculateMatchScore } from "@/lib/utils/coach";

interface RecommendedMatch {
  coachId?: string;
  seekerId?: string;
  matchScore: number;
  matchReason: string;
}

// Get matches and available coaches/seekers for the authenticated user
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

    // Get existing matches with full user data
    const existingMatches = user.isCoach
      ? await getCoachMatchesByCoachId(session.user.id)
      : await getCoachMatchesBySeekerId(session.user.id);

    // Get all available users based on role
    const [availableUsers, assessment] = await Promise.all([
      user.isCoach ? getSeekers() : getCoaches(),
      user.isCoach ? null : getAssessmentByUserId(user.id)
    ]);

    // Filter out users who already have matches
    const matchedUserIds = new Set(existingMatches.map(match => 
      user.isCoach ? match.seekerId : match.coachId
    ));

    const availableUsersWithoutMatches = availableUsers.filter(availableUser => 
      !matchedUserIds.has(availableUser.id)
    );

    // If user is a seeker and has an assessment, try to generate AI recommendations
    let recommendedMatches: RecommendedMatch[] = [];
    if (!user.isCoach && assessment && availableUsersWithoutMatches.length > 0) {
      try {
        recommendedMatches = await generateCoachMatches(
          {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            assessments: [assessment]
          },
          availableUsersWithoutMatches.map(coach => ({
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
      } catch (error) {
        console.error("Error generating AI matches:", error);
        // Fall back to basic matching if AI fails
        recommendedMatches = availableUsersWithoutMatches.map(coach => ({
          coachId: coach.id,
          matchScore: calculateMatchScore(user, coach, assessment).score,
          matchReason: "Based on profile compatibility"
        }));
      }
    }

    // For coaches, calculate basic match scores with available seekers
    if (user.isCoach) {
      recommendedMatches = availableUsersWithoutMatches.map(seeker => ({
        seekerId: seeker.id,
        matchScore: seeker.assessment 
          ? calculateMatchScore(seeker, user, seeker.assessment).score 
          : 50,
        matchReason: seeker.assessment 
          ? "Based on seeker's assessment and your expertise"
          : "Seeker looking for guidance"
      }));
    }

    // Transform matches to include full user data
    const transformedMatches = existingMatches.map(match => ({
      id: match.id,
      status: match.status,
      matchScore: match.matchScore,
      matchReason: match.matchReason,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      conversation: match.conversation,
      coach: {
        id: match.coach.id,
        name: match.coach.name,
        title: match.coach.title || '',
        avatar: match.coach.avatar || '',
        location: match.coach.location || '',
        expertise: match.coach.expertise,
        specialties: match.coach.specialties,
        industries: match.coach.industries,
        yearsExperience: match.coach.yearsExperience,
        certifications: match.coach.certifications,
        coachingStyle: match.coach.coachingStyle,
        bio: match.coach.bio,
        rating: match.coach.rating || 4.5,
        totalReviews: match.coach.totalReviews || Math.floor(Math.random() * 50) + 1,
        availability: match.coach.availability
      },
      seeker: {
        id: match.seeker.id,
        name: match.seeker.name,
        title: match.seeker.title || '',
        avatar: match.seeker.avatar || '',
        location: match.seeker.location || '',
        assessmentCompleted: match.seeker.assessments?.length > 0,
        disabilities: match.seeker.disabilities || [],
        goals: match.seeker.goals || [],
        skillLevel: match.seeker.skillLevel || "intermediate",
        focusArea: match.seeker.focusArea || "",
        assessment: match.seeker.assessments?.[0] || null
      }
    }));

    // Transform recommended matches to include full user data
    const transformedRecommendedMatches = recommendedMatches.map(match => ({
      ...match,
      coach: match.coachId ? availableUsersWithoutMatches.find(u => u.id === match.coachId) : null,
      seeker: match.seekerId ? availableUsersWithoutMatches.find(u => u.id === match.seekerId) : null
    }));

    return NextResponse.json({
      existingMatches: transformedMatches,
      recommendedMatches: transformedRecommendedMatches,
      availableUsers: availableUsersWithoutMatches
    });
  } catch (error) {
    console.error("Error in coach matching:", error);
    return NextResponse.json({ 
      existingMatches: [],
      recommendedMatches: [],
      availableUsers: []
    });
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

    // Get the match to verify it exists and get the coach's user ID
    const match = await prisma.coachMatch.findUnique({
      where: { id: matchId },
      include: {
        coach: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    // Update match status
    const updatedMatch = await updateCoachMatch(matchId, {
      status: action === "accept" ? "matched" : "declined",
    });

    // If both parties accept, create a conversation
    if (action === "accept") {
      const conversation = await createConversation({
        coachId: match.coach.userId, // Use the coach's user ID
        seekerId: match.seekerId,
        matchId: matchId
      });

      // Add initial system message
      await createMessage({
        conversationId: conversation.id,
        senderId: session.user.id,
        content: "Conversation started! You can now discuss your coaching journey.",
        type: "text"
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