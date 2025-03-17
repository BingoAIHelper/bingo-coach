import { getUserById, updateUser } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in GET /api/users/profile:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the user profile" },
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