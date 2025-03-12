import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { createAssessment, getAssessmentByUserId } from "@/lib/azure/cosmos";
import { z } from "zod";

// Define validation schema for assessment data
const assessmentSchema = z.object({
  disabilities: z.array(z.string()),
  disabilityDetails: z.string().optional(),
  jobPreferences: z.array(z.string()),
  jobTypes: z.array(z.string()),
  jobIndustry: z.string().optional(),
  timeframe: z.string().optional(),
  learningStyles: z.array(z.string()),
  communicationStyles: z.array(z.string()),
  assistanceNeeded: z.array(z.string()),
  additionalInfo: z.string().optional(),
});

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
    
    // Get assessment for the user
    const assessment = await getAssessmentByUserId(userId);
    
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found", completed: false },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ assessment, completed: true });
  } catch (error) {
    console.error("Error getting assessment:", error);
    return NextResponse.json(
      { error: "Failed to get assessment" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to submit an assessment" },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = assessmentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid assessment data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const assessmentData = validationResult.data;
    
    // Create assessment record with user information
    const assessment = {
      userId: session.user.id,
      userEmail: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...assessmentData,
    };
    
    // TODO: Store in Cosmos DB
    // This is a placeholder for the actual database operation
    // In a real implementation, you would use the Cosmos DB SDK to store the data
    console.log("Assessment data to be stored:", assessment);
    
    // For now, we'll simulate a successful storage
    return NextResponse.json(
      { message: "Assessment submitted successfully", assessmentId: "temp-id-" + Date.now() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing assessment submission:", error);
    return NextResponse.json(
      { error: "Failed to process assessment submission" },
      { status: 500 }
    );
  }
} 