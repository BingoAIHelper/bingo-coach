import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getAssessmentByUserId, getCoaches } from "@/lib/azure/cosmos";
import { generateChatCompletion } from "@/lib/azure/openai";

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
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Get user's assessment
    const assessment = await getAssessmentByUserId(userId);
    
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found. Please complete your assessment first." },
        { status: 404 }
      );
    }
    
    // Get all coaches
    const coaches = await getCoaches();
    
    if (!coaches || coaches.length === 0) {
      return NextResponse.json(
        { error: "No coaches available" },
        { status: 404 }
      );
    }
    
    // Use AI to match coaches based on assessment
    const matchedCoaches = await matchCoachesToAssessment(assessment, coaches);
    
    return NextResponse.json({ matches: matchedCoaches });
  } catch (error) {
    console.error("Error matching coaches:", error);
    return NextResponse.json(
      { error: "Failed to match coaches" },
      { status: 500 }
    );
  }
}

/**
 * Match coaches to a user's assessment using AI
 * @param assessment The user's assessment
 * @param coaches List of available coaches
 * @returns Matched coaches with compatibility scores
 */
async function matchCoachesToAssessment(assessment: any, coaches: any[]) {
  try {
    // Prepare the prompt for AI matching
    const systemPrompt = `
      You are an expert job coach matching system. Your task is to match job seekers with coaches
      based on their assessment and the coaches' profiles. Consider the following factors:
      
      1. Communication styles compatibility
      2. Teaching styles that match the seeker's learning preferences
      3. Coach's expertise in areas the seeker needs assistance with
      4. Coach's experience with the seeker's specific disabilities
      
      Analyze the seeker's assessment and the available coaches, then return a JSON array of matches.
      Each match should include the coach's ID, a compatibility score (0-100), and a brief explanation
      of why they are a good match.
    `;
    
    const userPrompt = `
      Seeker Assessment:
      ${JSON.stringify(assessment, null, 2)}
      
      Available Coaches:
      ${JSON.stringify(coaches, null, 2)}
    `;
    
    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];
    
    const response = await generateChatCompletion(messages, 2000, 0.3);
    
    // Parse the JSON response
    try {
      const matches = JSON.parse(response);
      
      // Sort matches by compatibility score (highest first)
      return matches.sort((a: any, b: any) => b.compatibilityScore - a.compatibilityScore);
    } catch (parseError) {
      console.error("Error parsing coach matches:", parseError);
      
      // Fallback to basic matching if AI fails
      return coaches.map((coach) => ({
        coachId: coach.id,
        compatibilityScore: 50, // Default score
        explanation: "Basic match based on availability",
      }));
    }
  } catch (error) {
    console.error("Error in AI coach matching:", error);
    throw error;
  }
} 