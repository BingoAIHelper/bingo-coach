import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/database";
import { z } from "zod";
import bcrypt from 'bcryptjs';

// Define validation schema for registration data
const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["seeker", "coach"]),
  // Optional fields
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional()
});

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
    
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      bio,
      location,
      phone
    } = validationResult.data;
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user in the database
    const newUser = await createUser({
      email,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      password: hashedPassword,
      role,
      isCoach: role === "coach",
      bio,
      location,
      phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Return the new user
    return NextResponse.json(
      { 
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        }, 
        message: "User registered successfully" 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    
    // Ensure a consistent error response
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to register user",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}