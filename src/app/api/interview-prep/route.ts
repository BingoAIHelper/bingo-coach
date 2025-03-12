import { NextRequest, NextResponse } from "next/server";
import { getJobById, getResumesByUserId } from "@/lib/azure/cosmos";
import { generateInterviewQuestions } from "@/lib/azure/openai";
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get("jobId");
    const resumeId = searchParams.get("resumeId");
    
    if (!jobId || !resumeId) {
      return NextResponse.json(
        { error: "Job ID and Resume ID are required" },
        { status: 400 }
      );
    }
    
    // Get user ID from session
    const userId = (session.user as any).id;
    
    // Get job details
    const job = await getJobById(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
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
    
    // Generate interview questions using Azure OpenAI
    const interviewPrep = await generateInterviewQuestions(job, resume.content);
    
    return NextResponse.json({ interviewPrep });
  } catch (error) {
    console.error("Error generating interview preparation:", error);
    return NextResponse.json(
      { error: "Failed to generate interview preparation" },
      { status: 500 }
    );
  }
} 