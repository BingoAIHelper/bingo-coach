import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/lib/azure/cosmos";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

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
    
    // Get user profile from Cosmos DB
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Remove sensitive information
    const { password, ...userProfile } = user;
    
    return NextResponse.json({ user: userProfile });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return NextResponse.json(
      { error: "Failed to get user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    
    // Get user profile from Cosmos DB
    const existingUser = await getUserById(userId);
    
    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Get updated profile data
    const updatedData = await request.json();
    
    // Prevent updating sensitive fields
    delete updatedData.id;
    delete updatedData.email;
    delete updatedData.password;
    delete updatedData.role;
    
    // Merge existing user data with updated data
    const userData = {
      ...existingUser,
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    // Update user in Cosmos DB
    const updatedUser = await updateUser(userId, userData);
    
    // Remove sensitive information
    const { password, ...userProfile } = updatedUser;
    
    return NextResponse.json({ user: userProfile });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
} 