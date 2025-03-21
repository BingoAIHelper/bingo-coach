import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get coach's seekers and their assessments
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      include: {
        matches: {
          include: {
            seeker: {
              include: {
                assessments: true
              }
            }
          }
        }
      }
    });

    if (!coach) {
      return NextResponse.json(
        { error: "Coach not found" },
        { status: 404 }
      );
    }

    // Return mock insights data
    return NextResponse.json({
      progressPatterns: [
        {
          title: "Assessment Completion Rate",
          description: "75% of your seekers have completed their initial assessments. Consider following up with those who haven't.",
          action: "View Assessment Status"
        },
        {
          title: "Skill Development Trends",
          description: "Your seekers are showing strong progress in technical skills, particularly in React and TypeScript.",
          action: "Review Progress"
        }
      ],
      assessmentRecommendations: [
        {
          title: "Interview Preparation",
          description: "3 seekers are ready for mock interviews based on their assessment scores.",
          action: "Schedule Interviews"
        },
        {
          title: "Skill Gaps Identified",
          description: "Common gaps in system design knowledge across multiple seekers.",
          action: "Add Resources"
        }
      ]
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
} 