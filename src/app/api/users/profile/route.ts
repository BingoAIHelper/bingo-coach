import { getUserById, updateUser } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }

    const user = await getUserById(session.user.id);
    
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }),
        { status: 404 }
      );
    }

    // Remove sensitive information
    const { password, ...profile } = user;

    return new NextResponse(
      JSON.stringify(profile),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userData = await req.json();
    const userId = userData.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const existingUser = await getUserById(userId);
    
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await updateUser(userId, userData);
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error in PUT /api/users/profile:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the user profile" },
      { status: 500 }
    );
  }
} 