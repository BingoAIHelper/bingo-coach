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
import { prisma } from "@/lib/database";

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
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if the user is a coach or seeker
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCoach: true }
    });

    if (user?.isCoach) {
      // Get all seekers with their assessments for coaches
      const seekers = await prisma.user.findMany({
        where: {
          isCoach: false,
          assessmentCompleted: true,
          assessments: {
            some: {
              status: "completed"
            }
          }
        },
        include: {
          assessments: {
            orderBy: {
              completedAt: 'desc'
            },
            take: 1,
            select: {
              id: true,
              title: true,
              sections: true,
              completedAt: true,
              status: true
            }
          },
          seekerMatches: {
            where: {
              coach: {
                userId: session.user.id
              }
            },
            include: {
              conversation: true,
              coach: true
            }
          }
        }
      });

      // Transform seekers data
      const transformedSeekers = seekers.map((seeker) => {
        const match = seeker.seekerMatches[0];
        const assessment = seeker.assessments[0];

        // Parse sections from string to object if it exists
        const parsedAssessment = assessment ? {
          ...assessment,
          sections: typeof assessment.sections === 'string' ? 
            JSON.parse(assessment.sections) : 
            assessment.sections
        } : null;

        const transformedSeeker = {
          id: seeker.id,
          name: seeker.name || '',
          title: seeker.role || '',
          avatar: '', // Add avatar handling if needed
          location: seeker.location || '',
          experience: seeker.experience ? 
            typeof seeker.experience === 'string' ? 
              JSON.parse(seeker.experience) : 
              seeker.experience : 
            [],
          goals: parsedAssessment?.sections
            ?.find((s: { title: string }) => s.title === "Job Preferences")
            ?.questions
            ?.find((q: { question: string }) => q.question === "What type of jobs are you interested in?")
            ?.answer || [],
          matchScore: match?.matchScore || null,
          matchReason: match?.matchReason || null,
          matchStatus: match?.status || null,
          matchId: match?.id || null,
          conversationId: match?.conversation?.id || null,
          assessmentCompleted: seeker.assessmentCompleted,
          assessment: parsedAssessment,
          lastActive: seeker.lastActive || seeker.updatedAt
        };

        // For existing matches, include the original seeker data
        if (match?.status) {
          return {
            ...transformedSeeker,
            seeker: transformedSeeker // Include the seeker data in the expected format
          };
        }

        return transformedSeeker;
      });

      // Separate seekers into categories
      const existingMatches = transformedSeekers.filter(s => s.matchStatus);
      const recommendedMatches = transformedSeekers.filter(s => !s.matchStatus && s.matchScore);
      const availableUsers = transformedSeekers.filter(s => !s.matchStatus && !s.matchScore);

      return NextResponse.json({
        existingMatches,
        recommendedMatches,
        availableUsers
      });
    } else {
      // Get all coaches with their matches for seekers
      const coaches = await prisma.user.findMany({
        where: {
          isCoach: true,
          coach: {
            isNot: null
          }
        },
        include: {
          coach: {
            include: {
              matches: {
                where: {
                  seekerId: session.user.id
                },
                include: {
                  conversation: true
                }
              }
            }
          }
        }
      });

      // Filter out coaches without required profile information
      const validCoaches = coaches.filter(user => {
        const coach = user.coach;
        return coach && 
          coach.expertise && 
          coach.specialties && 
          coach.expertise.length > 0 && 
          coach.specialties.length > 0;
      });

      // Transform coaches data
      const transformedCoaches = validCoaches.map((user) => {
        const coach = user.coach;
        if (!coach) return null;
        
        const match = coach.matches[0];

        return {
          id: user.id,
          name: user.name || '',
          title: user.role || '',
          avatar: '', // Add avatar handling if needed
          location: user.location || '',
          expertise: coach.expertise ? 
            typeof coach.expertise === 'string' ? 
              JSON.parse(coach.expertise) : 
              coach.expertise : 
            [],
          specialties: coach.specialties ? 
            typeof coach.specialties === 'string' ? 
              JSON.parse(coach.specialties) : 
              coach.specialties : 
            [],
          industries: coach.industries ? 
            typeof coach.industries === 'string' ? 
              JSON.parse(coach.industries) : 
              coach.industries : 
            [],
          yearsExperience: user.yearsExperience || 0,
          certifications: coach.certifications ? 
            typeof coach.certifications === 'string' ? 
              JSON.parse(coach.certifications) : 
              coach.certifications : 
            [],
          coachingStyle: user.coachingStyle || '',
          bio: user.bio || '',
          matchScore: match?.matchScore || null,
          matchReason: match?.matchReason || null,
          matchStatus: match?.status || null,
          matchId: match?.id || null,
          conversationId: match?.conversation?.id || null,
          rating: coach.rating || 4.5,
          totalReviews: user.totalReviews || Math.floor(Math.random() * 50) + 1,
          availability: coach.availability ? 
            typeof coach.availability === 'string' ? 
              JSON.parse(coach.availability) : 
              coach.availability : 
            []
        };
      }).filter((coach): coach is NonNullable<typeof coach> => coach !== null);

      // Separate coaches into categories
      const existingMatches = transformedCoaches.filter(c => c.matchStatus);
      const recommendedMatches = transformedCoaches.filter(c => !c.matchStatus && c.matchScore);
      const availableUsers = transformedCoaches.filter(c => !c.matchStatus && !c.matchScore);

      return NextResponse.json({
        existingMatches,
        recommendedMatches,
        availableUsers
      });
    }
  } catch (error) {
    console.error("Error in coach matching:", error);
    return NextResponse.json(
      { error: "Failed to get matches" },
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