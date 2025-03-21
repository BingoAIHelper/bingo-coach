import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/database";
import { z } from "zod";
import bcrypt from 'bcryptjs';

// Base schema for common fields
const baseUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional()
});

// Coach-specific schema
const coachSchema = baseUserSchema.extend({
  role: z.literal("coach"),
  expertise: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  yearsExperience: z.number().optional(),
  industries: z.array(z.string()).optional(),
  coachingStyle: z.string().optional(),
  hourlyRate: z.number().optional(),
  availability: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional()
});

// Seeker schema
const seekerSchema = baseUserSchema.extend({
  role: z.literal("seeker")
});

// Combined schema that validates based on role
const registerSchema = z.discriminatedUnion("role", [
  coachSchema,
  seekerSchema
]);

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid registration data",
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Check if user already exists
    const existingUser = await getUserByEmail(data.email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Prepare base user data
    const baseUserData = {
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      password: hashedPassword,
      role: data.role,
      isCoach: data.role === "coach",
      bio: data.bio,
      location: data.location,
      phone: data.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add coach-specific data if registering as a coach
    const userData = data.role === "coach"
      ? {
          ...baseUserData,
          expertise: data.expertise || [],
          specialties: data.specialties || [],
          yearsExperience: data.yearsExperience,
          industries: data.industries || [],
          coachingStyle: data.coachingStyle,
          hourlyRate: data.hourlyRate,
          availability: data.availability || [],
          languages: data.languages || [],
          certifications: data.certifications || []
        }
      : baseUserData;
    
    // Create the user in the database
    const newUser = await createUser(userData);
    
    // Return the new user (excluding sensitive data)
    return NextResponse.json(
      { 
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          ...(newUser.role === "coach" ? {
            expertise: newUser.expertise,
            specialties: newUser.specialties,
            yearsExperience: newUser.yearsExperience,
            industries: newUser.industries,
            coachingStyle: newUser.coachingStyle
          } : {})
        }, 
        message: "User registered successfully" 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to register user",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}