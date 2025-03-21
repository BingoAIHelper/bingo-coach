import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { 
  getUserById, 
  getCoaches,
  getAssessmentById,
  getCoachMatchesByCoachId 
} from "@/lib/database";

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
    const userId = searchParams.get("userId");

    // If user ID is provided, get specific coach with their assessments and matches
    if (userId) {
      const [user, assessment, matches] = await Promise.all([
        getUserById(userId),
        getAssessmentById(userId),
        getCoachMatchesByCoachId(userId)
      ]);

      if (!user || !user.isCoach) {
        return NextResponse.json(
          { error: "Coach not found" },
          { status: 404 }
        );
      }

      // Parse JSON strings into arrays
      const coach = {
        ...user,
        expertise: user.expertise ? JSON.parse(user.expertise) : [],
        specialties: user.specialties ? JSON.parse(user.specialties) : [],
        industries: user.industries ? JSON.parse(user.industries) : [],
        certifications: user.certifications ? JSON.parse(user.certifications) : [],
        availability: user.availability ? JSON.parse(user.availability) : [],
        assessment,
        matches,
        // Add placeholder rating data (this should come from a reviews system)
        rating: 4.8,
        totalReviews: 24
      };

      return NextResponse.json({ coach });
    }

    // Get all coaches
    const coaches = await getCoaches();

    // Transform coaches data
    const transformedCoaches = coaches.map(coach => ({
      ...coach,
      expertise: coach.expertise ? JSON.parse(coach.expertise) : [],
      specialties: coach.specialties ? JSON.parse(coach.specialties) : [],
      industries: coach.industries ? JSON.parse(coach.industries) : [],
      certifications: coach.certifications ? JSON.parse(coach.certifications) : [],
      availability: coach.availability ? JSON.parse(coach.availability) : [],
      // Add placeholder rating data (this should come from a reviews system)
      rating: 4.5 + Math.random() * 0.5,
      totalReviews: Math.floor(Math.random() * 50) + 1
    }));

    return NextResponse.json({ coaches: transformedCoaches });
  } catch (error) {
    console.error("Error getting coaches:", error);
    return NextResponse.json(
      { error: "Failed to get coaches" },
      { status: 500 }
    );
  }
} 