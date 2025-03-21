import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { updateUser } from "@/lib/database";
import { z } from "zod";

// Validation schema for coach profile updates
const profileUpdateSchema = z.object({
  bio: z.string().min(1, "Bio is required"),
  expertise: z.array(z.string()).min(1, "At least one area of expertise is required"),
  specialties: z.array(z.string()).optional(),
  yearsExperience: z.number().min(0, "Years of experience must be a positive number"),
  industries: z.array(z.string()).min(1, "At least one industry is required"),
  coachingStyle: z.string().min(1, "Coaching style is required"),
  hourlyRate: z.number().min(0, "Hourly rate must be a positive number"),
  availability: z.array(z.string()).min(1, "At least one availability slot is required"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  certifications: z.array(z.string()).optional(),
  profileComplete: z.boolean()
});

export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a coach
    if (session.user.role !== "coach") {
      return NextResponse.json({ error: "Only coaches can update coach profiles" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = profileUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid profile data",
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const profileData = validationResult.data;

    // Update user profile in database
    const updatedUser = await updateUser(session.user.id, {
      bio: profileData.bio,
      expertise: profileData.expertise,
      specialties: profileData.specialties || [],
      yearsExperience: profileData.yearsExperience,
      industries: profileData.industries,
      coachingStyle: profileData.coachingStyle,
      hourlyRate: profileData.hourlyRate,
      availability: profileData.availability,
      languages: profileData.languages,
      certifications: profileData.certifications || [],
      profileComplete: profileData.profileComplete,
      updatedAt: new Date()
    });

    // Return updated profile
    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        expertise: updatedUser.expertise,
        specialties: updatedUser.specialties,
        yearsExperience: updatedUser.yearsExperience,
        industries: updatedUser.industries,
        coachingStyle: updatedUser.coachingStyle,
        hourlyRate: updatedUser.hourlyRate,
        availability: updatedUser.availability,
        languages: updatedUser.languages,
        certifications: updatedUser.certifications,
        profileComplete: updatedUser.profileComplete
      }
    });
  } catch (error) {
    console.error("Error updating coach profile:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to update profile",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 