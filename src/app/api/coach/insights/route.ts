import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/database";
import { generateChatCompletion } from "@/lib/azure/openai";

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

    // Prepare data for AI analysis
    const seekerData = coach.matches.map(match => ({
      name: match.seeker.name,
      assessments: match.seeker.assessments.map(assessment => ({
        title: assessment.title,
        description: assessment.description,
        sections: assessment.sections,
        completedAt: assessment.completedAt,
        status: assessment.status
      }))
    }));

    // Generate AI insights
    const prompt = `
      Analyze the following seeker data and provide insights for the coach:
      
      ${JSON.stringify(seekerData, null, 2)}
      
      Provide insights in the following format:
      {
        "progressPatterns": [
          {
            "title": "string",
            "description": "string",
            "action": "string"
          }
        ],
        "assessmentRecommendations": [
          {
            "title": "string",
            "description": "string",
            "action": "string"
          }
        ]
      }
      
      Focus on:
      1. Progress patterns across seekers
      2. Assessment completion rates and areas needing attention
      3. Specific recommendations for improving coaching effectiveness
    `;

    const response = await generateChatCompletion([
      { role: "system", content: "You are an expert career coaching analytics assistant." },
      { role: "user", content: prompt }
    ], 1000, 0.3);

    try {
      const insights = JSON.parse(response);
      return NextResponse.json(insights);
    } catch (error) {
      console.error("Error parsing AI insights:", error);
      return NextResponse.json(
        { error: "Failed to generate insights" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
} 