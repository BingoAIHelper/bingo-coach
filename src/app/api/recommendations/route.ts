import { NextRequest, NextResponse } from "next/server";
import { getJobs, getResumesByUserId } from "@/lib/azure/cosmos";
import { generateJobRecommendations } from "@/lib/azure/openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

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
    const userId = (session.user as any).id;
    
    // Get resume ID from query params
    const searchParams = request.nextUrl.searchParams;
    const resumeId = searchParams.get("resumeId");
    
    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 }
      );
    }
    
    // Get user's resumes
    const resumes = await getResumesByUserId(userId);
    const resume = resumes.find(r => r.id === resumeId);
    
    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }
    
    // Get all jobs
    const allJobs = await getJobs({ query: "SELECT * FROM c" });
    
    // Generate recommendations using Azure OpenAI
    const recommendations = await generateJobRecommendations(resume.content, allJobs);
    
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Error getting job recommendations:", error);
    return NextResponse.json(
      { error: "Failed to get job recommendations" },
      { status: 500 }
    );
  }
} 