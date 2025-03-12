import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { 
  createApplication, 
  getApplicationsByUserId, 
  getJobById, 
  getResumesByUserId 
} from "@/lib/azure/cosmos";

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
    
    // Get applications for the user
    const applications = await getApplicationsByUserId(userId);
    
    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error getting applications:", error);
    return NextResponse.json(
      { error: "Failed to get applications" },
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
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Get application data from request
    const applicationData = await request.json();
    
    // Validate application data
    if (!applicationData.jobId || !applicationData.resumeId) {
      return NextResponse.json(
        { error: "Job ID and Resume ID are required" },
        { status: 400 }
      );
    }
    
    // Verify job exists
    const job = await getJobById(applicationData.jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }
    
    // Verify resume exists and belongs to user
    const resumes = await getResumesByUserId(userId);
    const resume = resumes.find(r => r.id === applicationData.resumeId);
    
    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }
    
    // Create application record
    const application = await createApplication({
      id: `application-${Date.now()}`,
      userId,
      jobId: applicationData.jobId,
      resumeId: applicationData.resumeId,
      status: "submitted",
      coverLetter: applicationData.coverLetter || "",
      additionalNotes: applicationData.additionalNotes || "",
      jobTitle: job.title,
      companyName: job.company,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
} 