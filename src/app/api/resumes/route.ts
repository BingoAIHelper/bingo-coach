import { NextRequest, NextResponse } from "next/server";
import { getResumesByUserId, createResume } from "@/lib/azure/cosmos";
import { analyzeResume } from "@/lib/azure/openai";
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
    
    // Get resumes for the user
    const resumes = await getResumesByUserId(userId);
    
    return NextResponse.json({ resumes });
  } catch (error) {
    console.error("Error getting resumes:", error);
    return NextResponse.json(
      { error: "Failed to get resumes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get form data with resume file
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 }
      );
    }
    
    // Convert file to text (in a real implementation, you would use Azure Form Recognizer)
    const fileText = await file.text();
    
    // Analyze resume using Azure OpenAI
    const analysis = await analyzeResume(fileText);
    
    // Create resume record
    const resumeData = {
      id: `resume-${Date.now()}`,
      userId: (session.user as any).id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      content: fileText,
      analysis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const resume = await createResume(resumeData);
    
    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    );
  }
} 