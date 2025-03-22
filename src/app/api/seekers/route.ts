import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { 
  getUserById, 
  getSeekers, 
  getAssessmentByUserId,
  getCoachMatchesBySeekerId 
} from "@/lib/database";

interface Assessment {
  id: string;
  userId: string;
  title: string;
  score?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface CoachMatch {
  id: string;
  coachId: string;
  seekerId: string;
  status: "pending" | "matched" | "declined";
  matchScore: number;
  matchReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Seeker {
  id: string;
  name: string;
  email: string;
  isCoach: false;
  bio?: string;
  location?: string;
  lastActive?: string;
  experience?: string;
  createdAt: string;
  updatedAt: string;
  assessment?: Assessment;
  matches?: CoachMatch[];
  assessmentCompleted?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    // If user ID is provided, get specific seeker with their assessment and matches
    if (userId) {
      const [user, assessment, matches] = await Promise.all([
        getUserById(userId),
        getAssessmentByUserId(userId),
        getCoachMatchesBySeekerId(userId)
      ]);

      if (!user) {
        return NextResponse.json(
          { error: "Seeker not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        seeker: {
          ...user,
          assessment,
          matches,
          assessmentCompleted: user.assessmentCompleted
        }
      });
    }

    // Get all seekers
    const seekers = await getSeekers();

    // If status filter is provided, filter seekers
    if (status === "unmatched") {
      const unmatchedSeekers = await Promise.all(
        seekers.map(async (seeker: Seeker) => {
          const matches = await getCoachMatchesBySeekerId(seeker.id);
          const assessment = await getAssessmentByUserId(seeker.id);
          
          // Only include seekers who:
          // 1. Have completed their assessment
          // 2. Have no active coach matches
          if (assessment && (!matches || matches.every((m: CoachMatch) => m.status === "declined"))) {
            return {
              ...seeker,
              assessment,
              assessmentCompleted: true,
              lastActive: seeker.lastActive || seeker.updatedAt,
              // Parse experience from JSON string to array if it exists
              experience: seeker.experience ? JSON.parse(seeker.experience) : [],
              // Add placeholder goals for now (this should come from assessment or profile)
              goals: ["Career Transition", "Skill Development"]
            };
          }
          return null;
        })
      );

      return NextResponse.json({
        seekers: unmatchedSeekers.filter(Boolean)
      });
    }

    return NextResponse.json({ seekers });
  } catch (error) {
    console.error("Error getting seekers:", error);
    return NextResponse.json(
      { error: "Failed to get seekers" },
      { status: 500 }
    );
  }
} 