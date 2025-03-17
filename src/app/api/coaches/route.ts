import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getCoaches, getCoachById } from "@/lib/database";

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
    const coachId = searchParams.get("id");
    
    // If coach ID is provided, get specific coach
    if (coachId) {
      const coach = await getCoachById(coachId);
      
      if (!coach) {
        return NextResponse.json(
          { error: "Coach not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ coach });
    }
    
    // Get all coaches from the database
    // The filtering will be handled by the database adapter
    const coaches = await getCoaches();
    
    return NextResponse.json({ coaches });
  } catch (error) {
    console.error("Error getting coaches:", error);
    return NextResponse.json(
      { error: "Failed to get coaches" },
      { status: 500 }
    );
  }
} 