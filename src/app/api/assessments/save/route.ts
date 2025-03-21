import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/database";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { assessment } = await req.json();

    // Save assessment to the seeker's profile
    const savedAssessment = await prisma.assessment.create({
      data: {
        userId: session.user.id,
        title: assessment.title,
        description: assessment.description,
        sections: JSON.stringify(assessment.sections),
        completedAt: new Date(),
        status: "completed"
      }
    });

    // Update seeker's profile with assessment completion status
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        assessmentCompleted: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      assessment: savedAssessment,
      message: "Assessment saved successfully"
    });
  } catch (error) {
    console.error("Error saving assessment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save assessment" },
      { status: 500 }
    );
  }
} 